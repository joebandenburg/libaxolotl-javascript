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

const ProtocolConstants = require("./ProtocolConstants");
const ArrayBufferUtils = require("./ArrayBufferUtils");
const SessionState = require("./SessionState");

/**
 * Represents the entire state of an Axolotl session.
 *
 * @param {Session|Object} [session] - another session. If passed, this session will clone its state.
 * @constructor
 */
class Session {
    constructor(session) {
        this.states = [];
        if (session) {
            for (let state of session.states) {
                this.states.push(new SessionState(state));
            }
        }
        Object.seal(this);
    }

    mostRecentState() {
        return this.states[0];
    }

    addState(state) {
        this.states.unshift(state);
        if (this.states.length > ProtocolConstants.maximumSessionStatesPerIdentity) {
            this.states.pop();
        }
    }

    removeState(state) {
        var index = this.states.indexOf(state);
        this.states.splice(index, 1);
    }
}

module.exports = Session;
