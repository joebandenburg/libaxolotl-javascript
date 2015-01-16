import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import co from "co";

import Axolotl from "../../src/Axolotl";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import ProtocolConstants from "../../src/ProtocolConstants";
import SessionStateList from "../../src/SessionStateList";
import Messages from "../../src/Messages";
import {
    UnsupportedProtocolVersionException,
    ConcurrentUseException,
    InvalidKeyException,
    InvalidMessageException,
    DuplicateMessageException
} from "../../src/Exceptions";
import crypto from "./FakeCrypto";

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("Axolotl", () => {
    it("is frozen", () => {
        var axolotl = new Axolotl();
        assert.throws(() => {
            axolotl.foo = 3;
        });
    });
    describe("methods", () => {
        var axolotl;
        var crypto;
        var keyPair = {
            public: 10,
            private: 5
        };
        beforeEach(() => {
            crypto = {
                generateKeyPair: sinon.stub().returns(Promise.resolve(keyPair)),
                randomBytes: sinon.stub().returns(new Uint32Array([20]).buffer),
                sign: sinon.stub().returns(Promise.resolve(42))
            };
            axolotl = new Axolotl(crypto);
        });
        describe("generateIdentityKeyPair", () => {
            it("returns value from generateKeyPair", co.wrap(function*() {
                assert.equal(keyPair, yield axolotl.generateIdentityKeyPair());
            }));
            it("calls generateKeyPair once", () => {
                axolotl.generateIdentityKeyPair();
                assert.ok(crypto.generateKeyPair.calledOnce);
            });
        });
        describe("generateRegistrationId", () => {
            it("calls randomInt once", () => {
                axolotl.generateRegistrationId(false);
                assert.ok(crypto.randomBytes.calledOnce);
            });
            it("returns non-extended registration ids in the range [1, 16380]", () => {
                crypto.randomBytes.returns(new Uint32Array([20]).buffer);
                assert.equal(21, axolotl.generateRegistrationId(false));
                crypto.randomBytes.returns(new Uint32Array([0x3ffb]).buffer);
                assert.equal(0x3ffc, axolotl.generateRegistrationId(false));
                crypto.randomBytes.returns(new Uint32Array([0x3ffc]).buffer);
                assert.equal(1, axolotl.generateRegistrationId(false));
            });
            it("returns extended registration ids in the range [1, MAX_INT]", () => {
                crypto.randomBytes.returns(new Uint32Array([20]).buffer);
                assert.equal(21, axolotl.generateRegistrationId(true));
                crypto.randomBytes.returns(new Uint32Array([0x3ffc]).buffer);
                assert.equal(0x3ffd, axolotl.generateRegistrationId(true));
                crypto.randomBytes.returns(new Uint32Array([0x7ffffffd]).buffer);
                assert.equal(0x7ffffffe, axolotl.generateRegistrationId(true));
                crypto.randomBytes.returns(new Uint32Array([0x7ffffffe]).buffer);
                assert.equal(1, axolotl.generateRegistrationId(true));
            });
        });
        describe("generatePreKeys", () => {
            it("returns a list of pre keys of length count", co.wrap(function*() {
                var result = yield axolotl.generatePreKeys(0, 12);
                assert.equal(12, result.length);
            }));
            it("calls generateKeyPair count times", co.wrap(function*() {
                yield axolotl.generatePreKeys(0, 11);
                assert.equal(11, crypto.generateKeyPair.callCount);
            }));
            it("returns generateKeyPair output", co.wrap(function*() {
                var result = yield axolotl.generatePreKeys(0, 11);
                assert.equal(keyPair, result[0].keyPair);
            }));
            it("returns records with ascending ids start from start", co.wrap(function*() {
                var result = yield axolotl.generatePreKeys(80, 4);
                assert.equal(80, result[0].id);
                assert.equal(81, result[1].id);
                assert.equal(82, result[2].id);
                assert.equal(83, result[3].id);
            }));
            it("wraps ids when they reach 2^24-2", co.wrap(function*() {
                var result = yield axolotl.generatePreKeys(0xfffffd, 4);
                assert.equal(0xfffffd, result[0].id);
                assert.equal(0xfffffe, result[1].id);
                assert.equal(1, result[2].id);
                assert.equal(2, result[3].id);
            }));
        });
        describe("generateLastResortPreKey", () => {
            it("returns a single pre key", co.wrap(function*() {
                var result = yield axolotl.generateLastResortPreKey();
                assert.equal(0xffffff, result.id);
                assert.equal(keyPair, result.keyPair);
            }));
            it("calls generateKeyPair once", co.wrap(function*() {
                yield axolotl.generateLastResortPreKey();
                assert.ok(crypto.generateKeyPair.calledOnce);
            }));
        });
        describe("generateSignedPreKey", () => {
            var identityKeyPair = {
                public: 100,
                private: 101
            };
            it("returns a single pre key", co.wrap(function*() {
                var result = yield axolotl.generateSignedPreKey(identityKeyPair, 88);
                assert.equal(88, result.id);
                assert.equal(keyPair, result.keyPair);
                assert.equal(42, result.signature);
            }));
            it("calls generateKeyPair once", co.wrap(function*() {
                yield axolotl.generateSignedPreKey(identityKeyPair, 88);
                assert.ok(crypto.generateKeyPair.calledOnce);
            }));
            it("calls sign once", co.wrap(function*() {
                yield axolotl.generateSignedPreKey(identityKeyPair, 88);
                assert.ok(crypto.sign.calledOnce);
            }));
            it("calls sign with correct arguments", co.wrap(function*() {
                yield axolotl.generateSignedPreKey(identityKeyPair, 88);
                assert.ok([101, 10], crypto.sign.firstCall.args);
            }));
        });
    });
    describe("communication", () => {
        var aliceIdentity = "alice";
        var bobIdentity = "bob";

        var aliceIdentityKeyPair;
        var aliceSignedPreKeyPair;
        var bobIdentityKeyPair;
        var bobSignedPreKeyPair;
        var bobOneTimePreKeyPair;

        var alicePreKeyBundle;
        var bobPreKeyBundle;

        var aliceSessions;
        var bobSessions;

        var aliceStore;

        var aliceAxolotl;
        var bobAxolotl;

        var createEncryptedMessage = co.wrap(function*(sendingAxolotl, receivingIdentity) {
            var plaintext = crypto.randomBytes(10);
            return {
                plaintext: plaintext,
                ciphertext: yield sendingAxolotl.encryptMessage(receivingIdentity, plaintext)
            };
        });

        var decryptMessage = co.wrap(function*(receivingAxolotl, sendingIdentity, message) {
            if (message.ciphertext.type === Axolotl.PreKeyWhisperMessage) {
                return yield receivingAxolotl.decryptPreKeyWhisperMessage(sendingIdentity, message.ciphertext.body);
            } else {
                return yield receivingAxolotl.decryptWhisperMessage(sendingIdentity, message.ciphertext.body);
            }
        });

        var assertMessageIsDecryptedCorrectly = co.wrap(function*(receivingAxolotl, sendingIdentity, message) {
            var actualPlaintext = yield decryptMessage(receivingAxolotl, sendingIdentity, message);
            assert.ok(ArrayBufferUtils.areEqual(message.plaintext, actualPlaintext));
        });

        var assertSessionsCanCommunicateOneWay = co.wrap(function*(sendingAxolotl, receivingAxolotl, sendingIdentity,
                                                                   receivingIdentity) {
            var message = yield createEncryptedMessage(sendingAxolotl, receivingIdentity);
            yield assertMessageIsDecryptedCorrectly(receivingAxolotl, sendingIdentity, message);
        });

        var assertAliceCanSendMessageToBob = co.wrap(function*() {
            yield assertSessionsCanCommunicateOneWay(aliceAxolotl, bobAxolotl, aliceIdentity, bobIdentity);
        });

        var assertBobCanSendMessageToAlice = co.wrap(function*() {
            yield assertSessionsCanCommunicateOneWay(bobAxolotl, aliceAxolotl, bobIdentity, aliceIdentity);
        });

        var assertSessionsCanCommunicateTwoWay = co.wrap(function*() {
            yield assertAliceCanSendMessageToBob();
            yield assertBobCanSendMessageToAlice();
        });

        beforeEach(co.wrap(function*() {
            crypto.validSiganture = true;

            aliceSessions = {};
            bobSessions = {};

            aliceStore = {
                getIdentityKeyPair: () => aliceIdentityKeyPair,
                getLocalRegistrationId: () => 666,
                getPreKeyBundle: (identity) => {
                    assert.equal(identity, bobIdentity);
                    return Promise.resolve(bobPreKeyBundle);
                },
                getSignedPreKeyPair: (id) => {
                    assert.equal(id, 6);
                    return aliceSignedPreKeyPair;
                },
                hasSession: (identity) => {
                    return !!aliceSessions[identity];
                },
                getSession: (identity) => {
                    return aliceSessions[identity];
                },
                putSession: (identity, session) => {
                    aliceSessions[identity] = session;
                }
            };

            aliceAxolotl = new Axolotl(crypto, aliceStore);
            bobAxolotl = new Axolotl(crypto, {
                getIdentityKeyPair: () => bobIdentityKeyPair,
                getLocalRegistrationId: () => 667,
                getPreKeyBundle: (identity) => {
                    assert.equal(identity, aliceIdentity);
                    return Promise.resolve(alicePreKeyBundle);
                },
                getSignedPreKeyPair: (id) => {
                    assert.equal(id, 5);
                    return bobSignedPreKeyPair;
                },
                getPreKeyPair: (id) => {
                    assert.equal(id, 31337);
                    return bobOneTimePreKeyPair;
                },
                hasSession: (identity) => {
                    return !!bobSessions[identity];
                },
                getSession: (identity) => {
                    return bobSessions[identity];
                },
                putSession: (identity, session) => {
                    bobSessions[identity] = session;
                }
            });

            aliceIdentityKeyPair = yield crypto.generateKeyPair();
            aliceSignedPreKeyPair = yield crypto.generateKeyPair();
            bobIdentityKeyPair = yield crypto.generateKeyPair();
            bobSignedPreKeyPair = yield crypto.generateKeyPair();
            bobOneTimePreKeyPair = yield crypto.generateKeyPair();
            var signature = yield crypto.sign(bobIdentityKeyPair.private, bobSignedPreKeyPair.public);

            alicePreKeyBundle = {
                registrationId: 666,
                deviceId: 4,
                preKey: null,
                preKeyId: null,
                signedPreKey: aliceSignedPreKeyPair.public,
                signedPreKeyId: 6,
                signedPreKeySignature: null,
                identityKey: aliceIdentityKeyPair.public
            };

            bobPreKeyBundle = {
                registrationId: 3,
                deviceId: 4,
                preKey: null,
                preKeyId: null,
                signedPreKey: bobSignedPreKeyPair.public,
                signedPreKeyId: 5,
                signedPreKeySignature: signature,
                identityKey: bobIdentityKeyPair.public
            };
        }));

        // Use smaller protocol parameters to keep the tests fast
        var maximumMissedMessages;
        beforeEach(() => {
            maximumMissedMessages = ProtocolConstants.maximumMissedMessages;
            ProtocolConstants.maximumMissedMessages = 20;
        });
        afterEach(() => {
            ProtocolConstants.maximumMissedMessages = maximumMissedMessages;
        });

        it("accepts a simple exchange", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
        }));
        it("accepts multiple messages sent by one party", co.wrap(function*() {
            yield assertAliceCanSendMessageToBob();
            yield assertAliceCanSendMessageToBob();
        }));
        it("accepts out of order message delivery (sub ratchet)", co.wrap(function*() {
            var ciphertext1 = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
            var ciphertext2 = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

            yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext2);
            yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext1);
        }));
        it("accepts a complicated message exchange", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();

            var i;
            for (i = 0; i < 10; i++) {
                yield assertAliceCanSendMessageToBob();
            }

            for (i = 0; i < 10; i++) {
                yield assertBobCanSendMessageToAlice();
            }

            var aliceOutOfOrderMessages = [];
            for (i = 0; i < 10; i++) {
                aliceOutOfOrderMessages.push(yield createEncryptedMessage(aliceAxolotl, bobIdentity));
            }

            for (i = 0; i < 10; i++) {
                yield assertAliceCanSendMessageToBob();
            }

            for (i = 0; i < 10; i++) {
                yield assertBobCanSendMessageToAlice();
            }

            for (i = 0; i < 10; i++) {
                var ciphertext = aliceOutOfOrderMessages[i];
                yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext);
            }
        }));
        it("rejects messages that come after too many dropped messages", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();

            for (var i = 0; i < ProtocolConstants.maximumMissedMessages + 1; i++) {
                yield createEncryptedMessage(aliceAxolotl, bobIdentity);
            }

            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
            yield assert.isRejected(decryptMessage(bobAxolotl, aliceIdentity, ciphertext), InvalidMessageException);
        }));
        it("rejects duplicate PreKeyWhisperMessage delivery", co.wrap(function*() {
            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

            yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext);
            yield assert.isRejected(decryptMessage(bobAxolotl, aliceIdentity, ciphertext), InvalidMessageException);
        }));
        it("rejects duplicate WhisperMessage delivery", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();

            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

            yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext);
            yield assert.isRejected(decryptMessage(bobAxolotl, aliceIdentity, ciphertext), InvalidMessageException);
        }));
        it("rejects message with bad mac", co.wrap(function*() {
            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
            // Corrupt the mac
            new Uint8Array(ciphertext.ciphertext.body)[ciphertext.ciphertext.body.byteLength - 1]++;
            yield assert.isRejected(decryptMessage(bobAxolotl, aliceIdentity, ciphertext), InvalidMessageException);
        }));
        it("rejects bad signedPreKey signature", co.wrap(function*() {
            crypto.validSiganture = false;
            yield assert.isRejected(createEncryptedMessage(aliceAxolotl, bobIdentity), InvalidKeyException);
        }));
        it("rejects preKeyBundle if neither preKey nor signedPreKey are present", co.wrap(function*() {
            delete bobPreKeyBundle.signedPreKey;
            yield assert.isRejected(createEncryptedMessage(aliceAxolotl, bobIdentity), InvalidKeyException);
        }));
        it("accepts optional oneTimePreKey", co.wrap(function*() {
            bobPreKeyBundle.preKey = bobOneTimePreKeyPair.public;
            bobPreKeyBundle.preKeyId = 31337;
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();
        }));
        it("queues and eventually completes concurrent encryptMessage", co.wrap(function*() {
            createEncryptedMessage(aliceAxolotl, bobIdentity);
            yield assertAliceCanSendMessageToBob();
        }));
        it("queues and eventually completes concurrent decryptPreKeyWhisperMessage", co.wrap(function*() {
            assertAliceCanSendMessageToBob();
            yield assertAliceCanSendMessageToBob();
        }));
        it("queues and eventually completes concurrent decryptWhisperMessage", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();
            assertAliceCanSendMessageToBob();
            yield assertAliceCanSendMessageToBob();
        }));
        it("rejects version 2 of PreKeyWhisperMessage", co.wrap(function*() {
            var message = Messages.encodePreKeyWhisperMessage({
                version: {
                    current: 2,
                    max: 3
                },
                message: {}
            });
            yield assert.isRejected(bobAxolotl.decryptPreKeyWhisperMessage(aliceIdentity, message),
                UnsupportedProtocolVersionException);
        }));
        it("accepts out of order message delivery (main ratchet)", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();

            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

            for (var i = 0; i < ProtocolConstants.maximumRetainedReceivedChainKeys; i++) {
                yield assertSessionsCanCommunicateTwoWay();
            }

            yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext);
        }));
        it("rejects messages that are too far out of order (main ratchet)", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();

            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

            for (var i = 0; i < ProtocolConstants.maximumRetainedReceivedChainKeys + 1; i++) {
                yield assertSessionsCanCommunicateTwoWay();
            }

            yield assert.isRejected(decryptMessage(bobAxolotl, aliceIdentity, ciphertext), InvalidMessageException);
        }));
        it("rejects whisper messages without pre-existing session", co.wrap(function*() {
            yield assertSessionsCanCommunicateTwoWay();
            yield assertSessionsCanCommunicateTwoWay();
            var ciphertext = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
            yield assert.isRejected(decryptMessage(bobAxolotl, "eve", ciphertext), InvalidMessageException);
        }));
        describe("simultaneous session initiation", () => {
            it("handles both parties simultaneously initiating sessions", co.wrap(function*() {
                var ciphertextForBob = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
                var ciphertextForAlice = yield createEncryptedMessage(bobAxolotl, aliceIdentity);

                yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertextForBob);
                yield assertMessageIsDecryptedCorrectly(aliceAxolotl, bobIdentity, ciphertextForAlice);

                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();
            }));
            it("handles a dropped PreKeyWhisperMessage", co.wrap(function*() {
                var ciphertextForBob = yield createEncryptedMessage(aliceAxolotl, bobIdentity);

                // This message is dropped
                yield createEncryptedMessage(bobAxolotl, aliceIdentity);

                yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertextForBob);

                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();
            }));
            it("handles a dropped first WhisperMessage", co.wrap(function*() {
                var ciphertextForBob = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
                var ciphertextForAlice = yield createEncryptedMessage(bobAxolotl, aliceIdentity);

                yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertextForBob);
                yield assertMessageIsDecryptedCorrectly(aliceAxolotl, bobIdentity, ciphertextForAlice);

                // This message is dropped
                yield createEncryptedMessage(aliceAxolotl, bobIdentity);

                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();
            }));
            it("handles a long exchange of session disagreements", co.wrap(function*() {
                // Because the two parties keep exchanging messages in this pattern, they fail to agree on one session
                for (var i = 0; i < 30; i++) {
                    var ciphertextForBob = yield createEncryptedMessage(aliceAxolotl, bobIdentity);
                    var ciphertextForAlice = yield createEncryptedMessage(bobAxolotl, aliceIdentity);

                    yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertextForBob);
                    yield assertMessageIsDecryptedCorrectly(aliceAxolotl, bobIdentity, ciphertextForAlice);
                }

                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();
            }));
        });
        describe("persistence", () => {
            it("loads old sessions from the store", co.wrap(function*() {
                yield assertSessionsCanCommunicateTwoWay();
                yield assertSessionsCanCommunicateTwoWay();

                var aliceAxolotl2 = new Axolotl(crypto, aliceStore);
                var ciphertext = yield createEncryptedMessage(aliceAxolotl2, bobIdentity);

                assert.equal(ciphertext.ciphertext.type, Axolotl.WhisperMessage);
                yield assertMessageIsDecryptedCorrectly(bobAxolotl, aliceIdentity, ciphertext);
            }));
        });
    });
});
