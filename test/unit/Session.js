import chai from "chai";
import Session from "../../src/Session";
import crypto from "./FakeCrypto";
import co from "co";

var assert = chai.assert;

describe("Session", () => {
    describe("encryptMessage", () => {
        it("WhisperMessage", co.wrap(function*() {
            var state = {
                sessionVersion: 3,
                sendingChain: {
                    key: new ArrayBuffer(32),
                    index: 0
                },
                senderRatchetKeyPair: {
                    public: new ArrayBuffer(32),
                    private: new ArrayBuffer(32)
                },
                previousCounter: 0,
                localIdentityKey: new ArrayBuffer(32),
                remoteIdentityKey: new ArrayBuffer(32)
            };
            var session = new Session(crypto, state);
            var message = yield session.encryptMessage(new Uint8Array([1, 2, 3]).buffer);
            //console.log(message);
            //assert.equal(message, new Uint8Array([51, 10, 32]).buffer);
            assert.equal(state.sendingChain.index, 1);
        }));
        it("PreKeyWhisperMessage", co.wrap(function*() {
            var state = {
                sessionVersion: 3,
                sendingChain: {
                    key: new ArrayBuffer(32),
                    index: 0
                },
                senderRatchetKeyPair: {
                    public: new ArrayBuffer(32),
                    private: new ArrayBuffer(32)
                },
                senderCounter: 0,
                previousCounter: 0,
                localIdentityKey: new ArrayBuffer(32),
                remoteIdentityKey: new ArrayBuffer(32),
                pendingPreKey: {
                    preKeyId: 1,
                    signedPreKeyId: 1,
                    baseKey: new ArrayBuffer(32)
                },
                localRegistrationId: 10
            };
            var session = new Session(crypto, state);
            var message = yield session.encryptMessage(new Uint8Array([1, 2, 3]).buffer);
            //console.log(message);
            //assert.equal(message, new Uint8Array([51, 10, 32]).buffer);
            assert.equal(state.sendingChain.index, 1);
        }));
    });
});
