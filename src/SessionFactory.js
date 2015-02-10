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

import WhisperProtos from "./WhisperProtos";
import ArrayBufferUtils from "./ArrayBufferUtils";
import Messages from "./Messages";
import Ratchet from "./Ratchet";
import SessionState from "./SessionState";
import Session from "./Session";
import {InvalidKeyException, UnsupportedProtocolVersionException, UntrustedIdentityException} from "./Exceptions";
import co from "co";

function SessionFactory(crypto, store) {
    const self = this;

    const ratchet = new Ratchet(crypto);

    /**
     * @typedef {Object} PreKeyBundle
     * @property {ArrayBuffer} identityKey - The remote identity's public key.
     * @property {Number} preKeyId - The identifier of the pre-key included in this bundle.
     * @property {ArrayBuffer} preKey - The public half of the pre-key.
     * @property {Number} signedPreKeyId - The identifier of the signed pre-key included in this bundle.
     * @property {ArrayBuffer} signedPreKey - The public half of the signed pre-key.
     * @property {ArrayBuffer} signedPreKeySignature - The signature associated with the `signedPreKey`
     */

    /**
     * Create a session from a pre-key bundle, probably retrieved from a server.
     * @method
     * @type {PreKeyBundle} retrievedPreKeyBundle - a pre-key bundle
     * @returns {Promise.<Session, Error>}
     */
    self.createSessionFromPreKeyBundle = co.wrap(function*(retrievedPreKeyBundle) {
        if (retrievedPreKeyBundle.signedPreKey) {
            var validSignature = yield crypto.verifySignature(retrievedPreKeyBundle.identityKey,
                retrievedPreKeyBundle.signedPreKey,
                retrievedPreKeyBundle.signedPreKeySignature);
            if (!validSignature) {
                throw new InvalidKeyException("Invalid signature on device key");
            }
        }

        if (!retrievedPreKeyBundle.preKey && !retrievedPreKeyBundle.signedPreKey) {
            throw new InvalidKeyException("Both signed and unsigned pre keys are absent");
        }

        var supportsV3 = !!retrievedPreKeyBundle.signedPreKey;
        var ourBaseKeyPair = yield crypto.generateKeyPair();
        var theirSignedPreKey = supportsV3 ? retrievedPreKeyBundle.signedPreKey : retrievedPreKeyBundle.preKey;

        var aliceParameters = {
            sessionVersion: supportsV3 ? 3 : 2,
            ourBaseKeyPair: ourBaseKeyPair,
            ourIdentityKeyPair: yield store.getLocalIdentityKeyPair(),
            theirIdentityKey: retrievedPreKeyBundle.identityKey,
            theirSignedPreKey: theirSignedPreKey,
            theirRatchetKey: theirSignedPreKey,
            theirOneTimePreKey: supportsV3 ? retrievedPreKeyBundle.preKey : undefined
        };

        var sessionState = yield initializeAliceSession(aliceParameters);
        sessionState.pendingPreKey = {
            preKeyId: supportsV3 ? retrievedPreKeyBundle.preKeyId : null,
            signedPreKeyId: retrievedPreKeyBundle.signedPreKeyId,
            baseKey: ourBaseKeyPair.public
        };
        sessionState.localRegistrationId = yield store.getLocalRegistrationId();
        var session = new Session();
        session.addState(sessionState);
        return session;
    });

    /**
     * Create a session from a PreKeyWhisperMessage.
     * @method
     * @type {Session} session - a session, if one exists, or null otherwise.
     * @type {ArrayBuffer} preKeyWhisperMessageBytes - the bytes of a PreKeyWhisperMessage.
     * @returns {Promise.<Session, Error>}
     */
    self.createSessionFromPreKeyWhisperMessage = co.wrap(function*(session, preKeyWhisperMessageBytes) {
        var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
        if (preKeyWhisperMessage.version.current !== 3) {
            // TODO: Support protocol version 2
            throw new UnsupportedProtocolVersionException("Protocol version " +
                preKeyWhisperMessage.version.current + " is not supported");
        }
        var message = preKeyWhisperMessage.message;

        if (session) {
            for (var cachedSessionState of session.states) {
                if (cachedSessionState.theirBaseKey &&
                    ArrayBufferUtils.areEqual(cachedSessionState.theirBaseKey, message.baseKey)) {
                    return session;
                }
            }
        }

        var ourSignedPreKeyPair = yield store.getLocalSignedPreKeyPair(message.signedPreKeyId);

        var preKeyPair;
        if (message.preKeyId) {
            preKeyPair = yield store.getLocalPreKeyPair(message.preKeyId);
        }

        var bobParameters = {
            sessionVersion: preKeyWhisperMessage.version.current,
            theirBaseKey: message.baseKey,
            theirIdentityKey: message.identityKey,
            ourIdentityKeyPair: yield store.getLocalIdentityKeyPair(),
            ourSignedPreKeyPair: ourSignedPreKeyPair,
            ourRatchetKeyPair: ourSignedPreKeyPair,
            ourOneTimePreKeyPair: preKeyPair
        };

        var sessionState = yield initializeBobSession(bobParameters);
        sessionState.theirBaseKey = message.baseKey;
        var clonedSession = new Session(session);
        clonedSession.addState(sessionState);
        return clonedSession;
    });

    // TODO: Implement
    //self.createSessionFromKeyExchange = (toIdentity, keyExchange) => {};

    var initializeAliceSession = co.wrap(function*(parameters) {
        var sendingRatchetKeyPair = yield crypto.generateKeyPair();

        var agreements = [
            crypto.calculateAgreement(parameters.theirSignedPreKey, parameters.ourIdentityKeyPair.private),
            crypto.calculateAgreement(parameters.theirIdentityKey, parameters.ourBaseKeyPair.private),
            crypto.calculateAgreement(parameters.theirSignedPreKey, parameters.ourBaseKeyPair.private)
        ];
        if (parameters.sessionVersion >= 3 && parameters.theirOneTimePreKey) {
            agreements.push(crypto.calculateAgreement(parameters.theirOneTimePreKey,
                parameters.ourBaseKeyPair.private));
        }
        var {
            rootKey: theirRootKey,
            chain: receivingChain
        } = yield ratchet.deriveInitialRootKeyAndChain(parameters.sessionVersion, yield agreements);
        var {
            rootKey,
            chain: sendingChain
        } = yield ratchet.deriveNextRootKeyAndChain(theirRootKey, parameters.theirRatchetKey,
                sendingRatchetKeyPair.private);

        var sessionState = new SessionState({
            sessionVersion: parameters.sessionVersion,
            remoteIdentityKey: parameters.theirIdentityKey,
            localIdentityKey: parameters.ourIdentityKeyPair.public,
            rootKey: rootKey,
            sendingChain: sendingChain,
            senderRatchetKeyPair: sendingRatchetKeyPair
        });
        sessionState.addReceivingChain(parameters.theirRatchetKey, receivingChain);
        return sessionState;
    });

    var initializeBobSession = co.wrap(function*(parameters) {
        var agreements = [
            crypto.calculateAgreement(parameters.theirIdentityKey, parameters.ourSignedPreKeyPair.private),
            crypto.calculateAgreement(parameters.theirBaseKey, parameters.ourIdentityKeyPair.private),
            crypto.calculateAgreement(parameters.theirBaseKey, parameters.ourSignedPreKeyPair.private)
        ];

        if (parameters.sessionVersion >= 3 && parameters.ourOneTimePreKeyPair) {
            agreements.push(crypto.calculateAgreement(parameters.theirBaseKey,
                parameters.ourOneTimePreKeyPair.private));
        }

        var {
            rootKey,
            chain: sendingChain
        } = yield ratchet.deriveInitialRootKeyAndChain(parameters.sessionVersion, yield agreements);

        return new SessionState({
            sessionVersion: parameters.sessionVersion,
            remoteIdentityKey: parameters.theirIdentityKey,
            localIdentityKey: parameters.ourIdentityKeyPair.public,
            rootKey: rootKey,
            sendingChain: sendingChain,
            senderRatchetKeyPair: parameters.ourRatchetKeyPair
        });
    });

    Object.freeze(self);
}

export default SessionFactory;
