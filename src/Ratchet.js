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

import HKDF from "./HKDF";
import Chain from "./Chain";
import ArrayBufferUtils from "./ArrayBufferUtils";
import ProtocolConstants from "./ProtocolConstants";
import co from "co";

const messageKeySeed = 0x01;
const chainKeySeed = 0x02;
const whisperMessageKeys = new Uint8Array([87, 104, 105, 115, 112, 101, 114, 77, 101, 115, 115, 97, 103, 101, 75, 101,
    121, 115]).buffer;
const whisperRatchet = new Uint8Array([87, 104, 105, 115, 112, 101, 114, 82, 97, 116, 99, 104, 101, 116]).buffer;
const whisperText = new Uint8Array([87, 104, 105, 115, 112, 101, 114, 84, 101, 120, 116]).buffer;
const discontinuityBytes = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff]).buffer;

/**
 * A utility class for performing the Axolotl ratcheting.
 *
 * @param {Crypto} crypto
 * @constructor
 */
function Ratchet(crypto) {
    const self = this;

    const hkdf = new HKDF(crypto);

    /**
     * Derive the main and sub ratchet states from the shared secrets derived from the handshake.
     *
     * @method
     * @param {number} sessionVersion
     * @param {Array.<ArrayBuffer>} agreements - an array of ArrayBuffers containing the shared secrets
     * @return {Promise.<Object, Error>} the root and chain keys
     */
    this.deriveInitialRootKeyAndChain = co.wrap(function*(sessionVersion, agreements) {
        var secrets = [];
        if (sessionVersion >= 3) {
            secrets.push(discontinuityBytes);
        }
        secrets = secrets.concat(agreements);

        var masterSecret = ArrayBufferUtils.concat(secrets);
        var derivedSecret = yield hkdf.deriveSecrets(masterSecret, whisperText,
            ProtocolConstants.rootKeyByteCount + ProtocolConstants.chainKeyByteCount);
        return {
            rootKey: derivedSecret.slice(0, ProtocolConstants.rootKeyByteCount),
            chain: new Chain(derivedSecret.slice(ProtocolConstants.rootKeyByteCount))
        };
    });

    /**
     * Derive the next main and sub ratchet states from the previous state.
     * <p>
     * This method "clicks" the Diffie-Hellman ratchet forwards.
     *
     * @method
     * @param {ArrayBuffer} rootKey - the current root key
     * @param {ArrayBuffer} theirEphemeralPublicKey - the receiving ephemeral/ratchet key
     * @param {ArrayBuffer} ourEphemeralPrivateKey - our current ephemeral/ratchet key
     * @return {Promise.<Object, Error>} the next root and chain keys
     */
    this.deriveNextRootKeyAndChain = co.wrap(function*(rootKey, theirEphemeralPublicKey, ourEphemeralPrivateKey) {
        var sharedSecret = yield crypto.calculateAgreement(theirEphemeralPublicKey, ourEphemeralPrivateKey);
        var derivedSecretBytes = yield hkdf.deriveSecretsWithSalt(sharedSecret, rootKey, whisperRatchet,
            ProtocolConstants.rootKeyByteCount + ProtocolConstants.chainKeyByteCount);
        return {
            rootKey: derivedSecretBytes.slice(0, ProtocolConstants.rootKeyByteCount),
            chain: new Chain(derivedSecretBytes.slice(ProtocolConstants.rootKeyByteCount))
        };
    });

    //
    /**
     * Derive the next sub ratchet state from the previous state.
     * <p>
     * This method "clicks" the hash iteration ratchet forwards.
     *
     * @method
     * @param {Chain} chain
     * @return {Promise.<void, Error>}
     */
    this.clickSubRatchet = co.wrap(function*(chain) {
        chain.index++;
        chain.key = yield deriveNextChainKey(chain.key);
    });

    /**
     * Derive the message keys from the chain key.
     *
     * @method
     * @param {ArrayBuffer} chainKey
     * @return {Promise.<object, Error>} an object containing the message keys.
     */
    this.deriveMessageKeys = co.wrap(function*(chainKey) {
        var messageKey = yield deriveMessageKey(chainKey);
        var keyMaterialBytes = yield hkdf.deriveSecrets(messageKey, whisperMessageKeys,
            ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount + ProtocolConstants.ivByteCount);
        var cipherKeyBytes = keyMaterialBytes.slice(0, ProtocolConstants.cipherKeyByteCount);
        var macKeyBytes = keyMaterialBytes.slice(ProtocolConstants.cipherKeyByteCount,
            ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount);
        var ivBytes = keyMaterialBytes.slice(ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount);
        return {
            cipherKey: cipherKeyBytes,
            macKey: macKeyBytes,
            iv: ivBytes
        };
    });

    var hmacByte = co.wrap(function*(key, byte) {
        return yield crypto.hmac(key, ArrayBufferUtils.fromByte(byte));
    });

    var deriveMessageKey = co.wrap(function*(chainKey) {
        return yield hmacByte(chainKey, messageKeySeed);
    });

    var deriveNextChainKey = co.wrap(function*(chainKey) {
        return yield hmacByte(chainKey, chainKeySeed);
    });
}

export default Ratchet;
