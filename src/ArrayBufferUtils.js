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

export default {
    // TODO: Consider timing attack
    areEqual: (left, right) => {
        if (left.byteLength !== right.byteLength) {
            return false;
        }
        var leftView = new Uint8Array(left);
        var rightView = new Uint8Array(right);
        for (var i = 0; i < left.byteLength; i++) {
            if (leftView[i] !== rightView[i]) {
                return false;
            }
        }
        return true;
    },
    concat: function(...buffers) {
        buffers = (buffers.length === 1) ? buffers[0] : buffers;
        var i;
        var byteLength = 0;
        for (i = 0; i < buffers.length; i++) {
            byteLength += buffers[i].byteLength;
        }
        var newBuffer = new ArrayBuffer(byteLength);
        var view = new Uint8Array(newBuffer);
        var offset = 0;
        for (i = 0; i < buffers.length; i++) {
            view.set(new Uint8Array(buffers[i]), offset);
            offset += buffers[i].byteLength;
        }
        return newBuffer;
    },
    fromByte: (byte) => new Uint8Array([byte]).buffer,
    stringify: (buffer) => {
        var string = "";
        var view = new Uint8Array(buffer);
        for (var i = 0; i < buffer.byteLength; i++) {
            var byte = view[i].toString(16);
            if (byte.length === 1) {
                string += "0";
            }
            string += byte;
        }
        return string;
    },
    parse: (string) => {
        var buffer = new ArrayBuffer(string.length / 2);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < string.length; i += 2) {
            view[i / 2] = parseInt(string[i], 16) * 16 + parseInt(string[i + 1], 16);
        }
        return buffer;
    }
};
