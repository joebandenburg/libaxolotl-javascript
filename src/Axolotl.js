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
import SessionCipher from "./SessionCipher";
import {InvalidMessageException} from "./Exceptions";
import Store from "./Store";
import Crypto from "./Crypto";
import co from "co";
import axolotlCrypto from "axolotl-crypto";

/**
 * A public/private key pair
 * @typedef {object} KeyPair
 * @property {ArrayBuffer} public - the public key bytes
 * @property {ArrayBuffer} private - the private key bytes
 */

/**
 * @typedef {object} PreKey
 * @property {number} id - a 16-bit identifier for the signed pre key
 * @property {KeyPair} keyPair - a key pair
 */

/**
 * A {@link KeyPair} with a signature.
 * @typedef {object} SignedPreKey
 * @property {number} id - a 16-bit identifier for the signed pre key
 * @property {KeyPair} keyPair - a key pair
 * @property {ArrayBuffer} signature - a signature for the key pair
 */

/**
 * A service providing cryptographic primitives. See the README for details on the methods.
 * @typedef {object} Crypto
 * @property {function} generateKeyPair
 * @property {function} calculateAgreement
 * @property {function} randomBytes
 * @property {function} sign
 * @property {function} verifySignature
 * @property {function} hmac
 * @property {function} encrypt
 * @property {function} decrypt
 */

/**
 * A service providing various storage facilities. See the README for details on the methods.
 * @typedef {object} Store
 * @property {function} getLocalIdentityKeyPair
 * @property {function} getLocalRegistrationId
 * @property {function} getLocalSignedPreKeyPair
 * @property {function} getLocalPreKeyPair
 * @property {function} getRemotePreKeyBundle
 * @property {function} isRemoteIdentityTrusted
 * @property {function} hasSession
 * @property {function} getSession
 * @property {function} putSession
 */

/**
 * An unique identifier for a remote entity. Clients are free to use whatever they wish for this.
 * @typedef {*} Identity
 */

/**
 * A single Axolotl instance may be used to encrypt/decrypt messages to/from many remote entities.
 * <p>
 * Clients must implement and supply both the crypto and store services, which are required by Axolotl to function.
 *
 * @param {Crypto} crypto - cryptographic service
 * @param {Store} store - storage service
 * @constructor
 */
