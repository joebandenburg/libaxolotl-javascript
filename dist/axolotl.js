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
            module.exports = function (cryptoServices, store) {
                return new Axolotl(cryptoServices, store);
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
                    },
                    stringify: function (buffer) {
                        var string = '';
                        var view = new Uint8Array(buffer);
                        for (var i = 0; i < buffer.byteLength; i++) {
                            var byte = view[i].toString(16);
                            if (byte.length === 1) {
                                string += '0';
                            }
                            string += byte;
                        }
                        return string;
                    },
                    parse: function (string) {
                        var buffer = new ArrayBuffer(string.length / 2);
                        var view = new Uint8Array(buffer);
                        for (var i = 0; i < string.length; i += 2) {
                            view[i / 2] = parseInt(string[i], 16) * 16 + parseInt(string[i + 1], 16);
                        }
                        return buffer;
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
            var $__build_47_SessionFactory__, $__build_47_Exceptions__, $__build_47_MessageTypes__, $__build_47_Store__, $__build_47_Crypto__, $__co__;
            var SessionFactory = ($__build_47_SessionFactory__ = _require(14), $__build_47_SessionFactory__ && $__build_47_SessionFactory__.__esModule && $__build_47_SessionFactory__ || { default: $__build_47_SessionFactory__ }).default;
            var InvalidMessageException = ($__build_47_Exceptions__ = _require(5), $__build_47_Exceptions__ && $__build_47_Exceptions__.__esModule && $__build_47_Exceptions__ || { default: $__build_47_Exceptions__ }).InvalidMessageException;
            var MessageTypes = ($__build_47_MessageTypes__ = _require(7), $__build_47_MessageTypes__ && $__build_47_MessageTypes__.__esModule && $__build_47_MessageTypes__ || { default: $__build_47_MessageTypes__ }).default;
            var Store = ($__build_47_Store__ = _require(17), $__build_47_Store__ && $__build_47_Store__.__esModule && $__build_47_Store__ || { default: $__build_47_Store__ }).default;
            var Crypto = ($__build_47_Crypto__ = _require(4), $__build_47_Crypto__ && $__build_47_Crypto__.__esModule && $__build_47_Crypto__ || { default: $__build_47_Crypto__ }).default;
            var co = ($__co__ = _require(19), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function Axolotl(crypto, store) {
                var self = this;
                var wrappedStore = new Store(store);
                var wrappedCrypto = new Crypto(crypto);
                var sessionFactory = new SessionFactory(wrappedCrypto, wrappedStore);
                this.generateIdentityKeyPair = function () {
                    return wrappedCrypto.generateKeyPair();
                };
                this.generateRegistrationId = co.wrap($traceurRuntime.initGeneratorFunction(function $__6(extendedRange) {
                    var upperLimit, bytes, number;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                upperLimit = extendedRange ? 2147483646 : 16380;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.state = 2;
                                return wrappedCrypto.randomBytes(4);
                            case 2:
                                bytes = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                number = new Uint32Array(bytes)[0];
                                $ctx.state = 10;
                                break;
                            case 10:
                                $ctx.returnValue = number % upperLimit + 1;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__6, this);
                }));
                this.generatePreKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__7(start, count) {
                    var results, i, $__8, $__9, $__10, $__11, $__12, $__13;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                results = [];
                                start--;
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
                                $__8 = results.push;
                                $__9 = wrappedCrypto.generateKeyPair;
                                $__10 = $__9.call(wrappedCrypto);
                                $ctx.state = 6;
                                break;
                            case 6:
                                $ctx.state = 2;
                                return $__10;
                            case 2:
                                $__11 = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__12 = {
                                    id: (start + i) % 16777214 + 1,
                                    keyPair: $__11
                                };
                                $__13 = $__8.call(results, $__12);
                                $ctx.state = 8;
                                break;
                            case 9:
                                $ctx.returnValue = results;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__7, this);
                }));
                this.generateLastResortPreKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__14() {
                    var $__15, $__16, $__17, $__18;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $__15 = wrappedCrypto.generateKeyPair;
                                $__16 = $__15.call(wrappedCrypto);
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
                                $__18 = {
                                    id: 16777215,
                                    keyPair: $__17
                                };
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = $__18;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__14, this);
                }));
                this.generateSignedPreKey = co.wrap($traceurRuntime.initGeneratorFunction(function $__19(identityKeyPair, signedPreKeyId) {
                    var keyPair, signature;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return wrappedCrypto.generateKeyPair();
                            case 2:
                                keyPair = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return wrappedCrypto.sign(identityKeyPair.private, keyPair.public);
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
                    }, $__19, this);
                }));
                this.encryptMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__20(toIdentity, message) {
                    var session, hasSession, preKeyBundle, $__21, $__22, $__23;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return sessionFactory.hasSessionForIdentity(toIdentity);
                            case 2:
                                hasSession = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = hasSession ? 5 : 9;
                                break;
                            case 5:
                                $ctx.state = 6;
                                return sessionFactory.getSessionForIdentity(toIdentity);
                            case 6:
                                session = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 9:
                                $ctx.state = 10;
                                return wrappedStore.getRemotePreKeyBundle(toIdentity);
                            case 10:
                                preKeyBundle = $ctx.sent;
                                $ctx.state = 12;
                                break;
                            case 12:
                                $ctx.state = 14;
                                return sessionFactory.createSessionFromPreKeyBundle(toIdentity, preKeyBundle);
                            case 14:
                                session = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $__21 = session.encryptMessage;
                                $__22 = $__21.call(session, message);
                                $ctx.state = 23;
                                break;
                            case 23:
                                $ctx.state = 19;
                                return $__22;
                            case 19:
                                $__23 = $ctx.sent;
                                $ctx.state = 21;
                                break;
                            case 21:
                                $ctx.returnValue = $__23;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__20, this);
                }));
                this.decryptWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__24(fromIdentity, message) {
                    var hasSession, session, $__25, $__26, $__27;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return sessionFactory.hasSessionForIdentity(fromIdentity);
                            case 2:
                                hasSession = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                if (!hasSession) {
                                    throw new InvalidMessageException('No session for message');
                                }
                                $ctx.state = 18;
                                break;
                            case 18:
                                $ctx.state = 6;
                                return sessionFactory.getSessionForIdentity(fromIdentity);
                            case 6:
                                session = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $__25 = session.decryptWhisperMessage;
                                $__26 = $__25.call(session, message);
                                $ctx.state = 14;
                                break;
                            case 14:
                                $ctx.state = 10;
                                return $__26;
                            case 10:
                                $__27 = $ctx.sent;
                                $ctx.state = 12;
                                break;
                            case 12:
                                $ctx.returnValue = $__27;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__24, this);
                }));
                this.decryptPreKeyWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__28(fromIdentity, message) {
                    var session, $__29, $__30, $__31;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return sessionFactory.createSessionFromPreKeyWhisperMessage(fromIdentity, message);
                            case 2:
                                session = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__29 = session.decryptPreKeyWhisperMessage;
                                $__30 = $__29.call(session, message);
                                $ctx.state = 10;
                                break;
                            case 10:
                                $ctx.state = 6;
                                return $__30;
                            case 6:
                                $__31 = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = $__31;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__28, this);
                }));
                Object.freeze(self);
            }
            Axolotl.PreKeyWhisperMessage = MessageTypes.PreKeyWhisperMessage;
            Axolotl.WhisperMessage = MessageTypes.WhisperMessage;
            var $__default = Axolotl;
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
            var __moduleName = 'build/src\\Chain';
            var Chain = function Chain(key) {
                this.key = key;
                this.index = 0;
                this.messageKeys = [];
                Object.seal(this);
            };
            $traceurRuntime.createClass(Chain, {}, {});
            var $__default = Chain;
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
            var __moduleName = 'build/src\\Crypto';
            var $__build_47_PromiseInterfaceDecorator__;
            var PromiseInterfaceDecorator = ($__build_47_PromiseInterfaceDecorator__ = _require(9), $__build_47_PromiseInterfaceDecorator__ && $__build_47_PromiseInterfaceDecorator__.__esModule && $__build_47_PromiseInterfaceDecorator__ || { default: $__build_47_PromiseInterfaceDecorator__ }).default;
            var methodNames = [
                    'generateKeyPair',
                    'calculateAgreement',
                    'randomBytes',
                    'sign',
                    'verifySignature',
                    'hmac',
                    'encrypt',
                    'decrypt'
                ];
            var Crypto = function Crypto(crypto) {
                $traceurRuntime.superConstructor($Crypto).call(this, crypto, methodNames);
            };
            var $Crypto = Crypto;
            $traceurRuntime.createClass(Crypto, {}, {}, PromiseInterfaceDecorator);
            var $__default = Crypto;
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
                UntrustedIdentityException: {
                    get: function () {
                        return UntrustedIdentityException;
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
            var UntrustedIdentityException = function UntrustedIdentityException() {
                $traceurRuntime.superConstructor($UntrustedIdentityException).apply(this, arguments);
            };
            var $UntrustedIdentityException = UntrustedIdentityException;
            $traceurRuntime.createClass(UntrustedIdentityException, {}, {}, Error);
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
            var co = ($__co__ = _require(19), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
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
            var __moduleName = 'build/src\\MessageTypes';
            var $__default = {
                    PreKeyWhisperMessage: 1,
                    WhisperMessage: 2
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
            var __moduleName = 'build/src\\Messages';
            var $__build_47_WhisperProtos__, $__build_47_ProtocolConstants__, $__build_47_ArrayBufferUtils__;
            var WhisperProtos = ($__build_47_WhisperProtos__ = _require(18), $__build_47_WhisperProtos__ && $__build_47_WhisperProtos__.__esModule && $__build_47_WhisperProtos__ || { default: $__build_47_WhisperProtos__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(10), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
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
                    decodePreKeyWhisperMessage: function (preKeyWhisperMessageBytes) {
                        var message = WhisperProtos.PreKeyWhisperMessage.decode(preKeyWhisperMessageBytes.slice(1));
                        toArrayBuffer(message, 'message');
                        toArrayBuffer(message, 'baseKey');
                        toArrayBuffer(message, 'identityKey');
                        return {
                            version: extractMessageVersion(preKeyWhisperMessageBytes.slice(0, 1)),
                            message: message
                        };
                    },
                    encodePreKeyWhisperMessage: function (preKeyWhisperMessage) {
                        var message = preKeyWhisperMessage.message;
                        var messageBytes = new WhisperProtos.PreKeyWhisperMessage(message).encode().toArrayBuffer();
                        var versionField = getVersionField(preKeyWhisperMessage.version);
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
            var __moduleName = 'build/src\\PromiseInterfaceDecorator';
            var wrap = function (fn) {
                return function () {
                    return Promise.resolve(fn.apply(this, arguments));
                };
            };
            var PromiseInterfaceDecorator = function PromiseInterfaceDecorator(impl, methodNames) {
                var $__0 = this;
                methodNames.forEach(function (methodName) {
                    if (!impl[methodName]) {
                        throw new Error('interface must implement ' + methodName);
                    }
                    $__0[methodName] = wrap(impl[methodName]);
                });
                Object.freeze(this);
            };
            $traceurRuntime.createClass(PromiseInterfaceDecorator, {}, {});
            var $__default = PromiseInterfaceDecorator;
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
                    maximumRetainedReceivedChainKeys: 5,
                    maximumMissedMessages: 2000,
                    maximumSessionsPerIdentity: 40
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
            var $__build_47_HKDF__, $__build_47_Chain__, $__build_47_ArrayBufferUtils__, $__build_47_ProtocolConstants__, $__co__;
            var HKDF = ($__build_47_HKDF__ = _require(6), $__build_47_HKDF__ && $__build_47_HKDF__.__esModule && $__build_47_HKDF__ || { default: $__build_47_HKDF__ }).default;
            var Chain = ($__build_47_Chain__ = _require(3), $__build_47_Chain__ && $__build_47_Chain__.__esModule && $__build_47_Chain__ || { default: $__build_47_Chain__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(10), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var co = ($__co__ = _require(19), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
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
                this.deriveInitialRootKeyAndChain = co.wrap($traceurRuntime.initGeneratorFunction(function $__5(sessionVersion, agreements) {
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
                                    chain: new Chain(derivedSecret.slice(ProtocolConstants.rootKeyByteCount))
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__5, this);
                }));
                this.deriveNextRootKeyAndChain = co.wrap($traceurRuntime.initGeneratorFunction(function $__6(rootKey, theirEphemeralPublicKey, ourEphemeralPrivateKey) {
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
                                    chain: new Chain(derivedSecretBytes.slice(ProtocolConstants.rootKeyByteCount))
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__6, this);
                }));
                this.clickSubRatchet = co.wrap($traceurRuntime.initGeneratorFunction(function $__7(chain) {
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
                    }, $__7, this);
                }));
                this.deriveMessageKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__8(chainKey) {
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
            var __moduleName = 'build/src\\SequentialOperationQueue';
            function SequentialOperationQueue() {
                var head = Promise.resolve();
                this.wrap = function (fn) {
                    return function () {
                        var $__0 = arguments, $__1 = this;
                        var boundFn = function () {
                            return fn.apply($__1, $__0);
                        };
                        head = head.then(boundFn, boundFn);
                        return head;
                    };
                };
            }
            var $__default = SequentialOperationQueue;
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
            var $__build_47_ArrayBufferUtils__, $__build_47_ProtocolConstants__, $__build_47_Messages__, $__build_47_MessageTypes__, $__build_47_SessionState__, $__build_47_Ratchet__, $__build_47_Exceptions__, $__build_47_SequentialOperationQueue__, $__co__;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(10), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var Messages = ($__build_47_Messages__ = _require(8), $__build_47_Messages__ && $__build_47_Messages__.__esModule && $__build_47_Messages__ || { default: $__build_47_Messages__ }).default;
            var MessageTypes = ($__build_47_MessageTypes__ = _require(7), $__build_47_MessageTypes__ && $__build_47_MessageTypes__.__esModule && $__build_47_MessageTypes__ || { default: $__build_47_MessageTypes__ }).default;
            var SessionState = ($__build_47_SessionState__ = _require(15), $__build_47_SessionState__ && $__build_47_SessionState__.__esModule && $__build_47_SessionState__ || { default: $__build_47_SessionState__ }).default;
            var Ratchet = ($__build_47_Ratchet__ = _require(11), $__build_47_Ratchet__ && $__build_47_Ratchet__.__esModule && $__build_47_Ratchet__ || { default: $__build_47_Ratchet__ }).default;
            var $__6 = ($__build_47_Exceptions__ = _require(5), $__build_47_Exceptions__ && $__build_47_Exceptions__.__esModule && $__build_47_Exceptions__ || { default: $__build_47_Exceptions__ }), InvalidMessageException = $__6.InvalidMessageException, DuplicateMessageException = $__6.DuplicateMessageException;
            var SequentialOperationQueue = ($__build_47_SequentialOperationQueue__ = _require(12), $__build_47_SequentialOperationQueue__ && $__build_47_SequentialOperationQueue__.__esModule && $__build_47_SequentialOperationQueue__ || { default: $__build_47_SequentialOperationQueue__ }).default;
            var co = ($__co__ = _require(19), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function Session(crypto, sessionStateList) {
                var self = this;
                var ratchet = new Ratchet(crypto);
                var queue = new SequentialOperationQueue();
                this.encryptMessage = queue.wrap(co.wrap($traceurRuntime.initGeneratorFunction(function $__13(paddedMessage) {
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
                                return ratchet.clickSubRatchet(sessionStateList.mostRecentSession().sendingChain);
                            case 6:
                                $ctx.maybeThrow();
                                $ctx.state = 8;
                                break;
                            case 8:
                                sessionStateList.save();
                                $ctx.state = 15;
                                break;
                            case 15:
                                $ctx.state = sessionStateList.mostRecentSession().pendingPreKey ? 9 : 11;
                                break;
                            case 9:
                                $ctx.returnValue = {
                                    type: MessageTypes.PreKeyWhisperMessage,
                                    body: createPreKeyWhisperMessage(whisperMessage)
                                };
                                $ctx.state = -2;
                                break;
                            case 11:
                                $ctx.returnValue = {
                                    type: MessageTypes.WhisperMessage,
                                    body: whisperMessage
                                };
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__13, this);
                })));
                this.decryptPreKeyWhisperMessage = function (preKeyWhisperMessageBytes) {
                    var preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
                    return self.decryptWhisperMessage(preKeyWhisperMessage.message.message);
                };
                this.decryptWhisperMessage = queue.wrap(co.wrap($traceurRuntime.initGeneratorFunction(function $__14(whisperMessageBytes) {
                    var exceptions, $__9, $__10, sessionState, clonedSessionState, promise, result, messages;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                exceptions = [];
                                $ctx.state = 17;
                                break;
                            case 17:
                                $__9 = sessionStateList.sessions[$traceurRuntime.toProperty(Symbol.iterator)]();
                                $ctx.state = 6;
                                break;
                            case 6:
                                $ctx.state = !($__10 = $__9.next()).done ? 12 : 14;
                                break;
                            case 12:
                                sessionState = $__10.value;
                                $ctx.state = 13;
                                break;
                            case 13:
                                clonedSessionState = new SessionState(sessionState);
                                promise = decryptWhisperMessageWithSessionState(clonedSessionState, whisperMessageBytes);
                                $ctx.state = 11;
                                break;
                            case 11:
                                $ctx.state = 2;
                                return promise.catch(function (e) {
                                    exceptions.push(e);
                                });
                            case 2:
                                result = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = result !== undefined ? 7 : 6;
                                break;
                            case 7:
                                sessionStateList.removeSessionState(sessionState);
                                sessionStateList.addSessionState(clonedSessionState);
                                sessionStateList.save();
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = result;
                                $ctx.state = -2;
                                break;
                            case 14:
                                messages = exceptions.map(function (e) {
                                    return e.toString();
                                });
                                throw new InvalidMessageException('Unable to decrypt message: ' + messages);
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__14, this);
                })));
                var decryptWhisperMessageWithSessionState = co.wrap($traceurRuntime.initGeneratorFunction(function $__15(sessionState, whisperMessageBytes) {
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
                                    return getOrCreateReceivingChain(sessionState, theirEphemeralPublicKey);
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
                        }, $__15, this);
                    }));
                var isValidMac = co.wrap($traceurRuntime.initGeneratorFunction(function $__16(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey, theirMac) {
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
                        }, $__16, this);
                    }));
                var getMac = co.wrap($traceurRuntime.initGeneratorFunction(function $__17(data, macKey, messageVersion, senderIdentityKey, receiverIdentityKey) {
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
                        }, $__17, this);
                    }));
                var createWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__18(paddedMessage) {
                        var messageKeys, ciphertext, version, message, macInputBytes, $__19, $__20, $__21, $__22, $__23, $__24, $__25, $__26, $__27, $__28, $__29, $__30, $__31, $__32, $__33;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return ratchet.deriveMessageKeys(sessionStateList.mostRecentSession().sendingChain.key);
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
                                        current: sessionStateList.mostRecentSession().sessionVersion,
                                        max: ProtocolConstants.currentVersion
                                    };
                                    message = {
                                        ratchetKey: sessionStateList.mostRecentSession().senderRatchetKeyPair.public,
                                        counter: sessionStateList.mostRecentSession().sendingChain.index,
                                        previousCounter: sessionStateList.mostRecentSession().previousCounter,
                                        ciphertext: ciphertext
                                    };
                                    macInputBytes = Messages.encodeWhisperMessageMacInput({
                                        version: version,
                                        message: message
                                    });
                                    $ctx.state = 20;
                                    break;
                                case 20:
                                    $__19 = Messages.encodeWhisperMessage;
                                    $__20 = messageKeys.macKey;
                                    $__21 = sessionStateList.mostRecentSession;
                                    $__22 = $__21.call(sessionStateList);
                                    $__23 = $__22.sessionVersion;
                                    $__24 = sessionStateList.mostRecentSession;
                                    $__25 = $__24.call(sessionStateList);
                                    $__26 = $__25.localIdentityKey;
                                    $__27 = sessionStateList.mostRecentSession;
                                    $__28 = $__27.call(sessionStateList);
                                    $__29 = $__28.remoteIdentityKey;
                                    $__30 = getMac(macInputBytes, $__20, $__23, $__26, $__29);
                                    $ctx.state = 14;
                                    break;
                                case 14:
                                    $ctx.state = 10;
                                    return $__30;
                                case 10:
                                    $__31 = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $__32 = {
                                        version: version,
                                        message: message,
                                        mac: $__31
                                    };
                                    $__33 = $__19.call(Messages, $__32);
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $ctx.returnValue = $__33;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__18, this);
                    }));
                var createPreKeyWhisperMessage = function (whisperMessage) {
                    var pendingPreKey = sessionStateList.mostRecentSession().pendingPreKey;
                    return Messages.encodePreKeyWhisperMessage({
                        version: {
                            current: sessionStateList.mostRecentSession().sessionVersion,
                            max: ProtocolConstants.currentVersion
                        },
                        message: {
                            registrationId: sessionStateList.mostRecentSession().localRegistrationId,
                            preKeyId: pendingPreKey.preKeyId,
                            signedPreKeyId: pendingPreKey.signedPreKeyId,
                            baseKey: pendingPreKey.baseKey,
                            identityKey: sessionStateList.mostRecentSession().localIdentityKey,
                            message: whisperMessage
                        }
                    });
                };
                var getOrCreateReceivingChain = co.wrap($traceurRuntime.initGeneratorFunction(function $__34(sessionState, theirEphemeralPublicKey) {
                        var chain, $__35, $__36;
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
                                    $__35 = clickMainRatchet(sessionState, theirEphemeralPublicKey);
                                    $ctx.state = 9;
                                    break;
                                case 9:
                                    $ctx.state = 5;
                                    return $__35;
                                case 5:
                                    $__36 = $ctx.sent;
                                    $ctx.state = 7;
                                    break;
                                case 7:
                                    $ctx.returnValue = $__36;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__34, this);
                    }));
                var getOrCreateMessageKeys = co.wrap($traceurRuntime.initGeneratorFunction(function $__37(theirEphemeralPublicKey, chain, counter) {
                        var cachedMessageKeys, messageKeys;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = chain.index > counter ? 3 : 24;
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
                                case 24:
                                    if (counter - chain.index > ProtocolConstants.maximumMissedMessages) {
                                        throw new InvalidMessageException('Too many skipped messages');
                                    }
                                    $ctx.state = 25;
                                    break;
                                case 25:
                                    $ctx.state = chain.index < counter ? 5 : 13;
                                    break;
                                case 5:
                                    $ctx.state = 6;
                                    return ratchet.deriveMessageKeys(chain.key);
                                case 6:
                                    chain.messageKeys[chain.index] = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $ctx.state = 10;
                                    return ratchet.clickSubRatchet(chain);
                                case 10:
                                    $ctx.maybeThrow();
                                    $ctx.state = 25;
                                    break;
                                case 13:
                                    $ctx.state = 15;
                                    return ratchet.deriveMessageKeys(chain.key);
                                case 15:
                                    messageKeys = $ctx.sent;
                                    $ctx.state = 17;
                                    break;
                                case 17:
                                    $ctx.state = 19;
                                    return ratchet.clickSubRatchet(chain);
                                case 19:
                                    $ctx.maybeThrow();
                                    $ctx.state = 21;
                                    break;
                                case 21:
                                    $ctx.returnValue = messageKeys;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__37, this);
                    }));
                var clickMainRatchet = co.wrap($traceurRuntime.initGeneratorFunction(function $__38(sessionState, theirEphemeralPublicKey) {
                        var $__11, theirRootKey, nextReceivingChain, ourNewEphemeralKeyPair, $__12, rootKey, nextSendingChain, $__39, $__40, $__41, $__42, $__43, $__44, $__45, $__46, $__47, $__48, $__49, $__50, $__51, $__52;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $__39 = ratchet.deriveNextRootKeyAndChain;
                                    $__40 = sessionState.rootKey;
                                    $__41 = sessionState.senderRatchetKeyPair;
                                    $__42 = $__41.private;
                                    $__43 = $__39.call(ratchet, $__40, theirEphemeralPublicKey, $__42);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return $__43;
                                case 2:
                                    $__44 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $__11 = $__44;
                                    $__45 = $__11.rootKey;
                                    theirRootKey = $__45;
                                    $__46 = $__11.chain;
                                    nextReceivingChain = $__46;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $ctx.state = 10;
                                    return crypto.generateKeyPair();
                                case 10:
                                    ourNewEphemeralKeyPair = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $__47 = ratchet.deriveNextRootKeyAndChain;
                                    $__48 = ourNewEphemeralKeyPair.private;
                                    $__49 = $__47.call(ratchet, theirRootKey, theirEphemeralPublicKey, $__48);
                                    $ctx.state = 18;
                                    break;
                                case 18:
                                    $ctx.state = 14;
                                    return $__49;
                                case 14:
                                    $__50 = $ctx.sent;
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $__12 = $__50;
                                    $__51 = $__12.rootKey;
                                    rootKey = $__51;
                                    $__52 = $__12.chain;
                                    nextSendingChain = $__52;
                                    $ctx.state = 20;
                                    break;
                                case 20:
                                    sessionState.rootKey = rootKey;
                                    sessionState.addReceivingChain(theirEphemeralPublicKey, nextReceivingChain);
                                    sessionState.previousCounter = Math.max(sessionState.sendingChain.index - 1, 0);
                                    sessionState.sendingChain = nextSendingChain;
                                    sessionState.senderRatchetKeyPair = ourNewEphemeralKeyPair;
                                    $ctx.state = 24;
                                    break;
                                case 24:
                                    $ctx.returnValue = nextReceivingChain;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__38, this);
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
            var $__build_47_Session__, $__build_47_WhisperProtos__, $__build_47_ArrayBufferUtils__, $__build_47_Messages__, $__build_47_Ratchet__, $__build_47_SessionState__, $__build_47_SessionStateList__, $__build_47_Exceptions__, $__co__;
            var Session = ($__build_47_Session__ = _require(13), $__build_47_Session__ && $__build_47_Session__.__esModule && $__build_47_Session__ || { default: $__build_47_Session__ }).default;
            var WhisperProtos = ($__build_47_WhisperProtos__ = _require(18), $__build_47_WhisperProtos__ && $__build_47_WhisperProtos__.__esModule && $__build_47_WhisperProtos__ || { default: $__build_47_WhisperProtos__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            var Messages = ($__build_47_Messages__ = _require(8), $__build_47_Messages__ && $__build_47_Messages__.__esModule && $__build_47_Messages__ || { default: $__build_47_Messages__ }).default;
            var Ratchet = ($__build_47_Ratchet__ = _require(11), $__build_47_Ratchet__ && $__build_47_Ratchet__.__esModule && $__build_47_Ratchet__ || { default: $__build_47_Ratchet__ }).default;
            var SessionState = ($__build_47_SessionState__ = _require(15), $__build_47_SessionState__ && $__build_47_SessionState__.__esModule && $__build_47_SessionState__ || { default: $__build_47_SessionState__ }).default;
            var SessionStateList = ($__build_47_SessionStateList__ = _require(16), $__build_47_SessionStateList__ && $__build_47_SessionStateList__.__esModule && $__build_47_SessionStateList__ || { default: $__build_47_SessionStateList__ }).default;
            var $__7 = ($__build_47_Exceptions__ = _require(5), $__build_47_Exceptions__ && $__build_47_Exceptions__.__esModule && $__build_47_Exceptions__ || { default: $__build_47_Exceptions__ }), InvalidKeyException = $__7.InvalidKeyException, UnsupportedProtocolVersionException = $__7.UnsupportedProtocolVersionException, UntrustedIdentityException = $__7.UntrustedIdentityException;
            var co = ($__co__ = _require(19), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function SessionFactory(crypto, store) {
                var self = this;
                var ratchet = new Ratchet(crypto);
                var sessionCache = {};
                self.createSessionFromPreKeyBundle = co.wrap($traceurRuntime.initGeneratorFunction(function $__13(toIdentity, retrievedPreKeyBundle) {
                    var isTrusted, validSignature, supportsV3, ourBaseKeyPair, theirSignedPreKey, aliceParameters, sessionState, sessionStateList, $__14, $__15, $__16, $__17, $__18, $__19, $__20, $__21, $__22, $__23;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return store.isRemoteIdentityTrusted(toIdentity, retrievedPreKeyBundle.identityKey);
                            case 2:
                                isTrusted = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                if (!isTrusted) {
                                    throw new UntrustedIdentityException();
                                }
                                $ctx.state = 49;
                                break;
                            case 49:
                                $ctx.state = retrievedPreKeyBundle.signedPreKey ? 5 : 10;
                                break;
                            case 5:
                                $ctx.state = 6;
                                return crypto.verifySignature(retrievedPreKeyBundle.identityKey, retrievedPreKeyBundle.signedPreKey, retrievedPreKeyBundle.signedPreKeySignature);
                            case 6:
                                validSignature = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                if (!validSignature) {
                                    throw new InvalidKeyException('Invalid signature on device key');
                                }
                                $ctx.state = 10;
                                break;
                            case 10:
                                if (!retrievedPreKeyBundle.preKey && !retrievedPreKeyBundle.signedPreKey) {
                                    throw new InvalidKeyException('Both signed and unsigned pre keys are absent');
                                }
                                supportsV3 = !!retrievedPreKeyBundle.signedPreKey;
                                $ctx.state = 51;
                                break;
                            case 51:
                                $ctx.state = 13;
                                return crypto.generateKeyPair();
                            case 13:
                                ourBaseKeyPair = $ctx.sent;
                                $ctx.state = 15;
                                break;
                            case 15:
                                theirSignedPreKey = supportsV3 ? retrievedPreKeyBundle.signedPreKey : retrievedPreKeyBundle.preKey;
                                $ctx.state = 53;
                                break;
                            case 53:
                                $__14 = store.getLocalIdentityKeyPair;
                                $__15 = $__14.call(store);
                                $ctx.state = 21;
                                break;
                            case 21:
                                $ctx.state = 17;
                                return $__15;
                            case 17:
                                $__16 = $ctx.sent;
                                $ctx.state = 19;
                                break;
                            case 19:
                                $__17 = retrievedPreKeyBundle.identityKey;
                                if (supportsV3) {
                                    $__18 = retrievedPreKeyBundle.preKey;
                                    $__19 = $__18;
                                } else {
                                    $__19 = undefined;
                                }
                                $__20 = {
                                    sessionVersion: supportsV3 ? 3 : 2,
                                    ourBaseKeyPair: ourBaseKeyPair,
                                    ourIdentityKeyPair: $__16,
                                    theirIdentityKey: $__17,
                                    theirSignedPreKey: theirSignedPreKey,
                                    theirRatchetKey: theirSignedPreKey,
                                    theirOneTimePreKey: $__19
                                };
                                aliceParameters = $__20;
                                $ctx.state = 23;
                                break;
                            case 23:
                                $ctx.state = 25;
                                return initializeAliceSession(aliceParameters);
                            case 25:
                                sessionState = $ctx.sent;
                                $ctx.state = 27;
                                break;
                            case 27:
                                sessionState.pendingPreKey = {
                                    preKeyId: supportsV3 ? retrievedPreKeyBundle.preKeyId : null,
                                    signedPreKeyId: retrievedPreKeyBundle.signedPreKeyId,
                                    baseKey: ourBaseKeyPair.public
                                };
                                $ctx.state = 55;
                                break;
                            case 55:
                                $ctx.state = 29;
                                return store.getLocalRegistrationId();
                            case 29:
                                sessionState.localRegistrationId = $ctx.sent;
                                $ctx.state = 31;
                                break;
                            case 31:
                                sessionStateList = new SessionStateList(function (serialisedState) {
                                    return store.putSession(toIdentity, serialisedState);
                                });
                                sessionStateList.addSessionState(sessionState);
                                $ctx.state = 57;
                                break;
                            case 57:
                                $ctx.state = 33;
                                return sessionStateList.save();
                            case 33:
                                $ctx.maybeThrow();
                                $ctx.state = 35;
                                break;
                            case 35:
                                $ctx.state = 37;
                                return store.putRemoteIdentity(toIdentity, retrievedPreKeyBundle.identityKey);
                            case 37:
                                $ctx.maybeThrow();
                                $ctx.state = 39;
                                break;
                            case 39:
                                $__21 = self.getSessionForIdentity;
                                $__22 = $__21.call(self, toIdentity);
                                $ctx.state = 45;
                                break;
                            case 45:
                                $ctx.state = 41;
                                return $__22;
                            case 41:
                                $__23 = $ctx.sent;
                                $ctx.state = 43;
                                break;
                            case 43:
                                $ctx.returnValue = $__23;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__13, this);
                }));
                self.createSessionFromPreKeyWhisperMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__24(fromIdentity, preKeyWhisperMessageBytes) {
                    var preKeyWhisperMessage, message, isTrusted, cachedSession, $__9, $__10, cachedSessionState, ourSignedPreKeyPair, preKeyPair, bobParameters, sessionState, sessionStateList, $__25, $__26, $__27, $__28, $__29, $__30, $__31, $__32, $__33, $__34, $__35, $__36, $__37, $__38;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                preKeyWhisperMessage = Messages.decodePreKeyWhisperMessage(preKeyWhisperMessageBytes);
                                if (preKeyWhisperMessage.version.current !== 3) {
                                    throw new UnsupportedProtocolVersionException('Protocol version ' + preKeyWhisperMessage.version.current + ' is not supported');
                                }
                                message = preKeyWhisperMessage.message;
                                $ctx.state = 63;
                                break;
                            case 63:
                                $ctx.state = 2;
                                return store.isRemoteIdentityTrusted(fromIdentity, message.identityKey);
                            case 2:
                                isTrusted = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                if (!isTrusted) {
                                    throw new UntrustedIdentityException();
                                }
                                $ctx.state = 65;
                                break;
                            case 65:
                                $ctx.state = self.hasSessionForIdentity(fromIdentity) ? 5 : 14;
                                break;
                            case 5:
                                $ctx.state = 6;
                                return getSessionStateListForIdentity(fromIdentity);
                            case 6:
                                cachedSession = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $__9 = cachedSession.sessionStateList.sessions[$traceurRuntime.toProperty(Symbol.iterator)]();
                                $ctx.state = 10;
                                break;
                            case 10:
                                $ctx.state = !($__10 = $__9.next()).done ? 12 : 14;
                                break;
                            case 12:
                                cachedSessionState = $__10.value;
                                $ctx.state = 13;
                                break;
                            case 13:
                                $ctx.state = cachedSessionState.theirBaseKey && ArrayBufferUtils.areEqual(cachedSessionState.theirBaseKey, message.baseKey) ? 9 : 10;
                                break;
                            case 9:
                                $ctx.returnValue = cachedSession.session;
                                $ctx.state = -2;
                                break;
                            case 14:
                                $ctx.state = 18;
                                return store.getLocalSignedPreKeyPair(message.signedPreKeyId);
                            case 18:
                                ourSignedPreKeyPair = $ctx.sent;
                                $ctx.state = 20;
                                break;
                            case 20:
                                $ctx.state = message.preKeyId ? 21 : 24;
                                break;
                            case 21:
                                $ctx.state = 22;
                                return store.getLocalPreKeyPair(message.preKeyId);
                            case 22:
                                preKeyPair = $ctx.sent;
                                $ctx.state = 24;
                                break;
                            case 24:
                                $__25 = preKeyWhisperMessage.version;
                                $__26 = $__25.current;
                                $__27 = message.baseKey;
                                $__28 = message.identityKey;
                                $__29 = store.getLocalIdentityKeyPair;
                                $__30 = $__29.call(store);
                                $ctx.state = 31;
                                break;
                            case 31:
                                $ctx.state = 27;
                                return $__30;
                            case 27:
                                $__31 = $ctx.sent;
                                $ctx.state = 29;
                                break;
                            case 29:
                                $__32 = {
                                    sessionVersion: $__26,
                                    theirBaseKey: $__27,
                                    theirIdentityKey: $__28,
                                    ourIdentityKeyPair: $__31,
                                    ourSignedPreKeyPair: ourSignedPreKeyPair,
                                    ourRatchetKeyPair: ourSignedPreKeyPair,
                                    ourOneTimePreKeyPair: preKeyPair
                                };
                                bobParameters = $__32;
                                $ctx.state = 33;
                                break;
                            case 33:
                                $ctx.state = 35;
                                return initializeBobSession(bobParameters);
                            case 35:
                                sessionState = $ctx.sent;
                                $ctx.state = 37;
                                break;
                            case 37:
                                sessionState.theirBaseKey = message.baseKey;
                                $ctx.state = 67;
                                break;
                            case 67:
                                $__33 = getSessionStateListForIdentity(fromIdentity);
                                $ctx.state = 43;
                                break;
                            case 43:
                                $ctx.state = 39;
                                return $__33;
                            case 39:
                                $__34 = $ctx.sent;
                                $ctx.state = 41;
                                break;
                            case 41:
                                $__35 = $__34.sessionStateList;
                                sessionStateList = $__35;
                                $ctx.state = 45;
                                break;
                            case 45:
                                sessionStateList.addSessionState(sessionState);
                                $ctx.state = 69;
                                break;
                            case 69:
                                $ctx.state = 47;
                                return sessionStateList.save();
                            case 47:
                                $ctx.maybeThrow();
                                $ctx.state = 49;
                                break;
                            case 49:
                                $ctx.state = 51;
                                return store.putRemoteIdentity(fromIdentity, message.identityKey);
                            case 51:
                                $ctx.maybeThrow();
                                $ctx.state = 53;
                                break;
                            case 53:
                                $__36 = self.getSessionForIdentity;
                                $__37 = $__36.call(self, fromIdentity);
                                $ctx.state = 59;
                                break;
                            case 59:
                                $ctx.state = 55;
                                return $__37;
                            case 55:
                                $__38 = $ctx.sent;
                                $ctx.state = 57;
                                break;
                            case 57:
                                $ctx.returnValue = $__38;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__24, this);
                }));
                self.hasSessionForIdentity = function (identity) {
                    return store.hasSession(identity);
                };
                var getSessionStateListForIdentity = co.wrap($traceurRuntime.initGeneratorFunction(function $__39(identity) {
                        var serialisedSessionStateList, sessionStateList;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = !sessionCache[identity] ? 1 : 6;
                                    break;
                                case 1:
                                    $ctx.state = 2;
                                    return store.getSession(identity);
                                case 2:
                                    serialisedSessionStateList = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    sessionStateList = new SessionStateList(function (serialisedState) {
                                        return store.putSession(identity, serialisedState);
                                    }, serialisedSessionStateList);
                                    sessionCache[identity] = {
                                        sessionStateList: sessionStateList,
                                        session: new Session(crypto, sessionStateList)
                                    };
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.returnValue = sessionCache[identity];
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__39, this);
                    }));
                self.getSessionForIdentity = co.wrap($traceurRuntime.initGeneratorFunction(function $__40(identity) {
                    var cachedSession;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return getSessionStateListForIdentity(identity);
                            case 2:
                                cachedSession = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.returnValue = cachedSession.session;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__40, this);
                }));
                var initializeAliceSession = co.wrap($traceurRuntime.initGeneratorFunction(function $__41(parameters) {
                        var sendingRatchetKeyPair, agreements, $__11, theirRootKey, receivingChain, $__12, rootKey, sendingChain, sessionState, $__42, $__43, $__44, $__45, $__46, $__47, $__48, $__49, $__50, $__51, $__52, $__53, $__54, $__55;
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
                                    $ctx.state = 30;
                                    break;
                                case 30:
                                    $__42 = ratchet.deriveInitialRootKeyAndChain;
                                    $__43 = parameters.sessionVersion;
                                    $ctx.state = 14;
                                    break;
                                case 14:
                                    $ctx.state = 6;
                                    return agreements;
                                case 6:
                                    $__44 = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $__45 = $__42.call(ratchet, $__43, $__44);
                                    $ctx.state = 16;
                                    break;
                                case 16:
                                    $ctx.state = 10;
                                    return $__45;
                                case 10:
                                    $__46 = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $__11 = $__46;
                                    $__47 = $__11.rootKey;
                                    theirRootKey = $__47;
                                    $__48 = $__11.chain;
                                    receivingChain = $__48;
                                    $ctx.state = 18;
                                    break;
                                case 18:
                                    $__49 = ratchet.deriveNextRootKeyAndChain;
                                    $__50 = parameters.theirRatchetKey;
                                    $__51 = sendingRatchetKeyPair.private;
                                    $__52 = $__49.call(ratchet, theirRootKey, $__50, $__51);
                                    $ctx.state = 24;
                                    break;
                                case 24:
                                    $ctx.state = 20;
                                    return $__52;
                                case 20:
                                    $__53 = $ctx.sent;
                                    $ctx.state = 22;
                                    break;
                                case 22:
                                    $__12 = $__53;
                                    $__54 = $__12.rootKey;
                                    rootKey = $__54;
                                    $__55 = $__12.chain;
                                    sendingChain = $__55;
                                    $ctx.state = 26;
                                    break;
                                case 26:
                                    sessionState = new SessionState({
                                        sessionVersion: parameters.sessionVersion,
                                        remoteIdentityKey: parameters.theirIdentityKey,
                                        localIdentityKey: parameters.ourIdentityKeyPair.public,
                                        rootKey: rootKey,
                                        sendingChain: sendingChain,
                                        senderRatchetKeyPair: sendingRatchetKeyPair
                                    });
                                    sessionState.addReceivingChain(parameters.theirRatchetKey, receivingChain);
                                    $ctx.state = 32;
                                    break;
                                case 32:
                                    $ctx.returnValue = sessionState;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__41, this);
                    }));
                var initializeBobSession = co.wrap($traceurRuntime.initGeneratorFunction(function $__56(parameters) {
                        var agreements, $__11, rootKey, sendingChain, $__57, $__58, $__59, $__60, $__61, $__62, $__63;
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
                                    $ctx.state = 18;
                                    break;
                                case 18:
                                    $__57 = ratchet.deriveInitialRootKeyAndChain;
                                    $__58 = parameters.sessionVersion;
                                    $ctx.state = 10;
                                    break;
                                case 10:
                                    $ctx.state = 2;
                                    return agreements;
                                case 2:
                                    $__59 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $__60 = $__57.call(ratchet, $__58, $__59);
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $ctx.state = 6;
                                    return $__60;
                                case 6:
                                    $__61 = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    $__11 = $__61;
                                    $__62 = $__11.rootKey;
                                    rootKey = $__62;
                                    $__63 = $__11.chain;
                                    sendingChain = $__63;
                                    $ctx.state = 14;
                                    break;
                                case 14:
                                    $ctx.returnValue = new SessionState({
                                        sessionVersion: parameters.sessionVersion,
                                        remoteIdentityKey: parameters.theirIdentityKey,
                                        localIdentityKey: parameters.ourIdentityKeyPair.public,
                                        rootKey: rootKey,
                                        sendingChain: sendingChain,
                                        senderRatchetKeyPair: parameters.ourRatchetKeyPair
                                    });
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__56, this);
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
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(10), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var makeReadonly = function (obj, key) {
                Object.defineProperty(obj, key, { writable: false });
            };
            var SessionState = function SessionState(parameters) {
                Object.assign(this, {
                    sessionVersion: 3,
                    remoteIdentityKey: null,
                    localIdentityKey: null,
                    pendingPreKey: null,
                    localRegistrationId: 0,
                    theirBaseKey: null,
                    rootKey: null,
                    sendingChain: null,
                    senderRatchetKeyPair: null,
                    receivingChains: [],
                    previousCounter: 0
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
            var __moduleName = 'build/src\\SessionStateList';
            var $__build_47_ProtocolConstants__, $__build_47_ArrayBufferUtils__;
            var ProtocolConstants = ($__build_47_ProtocolConstants__ = _require(10), $__build_47_ProtocolConstants__ && $__build_47_ProtocolConstants__.__esModule && $__build_47_ProtocolConstants__ || { default: $__build_47_ProtocolConstants__ }).default;
            var ArrayBufferUtils = ($__build_47_ArrayBufferUtils__ = _require(1), $__build_47_ArrayBufferUtils__ && $__build_47_ArrayBufferUtils__.__esModule && $__build_47_ArrayBufferUtils__ || { default: $__build_47_ArrayBufferUtils__ }).default;
            function SessionStateList(sessionPersistor, serialisedState) {
                var self = this;
                var sessions = [];
                if (serialisedState) {
                    sessions = JSON.parse(serialisedState, function (key, value) {
                        if (typeof value === 'string' && value.substring(0, 5) === '{{ab:') {
                            return ArrayBufferUtils.parse(value.substring(5, value.length - 2));
                        }
                        return value;
                    });
                }
                Object.defineProperty(self, 'sessions', {
                    get: function () {
                        return sessions;
                    }
                });
                self.mostRecentSession = function () {
                    return sessions[0];
                };
                self.addSessionState = function (sessionState) {
                    sessions.unshift(sessionState);
                    if (sessions.length > ProtocolConstants.maximumSessionsPerIdentity) {
                        sessions.pop();
                    }
                };
                self.removeSessionState = function (sessionState) {
                    var index = sessions.indexOf(sessionState);
                    sessions.splice(index, 1);
                };
                self.save = function () {
                    return sessionPersistor(JSON.stringify(sessions, function (key, value) {
                        if (value instanceof ArrayBuffer) {
                            return '{{ab:' + ArrayBufferUtils.stringify(value) + '}}';
                        }
                        return value;
                    }));
                };
                Object.freeze(this);
            }
            var $__default = SessionStateList;
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
            var __moduleName = 'build/src\\Store';
            var $__build_47_PromiseInterfaceDecorator__;
            var PromiseInterfaceDecorator = ($__build_47_PromiseInterfaceDecorator__ = _require(9), $__build_47_PromiseInterfaceDecorator__ && $__build_47_PromiseInterfaceDecorator__.__esModule && $__build_47_PromiseInterfaceDecorator__ || { default: $__build_47_PromiseInterfaceDecorator__ }).default;
            var methodNames = [
                    'getLocalIdentityKeyPair',
                    'getLocalRegistrationId',
                    'getLocalSignedPreKeyPair',
                    'getLocalPreKeyPair',
                    'getRemotePreKeyBundle',
                    'isRemoteIdentityTrusted',
                    'putRemoteIdentity',
                    'hasSession',
                    'getSession',
                    'putSession'
                ];
            var Store = function Store(store) {
                $traceurRuntime.superConstructor($Store).call(this, store, methodNames);
            };
            var $Store = Store;
            $traceurRuntime.createClass(Store, {}, {}, PromiseInterfaceDecorator);
            var $__default = Store;
        },
        function (module, exports) {
            'use strict';
            var __moduleName = 'build/src\\WhisperProtos';
            module.exports = _require(20).newBuilder({})['import']({
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