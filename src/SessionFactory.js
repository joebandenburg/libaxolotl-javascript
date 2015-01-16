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
import SessionStateList from "./SessionStateList";
import {InvalidKeyException, UnsupportedProtocolVersionException, UntrustedIdentityException} from "./Exceptions";
import co from "co";

function SessionFactory(crypto, store) {
    const self = this;

    const ratchet = new Ratchet(crypto);

    var sessionCache = {};

    self.createSessionFromPreKeyBundle = co.wrap(function*(toIdentity, retrievedPreKeyBundle) {
        var isTrusted = yield store.isRemoteIdentityTrusted(toIdentity, retrievedPreKeyBundle.identityKey);
        if (!isTrusted) {
            throw new UntrustedIdentityException();
        }
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
        var sessionStateList = new SessionStateList((serialisedState) => {
            return store.putSession(toIdentity, serialisedState);
        });
        sessionStateList.addSessionState(sessionState);
        yield sessionStateList.save();
        yield store.putRemoteIdentity(toIdentity, retrievedPreKeyBundle.identityKey);
        return yield self.getSessionForIdentity(toIdentity);
    });

    self.createSessionFromPreKeyWhisperMessage = co.wrap(function*(fromIdentity, preKeyWhisperMessageBytes) {
        var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
        if (preKeyWhisperMessage.version.current !== 3) {
            // TODO: Support protocol version 2
            throw new UnsupportedProtocolVersionException("Protocol version " +
                preKeyWhisperMessage.version.current + " is not supported");
        }
        var message = preKeyWhisperMessage.message;
        var isTrusted = yield store.isRemoteIdentityTrusted(fromIdentity, message.identityKey);
        if (!isTrusted) {
            throw new UntrustedIdentityException();
        }

        if (self.hasSessionForIdentity(fromIdentity)) {
            var cachedSession = yield getSessionStateListForIdentity(fromIdentity);
            for (var cachedSessionState of cachedSession.sessionStateList.sessions) {
                if (cachedSessionState.theirBaseKey &&
                    ArrayBufferUtils.areEqual(cachedSessionState.theirBaseKey, message.baseKey)) {
                    return cachedSession.session;
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
        var { sessionStateList: sessionStateList } = yield getSessionStateListForIdentity(fromIdentity);
        sessionStateList.addSessionState(sessionState);
        yield sessionStateList.save();
        yield store.putRemoteIdentity(fromIdentity, message.identityKey);
        return yield self.getSessionForIdentity(fromIdentity);
    });

    // TODO: Implement
    //self.createSessionFromKeyExchange = (toIdentity, keyExchange) => {};

    self.hasSessionForIdentity = (identity) => {
        return store.hasSession(identity);
    };

    var getSessionStateListForIdentity = co.wrap(function*(identity) {
        if (!sessionCache[identity]) {
            var serialisedSessionStateList = yield store.getSession(identity);
            var sessionStateList = new SessionStateList((serialisedState) => {
                return store.putSession(identity, serialisedState);
            }, serialisedSessionStateList);
            sessionCache[identity] = {
                sessionStateList: sessionStateList,
                session: new Session(crypto, sessionStateList)
            };
        }
        return sessionCache[identity];
    });

    self.getSessionForIdentity = co.wrap(function*(identity) {
        var cachedSession = yield getSessionStateListForIdentity(identity);
        return cachedSession.session;
    });

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
