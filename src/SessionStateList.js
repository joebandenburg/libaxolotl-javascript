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

function SessionStateList(sessionPersistor, serialisedState) {
    var self = this;

    var sessions = [];
    if (serialisedState) {
        sessions = JSON.parse(serialisedState, (key, value) => {
            if (typeof value === "string" && value.substring(0, 5) === "{{ab:") {
                return ArrayBufferUtils.parse(value.substring(5, value.length - 2));
            }
            return value;
        });
    }

    Object.defineProperty(self, "sessions", {
        get: () => sessions
    });

    self.mostRecentSession = () => {
        return sessions[0];
    };

    self.addSessionState = (sessionState) => {
        sessions.unshift(sessionState);
        if (sessions.length > ProtocolConstants.maximumSessionsPerIdentity) {
            sessions.pop();
        }
    };

    self.removeSessionState = (sessionState) => {
        var index = sessions.indexOf(sessionState);
        sessions.splice(index, 1);
    };

    self.save = () => {
        return sessionPersistor(JSON.stringify(sessions, (key, value) => {
            if (value instanceof ArrayBuffer) {
                return "{{ab:" + ArrayBufferUtils.stringify(value) + "}}";
            }
            return value;
        }));
    };

    Object.freeze(this);
}

export default SessionStateList;
