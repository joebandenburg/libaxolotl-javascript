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

export default class SessionStateList {
    constructor() {
        this.sessions = [];
        Object.seal(this);
    }

    mostRecentSession() {
        return this.sessions[0];
    }

    addSessionState(sessionState) {
        this.sessions.unshift(sessionState);
        if (this.sessions.length > ProtocolConstants.maximumSessionsPerIdentity) {
            this.sessions.pop();
        }
    }

    removeSessionState(sessionState) {
        var index = this.sessions.indexOf(sessionState);
        this.sessions.splice(index, 1);
    }
}
