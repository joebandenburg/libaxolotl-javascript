/**
 * Copyright (C) 2015 Joe Bandenburg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import ArrayBufferUtils from "./ArrayBufferUtils";
import ProtocolConstants from "./ProtocolConstants";
import Messages from "./Messages";
import MessageTypes from "./MessageTypes";
import SessionState from "./SessionState";
import Ratchet from "./Ratchet";
import {InvalidMessageException, DuplicateMessageException} from "./Exceptions";
import SequentialOperationQueue from "./SequentialOperationQueue";
import co from "co";

/**
 * A Session is responsible for encrypting and decrypting messages for a single identity.
 *
 * @param {Crypto} crypto
 * @param {SessionStateList} sessionStateList
 * @constructor
 */
function Session(crypto, sessionStateList) {
    const self = this;

    const ratchet = new Ratchet(crypto);
    const queue = new SequentialOperationQueue();

    /**
     * Encrypt a message. This method has the side-effect of mutating the session state.
     * <p>
     * This method will always execute sequentially even if it is called multiple times.
     *
     * @method
     * @param {ArrayBuffer} paddedMessage - optionally padded message bytes.
     * @return {Promise.<ArrayBuffer, Error>} encrypted message bytes
     */
    this.encryptMessage = queue.wrap(co.wrap(function*(paddedMessage) {
        var whisperMessage = yield createWhisperMessage(paddedMessage);

        yield ratchet.clickSubRatchet(sessionStateList.mostRecentSession().sendingChain);
        sessionStateList.save();

        if (sessionStateList.mostRecentSession().pendingPreKey) {
            return {
                type: MessageTypes.PreKeyWhisperMessage,
                body: createPreKeyWhisperMessage(whisperMessage)
            };
        } else {
            return {
                type: MessageTypes.WhisperMessage,
                body: whisperMessage
            };
        }
    }));

    /**
     * Unwrap the WhisperMessage from a PreKeyWhisperMessage and decrypt it.
     *
     * @method
     * @param {ArrayBuffer} preKeyWhisperMessageBytes
     * @returns {Promise.<ArrayBuffer, InvalidMessageException>}
     */
    this.decryptPreKeyWhisperMessage = (preKeyWhisperMessageBytes) => {
        var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
        return self.decryptWhisperMessage(preKeyWhisperMessage.message.message);
    };

    /**
     * Decrypt a WhisperMessage.
     * <p>
     * This method will always execute sequentially even if it is called multiple times.
     *
     * @method
     * @param {ArrayBuffer} whisperMessageBytes
     * @returns {Promise.<ArrayBuffer, InvalidMessageException>}
     */
    this.decryptWhisperMessage = queue.wrap(co.wrap(function*(whisperMessageBytes) {
        var exceptions = [];
        for (var sessionState of sessionStateList.sessions) {
            var clonedSessionState = new SessionState(sessionState);
            var promise = decryptWhisperMessageWithSessionState(clonedSessionState, whisperMessageBytes);
            var result = yield promise.catch((e) => {
                exceptions.push(e);
            });
            if (result !== undefined) {
                sessionStateList.removeSessionState(sessionState);
                sessionStateList.addSessionState(clonedSessionState);
                sessionStateList.save();
                return result;
            }
        }
        var messages = exceptions.map((e) => e.toString());
        throw new InvalidMessageException("Unable to decrypt message: " + messages);
    }));

    /**
     * Attempt to decrypt a WhisperMessage using sessionState.
     * <p>
     * Failure of this method is not necessarily fatal as it may be possible to decrypt the message using another
     * session state.
     *
     * @method
     * @private
     * @param {SessionState} sessionState
     * @param {ArrayBuffer} whisperMessageBytes
     * @returns {Promise.<ArrayBuffer, InvalidMessageException>}
     */
    var decryptWhisperMessageWithSessionState = co.wrap(function*(sessionState, whisperMessageBytes) {
        var whisperMessage = Messages.decodeWhisperMessage(whisperMessageBytes);
        var macInputTypes = Messages.decodeWhisperMessageMacInput(whisperMessageBytes);

        if (whisperMessage.version.current !== sessionState.sessionVersion) {
            throw new InvalidMessageException("Message version doesn't match session version");
        }

        var message = whisperMessage.message;
        var theirEphemeralPublicKey = message.ratchetKey;

        var receivingChain = yield getOrCreateReceivingChain(sessionState, theirEphemeralPublicKey);
        var messageKeys = yield getOrCreateMessageKeys(theirEphemeralPublicKey, receivingChain, message.counter);
        var isValid = yield isValidMac(macInputTypes, messageKeys.macKey, whisperMessage.version.current,
            sessionState.remoteIdentityKey, sessionState.localIdentityKey, whisperMessage.mac);

        if (!isValid) {
            throw new InvalidMessageException("Bad mac");
        }

        // TODO: Support for version 2: Use CTR mode instead of CBC
        var plaintext = yield crypto.decrypt(messageKeys.cipherKey, message.ciphertext, messageKeys.iv);

        sessionState.pendingPreKey = null;

        return plaintext;
    });

    /**
     * Verifies the MAC of a WhisperMessage.
     *
     * @method
     * @private
     * @param {ArrayBuffer} data - the data to calculate the MAC over
     * @param {ArrayBuffer} macKey - the MAC key
     * @param {number} messageVersion
     * @param {ArrayBuffer} senderIdentityKey
     * @param {ArrayBuffer} receiverIdentityKey
     * @param {ArrayBuffer} theirMac - the MAC to check
     * @return {Promise.<Boolean, Error>} true if theirMac is valid, false otherwise.
     */
    var isValidMac = co.wrap(function*(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey, theirMac) {
        var ourMac = yield getMac(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey);
        return ArrayBufferUtils.areEqual(ourMac, theirMac);
    });

    /**
     * Calculate the MAC of a WhisperMessage.
     *
     * @method
     * @private
     * @param {ArrayBuffer} data - the data to calculate the MAC over
     * @param {ArrayBuffer} macKey - the MAC key
     * @param {number} messageVersion
     * @param {ArrayBuffer} senderIdentityKey
     * @param {ArrayBuffer} receiverIdentityKey
     * @return {Promise.<ArrayBuffer, Error>} the MAC bytes.
     */
    var getMac = co.wrap(function*(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey) {
        var macInputs = (messageVersion >= 3) ? [senderIdentityKey, receiverIdentityKey] : [];
        macInputs.push(data);
        var macBytes = yield crypto.hmac(macKey, ArrayBufferUtils.concat(macInputs));
        return macBytes.slice(0, ProtocolConstants.macByteCount);
    });

    /**
     * Create an encrypted WhisperMessage.
     *
     * @method
     * @private
     * @param {ArrayBuffer} paddedMessage
     * @return {Promise.<ArrayBuffer, Error>} the bytes of an encoded WhisperMessage
     */
    var createWhisperMessage = co.wrap(function*(paddedMessage) {
        var messageKeys = yield ratchet.deriveMessageKeys(sessionStateList.mostRecentSession().sendingChain.key);
        // TODO: Should use CTR mode in version 2 of protocol
        var ciphertext = yield crypto.encrypt(messageKeys.cipherKey, paddedMessage, messageKeys.iv);

        var version = {
            current: sessionStateList.mostRecentSession().sessionVersion,
            max: ProtocolConstants.currentVersion
        };
        var message = {
            ratchetKey: sessionStateList.mostRecentSession().senderRatchetKeyPair.public,
            counter: sessionStateList.mostRecentSession().sendingChain.index,
            previousCounter: sessionStateList.mostRecentSession().previousCounter,
            ciphertext: ciphertext
        };
        var macInputBytes = Messages.encodeWhisperMessageMacInput({
            version: version,
            message: message
        });

        return Messages.encodeWhisperMessage({
            version: version,
            message: message,
            mac: yield getMac(macInputBytes, messageKeys.macKey, sessionStateList.mostRecentSession().sessionVersion,
                sessionStateList.mostRecentSession().localIdentityKey,
                sessionStateList.mostRecentSession().remoteIdentityKey)
        });
    });

    /**
     * Create an encrypted PreKeyWhisperMessage.
     *
     * @method
     * @private
     * @param {ArrayBuffer} whisperMessage - the bytes of an encoded WhisperMessage
     * @return {Promise.<ArrayBuffer, Error>} the bytes of an encoded PreKeyWhisperMessage
     */
    var createPreKeyWhisperMessage = (whisperMessage) => {
        var pendingPreKey = sessionStateList.mostRecentSession().pendingPreKey;
        return Messages.encodePreKeyWhisperMessage({
            version: {
                current: sessionStateList.mostRecentSession().sessionVersion,
                max: ProtocolConstants.currentVersion
            },
            message: {
                registrationId: sessionStateList.mostRecentSession().localRegistrationId,
                preKeyId: pendingPreKey.preKeyId,
                signedPreKeyId: pendingPreKey.signedPreKeyId,
                baseKey: pendingPreKey.baseKey,
                identityKey: sessionStateList.mostRecentSession().localIdentityKey,
                message: whisperMessage
            }
        });
    };

    /**
     * Find the chain for decryption that corresponds to the ephemeral key sent in their message.
     * <p>
     * This method handles stepping the main ratchet, if necessary.
     *
     * @method
     * @private
     * @param {SessionState} sessionState
     * @param {ArrayBuffer} theirEphemeralPublicKey - the ephemeral key sent in the message.
     * @return {Promise.<Chain, Error>} the receiving chain
     */
    var getOrCreateReceivingChain = co.wrap(function*(sessionState, theirEphemeralPublicKey) {
        // If they've sent us multiple messages before receiving a reply from us, then those messages will be sent using
        // the same ephemeral key (i.e. the main ratchet will not click forward).
        var chain = sessionState.findReceivingChain(theirEphemeralPublicKey);
        if (chain) {
            return chain;
        }
        // This is the first message in a new chain.
        return yield clickMainRatchet(sessionState, theirEphemeralPublicKey);
    });

    /**
     * Find the message keys for decryption that correspond to the ephemeral key sent in their message.
     * <p>
     * This method handles stepping the sub ratchet, if necessary.
     *
     * @method
     * @private
     * @param {ArrayBuffer} theirEphemeralPublicKey - the ephemeral key sent in the message.
     * @param {Chain} chain - the chain for decryption.
     * @param {number} counter - the counter sent in the message.
     * @return {Promise.<MessageKeys, Error>} the message keys for decryption
     */
    var getOrCreateMessageKeys = co.wrap(function*(theirEphemeralPublicKey, chain, counter) {
        if (chain.index > counter) {
            // The message is an old message that has been delivered out of order. We should still have the message
            // key cached unless this is a duplicate message that we've seen before.
            var cachedMessageKeys = chain.messageKeys[counter];
            if (!cachedMessageKeys) {
                throw new DuplicateMessageException("Received message with old counter");
            }
            // We don't want to be able to decrypt this message again, for forward secrecy.
            delete chain.messageKeys[counter];
            return cachedMessageKeys;
        } else {
            // Otherwise, the message is a new message in the chain and we must click the sub ratchet forwards.
            if (counter - chain.index > ProtocolConstants.maximumMissedMessages) {
                throw new InvalidMessageException("Too many skipped messages");
            }
            while (chain.index < counter) {
                // Some messages have not yet been delivered ("skipped") and so we need to catch the sub ratchet up
                // while keeping the message keys for when the messages are eventually delivered.
                chain.messageKeys[chain.index] = yield ratchet.deriveMessageKeys(chain.key);
                yield ratchet.clickSubRatchet(chain);
            }
            var messageKeys = yield ratchet.deriveMessageKeys(chain.key);
            // As we have received the message, we should click the sub ratchet forwards so we can't decrypt it again
            yield ratchet.clickSubRatchet(chain);
            return messageKeys;
        }
    });

    /**
     * "clicks" the Diffie-Hellman ratchet two steps forwards. Once to catch up with the other party and once
     * more so that the next message we send will be one ahead.
     *
     * @method
     * @private
     * @param {SessionState} sessionState
     * @param {ArrayBuffer} theirEphemeralPublicKey
     * @return {Promise.<Chain, Error>} the next chain for decryption
     */
    var clickMainRatchet = co.wrap(function*(sessionState, theirEphemeralPublicKey) {
        var {
            rootKey: theirRootKey,
            chain: nextReceivingChain
        } = yield ratchet.deriveNextRootKeyAndChain(sessionState.rootKey, theirEphemeralPublicKey,
                sessionState.senderRatchetKeyPair.private);
        var ourNewEphemeralKeyPair = yield crypto.generateKeyPair();
        var {
            rootKey,
            chain: nextSendingChain
        } = yield ratchet.deriveNextRootKeyAndChain(theirRootKey,
                theirEphemeralPublicKey, ourNewEphemeralKeyPair.private);
        sessionState.rootKey = rootKey;
        sessionState.addReceivingChain(theirEphemeralPublicKey, nextReceivingChain);
        sessionState.previousCounter = Math.max(sessionState.sendingChain.index - 1, 0);
        sessionState.sendingChain = nextSendingChain;
        sessionState.senderRatchetKeyPair = ourNewEphemeralKeyPair;
        return nextReceivingChain;
    });

    Object.freeze(self);
}

export default Session;
