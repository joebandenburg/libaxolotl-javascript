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

import ProtocolConstants from "./ProtocolConstants";
import ArrayBufferUtils from "./ArrayBufferUtils";
import SessionState from "./SessionState";

/**
 * Represents the entire state of an Axolotl session.
 *
 * @param {Session|Object} [session] - another session. If passed, this session will clone its state.
 * @constructor
 */
function Session(session) {
    var self = this;

    var states = [];

    if (session) {
        for (let state of session.states) {
            states.push(new SessionState(state));
        }
    }

    Object.defineProperty(self, "states", {
        get: () => states
    });

    self.mostRecentState = () => {
        return states[0];
    };

    self.addState = (state) => {
        states.unshift(state);
        if (states.length > ProtocolConstants.maximumSessionStatesPerIdentity) {
            states.pop();
        }
    };

    self.removeState = (state) => {
        var index = states.indexOf(state);
        states.splice(index, 1);
    };

    Object.freeze(this);
}

export default Session;
