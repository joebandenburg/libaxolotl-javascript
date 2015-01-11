import chai from "chai";
import chaiAsPromise from "chai-as-promised";
import SessionFactory from "../../src/SessionFactory";
import Session from "../../src/Session";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import Messages from "../../src/Messages";
import ProtocolConstants from "../../src/ProtocolConstants";
import crypto from "./FakeCrypto";
import {
    InvalidMessageException,
    DuplicateMessageException,
    InvalidKeyException,
    ConcurrentUseException,
    UnsupportedProtocolVersionException
} from "../../src/Exceptions";
import co from "co";

chai.use(chaiAsPromise);
var assert = chai.assert;

describe("SessionFactory", () => {
    describe("createSessionFromPreKeyBundle", () => {
        var aliceIdentityKeyPair;
        var bobIdentityKeyPair;
        var bobSignedPreKeyPair;
        var bobOneTimePreKeyPair;

        var aliceFactory = new SessionFactory(crypto, {
            getIdentityKeyPair: () => aliceIdentityKeyPair,
            getLocalRegistrationId: () => 666
        });
        var bobFactory = new SessionFactory(crypto, {
            getIdentityKeyPair: () => bobIdentityKeyPair,
            getLocalRegistrationId: () => 667,
            getSignedPreKeyPair: (id) => {
                assert.equal(id, 5);
                return bobSignedPreKeyPair;
            },
            getPreKeyPair: (id) => {
                assert.equal(id, 31337);
                return bobOneTimePreKeyPair;
            }
        });

        var aliceSession;

        var recipientId = 1;
        var deviceId = 2;

        var plaintext1Sent = new Uint8Array([1, 2, 3]).buffer;
        var plaintext2Sent = new Uint8Array([6, 7, 8]).buffer;

        var bobPreKeyBundle;

        beforeEach(co.wrap(function*() {
            crypto.validSiganture = true;

            aliceIdentityKeyPair = yield crypto.generateKeyPair();
            bobIdentityKeyPair = yield crypto.generateKeyPair();
            bobSignedPreKeyPair = yield crypto.generateKeyPair();
            bobOneTimePreKeyPair = yield crypto.generateKeyPair();
            var signature = yield crypto.sign(bobIdentityKeyPair.private, bobSignedPreKeyPair.public);

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
            aliceSession = yield aliceFactory.createSessionFromPreKeyBundle(recipientId, deviceId, bobPreKeyBundle);
        }));

        // Use smaller protocol parameters to keep the tests fast
        var maximumMissedMessages;
        beforeEach(function() {
            maximumMissedMessages = ProtocolConstants.maximumMissedMessages;
            ProtocolConstants.maximumMissedMessages = 20;
        });
        afterEach(function() {
            ProtocolConstants.maximumMissedMessages = maximumMissedMessages;
        });

        it("accepts multiple messages sent by one party", co.wrap(function*() {
            var preKeyMessage = yield aliceSession.encryptMessage(plaintext1Sent);
            var ciphertext2 = yield aliceSession.encryptMessage(plaintext2Sent);

            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId,
                preKeyMessage);
            var plaintext1Received = yield bobSession.decryptPreKeyMessage(preKeyMessage);
            assert.ok(ArrayBufferUtils.areEqual(plaintext1Sent, plaintext1Received));

            var plaintext2Received = yield bobSession.decryptPreKeyMessage(ciphertext2);
            assert.ok(ArrayBufferUtils.areEqual(plaintext2Sent, plaintext2Received));
        }));
        it("accepts out of order message delivery (sub ratchet)", co.wrap(function*() {
            var ciphertext1 = yield aliceSession.encryptMessage(plaintext1Sent);
            var ciphertext2 = yield aliceSession.encryptMessage(plaintext2Sent);

            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext2);
            var plaintext1Received = yield bobSession.decryptPreKeyMessage(ciphertext2);
            assert.ok(ArrayBufferUtils.areEqual(plaintext2Sent, plaintext1Received));

            var plaintext2Received = yield bobSession.decryptPreKeyMessage(ciphertext1);
            assert.ok(ArrayBufferUtils.areEqual(plaintext1Sent, plaintext2Received));
        }));
        it("rejects messages that come after too many dropped messages", co.wrap(function*() {
            var ciphertext = yield aliceSession.encryptMessage(plaintext1Sent);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            yield bobSession.decryptPreKeyMessage(ciphertext);
            ciphertext = yield bobSession.encryptMessage(plaintext2Sent);
            yield aliceSession.decryptMessage(ciphertext);

            for (var i = 0; i < ProtocolConstants.maximumMissedMessages + 1; i++) {
                yield aliceSession.encryptMessage(new Uint8Array([1, 2, 3, 4, i]).buffer);
            }

            var lastCiphertext = yield aliceSession.encryptMessage(new Uint8Array([1, 2, 3, 4, 5, 6]).buffer);
            yield assert.isRejected(bobSession.decryptMessage(lastCiphertext), InvalidMessageException);
        }));
        it("rejects duplicate message delivery", co.wrap(function*() {
            var ciphertext1 = yield aliceSession.encryptMessage(plaintext1Sent);

            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext1);
            yield bobSession.decryptPreKeyMessage(ciphertext1);

            yield assert.isRejected(bobSession.decryptPreKeyMessage(ciphertext1), DuplicateMessageException);
        }));
        it("rejects message with bad mac", co.wrap(function*() {
            var ciphertext1 = yield aliceSession.encryptMessage(plaintext1Sent);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext1);
            // Corrupt the mac
            new Uint8Array(ciphertext1)[ciphertext1.byteLength - 1]++;
            yield assert.isRejected(bobSession.decryptPreKeyMessage(ciphertext1), InvalidMessageException);
        }));
        it("rejects bad signedPreKey signature", co.wrap(function*() {
            crypto.validSiganture = false;
            yield assert.isRejected(aliceFactory.createSessionFromPreKeyBundle(recipientId, deviceId, bobPreKeyBundle),
                InvalidKeyException);
        }));
        it("rejects preKeyBundle if neither preKey nor signedPreKey are present", co.wrap(function*() {
            delete bobPreKeyBundle.signedPreKey;
            yield assert.isRejected(aliceFactory.createSessionFromPreKeyBundle(recipientId, deviceId, bobPreKeyBundle),
                InvalidKeyException);
        }));
        it("accepts a complicated message exchange", co.wrap(function*() {
            var ciphertext = yield aliceSession.encryptMessage(plaintext1Sent);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            yield bobSession.decryptPreKeyMessage(ciphertext);
            ciphertext = yield bobSession.encryptMessage(plaintext2Sent);
            yield aliceSession.decryptMessage(ciphertext);

            var i;
            var plaintextSent;
            for (i = 0; i < 10; i++) {
                plaintextSent = new Uint8Array([1, 2, 3, 4, i]).buffer;
                ciphertext = yield aliceSession.encryptMessage(plaintextSent);
                assert.ok(ArrayBufferUtils.areEqual(plaintextSent, yield bobSession.decryptMessage(ciphertext)));
            }

            for (i = 0; i < 10; i++) {
                plaintextSent = new Uint8Array([1, 2, 3, 4, 5, i]).buffer;
                ciphertext = yield bobSession.encryptMessage(plaintextSent);
                assert.ok(ArrayBufferUtils.areEqual(plaintextSent, yield aliceSession.decryptMessage(ciphertext)));
            }

            var aliceOutOfOrderMessages = [];
            for (i = 0; i < 10; i++) {
                plaintextSent = new Uint8Array([1, 2, 3, 4, 5, 6, i]).buffer;
                aliceOutOfOrderMessages.push({
                    plaintextSent: plaintextSent,
                    ciphertext: yield aliceSession.encryptMessage(plaintextSent)
                });
            }

            for (i = 0; i < 10; i++) {
                plaintextSent = new Uint8Array([1, 2, 3, 4, 5, 6, 7, i]).buffer;
                ciphertext = yield aliceSession.encryptMessage(plaintextSent);
                assert.ok(ArrayBufferUtils.areEqual(plaintextSent, yield bobSession.decryptMessage(ciphertext)));
            }

            for (i = 0; i < 10; i++) {
                plaintextSent = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, i]).buffer;
                ciphertext = yield bobSession.encryptMessage(plaintextSent);
                assert.ok(ArrayBufferUtils.areEqual(plaintextSent, yield aliceSession.decryptMessage(ciphertext)));
            }

            for (i = 0; i < 10; i++) {
                var aliceMessage = aliceOutOfOrderMessages[i];
                assert.ok(ArrayBufferUtils.areEqual(aliceMessage.plaintextSent,
                    yield bobSession.decryptMessage(aliceMessage.ciphertext)));
            }
        }));
        it("accepts optional oneTimePreKey", co.wrap(function*() {
            bobPreKeyBundle.preKey = bobOneTimePreKeyPair.public;
            bobPreKeyBundle.preKeyId = 31337;
            aliceSession = yield aliceFactory.createSessionFromPreKeyBundle(recipientId, deviceId, bobPreKeyBundle);

            var preKeyMessage = yield aliceSession.encryptMessage(plaintext1Sent);

            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId,
                preKeyMessage);
            var plaintext1Received = yield bobSession.decryptPreKeyMessage(preKeyMessage);
            assert.ok(ArrayBufferUtils.areEqual(plaintext1Sent, plaintext1Received));
        }));
        it("rejects concurrent encryptMessage", co.wrap(function*() {
            var plaintext = new Uint8Array([1, 2, 3]).buffer;
            aliceSession.encryptMessage(plaintext);
            yield assert.isRejected(aliceSession.encryptMessage(plaintext), ConcurrentUseException);
        }));
        it("rejects concurrent decryptPreKeyMessage", co.wrap(function*() {
            var plaintext = new Uint8Array([1, 2, 3]).buffer;
            var ciphertext = yield aliceSession.encryptMessage(plaintext);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            bobSession.decryptPreKeyMessage(ciphertext);
            yield assert.isRejected(bobSession.decryptPreKeyMessage(ciphertext), ConcurrentUseException);
        }));
        it("rejects concurrent decryptMessage", co.wrap(function*() {
            var plaintext = new Uint8Array([1, 2, 3]).buffer;
            var ciphertext = yield aliceSession.encryptMessage(plaintext);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            var ciphertext2 = bobSession.encryptMessage(plaintext);
            aliceSession.decryptMessage(ciphertext2);
            yield assert.isRejected(aliceSession.decryptMessage(ciphertext2), ConcurrentUseException);
        }));
        it("rejects version 2 of PreKeyWhisperMessage", co.wrap(function*() {
            var message = Messages.encodePreKeyWhisperMessage({
                version: {
                    current: 2,
                    max: 3
                },
                message: {}
            });
            yield assert.isRejected(aliceFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, message),
                UnsupportedProtocolVersionException);
        }));
        it("accepts out of order message delivery (main ratchet)", co.wrap(function*() {
            var ciphertext = yield aliceSession.encryptMessage(plaintext1Sent);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            yield bobSession.decryptPreKeyMessage(ciphertext);
            ciphertext = yield bobSession.encryptMessage(plaintext2Sent);
            yield aliceSession.decryptMessage(ciphertext);

            var oldCiphertext = yield aliceSession.encryptMessage(plaintext1Sent);

            for (var i = 0; i < ProtocolConstants.maximumRetainedReceivedChainKeys; i++) {
                ciphertext = yield aliceSession.encryptMessage(new Uint8Array([1, 2, 3, 4, i]).buffer);
                yield bobSession.decryptMessage(ciphertext);
                ciphertext = yield bobSession.encryptMessage(new Uint8Array([1, 2, 3, 4, i]).buffer);
                yield aliceSession.decryptMessage(ciphertext);
            }

            assert.ok(ArrayBufferUtils.areEqual(plaintext1Sent, yield bobSession.decryptMessage(oldCiphertext)));
        }));
        it("rejects messages that are too far out of order (main ratchet)", co.wrap(function*() {
            var ciphertext = yield aliceSession.encryptMessage(plaintext1Sent);
            var bobSession = yield bobFactory.createSessionFromPreKeyWhisperMessage(recipientId, deviceId, ciphertext);
            yield bobSession.decryptPreKeyMessage(ciphertext);
            ciphertext = yield bobSession.encryptMessage(plaintext2Sent);
            yield aliceSession.decryptMessage(ciphertext);

            var oldCiphertext = yield aliceSession.encryptMessage(plaintext1Sent);

            for (var i = 0; i < ProtocolConstants.maximumRetainedReceivedChainKeys + 1; i++) {
                ciphertext = yield aliceSession.encryptMessage(new Uint8Array([1, 2, 3, 4, i]).buffer);
                yield bobSession.decryptMessage(ciphertext);
                ciphertext = yield bobSession.encryptMessage(new Uint8Array([1, 2, 3, 4, i]).buffer);
                yield aliceSession.decryptMessage(ciphertext);
            }

            yield assert.isRejected(bobSession.decryptMessage(oldCiphertext), InvalidMessageException);
        }));
    });
});
