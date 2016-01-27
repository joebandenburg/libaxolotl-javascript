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

/**
 * A chain holds the state of the sub ratchet, used for sending multiple messages before receiving a reply.
 */
class Chain {
    /**
     *
     * @param {ArrayBuffer} key
     */
    constructor(key) {
        this.key = key;
        this.index = 0;
        this.messageKeys = [];
        Object.seal(this);
    }
}

module.exports = Chain;
