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
import Ratchet from "./Ratchet";
import {InvalidMessageException, DuplicateMessageException, ConcurrentUseException} from "./Exceptions";
import co from "co";

function Session(crypto, sessionState) {
    const self = this;

    const ratchet = new Ratchet(crypto);

    var isLocked = false;

    self.encryptMessage = withLock(co.wrap(function*(paddedMessage) {
        var whisperMessage = yield createWhisperMessage(paddedMessage);

        // TODO: Order of operations important here? Exception safety?
        yield ratchet.clickSubRatchet(sessionState.sendingChain);
        //sessionState.save();

        if (sessionState.pendingPreKey) {
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

    self.decryptPreKeyWhisperMessage = (preKeyWhisperMessageBytes) => {
        var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
        return self.decryptWhisperMessage(preKeyWhisperMessage.message.message);
    };

    self.decryptWhisperMessage = withLock(co.wrap(function*(whisperMessageBytes) {
        var whisperMessage = Messages.decodeWhisperMessage(whisperMessageBytes);
        var macInputTypes = Messages.decodeWhisperMessageMacInput(whisperMessageBytes);

        if (whisperMessage.version.current !== sessionState.sessionVersion) {
            throw new InvalidMessageException("Message version doesn't match session version");
        }

        var message = whisperMessage.message;
        var theirEphemeralPublicKey = message.ratchetKey;

        var receivingChain = yield getOrCreateReceivingChainKey(theirEphemeralPublicKey);
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
    }));

    function withLock(fn) {
        return function() {
            if (isLocked) {
                return Promise.reject(new ConcurrentUseException("Another operation is already in progress"));
            }
            isLocked = true;
            return fn.apply(self, arguments).then(function(result) {
                isLocked = false;
                return result;
            }, function(error) {
                isLocked = false;
                return Promise.reject(error);
            });
        };
    }

    var isValidMac = co.wrap(function*(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey, theirMac) {
        var ourMac = yield getMac(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey);
        return ArrayBufferUtils.areEqual(ourMac, theirMac);
    });

    var getMac = co.wrap(function*(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey) {
        var macInputs = (messageVersion >= 3) ? [senderIdentityKey, receiverIdentityKey] : [];
        macInputs.push(data);
        var macBytes = yield crypto.hmac(macKey, ArrayBufferUtils.concat(macInputs));
        return macBytes.slice(0, ProtocolConstants.macByteCount);
    });

    var createWhisperMessage = co.wrap(function*(paddedMessage) {
        var messageKeys = yield ratchet.deriveMessageKeys(sessionState.sendingChain.key);
        // TODO: Should use CTR mode in version 2 of protocol
        var ciphertext = yield crypto.encrypt(messageKeys.cipherKey, paddedMessage, messageKeys.iv);

        var version = {
            current: sessionState.sessionVersion,
            max: ProtocolConstants.currentVersion
        };
        var message = {
            ratchetKey: sessionState.senderRatchetKeyPair.public,
            counter: sessionState.sendingChain.index,
            previousCounter: sessionState.previousCounter,
            ciphertext: ciphertext
        };
        var macInputBytes = Messages.encodeWhisperMessageMacInput({
            version: version,
            message: message
        });

        return Messages.encodeWhisperMessage({
            version: version,
            message: message,
            mac: yield getMac(macInputBytes, messageKeys.macKey, sessionState.sessionVersion,
                sessionState.localIdentityKey, sessionState.remoteIdentityKey)
        });
    });

    var createPreKeyWhisperMessage = (whisperMessage) => {
        var pendingPreKey = sessionState.pendingPreKey;
        return Messages.encodePreKeyWhisperMessage({
            version: {
                current: sessionState.sessionVersion,
                max: ProtocolConstants.currentVersion
            },
            message: {
                registrationId: sessionState.localRegistrationId,
                preKeyId: pendingPreKey.preKeyId,
                signedPreKeyId: pendingPreKey.signedPreKeyId,
                baseKey: pendingPreKey.baseKey,
                identityKey: sessionState.localIdentityKey,
                message: whisperMessage
            }
        });
    };

    var getOrCreateReceivingChainKey = co.wrap(function*(theirEphemeralPublicKey) {
        // If they've sent us multiple messages before we've replied, then we'll see their ephemeral key more than once
        var chain = sessionState.findReceivingChain(theirEphemeralPublicKey);
        if (chain) {
            return chain;
        }
        // This is the first message in a new chain
        return yield clickMainRatchet(theirEphemeralPublicKey);
    });

    var getOrCreateMessageKeys = co.wrap(function*(theirEphemeralPublicKey, chain, counter) {
        if (chain.index > counter) {
            var cachedMessageKeys = chain.messageKeys[counter];
            if (!cachedMessageKeys) {
                throw new DuplicateMessageException("Received message with old counter");
            }
            delete chain.messageKeys[counter];
            return cachedMessageKeys;
        }
        if (counter - chain.index > ProtocolConstants.maximumMissedMessages) {
            throw new InvalidMessageException("Too many skipped messages");
        }
        while (chain.index < counter) {
            chain.messageKeys[chain.index] = yield ratchet.deriveMessageKeys(chain.key);
            yield ratchet.clickSubRatchet(chain);
        }
        var messageKeys = yield ratchet.deriveMessageKeys(chain.key);
        yield ratchet.clickSubRatchet(chain);
        return messageKeys;
    });

    // "clicks" the DH ratchet two steps forwards. Once to catch up with the other party and once
    // again to get one click ahead.
    var clickMainRatchet = co.wrap(function*(theirEphemeralPublicKey) {
        var nextReceivingChain = yield ratchet.deriveNewRootAndChainKeys(sessionState.rootKey, theirEphemeralPublicKey,
            sessionState.senderRatchetKeyPair.private);
        var ourNewEphemeralKeyPair = yield crypto.generateKeyPair();
        var nextSendingChain = yield ratchet.deriveNewRootAndChainKeys(nextReceivingChain.rootKey,
            theirEphemeralPublicKey, ourNewEphemeralKeyPair.private);
        sessionState.rootKey = nextSendingChain.rootKey;
        sessionState.addReceivingChain(theirEphemeralPublicKey, nextReceivingChain.chain);
        sessionState.previousCounter = Math.max(sessionState.sendingChain.index - 1, 0);
        sessionState.sendingChain = nextSendingChain.chain;
        sessionState.senderRatchetKeyPair = ourNewEphemeralKeyPair;
        return nextReceivingChain.chain;
    });

    Object.freeze(self);
}

export default Session;
