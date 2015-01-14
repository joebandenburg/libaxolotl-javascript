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

import SessionFactory from "./SessionFactory";
import {InvalidMessageException} from "./Exceptions";
import MessageTypes from "./MessageTypes";
import co from "co";

function Axolotl(crypto, store) {
    var self = this;

    var sessionFactory = new SessionFactory(crypto, store);

    /**
     * Generate an identity key pair. Clients should only do this once, at install time.
     *
     * @return {KeyPair} generated key pair.
     */
    self.generateIdentityKeyPair = () => crypto.generateKeyPair();

    /**
     * Generate a registration ID. Clients should only do this once, at install time.
     *
     * @param {boolean} extendedRange - By default (false), the generated registration
     *                                  ID is sized to require the minimal possible protobuf
     *                                  encoding overhead. Specify true if the caller needs
     *                                  the full range of MAX_INT at the cost of slightly
     *                                  higher encoding overhead.
     * @return {number} generated registration ID.
     */
    self.generateRegistrationId = (extendedRange) => {
        var upperLimit = (extendedRange) ? 0x7ffffffe : 0x3ffc;
        var bytes = crypto.randomBytes(4);
        var number = new Uint32Array(bytes)[0];
        // TODO: Mod is a bad way to do this. Makes lower values more likely.
        return (number % upperLimit) + 1;
    };

    /**
     * Generate a list of PreKeys.  Clients should do this at install time, and
     * subsequently any time the list of PreKeys stored on the server runs low.
     * <p>
     * PreKey IDs are shorts, so they will eventually be repeated.  Clients should
     * store PreKeys in a circular buffer, so that they are repeated as infrequently
     * as possible.
     *
     * @param {number} start - The starting PreKey ID, inclusive.
     * @param {number} count - The number of PreKeys to generate.
     * @return the list of generated PreKeyRecords.
     */
    self.generatePreKeys = co.wrap(function*(start, count) {
        var results = [];
        start--;
        for (var i = 0; i < count; i++) {
            results.push({
                id: ((start + i) % 0xfffffe) + 1,
                keyPair: yield crypto.generateKeyPair()
            });
        }
        return results;
    });

    /**
     * Generate the last resort PreKey.  Clients should do this only once, at install
     * time, and durably store it for the length of the install.
     *
     * @return the generated last resort PreKeyRecord.
     */
    self.generateLastResortPreKey = co.wrap(function*() {
        return {
            id: 0xffffff,
            keyPair: yield crypto.generateKeyPair()
        };
    });

    /**
     * Generate a signed PreKey
     *
     * @param {KeyPair} identityKeyPair - The local client's identity key pair.
     * @param {number} signedPreKeyId - The PreKey id to assign the generated signed PreKey
     *
     * @return the generated signed PreKey
     */
    self.generateSignedPreKey = co.wrap(function*(identityKeyPair, signedPreKeyId) {
        var keyPair = yield crypto.generateKeyPair();
        var signature = yield crypto.sign(identityKeyPair.private, keyPair.public);
        return {
            id: signedPreKeyId,
            keyPair: keyPair,
            signature: signature
        };
    });

    self.encryptMessage = co.wrap(function*(toIdentity, message) {
        var session;
        if (sessionFactory.hasSessionForIdentity(toIdentity)) {
            session = sessionFactory.getSessionForIdentity(toIdentity);
        } else {
            var preKeyBundle = yield store.getPreKeyBundle(toIdentity);
            session = yield sessionFactory.createSessionFromPreKeyBundle(toIdentity, preKeyBundle);
        }
        return yield session.encryptMessage(message);
    });

    self.decryptWhisperMessage = co.wrap(function*(fromIdentity, message) {
        if (!sessionFactory.hasSessionForIdentity(fromIdentity)) {
            throw new InvalidMessageException("No session for message");
        }
        return yield sessionFactory.getSessionForIdentity(fromIdentity).decryptWhisperMessage(message);
    });

    self.decryptPreKeyWhisperMessage = co.wrap(function*(fromIdentity, message) {
        var session = yield sessionFactory.createSessionFromPreKeyWhisperMessage(fromIdentity, message);
        return yield session.decryptPreKeyWhisperMessage(message);
    });

    Object.freeze(self);
}

Axolotl.PreKeyWhisperMessage = MessageTypes.PreKeyWhisperMessage;
Axolotl.WhisperMessage = MessageTypes.WhisperMessage;

export default Axolotl;
