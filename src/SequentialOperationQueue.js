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
 * A utility class for ensuring asynchronous operations are executed sequentially
 *
 * @constructor
 */
function SequentialOperationQueue() {
    var head = Promise.resolve();

    /**
     * Wrap an asynchronous function so that calls to it are guaranteed to be sequential.
     *
     * @param {Function} fn - the function to wrap. Must return a promise.
     * @returns {Function} a function that also returns a promise.
     */
    this.wrap = (fn) => {
        return function() {
            var boundFn = () => {
                return fn.apply(this, arguments);
            };
            // Note we also perform the next op even if the previous op failed
            head = head.then(boundFn, boundFn);
            return head;
        };
    };
}

export default SequentialOperationQueue;