function Axolotl(crypto, store) {
    var self = this;

    var wrappedStore = new Store(store);
    var wrappedCrypto = new Crypto(crypto);

    var sessionFactory = new SessionFactory(wrappedCrypto, wrappedStore);
    var sessionCipher = new SessionCipher(wrappedCrypto);

    /**
     * Generate an identity key pair. Clients should only do this once, at install time.
     *
     * @method
     * @return {Promise.<KeyPair, Error>} generated key pair.
     */
    this.generateIdentityKeyPair = () => wrappedCrypto.generateKeyPair();

    /**
     * Generate a registration ID. Clients should only do this once, at install time.
     *
     * @method
     * @param {boolean} extendedRange - By default (false), the generated registration
     *                                  ID is sized to require the minimal possible protobuf
     *                                  encoding overhead. Specify true if the caller needs
     *                                  the full range of MAX_INT at the cost of slightly
     *                                  higher encoding overhead.
     * @return {number} generated registration ID.
     */
    this.generateRegistrationId = co.wrap(function*(extendedRange) {
        var upperLimit = (extendedRange) ? 0x7ffffffe : 0x3ffc;
        var bytes = yield wrappedCrypto.randomBytes(4);
        var number = new Uint32Array(bytes)[0];
        // TODO: Mod is a bad way to do this. Makes lower values more likely.
        return (number % upperLimit) + 1;
    });

    /**
     * Generate a list of PreKeys.  Clients should do this at install time, and
     * subsequently any time the list of PreKeys stored on the server runs low.
     * <p>
     * PreKey IDs are 16-bit numbers, so they will eventually be repeated.  Clients should
     * store PreKeys in a circular buffer, so that they are repeated as infrequently
     * as possible.
     *
     * @method
     * @param {number} start - The starting PreKey ID, inclusive.
     * @param {number} count - The number of PreKeys to generate.
     * @return {Promise.<Array.<PreKey>, Error>} the list of generated PreKeyRecords.
     */
    this.generatePreKeys = co.wrap(function*(start, count) {
        var results = [];
        start--;
        for (var i = 0; i < count; i++) {
            results.push({
                id: ((start + i) % 0xfffffe) + 1,
                keyPair: yield wrappedCrypto.generateKeyPair()
            });
        }
        return results;
    });

    /**
     * Generate the last resort PreKey.  Clients should do this only once, at install
     * time, and durably store it for the length of the install.
     *
     * @method
     * @return {Promise.<PreKey, Error>} the generated last resort PreKeyRecord.
     */
    this.generateLastResortPreKey = co.wrap(function*() {
        return {
            id: 0xffffff,
            keyPair: yield wrappedCrypto.generateKeyPair()
        };
    });

    /**
     * Generate a signed PreKey
     *
     * @method
     * @param {KeyPair} identityKeyPair - The local client's identity key pair.
     * @param {number} signedPreKeyId - The PreKey id to assign the generated signed PreKey
     * @return {SignedPreKey} the generated signed PreKey
     */
    this.generateSignedPreKey = co.wrap(function*(identityKeyPair, signedPreKeyId) {
        var keyPair = yield wrappedCrypto.generateKeyPair();
        var signature = yield wrappedCrypto.sign(identityKeyPair.private, keyPair.public);
        return {
            id: signedPreKeyId,
            keyPair: keyPair,
            signature: signature
        };
    });

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
     * @type {PreKeyBundle} a pre-key bundle
     * @returns {Promise.<Session, Error>}
     */
    this.createSessionFromPreKeyBundle = sessionFactory.createSessionFromPreKeyBundle;

    /**
     * Create a session from a PreKeyWhisperMessage.
     * @method
     * @type {Session} session - a session, if one exists, or null otherwise.
     * @type {ArrayBuffer} preKeyWhisperMessageBytes - the bytes of a PreKeyWhisperMessage.
     * @returns {Promise.<Session, Error>}
     */
    this.createSessionFromPreKeyWhisperMessage = sessionFactory.createSessionFromPreKeyWhisperMessage;

    /**
     * Encrypt a message using the session.
     * <p>
     * If this method succeeds, the passed in session should be destroyed. This method must never be called with
     * that session again.
     *
     * @method
     * @param {Session} session
     * @param {ArrayBuffer} message - the message bytes to be encrypted (optionally padded)
     * @return {Promise.<Object, Error>} an object containing the encrypted message bytes as well as a new session
     */
    this.encryptMessage = sessionCipher.encryptMessage;

    /**
     * Decrypt a WhisperMessage using session.
     * <p>
     * If this method succeeds, the passed in session should be destroyed. This method must never be called with
     * that session again.
     *
     * @method
     * @param {Session} session
     * @param {ArrayBuffer} whisperMessageBytes - the encrypted message bytes
     * @returns {Promise.<Object, InvalidMessageException>} an object containing the decrypted message and a new session
     */
    this.decryptWhisperMessage = sessionCipher.decryptWhisperMessage;

    /**
     * Unwrap the WhisperMessage from a PreKeyWhisperMessage and attempt to decrypt it using session.
     *
     * @method
     * @param {Session} session
     * @param {ArrayBuffer} preKeyWhisperMessageBytes - the encrypted message bytes
     * @returns {Promise.<Object, InvalidMessageException>} an object containing the decrypted message and a new session
     */
    this.decryptPreKeyWhisperMessage = sessionCipher.decryptPreKeyWhisperMessage;

    Object.freeze(self);
}

export default Axolotl;
