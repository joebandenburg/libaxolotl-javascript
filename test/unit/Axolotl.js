import chai from "chai";
import sinon from "sinon";
import co from "co";

import Axolotl from "../../src/Axolotl";
import SessionFactory from "../../src/SessionFactory";

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
        describe("createSessionFactory", () => {
            it("returns a session factory", () => {
                var result = axolotl.createSessionFactory({});
                assert.instanceOf(result, SessionFactory);
            });
        });
    });
});
