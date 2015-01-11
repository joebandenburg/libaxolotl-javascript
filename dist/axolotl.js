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

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'protobufjs',
            'traceur-runtime'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('protobufjs'), require('traceur-runtime'));
    } else {
        this.axolotl = factory(dcodeIO.ProtoBuf, 1);
    }
}(function (__external_1, __external_2) {
    var global = this, define;
    function _require(id) {
        var module = _require.cache[id];
        if (!module) {
            var exports = {};
            module = _require.cache[id] = {
                id: id,
                exports: exports
            };
            _require.modules[id].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            'use strict';
            var __moduleName = 'build\\index';
            var $__src_47_Axolotl__;
            var Axolotl = ($__src_47_Axolotl__ = _require(2), $__src_47_Axolotl__ && $__src_47_Axolotl__.__esModule && $__src_47_Axolotl__ || { default: $__src_47_Axolotl__ }).default;
            module.exports = function (cryptoServices) {
                return new Axolotl(cryptoServices);
            };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\ArrayBufferUtils';
            var $__default = {
                    areEqual: function (left, right) {
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
                    concat: function () {
                        for (var buffers = [], $__0 = 0; $__0 < arguments.length; $__0++)
                            buffers[$__0] = arguments[$__0];
                        buffers = buffers.length === 1 ? buffers[0] : buffers;
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
                    fromByte: function (byte) {
                        return new Uint8Array([byte]).buffer;
                    }
                };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\Axolotl';
            var $__build_47_SessionFactory__, $__co__;
            var SessionFactory = ($__build_47_SessionFactory__ = _require(9), $__build_47_SessionFactory__ && $__build_47_SessionFactory__.__esModule && $__build_47_SessionFactory__ || { default: $__build_47_SessionFactory__ }).default;
            var co = ($__co__ = _require(13), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function Axolotl(crypto) {
                var self = this;
                self.generateIdentityKeyPair = function () {
                    return crypto.generateKeyPair();
                };
                self.generateRegistrationId = function (extendedRange) {
                    var upperLimit = extendedRange ? 4294967294 : 16380;
                    return crypto.randomInt(upperLimit) + 1;
                };
                self.generatePreKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__2(start, count) {
                    var results, i, $__3, $__4, $__5, $__6, $__7, $__8;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                results = [];
                                $ctx.state = 15;
                                break;
                            case 15:
                                i = 0;
                                $ctx.state = 11;
                                break;
                            case 11:
                                $ctx.state = i < count ? 5 : 9;
                                break;
                            case 8:
                                i++;
                                $ctx.state = 11;
                                break;
                            case 5:
                                $__3 = results.push;
                                $__4 = crypto.generateKeyPair;
                                $__5 = $__4.call(crypto);
                                $ctx.state = 6;
                                break;
                            case 6:
                                $ctx.state = 2;
                                return $__5;
                            case 2:
                                $__6 = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__7 = {
                                    id: (start + i) % 16777215 + 1,
                                    keyPair: $__6
                                };
                                $__8 = $__3.call(results, $__7);
                                $ctx.state = 8;
                                break;
                            case 9:
                                $ctx.returnValue = results;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__2, this);
                }));
                self.generateLastResortPreKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__9() {
                    var $__10, $__11, $__12, $__13;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $__10 = crypto.generateKeyPair;
                                $__11 = $__10.call(crypto);
                                $ctx.state = 6;
                                break;
                            case 6:
                                $ctx.state = 2;
                                return $__11;
                            case 2:
                                $__12 = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__13 = {
                                    id: 16777215,
                                    keyPair: $__12
                                };
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = $__13;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__9, this);
                }));
                self.generateSignedPreKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__14(identityKeyPair, signedPreKeyId) {
                    var keyPair, signature;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return crypto.generateKeyPair();
                            case 2:
                                keyPair = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return crypto.sign(identityKeyPair.private, keyPair.public);
                            case 6:
                                signature = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = {
                                    id: signedPreKeyId,
                                    keyPair: keyPair,
                                    signature: signature
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__14, this);
                }));
                self.createSessionFactory = function (store) {
                    return new SessionFactory(crypto, store);
                };
                Object.freeze(self);
            }
            var $__default = Axolotl;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                InvalidMessageException: {
                    get: function () {
                        return InvalidMessageException;
                    }
                },
                DuplicateMessageException: {
                    get: function () {
                        return DuplicateMessageException;
                    }
                },
                InvalidKeyException: {
                    get: function () {
                        return InvalidKeyException;
                    }
                },
                UnsupportedProtocolVersionException: {
                    get: function () {
                        return UnsupportedProtocolVersionException;
                    }
                },
                ConcurrentUseException: {
                    get: function () {
                        return ConcurrentUseException;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\Exceptions';
            var InvalidMessageException = function InvalidMessageException() {
                $traceurRuntime.superConstructor($InvalidMessageException).apply(this, arguments);
            };
            var $InvalidMessageException = InvalidMessageException;
            $traceurRuntime.createClass(InvalidMessageException, {}, {}, Error);
            var DuplicateMessageException = function DuplicateMessageException() {
                $traceurRuntime.superConstructor($DuplicateMessageException).apply(this, arguments);
            };
            var $DuplicateMessageException = DuplicateMessageException;
            $traceurRuntime.createClass(DuplicateMessageException, {}, {}, Error);
            var InvalidKeyException = function InvalidKeyException() {
                $traceurRuntime.superConstructor($InvalidKeyException).apply(this, arguments);
            };
            var $InvalidKeyException = InvalidKeyException;
            $traceurRuntime.createClass(InvalidKeyException, {}, {}, Error);
            var UnsupportedProtocolVersionException = function UnsupportedProtocolVersionException() {
                $traceurRuntime.superConstructor($UnsupportedProtocolVersionException).apply(this, arguments);
            };
            var $UnsupportedProtocolVersionException = UnsupportedProtocolVersionException;
            $traceurRuntime.createClass(UnsupportedProtocolVersionException, {}, {}, Error);
            var ConcurrentUseException = function ConcurrentUseException() {
                $traceurRuntime.superConstructor($ConcurrentUseException).apply(this, arguments);
            };
            var $ConcurrentUseException = ConcurrentUseException;
            $traceurRuntime.createClass(ConcurrentUseException, {}, {}, Error);
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\HKDF';
            var $__build_47_ArrayBufferUtils__, $__co__;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var co = ($__co__ = _require(13), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            var hashOutputSize = 32;
            var iterationStartOffset = 1;
            function HKDF(crypto) {
                var self = this;
                var extract = function (salt, inputKeyMaterial) {
                    return crypto.hmac(salt, inputKeyMaterial);
                };
                var expand = co.wrap($traceurRuntime.initGeneratorFunction(function $__2(prk, info, outputByteCount) {
                        var iterations, mixin, result, remainingBytes, i, inputBytes, stepResultArray, stepResult, stepSize, stepSlice;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    iterations = Math.ceil(outputByteCount / hashOutputSize);
                                    mixin = new ArrayBuffer(0);
                                    result = new Uint8Array(outputByteCount);
                                    remainingBytes = outputByteCount;
                                    $ctx.state = 15;
                                    break;
                                case 15:
                                    i = iterationStartOffset;
                                    $ctx.state = 11;
                                    break;
                                case 11:
                                    $ctx.state = i < iterations + iterationStartOffset ? 5 : 9;
                                    break;
                                case 8:
                                    i++;
                                    $ctx.state = 11;
                                    break;
                                case 5:
                                    inputBytes = ArrayBufferUtils.concat(mixin, info, new Uint8Array([i]).buffer);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return crypto.hmac(prk, inputBytes);
                                case 2:
                                    stepResultArray = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    stepResult = new Uint8Array(stepResultArray);
                                    stepSize = Math.min(remainingBytes, stepResult.length);
                                    stepSlice = stepResult.subarray(0, stepSize);
                                    result.set(stepSlice, outputByteCount - remainingBytes);
                                    mixin = stepResultArray;
                                    remainingBytes -= stepSize;
                                    $ctx.state = 8;
                                    break;
                                case 9:
                                    $ctx.returnValue = result.buffer;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__2, this);
                    }));
                self.deriveSecretsWithSalt = co.wrap($traceurRuntime.initGeneratorFunction(function $__3(inputKeyMaterial, salt, info, outputByteCount) {
                    var prk, $__4, $__5;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return extract(salt, inputKeyMaterial);
                            case 2:
                                prk = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__4 = expand(prk, info, outputByteCount);
                                $ctx.state = 10;
                                break;
                            case 10:
                                $ctx.state = 6;
                                return $__4;
                            case 6:
                                $__5 = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = $__5;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__3, this);
                }));
                self.deriveSecrets = function (inputKeyMaterial, info, outputByteCount) {
                    return self.deriveSecretsWithSalt(inputKeyMaterial, new ArrayBuffer(hashOutputSize), info, outputByteCount);
                };
                Object.freeze(self);
            }
            var $__default = HKDF;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\Messages';
            var $__build_47_WhisperProtos__, $__build_47_ProtocolConstants__, $__build_47_ArrayBufferUtils__;
            var WhisperProtos = ($__build_47_WhisperProtos__ = _require(12), $__build_47_WhisperProtos__ && $__build_47_WhisperProtos__.__esModule && $__build_47_WhisperProtos__ || { default: $__build_47_WhisperProtos__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(6), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var getVersionField = function (version) {
                return ArrayBufferUtils.fromByte((version.current << 4 | version.max) & 255);
            };
            var extractMessageVersion = function (versionByte) {
                var view = new Uint8Array(versionByte);
                return {
                    current: view[0] >> 4 & 15,
                    max: view[0] & 15
                };
            };
            var toArrayBuffer = function (obj, key) {
                if (obj[key]) {
                    obj[key] = obj[key].toArrayBuffer();
                }
            };
            var encodeWhisperMessageMacInput = function (whisperMessage) {
                var versionByte = getVersionField(whisperMessage.version);
                var messageBytes = new WhisperProtos.WhisperMessage(whisperMessage.message).encode().toArrayBuffer();
                return ArrayBufferUtils.concat(versionByte, messageBytes);
            };
            var $__default = {
                    decodeWhisperMessage: function (whisperMessageBytes) {
                        var messageBytes = whisperMessageBytes.slice(1, -ProtocolConstants.macByteCount);
                        var message = WhisperProtos.WhisperMessage.decode(messageBytes);
                        toArrayBuffer(message, 'ratchetKey');
                        toArrayBuffer(message, 'ciphertext');
                        return {
                            version: extractMessageVersion(whisperMessageBytes.slice(0, 1)),
                            message: message,
                            mac: whisperMessageBytes.slice(-ProtocolConstants.macByteCount)
                        };
                    },
                    decodeWhisperMessageMacInput: function (whisperMessageBytes) {
                        return whisperMessageBytes.slice(0, -ProtocolConstants.macByteCount);
                    },
                    encodeWhisperMessage: function (whisperMessage) {
                        return ArrayBufferUtils.concat(encodeWhisperMessageMacInput(whisperMessage), whisperMessage.mac);
                    },
                    encodeWhisperMessageMacInput: encodeWhisperMessageMacInput,
                    decodePreKeyWhisperMessage: function (preKeyWhisperMessage) {
                        var message = WhisperProtos.PreKeyWhisperMessage.decode(preKeyWhisperMessage.slice(1));
                        toArrayBuffer(message, 'message');
                        toArrayBuffer(message, 'baseKey');
                        toArrayBuffer(message, 'identityKey');
                        return {
                            version: extractMessageVersion(preKeyWhisperMessage.slice(0, 1)),
                            message: message
                        };
                    },
                    encodePreKeyWhisperMessage: function (preKeyWhisperMessageBytes) {
                        var message = preKeyWhisperMessageBytes.message;
                        var messageBytes = new WhisperProtos.PreKeyWhisperMessage(message).encode().toArrayBuffer();
                        var versionField = getVersionField(preKeyWhisperMessageBytes.version);
                        return ArrayBufferUtils.concat(versionField, messageBytes);
                    }
                };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\ProtocolConstants';
            var $__default = {
                    currentVersion: 3,
                    macByteCount: 8,
                    cipherKeyByteCount: 32,
                    macKeyByteCount: 32,
                    ivByteCount: 16,
                    dhKeyByteCount: 32,
                    rootKeyByteCount: 32,
                    chainKeyByteCount: 32,
                    maximumRetainedReceivedChainKeys: 5
                };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\Ratchet';
            var $__build_47_HKDF__, $__build_47_SessionUtils__, $__build_47_ArrayBufferUtils__, $__build_47_ProtocolConstants__, $__co__;
            var HKDF = ($__build_47_HKDF__ = _require(4), $__build_47_HKDF__ && $__build_47_HKDF__.__esModule && $__build_47_HKDF__ || { default: $__build_47_HKDF__ }).default;
            var SessionUtils = ($__build_47_SessionUtils__ = _require(11), $__build_47_SessionUtils__ && $__build_47_SessionUtils__.__esModule && $__build_47_SessionUtils__ || { default: $__build_47_SessionUtils__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(6), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var co = ($__co__ = _require(13), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            var messageKeySeed = 1;
            var chainKeySeed = 2;
            var whisperMessageKeys = new Uint8Array([
                    87,
                    104,
                    105,
                    115,
                    112,
                    101,
                    114,
                    77,
                    101,
                    115,
                    115,
                    97,
                    103,
                    101,
                    75,
                    101,
                    121,
                    115
                ]).buffer;
            var whisperRatchet = new Uint8Array([
                    87,
                    104,
                    105,
                    115,
                    112,
                    101,
                    114,
                    82,
                    97,
                    116,
                    99,
                    104,
                    101,
                    116
                ]).buffer;
            var whisperText = new Uint8Array([
                    87,
                    104,
                    105,
                    115,
                    112,
                    101,
                    114,
                    84,
                    101,
                    120,
                    116
                ]).buffer;
            var discontinuityBytes = new Uint8Array([
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255
                ]).buffer;
            function Ratchet(crypto) {
                var self = this;
                var hkdf = new HKDF(crypto);
                self.deriveInitialRootAndChainKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__5(sessionVersion, agreements) {
                    var secrets, masterSecret, derivedSecret;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                secrets = [];
                                if (sessionVersion >= 3) {
                                    secrets.push(discontinuityBytes);
                                }
                                secrets = secrets.concat(agreements);
                                masterSecret = ArrayBufferUtils.concat(secrets);
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.state = 2;
                                return hkdf.deriveSecrets(masterSecret, whisperText, ProtocolConstants.rootKeyByteCount + ProtocolConstants.chainKeyByteCount);
                            case 2:
                                derivedSecret = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.returnValue = {
                                    rootKey: derivedSecret.slice(0, ProtocolConstants.rootKeyByteCount),
                                    chain: SessionUtils.createNewChain(derivedSecret.slice(ProtocolConstants.rootKeyByteCount), 0)
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__5, this);
                }));
                self.deriveNewRootAndChainKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__6(rootKey, theirEphemeralPublicKey, ourEphemeralPrivateKey) {
                    var sharedSecret, derivedSecretBytes;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return crypto.calculateAgreement(theirEphemeralPublicKey, ourEphemeralPrivateKey);
                            case 2:
                                sharedSecret = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return hkdf.deriveSecretsWithSalt(sharedSecret, rootKey, whisperRatchet, ProtocolConstants.rootKeyByteCount + ProtocolConstants.chainKeyByteCount);
                            case 6:
                                derivedSecretBytes = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = {
                                    rootKey: derivedSecretBytes.slice(0, ProtocolConstants.rootKeyByteCount),
                                    chain: SessionUtils.createNewChain(derivedSecretBytes.slice(ProtocolConstants.rootKeyByteCount), 0)
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__6, this);
                }));
                self.deriveMessageKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__7(chainKey) {
                    var messageKey, keyMaterialBytes, cipherKeyBytes, macKeyBytes, ivBytes;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return deriveMessageKey(chainKey);
                            case 2:
                                messageKey = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return hkdf.deriveSecrets(messageKey, whisperMessageKeys, ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount + ProtocolConstants.ivByteCount);
                            case 6:
                                keyMaterialBytes = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                cipherKeyBytes = keyMaterialBytes.slice(0, ProtocolConstants.cipherKeyByteCount);
                                macKeyBytes = keyMaterialBytes.slice(ProtocolConstants.cipherKeyByteCount, ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount);
                                ivBytes = keyMaterialBytes.slice(ProtocolConstants.cipherKeyByteCount + ProtocolConstants.macKeyByteCount);
                                $ctx.state = 12;
                                break;
                            case 12:
                                $ctx.returnValue = {
                                    cipherKey: cipherKeyBytes,
                                    macKey: macKeyBytes,
                                    iv: ivBytes
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__7, this);
                }));
                self.clickSubRatchet = co.wrap($traceurRuntime.initGeneratorFunction(function $__8(chain) {
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                chain.index++;
                                $ctx.state = 6;
                                break;
                            case 6:
                                $ctx.state = 2;
                                return deriveNextChainKey(chain.key);
                            case 2:
                                chain.key = $ctx.sent;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__8, this);
                }));
                var hmacByte = co.wrap($traceurRuntime.initGeneratorFunction(function $__9(key, byte) {
                        var $__10, $__11, $__12, $__13, $__14;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $__10 = crypto.hmac;
                                    $__11 = ArrayBufferUtils.fromByte;
                                    $__12 = $__11.call(ArrayBufferUtils, byte);
                                    $__13 = $__10.call(crypto, key, $__12);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return $__13;
                                case 2:
                                    $__14 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = $__14;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__9, this);
                    }));
                var deriveMessageKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__15(chainKey) {
                        var $__16, $__17;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $__16 = hmacByte(chainKey, messageKeySeed);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return $__16;
                                case 2:
                                    $__17 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = $__17;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__15, this);
                    }));
                var deriveNextChainKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__18(chainKey) {
                        var $__19, $__20;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $__19 = hmacByte(chainKey, chainKeySeed);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return $__19;
                                case 2:
                                    $__20 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = $__20;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__18, this);
                    }));
            }
            var $__default = Ratchet;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\Session';
            var $__build_47_ArrayBufferUtils__, $__build_47_ProtocolConstants__, $__build_47_Messages__, $__build_47_Ratchet__, $__build_47_Exceptions__, $__co__;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(6), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var Messages = ($__build_47_Messages__ = _require(5), $__build_47_Messages__ && $__build_47_Messages__.__esModule && $__build_47_Messages__ || { default: $__build_47_Messages__ }).default;
            var Ratchet = ($__build_47_Ratchet__ = _require(7), $__build_47_Ratchet__ && $__build_47_Ratchet__.__esModule && $__build_47_Ratchet__ || { default: $__build_47_Ratchet__ }).default;
            var $__4 = ($__build_47_Exceptions__ = _require(3), $__build_47_Exceptions__ && $__build_47_Exceptions__.__esModule && $__build_47_Exceptions__ || { default: $__build_47_Exceptions__ }), InvalidMessageException = $__4.InvalidMessageException, DuplicateMessageException = $__4.DuplicateMessageException, ConcurrentUseException = $__4.ConcurrentUseException;
            var co = ($__co__ = _require(13), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function Session(crypto, sessionState) {
                var self = this;
                var ratchet = new Ratchet(crypto);
                var isLocked = false;
                self.encryptMessage = withLock(co.wrap($traceurRuntime.initGeneratorFunction(function $__6(paddedMessage) {
                    var whisperMessage;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return createWhisperMessage(paddedMessage);
                            case 2:
                                whisperMessage = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return ratchet.clickSubRatchet(sessionState.sendingChain);
                            case 6:
                                $ctx.maybeThrow();
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.state = sessionState.pendingPreKey ? 9 : 11;
                                break;
                            case 9:
                                $ctx.returnValue = createPreKeyWhisperMessage(whisperMessage);
                                $ctx.state = -2;
                                break;
                            case 11:
                                $ctx.returnValue = whisperMessage;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__6, this);
                })));
                self.decryptPreKeyMessage = function (preKeyWhisperMessageBytes) {
                    var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
                    return self.decryptMessage(preKeyWhisperMessage.message.message);
                };
                self.decryptMessage = withLock(co.wrap($traceurRuntime.initGeneratorFunction(function $__7(whisperMessageBytes) {
                    var whisperMessage, macInputTypes, message, theirEphemeralPublicKey, receivingChain, messageKeys, isValid, plaintext;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                whisperMessage = Messages.decodeWhisperMessage(whisperMessageBytes);
                                macInputTypes = Messages.decodeWhisperMessageMacInput(whisperMessageBytes);
                                if (whisperMessage.version.current !== sessionState.sessionVersion) {
                                    throw new InvalidMessageException('Message version doesn\'t match session version');
                                }
                                message = whisperMessage.message;
                                theirEphemeralPublicKey = message.ratchetKey;
                                $ctx.state = 20;
                                break;
                            case 20:
                                $ctx.state = 2;
                                return getOrCreateReceivingChainKey(theirEphemeralPublicKey);
                            case 2:
                                receivingChain = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return getOrCreateMessageKeys(theirEphemeralPublicKey, receivingChain, message.counter);
                            case 6:
                                messageKeys = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.state = 10;
                                return isValidMac(macInputTypes, messageKeys.macKey, whisperMessage.version.current, sessionState.remoteIdentityKey, sessionState.localIdentityKey, whisperMessage.mac);
                            case 10:
                                isValid = $ctx.sent;
                                $ctx.state = 12;
                                break;
                            case 12:
                                if (!isValid) {
                                    throw new InvalidMessageException('Bad mac');
                                }
                                $ctx.state = 22;
                                break;
                            case 22:
                                $ctx.state = 14;
                                return crypto.decrypt(messageKeys.cipherKey, message.ciphertext, messageKeys.iv);
                            case 14:
                                plaintext = $ctx.sent;
                                $ctx.state = 16;
                                break;
                            case 16:
                                sessionState.pendingPreKey = null;
                                $ctx.state = 24;
                                break;
                            case 24:
                                $ctx.returnValue = plaintext;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__7, this);
                })));
                function withLock(fn) {
                    return function () {
                        if (isLocked) {
                            return Promise.reject(new ConcurrentUseException('Another operation is already in progress'));
                        }
                        isLocked = true;
                        return fn.apply(self, arguments).then(function (result) {
                            isLocked = false;
                            return result;
                        }, function (error) {
                            isLocked = false;
                            return Promise.reject(error);
                        });
                    };
                }
                var isValidMac = co.wrap($traceurRuntime.initGeneratorFunction(function $__8(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey, theirMac) {
                        var ourMac;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return getMac(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey);
                                case 2:
                                    ourMac = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = ArrayBufferUtils.areEqual(ourMac, theirMac);
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__8, this);
                    }));
                var getMac = co.wrap($traceurRuntime.initGeneratorFunction(function $__9(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey) {
                        var macInputs, macBytes;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    macInputs = messageVersion >= 3 ? [
                                        senderIdentityKey,
                                        receiverIdentityKey
                                    ] : [];
                                    macInputs.push(data);
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $ctx.state = 2;
                                    return crypto.hmac(macKey, ArrayBufferUtils.concat(macInputs));
                                case 2:
                                    macBytes = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = macBytes.slice(0, ProtocolConstants.macByteCount);
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__9, this);
                    }));
                var createWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__10(paddedMessage) {
                        var messageKeys, ciphertext, version, message, macInputBytes, $__11, $__12, $__13, $__14, $__15, $__16, $__17, $__18, $__19;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return ratchet.deriveMessageKeys(sessionState.sendingChain.key);
                                case 2:
                                    messageKeys = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.state = 6;
                                    return crypto.encrypt(messageKeys.cipherKey, paddedMessage, messageKeys.iv);
                                case 6:
                                    ciphertext = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    version = {
                                        current: sessionState.sessionVersion,
                                        max: ProtocolConstants.currentVersion
                                    };
                                    message = {
                                        ratchetKey: sessionState.senderRatchetKeyPair.public,
                                        counter: sessionState.sendingChain.index,
                                        previousCounter: sessionState.previousCounter,
                                        ciphertext: ciphertext
                                    };
                                    macInputBytes = Messages.encodeWhisperMessageMacInput({
                                        version: version,
                                        message: message
                                    });
                                    $ctx.state = 20;
                                    break;
                                case 20:
                                    $__11 = Messages.encodeWhisperMessage;
                                    $__12 = messageKeys.macKey;
                                    $__13 = sessionState.sessionVersion;
                                    $__14 = sessionState.localIdentityKey;
                                    $__15 = sessionState.remoteIdentityKey;
                                    $__16 = getMac(macInputBytes, $__12, $__13, $__14, $__15);
                                    $ctx.state = 14;
                                    break;
                                case 14:
                                    $ctx.state = 10;
                                    return $__16;
                                case 10:
                                    $__17 = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $__18 = {
                                        version: version,
                                        message: message,
                                        mac: $__17
                                    };
                                    $__19 = $__11.call(Messages, $__18);
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $ctx.returnValue = $__19;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__10, this);
                    }));
                var createPreKeyWhisperMessage = function (whisperMessage) {
                    var pendingPreKey = sessionState.pendingPreKey;
                    return Messages.encodePreKeyWhisperMessage({
                        version: {
                            current: sessionState.sessionVersion,
                            max: ProtocolConstants.currentVersion
                        },
                        message: {
                            registrationId: sessionState.localRegistrationId,
                            preKeyId: pendingPreKey.preKeyId,
                            signedPreKeyId: pendingPreKey.signedPreKeyId,
                            baseKey: pendingPreKey.baseKey,
                            identityKey: sessionState.localIdentityKey,
                            message: whisperMessage
                        }
                    });
                };
                var getOrCreateReceivingChainKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__20(theirEphemeralPublicKey) {
                        var chain, $__21, $__22;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    chain = sessionState.findReceivingChain(theirEphemeralPublicKey);
                                    $ctx.state = 13;
                                    break;
                                case 13:
                                    $ctx.state = chain ? 1 : 2;
                                    break;
                                case 1:
                                    $ctx.returnValue = chain;
                                    $ctx.state = -2;
                                    break;
                                case 2:
                                    $__21 = clickMainRatchet(theirEphemeralPublicKey);
                                    $ctx.state = 9;
                                    break;
                                case 9:
                                    $ctx.state = 5;
                                    return $__21;
                                case 5:
                                    $__22 = $ctx.sent;
                                    $ctx.state = 7;
                                    break;
                                case 7:
                                    $ctx.returnValue = $__22;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__20, this);
                    }));
                var getOrCreateMessageKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__23(theirEphemeralPublicKey, chain, counter) {
                        var cachedMessageKeys, messageKeys;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = chain.index > counter ? 3 : 2;
                                    break;
                                case 3:
                                    cachedMessageKeys = chain.messageKeys[counter];
                                    if (!cachedMessageKeys) {
                                        throw new DuplicateMessageException('Received message with old counter');
                                    }
                                    delete chain.messageKeys[counter];
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = cachedMessageKeys;
                                    $ctx.state = -2;
                                    break;
                                case 2:
                                    if (counter - chain.index > 2000) {
                                        throw new InvalidMessageException('Over 2000 messages into the future');
                                    }
                                    $ctx.state = 26;
                                    break;
                                case 26:
                                    $ctx.state = chain.index < counter ? 6 : 14;
                                    break;
                                case 6:
                                    $ctx.state = 7;
                                    return ratchet.deriveMessageKeys(chain.key);
                                case 7:
                                    chain.messageKeys[chain.index] = $ctx.sent;
                                    $ctx.state = 9;
                                    break;
                                case 9:
                                    $ctx.state = 11;
                                    return ratchet.clickSubRatchet(chain);
                                case 11:
                                    $ctx.maybeThrow();
                                    $ctx.state = 26;
                                    break;
                                case 14:
                                    $ctx.state = 16;
                                    return ratchet.deriveMessageKeys(chain.key);
                                case 16:
                                    messageKeys = $ctx.sent;
                                    $ctx.state = 18;
                                    break;
                                case 18:
                                    $ctx.state = 20;
                                    return ratchet.clickSubRatchet(chain);
                                case 20:
                                    $ctx.maybeThrow();
                                    $ctx.state = 22;
                                    break;
                                case 22:
                                    $ctx.returnValue = messageKeys;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__23, this);
                    }));
                var clickMainRatchet = co.wrap($traceurRuntime.initGeneratorFunction(function $__24(theirEphemeralPublicKey) {
                        var nextReceivingChain, ourNewEphemeralKeyPair, nextSendingChain;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return ratchet.deriveNewRootAndChainKeys(sessionState.rootKey, theirEphemeralPublicKey, sessionState.senderRatchetKeyPair.private);
                                case 2:
                                    nextReceivingChain = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.state = 6;
                                    return crypto.generateKeyPair();
                                case 6:
                                    ourNewEphemeralKeyPair = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $ctx.state = 10;
                                    return ratchet.deriveNewRootAndChainKeys(nextReceivingChain.rootKey, theirEphemeralPublicKey, ourNewEphemeralKeyPair.private);
                                case 10:
                                    nextSendingChain = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    sessionState.rootKey = nextSendingChain.rootKey;
                                    sessionState.addReceivingChain(theirEphemeralPublicKey, nextReceivingChain.chain);
                                    sessionState.previousCounter = Math.max(sessionState.sendingChain.index - 1, 0);
                                    sessionState.sendingChain = nextSendingChain.chain;
                                    sessionState.senderRatchetKeyPair = ourNewEphemeralKeyPair;
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $ctx.returnValue = nextReceivingChain.chain;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__24, this);
                    }));
                Object.freeze(self);
            }
            var $__default = Session;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\SessionFactory';
            var $__build_47_Session__, $__build_47_WhisperProtos__, $__build_47_ArrayBufferUtils__, $__build_47_Messages__, $__build_47_SessionUtils__, $__build_47_Ratchet__, $__build_47_SessionState__, $__build_47_Exceptions__, $__co__;
            var Session = ($__build_47_Session__ = _require(8), $__build_47_Session__ && $__build_47_Session__.__esModule && $__build_47_Session__ || { default: $__build_47_Session__ }).default;
            var WhisperProtos = ($__build_47_WhisperProtos__ = _require(12), $__build_47_WhisperProtos__ && $__build_47_WhisperProtos__.__esModule && $__build_47_WhisperProtos__ || { default: $__build_47_WhisperProtos__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var Messages = ($__build_47_Messages__ = _require(5), $__build_47_Messages__ && $__build_47_Messages__.__esModule && $__build_47_Messages__ || { default: $__build_47_Messages__ }).default;
            var SessionUtils = ($__build_47_SessionUtils__ = _require(11), $__build_47_SessionUtils__ && $__build_47_SessionUtils__.__esModule && $__build_47_SessionUtils__ || { default: $__build_47_SessionUtils__ }).default;
            var Ratchet = ($__build_47_Ratchet__ = _require(7), $__build_47_Ratchet__ && $__build_47_Ratchet__.__esModule && $__build_47_Ratchet__ || { default: $__build_47_Ratchet__ }).default;
            var SessionState = ($__build_47_SessionState__ = _require(10), $__build_47_SessionState__ && $__build_47_SessionState__.__esModule && $__build_47_SessionState__ || { default: $__build_47_SessionState__ }).default;
            var $__7 = ($__build_47_Exceptions__ = _require(3), $__build_47_Exceptions__ && $__build_47_Exceptions__.__esModule && $__build_47_Exceptions__ || { default: $__build_47_Exceptions__ }), InvalidKeyException = $__7.InvalidKeyException, UnsupportedProtocolVersionException = $__7.UnsupportedProtocolVersionException;
            var co = ($__co__ = _require(13), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function SessionFactory(crypto, store) {
                var self = this;
                var ratchet = new Ratchet(crypto);
                self.createSessionFromPreKeyBundle = co.wrap($traceurRuntime.initGeneratorFunction(function $__9(recipientId, deviceId, retrievedPreKey) {
                    var validSignature, supportsV3, ourBaseKeyPair, theirSignedPreKey, aliceParameters, sessionState;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = retrievedPreKey.signedPreKey ? 1 : 6;
                                break;
                            case 1:
                                $ctx.state = 2;
                                return crypto.verifySignature(retrievedPreKey.identityKey, retrievedPreKey.signedPreKey, retrievedPreKey.signedPreKeySignature);
                            case 2:
                                validSignature = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                if (!validSignature) {
                                    throw new InvalidKeyException('Invalid signature on device key');
                                }
                                $ctx.state = 6;
                                break;
                            case 6:
                                if (!retrievedPreKey.preKey && !retrievedPreKey.signedPreKey) {
                                    throw new InvalidKeyException('Both signed and unsigned pre keys are absent');
                                }
                                supportsV3 = !!retrievedPreKey.signedPreKey;
                                $ctx.state = 19;
                                break;
                            case 19:
                                $ctx.state = 9;
                                return crypto.generateKeyPair();
                            case 9:
                                ourBaseKeyPair = $ctx.sent;
                                $ctx.state = 11;
                                break;
                            case 11:
                                theirSignedPreKey = supportsV3 ? retrievedPreKey.signedPreKey : retrievedPreKey.preKey;
                                aliceParameters = {
                                    sessionVersion: supportsV3 ? 3 : 2,
                                    ourBaseKeyPair: ourBaseKeyPair,
                                    ourIdentityKeyPair: store.getIdentityKeyPair(),
                                    theirIdentityKey: retrievedPreKey.identityKey,
                                    theirSignedPreKey: theirSignedPreKey,
                                    theirRatchetKey: theirSignedPreKey,
                                    theirOneTimePreKey: supportsV3 ? retrievedPreKey.preKey : undefined
                                };
                                $ctx.state = 21;
                                break;
                            case 21:
                                $ctx.state = 13;
                                return initializeAliceSession(aliceParameters);
                            case 13:
                                sessionState = $ctx.sent;
                                $ctx.state = 15;
                                break;
                            case 15:
                                sessionState.pendingPreKey = {
                                    preKeyId: supportsV3 ? retrievedPreKey.preKeyId : null,
                                    signedPreKeyId: retrievedPreKey.signedPreKeyId,
                                    baseKey: ourBaseKeyPair.public
                                };
                                sessionState.localRegistrationId = store.getLocalRegistrationId();
                                $ctx.state = 23;
                                break;
                            case 23:
                                $ctx.returnValue = new Session(crypto, sessionState);
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__9, this);
                }));
                self.createSessionFromPreKeyWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__10(recipientId, deviceId, preKeyWhisperMessageBytes) {
                    var preKeyWhisperMessage, message, ourSignedPreKeyPair, preKeyPair, bobParameters, sessionState;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
                                if (preKeyWhisperMessage.version.current !== 3) {
                                    throw new UnsupportedProtocolVersionException('Protocol version 2 not supported');
                                }
                                message = preKeyWhisperMessage.message;
                                ourSignedPreKeyPair = store.getSignedPreKeyPair(message.signedPreKeyId);
                                if (message.preKeyId) {
                                    preKeyPair = store.getPreKeyPair(message.preKeyId);
                                }
                                bobParameters = {
                                    sessionVersion: preKeyWhisperMessage.version.current,
                                    theirBaseKey: message.baseKey,
                                    theirIdentityKey: message.identityKey,
                                    ourIdentityKeyPair: store.getIdentityKeyPair(),
                                    ourSignedPreKeyPair: ourSignedPreKeyPair,
                                    ourRatchetKeyPair: ourSignedPreKeyPair,
                                    ourOneTimePreKeyPair: preKeyPair
                                };
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.state = 2;
                                return initializeBobSession(bobParameters);
                            case 2:
                                sessionState = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.returnValue = new Session(crypto, sessionState);
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__10, this);
                }));
                self.createSessionFromKeyExchange = function (recipientId, deviceId, keyExchange) {
                };
                self.restoreSession = function (recipientId, deviceId) {
                };
                var initializeAliceSession = co.wrap($traceurRuntime.initGeneratorFunction(function $__11(parameters) {
                        var sendingRatchetKeyPair, agreements, receivingChain, sendingChain, sessionState, $__12, $__13, $__14, $__15;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return crypto.generateKeyPair();
                                case 2:
                                    sendingRatchetKeyPair = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    agreements = [
                                        crypto.calculateAgreement(parameters.theirSignedPreKey, parameters.ourIdentityKeyPair.private),
                                        crypto.calculateAgreement(parameters.theirIdentityKey, parameters.ourBaseKeyPair.private),
                                        crypto.calculateAgreement(parameters.theirSignedPreKey, parameters.ourBaseKeyPair.private)
                                    ];
                                    if (parameters.sessionVersion >= 3 && parameters.theirOneTimePreKey) {
                                        agreements.push(crypto.calculateAgreement(parameters.theirOneTimePreKey, parameters.ourBaseKeyPair.private));
                                    }
                                    $ctx.state = 24;
                                    break;
                                case 24:
                                    $__12 = ratchet.deriveInitialRootAndChainKeys;
                                    $__13 = parameters.sessionVersion;
                                    $ctx.state = 10;
                                    break;
                                case 10:
                                    $ctx.state = 6;
                                    return agreements;
                                case 6:
                                    $__14 = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $__15 = $__12.call(ratchet, $__13, $__14);
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $ctx.state = 14;
                                    return $__15;
                                case 14:
                                    receivingChain = $ctx.sent;
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $ctx.state = 18;
                                    return ratchet.deriveNewRootAndChainKeys(receivingChain.rootKey, parameters.theirRatchetKey, sendingRatchetKeyPair.private);
                                case 18:
                                    sendingChain = $ctx.sent;
                                    $ctx.state = 20;
                                    break;
                                case 20:
                                    sessionState = new SessionState({
                                        sessionVersion: parameters.sessionVersion,
                                        remoteIdentityKey: parameters.theirIdentityKey,
                                        localIdentityKey: parameters.ourIdentityKeyPair.public,
                                        rootKey: sendingChain.rootKey,
                                        sendingChain: sendingChain.chain,
                                        senderRatchetKeyPair: sendingRatchetKeyPair
                                    });
                                    sessionState.addReceivingChain(parameters.theirRatchetKey, receivingChain.chain);
                                    $ctx.state = 26;
                                    break;
                                case 26:
                                    $ctx.returnValue = sessionState;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__11, this);
                    }));
                var initializeBobSession = co.wrap($traceurRuntime.initGeneratorFunction(function $__16(parameters) {
                        var agreements, sendingChain, $__17, $__18, $__19, $__20;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    agreements = [
                                        crypto.calculateAgreement(parameters.theirIdentityKey, parameters.ourSignedPreKeyPair.private),
                                        crypto.calculateAgreement(parameters.theirBaseKey, parameters.ourIdentityKeyPair.private),
                                        crypto.calculateAgreement(parameters.theirBaseKey, parameters.ourSignedPreKeyPair.private)
                                    ];
                                    if (parameters.sessionVersion >= 3 && parameters.ourOneTimePreKeyPair) {
                                        agreements.push(crypto.calculateAgreement(parameters.theirBaseKey, parameters.ourOneTimePreKeyPair.private));
                                    }
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $__17 = ratchet.deriveInitialRootAndChainKeys;
                                    $__18 = parameters.sessionVersion;
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return agreements;
                                case 2:
                                    $__19 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $__20 = $__17.call(ratchet, $__18, $__19);
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $ctx.state = 10;
                                    return $__20;
                                case 10:
                                    sendingChain = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $ctx.returnValue = new SessionState({
                                        sessionVersion: parameters.sessionVersion,
                                        remoteIdentityKey: parameters.theirIdentityKey,
                                        localIdentityKey: parameters.ourIdentityKeyPair.public,
                                        rootKey: sendingChain.rootKey,
                                        sendingChain: sendingChain.chain,
                                        senderRatchetKeyPair: parameters.ourRatchetKeyPair
                                    });
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__16, this);
                    }));
                Object.freeze(self);
            }
            var $__default = SessionFactory;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\SessionState';
            var $__build_47_ArrayBufferUtils__, $__build_47_ProtocolConstants__;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(6), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var makeReadonly = function (obj, key) {
                Object.defineProperty(obj, key, { writable: false });
            };
            var SessionState = function SessionState(parameters) {
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
                makeReadonly(this, 'sessionVersion');
                makeReadonly(this, 'remoteIdentityKey');
                makeReadonly(this, 'localIdentityKey');
                Object.seal(this);
            };
            $traceurRuntime.createClass(SessionState, {
                findReceivingChain: function (theirEphemeralPublicKey) {
                    for (var i = 0; i < this.receivingChains.length; i++) {
                        var receivingChain = this.receivingChains[i];
                        if (ArrayBufferUtils.areEqual(receivingChain.theirEphemeralKey, theirEphemeralPublicKey)) {
                            return receivingChain.chain;
                        }
                    }
                    return null;
                },
                addReceivingChain: function (theirEphemeralPublicKey, chain) {
                    this.receivingChains.push({
                        theirEphemeralKey: theirEphemeralPublicKey,
                        chain: chain
                    });
                    if (this.receivingChains.length > ProtocolConstants.maximumRetainedReceivedChainKeys) {
                        this.receivingChains.shift();
                    }
                }
            }, {});
            var $__default = SessionState;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var __moduleName = 'build/src\\SessionUtils';
            var $__default = {
                    createNewChain: function (key, index) {
                        return {
                            key: key,
                            index: index,
                            messageKeys: []
                        };
                    }
                };
        },
        function (module, exports) {
            'use strict';
            var __moduleName = 'build/src\\WhisperProtos';
            module.exports = _require(14).newBuilder({})['import']({
                'package': 'textsecure',
                'messages': [
                    {
                        'name': 'WhisperMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'ratchetKey',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'counter',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'previousCounter',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'ciphertext',
                                'id': 4
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'PreKeyWhisperMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'registrationId',
                                'id': 5
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'preKeyId',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'signedPreKeyId',
                                'id': 6
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'baseKey',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'identityKey',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'message',
                                'id': 4
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'KeyExchangeMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'id',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'baseKey',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'ratchetKey',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'identityKey',
                                'id': 4
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'baseKeySignature',
                                'id': 5
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'SenderKeyMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'id',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'iteration',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'ciphertext',
                                'id': 3
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'SenderKeyDistributionMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'id',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'iteration',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'chainKey',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'signingKey',
                                'id': 4
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    }
                ],
                'enums': [],
                'imports': [],
                'options': {
                    'java_package': 'org.whispersystems.libaxolotl.protocol',
                    'java_outer_classname': 'WhisperProtos'
                },
                'services': []
            }).build('textsecure');
        },
        function (module, exports) {
            var slice = Array.prototype.slice;
            module.exports = co['default'] = co.co = co;
            co.wrap = function (fn) {
                return function () {
                    return co.call(this, fn.apply(this, arguments));
                };
            };
            function co(gen) {
                var ctx = this;
                if (typeof gen === 'function')
                    gen = gen.call(this);
                return new Promise(function (resolve, reject) {
                    onFulfilled();
                    function onFulfilled(res) {
                        var ret;
                        try {
                            ret = gen.next(res);
                        } catch (e) {
                            return reject(e);
                        }
                        next(ret);
                    }
                    function onRejected(err) {
                        var ret;
                        try {
                            ret = gen.throw(err);
                        } catch (e) {
                            return reject(e);
                        }
                        next(ret);
                    }
                    function next(ret) {
                        if (ret.done)
                            return resolve(ret.value);
                        var value = toPromise.call(ctx, ret.value);
                        if (value && isPromise(value))
                            return value.then(onFulfilled, onRejected);
                        return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following object was passed: "' + String(ret.value) + '"'));
                    }
                });
            }
            function toPromise(obj) {
                if (!obj)
                    return obj;
                if (isPromise(obj))
                    return obj;
                if (isGeneratorFunction(obj) || isGenerator(obj))
                    return co.call(this, obj);
                if ('function' == typeof obj)
                    return thunkToPromise.call(this, obj);
                if (Array.isArray(obj))
                    return arrayToPromise.call(this, obj);
                if (isObject(obj))
                    return objectToPromise.call(this, obj);
                return obj;
            }
            function thunkToPromise(fn) {
                var ctx = this;
                return new Promise(function (resolve, reject) {
                    fn.call(ctx, function (err, res) {
                        if (err)
                            return reject(err);
                        if (arguments.length > 2)
                            res = slice.call(arguments, 1);
                        resolve(res);
                    });
                });
            }
            function arrayToPromise(obj) {
                return Promise.all(obj.map(toPromise, this));
            }
            function objectToPromise(obj) {
                var results = new obj.constructor();
                var keys = Object.keys(obj);
                var promises = [];
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var promise = toPromise.call(this, obj[key]);
                    if (promise && isPromise(promise))
                        defer(promise, key);
                    else
                        results[key] = obj[key];
                }
                return Promise.all(promises).then(function () {
                    return results;
                });
                function defer(promise, key) {
                    results[key] = undefined;
                    promises.push(promise.then(function (res) {
                        results[key] = res;
                    }));
                }
            }
            function isPromise(obj) {
                return 'function' == typeof obj.then;
            }
            function isGenerator(obj) {
                return 'function' == typeof obj.next && 'function' == typeof obj.throw;
            }
            function isGeneratorFunction(obj) {
                var constructor = obj.constructor;
                return constructor && 'GeneratorFunction' == constructor.name;
            }
            function isObject(val) {
                return Object == val.constructor;
            }
        },
        function (module, exports) {
            module.exports = __external_1;
        }
    ];
    return _require(0);
}));