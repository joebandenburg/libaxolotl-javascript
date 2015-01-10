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

import Session from "./Session";
import WhisperProtos from "./WhisperProtos";
import ArrayBufferUtils from "./ArrayBufferUtils";
import Messages from "./Messages";
import SessionUtils from "./SessionUtils";
import Ratchet from "./Ratchet";
import SessionState from "./SessionState";
import {InvalidKeyException, UnsupportedProtocolVersionException} from "./Exceptions";
import co from "co";

function SessionFactory(crypto, store) {
    const self = this;

    const ratchet = new Ratchet(crypto);

    self.createSessionFromPreKeyBundle = co.wrap(function*(recipientId, deviceId, retrievedPreKey) {
        // TODO: Check identity is trusted
        if (retrievedPreKey.signedPreKey) {
            var validSignature = yield crypto.verifySignature(retrievedPreKey.identityKey, retrievedPreKey.signedPreKey,
                retrievedPreKey.signedPreKeySignature);
            if (!validSignature) {
                throw new InvalidKeyException("Invalid signature on device key");
            }
        }

        if (!retrievedPreKey.preKey && !retrievedPreKey.signedPreKey) {
            throw new InvalidKeyException("Both signed and unsigned pre keys are absent");
        }

        var supportsV3 = !!retrievedPreKey.signedPreKey;
        var ourBaseKeyPair = yield crypto.generateKeyPair();
        var theirSignedPreKey = supportsV3 ? retrievedPreKey.signedPreKey : retrievedPreKey.preKey;

        var aliceParameters = {
            sessionVersion: supportsV3 ? 3 : 2,
            ourBaseKeyPair: ourBaseKeyPair,
            ourIdentityKeyPair: /*TODO*/ store.getIdentityKeyPair(),
            theirIdentityKey: retrievedPreKey.identityKey,
            theirSignedPreKey: theirSignedPreKey,
            theirRatchetKey: theirSignedPreKey,
            theirOneTimePreKey: supportsV3 ? retrievedPreKey.preKey : undefined
        };

        var sessionState = yield initializeAliceSession(aliceParameters);
        sessionState.pendingPreKey = {
            preKeyId: supportsV3 ? retrievedPreKey.preKeyId : null,
            signedPreKeyId: retrievedPreKey.signedPreKeyId,
            baseKey: ourBaseKeyPair.public
        };
        sessionState.localRegistrationId = store.getLocalRegistrationId();
        return new Session(crypto, sessionState);
    });

    self.createSessionFromPreKeyWhisperMessage = co.wrap(function*(recipientId, deviceId, preKeyWhisperMessageBytes) {
        // TODO: Check identity is trusted
        // TODO: Check session doesn't already exist
        var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
        if (preKeyWhisperMessage.version.current !== 3) {
            // TODO: Support protocol version 2
            throw new UnsupportedProtocolVersionException("Protocol version 2 not supported");
        }
        var message = preKeyWhisperMessage.message;

        var ourSignedPreKeyPair = store.getSignedPreKeyPair(message.signedPreKeyId);

        var preKeyPair;
        if (message.preKeyId) {
            preKeyPair = store.getPreKeyPair(message.preKeyId);
        }

        var bobParameters = {
            sessionVersion: preKeyWhisperMessage.version.current,
            theirBaseKey: message.baseKey,
            theirIdentityKey: message.identityKey,
            ourIdentityKeyPair: /*TODO*/ store.getIdentityKeyPair(),
            ourSignedPreKeyPair: ourSignedPreKeyPair,
            ourRatchetKeyPair: ourSignedPreKeyPair,
            ourOneTimePreKeyPair: preKeyPair
        };

        var sessionState = yield initializeBobSession(bobParameters);
        return new Session(crypto, sessionState);
    });

    self.createSessionFromKeyExchange = (recipientId, deviceId, keyExchange) => {
        // TODO: Implement
    };

    self.restoreSession = (recipientId, deviceId) => {
        // TODO: Implement
    };

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
        var receivingChain = yield ratchet.deriveInitialRootAndChainKeys(parameters.sessionVersion, yield agreements);
        var sendingChain = yield ratchet.deriveNewRootAndChainKeys(receivingChain.rootKey, parameters.theirRatchetKey,
            sendingRatchetKeyPair.private);

        var sessionState = new SessionState({
            sessionVersion: parameters.sessionVersion,
            remoteIdentityKey: parameters.theirIdentityKey,
            localIdentityKey: parameters.ourIdentityKeyPair.public,
            rootKey: sendingChain.rootKey,
            sendingChain: sendingChain.chain,
            senderRatchetKeyPair: sendingRatchetKeyPair
        });
        sessionState.addReceivingChain(parameters.theirRatchetKey, receivingChain.chain);
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

        var sendingChain = yield ratchet.deriveInitialRootAndChainKeys(parameters.sessionVersion, yield agreements);

        return new SessionState({
            sessionVersion: parameters.sessionVersion,
            remoteIdentityKey: parameters.theirIdentityKey,
            localIdentityKey: parameters.ourIdentityKeyPair.public,
            rootKey: sendingChain.rootKey,
            sendingChain: sendingChain.chain,
            senderRatchetKeyPair: parameters.ourRatchetKeyPair
        });
    });

    Object.freeze(self);
}

export default SessionFactory;
