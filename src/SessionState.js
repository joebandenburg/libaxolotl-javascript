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

var makeReadonly = (obj, key) => {
    Object.defineProperty(obj, key, {
        writable: false
    });
};

export default class SessionState {
    constructor(parameters) {
        Object.assign(this, {
            sessionVersion: 3,
            remoteIdentityKey: null,
            localIdentityKey: null,
            rootKey: null,
            sendingChain: null,
            senderRatchetKeyPair: null,
            previousCounter: 0,
            receivingChains: [],
            pendingPreKey: null,
            localRegistrationId: 0
        }, parameters);
        makeReadonly(this, "sessionVersion");
        makeReadonly(this, "remoteIdentityKey");
        makeReadonly(this, "localIdentityKey");
        Object.seal(this);
    }

    // Search the entire list so that we can deal with out of order messages.
    // i.e. messages that were sent with older chain keys because the sender
    // has not received our latest message and so hasn't clicked their ratchet.
    findReceivingChain(theirEphemeralPublicKey) {
        for (var i = 0; i < this.receivingChains.length; i++) {
            var receivingChain = this.receivingChains[i];
            if (ArrayBufferUtils.areEqual(receivingChain.theirEphemeralKey, theirEphemeralPublicKey)) {
                return receivingChain.chain;
            }
        }
        return null;
    }

    // Keep a small list of chain keys to allow for out of order message delivery.
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
