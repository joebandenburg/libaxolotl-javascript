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
import co from "co";

var hashOutputSize = 32;
var iterationStartOffset = 1; // TODO: Depends on protocol version

function HKDF(crypto) {
    var self = this;

    var extract = (salt, inputKeyMaterial) => crypto.hmac(salt, inputKeyMaterial);

    var expand = co.wrap(function*(prk, info, outputByteCount) {
        var iterations = Math.ceil(outputByteCount / hashOutputSize);
        var mixin = new ArrayBuffer(0);
        var result = new Uint8Array(outputByteCount);
        var remainingBytes = outputByteCount;
        for (var i = iterationStartOffset; i < iterations + iterationStartOffset; i++) {
            var inputBytes = ArrayBufferUtils.concat(mixin, info, new Uint8Array([i]).buffer);
            var stepResultArray = yield crypto.hmac(prk, inputBytes);
            var stepResult = new Uint8Array(stepResultArray);
            var stepSize = Math.min(remainingBytes, stepResult.length);
            var stepSlice = stepResult.subarray(0, stepSize);
            result.set(stepSlice, outputByteCount - remainingBytes);
            mixin = stepResultArray;
            remainingBytes -= stepSize;
        }
        return result.buffer;
    });

    self.deriveSecretsWithSalt = co.wrap(function*(inputKeyMaterial, salt, info, outputByteCount) {
        var prk = yield extract(salt, inputKeyMaterial);
        return yield expand(prk, info, outputByteCount);
    });

    self.deriveSecrets = (inputKeyMaterial, info, outputByteCount) =>
        self.deriveSecretsWithSalt(inputKeyMaterial, new ArrayBuffer(hashOutputSize), info, outputByteCount);

    Object.freeze(self);
}

export default HKDF;
