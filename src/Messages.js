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

import WhisperProtos from "./WhisperProtos";
import ProtocolConstants from "./ProtocolConstants";
import ArrayBufferUtils from "./ArrayBufferUtils";

var getVersionField = (version) => ArrayBufferUtils.fromByte((version.current << 4 | version.max) & 0xff);

var extractMessageVersion = (versionByte) => {
    var view = new Uint8Array(versionByte);
    return {
        current: (view[0] >> 4) & 0xf,
        max: view[0] & 0xf
    };
};

var toArrayBuffer = (obj, key) => {
    if (obj[key]) {
        obj[key] = obj[key].toArrayBuffer();
    }
};

var encodeWhisperMessageMacInput = (whisperMessage) => {
    var versionByte = getVersionField(whisperMessage.version);
    var messageBytes = new WhisperProtos.WhisperMessage(whisperMessage.message).encode().toArrayBuffer();
    return ArrayBufferUtils.concat(versionByte, messageBytes);
};

export default {
    decodeWhisperMessage: (whisperMessageBytes) => {
        var messageBytes = whisperMessageBytes.slice(1, -ProtocolConstants.macByteCount);
        var message = WhisperProtos.WhisperMessage.decode(messageBytes);
        toArrayBuffer(message, "ratchetKey");
        toArrayBuffer(message, "ciphertext");
        return {
            version: extractMessageVersion(whisperMessageBytes.slice(0, 1)),
            message: message,
            mac: whisperMessageBytes.slice(-ProtocolConstants.macByteCount)
        };
    },
    decodeWhisperMessageMacInput: (whisperMessageBytes) => {
        return whisperMessageBytes.slice(0, -ProtocolConstants.macByteCount);
    },
    encodeWhisperMessage: (whisperMessage) => {
        return ArrayBufferUtils.concat(encodeWhisperMessageMacInput(whisperMessage), whisperMessage.mac);
    },
    encodeWhisperMessageMacInput: encodeWhisperMessageMacInput,
    decodePreKeyWhisperMessage: (preKeyWhisperMessage) => {
        var message = WhisperProtos.PreKeyWhisperMessage.decode(preKeyWhisperMessage.slice(1));
        toArrayBuffer(message, "message");
        toArrayBuffer(message, "baseKey");
        toArrayBuffer(message, "identityKey");
        return {
            version: extractMessageVersion(preKeyWhisperMessage.slice(0, 1)),
            message: message
        };
    },
    encodePreKeyWhisperMessage: (preKeyWhisperMessageBytes) => {
        var message = preKeyWhisperMessageBytes.message;
        var messageBytes = new WhisperProtos.PreKeyWhisperMessage(message).encode().toArrayBuffer();
        var versionField = getVersionField(preKeyWhisperMessageBytes.version);
        return ArrayBufferUtils.concat(versionField, messageBytes);
    }
};
