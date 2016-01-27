"use strict";
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

const ArrayBufferUtils = require("./ArrayBufferUtils");
const ProtocolConstants = require("./ProtocolConstants");

var makeReadonly = (obj, key) => {
    Object.defineProperty(obj, key, {
        writable: false
    });
};

/**
 * A serialisable representation of a session "state". Sessions can contain multiple states.
 */
class SessionState {
    /**
     *
     * @param {object} parameters - initial parameters
     */
    constructor(parameters) {
        Object.assign(this, {
            sessionVersion: 3,
            remoteIdentityKey: null,
            localIdentityKey: null,
            pendingPreKey: null,
            localRegistrationId: 0,
            theirBaseKey: null,
            // Ratchet parameters
            rootKey: null,
            sendingChain: null,
            senderRatchetKeyPair: null,
            receivingChains: [], // Keep a small list of chain keys to allow for out of order message delivery.
            previousCounter: 0
        }, parameters);
        makeReadonly(this, "sessionVersion");
        makeReadonly(this, "remoteIdentityKey");
        makeReadonly(this, "localIdentityKey");
        Object.seal(this);
    }

    /**
     * Find a chain for decryption by an ephemeral key.
     *
     * @param {ArrayBuffer} theirEphemeralPublicKey
     * @returns {Chain}
     */
    findReceivingChain(theirEphemeralPublicKey) {
        for (var i = 0; i < this.receivingChains.length; i++) {
            var receivingChain = this.receivingChains[i];
            if (ArrayBufferUtils.areEqual(receivingChain.theirEphemeralKey, theirEphemeralPublicKey)) {
                return receivingChain.chain;
            }
        }
        return null;
    }

    /**
     * Add a chain for decryption with an associated ephemeral key.
     *
     * @param {ArrayBuffer} theirEphemeralPublicKey
     * @param {Chain} chain
     */
    addReceivingChain(theirEphemeralPublicKey, chain) {
        this.receivingChains.push({
            theirEphemeralKey: theirEphemeralPublicKey,
            chain: chain
        });
        // We don't keep an infinite number of chain keys, as this would compromise forward secrecy.
        if (this.receivingChains.length > ProtocolConstants.maximumRetainedReceivedChainKeys) {
            this.receivingChains.shift();
        }
    }
}

module.exports = SessionState;
