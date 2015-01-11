import chai from "chai";
import crypto from "crypto";
import co from "co";

var assert = chai.assert;

var toBuffer = function(arrayBuffer) {
    var buffer = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
};

var toArrayBuffer = function(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
};

var prime = crypto.createDiffieHellman(256).getPrime();

var fakeCrypto = {
    generateKeyPair: function() {
        return new Promise(function(resolve) {
            var dh = crypto.createDiffieHellman(prime);
            dh.generateKeys();
            resolve({
                public: toArrayBuffer(dh.getPublicKey()),
                private: toArrayBuffer(dh.getPrivateKey())
            });
        });
    },
    calculateAgreement: function(publicKey, privateKey) {
        return new Promise(function(resolve) {
            var dh = crypto.createDiffieHellman(prime);
            dh.setPrivateKey(toBuffer(privateKey));
            resolve(toArrayBuffer(dh.computeSecret(toBuffer(publicKey))));
        });
    },
    randomBytes: function(byteCount) {
        return crypto.randomBytes(byteCount);
    },
    sign: function() {
        return new Promise(function(resolve) {
            resolve(new ArrayBuffer(32));
        });
    },
    validSiganture: true,
    verifySignature: function() {
        return new Promise(function(resolve) {
            resolve(fakeCrypto.validSiganture);
        });
    },
    hmac: function(key, data) {
        return new Promise(function(resolve) {
            var hmac = crypto.createHmac("sha256", toBuffer(key));
            hmac.update(toBuffer(data));
            resolve(toArrayBuffer(hmac.digest()));
        });
    },
    encrypt: function(key, message, iv) {
        return new Promise(function(resolve) {
            var cipher = crypto.createCipheriv("aes-256-cbc", toBuffer(key), toBuffer(iv));
            var buffer1 = cipher.update(toBuffer(message));
            var buffer2 = cipher.final();
            resolve(toArrayBuffer(Buffer.concat([buffer1, buffer2])));
        });
    },
    decrypt: function(key, ciphertext, iv) {
        return new Promise(function(resolve) {
            var cipher = crypto.createDecipheriv("aes-256-cbc", toBuffer(key), toBuffer(iv));
            var buffer1 = cipher.update(toBuffer(ciphertext));
            var buffer2 = cipher.final();
            resolve(toArrayBuffer(Buffer.concat([buffer1, buffer2])));
        });
    }
};

export default fakeCrypto;

describe("FakeCrypto", () => {
    describe("generateKeyPair", () => {
        it("returns key pair", co.wrap(function*() {
            var pair = yield fakeCrypto.generateKeyPair();
            assert.typeOf(pair, "object");
            assert.instanceOf(pair.public, ArrayBuffer);
            assert.instanceOf(pair.private, ArrayBuffer);
        }));
    });
    describe("calculateAgreement", () => {
        it("works", co.wrap(function*() {
            var alicePair = yield fakeCrypto.generateKeyPair();
            var bobPair = yield fakeCrypto.generateKeyPair();
            var aliceSharedSecret = yield fakeCrypto.calculateAgreement(bobPair.public, alicePair.private);
            var bobSharedSecret = yield fakeCrypto.calculateAgreement(alicePair.public, bobPair.private);
            assert.equal(new Uint8Array(aliceSharedSecret)[0], new Uint8Array(bobSharedSecret)[0]);
        }));
    });
});
