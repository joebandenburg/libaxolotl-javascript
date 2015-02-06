var assert = require("assert");
var ByteBuffer = require("ByteBuffer");
var axolotl = require("../../../dist/axolotl");

var fromHex = function(hex) {
    return ByteBuffer.fromHex(hex).toArrayBuffer();
};

var state = {
    states: [{
        sessionVersion: 3,
        remoteIdentityKey: fromHex("0534ad091121f387dbf22e56e7a7c7e6f6964ed7ba6ed1e092d3870b6285c4eb13"),
        localIdentityKey: fromHex("052e978dcd2f616c2275ff28c740645c2ceec9a7c73c712dd2d55e4b6aa3ec5f44"),
        pendingPreKey: {
            preKeyId: 0,
            signedPreKeyId: 0,
            baseKey: fromHex("052d2c043f7035101c596a1febb78fc4a8d8dff07db66449530ce1a3396d954f6c")
        },
        localRegistrationId: 1083,
        theirBaseKey: fromHex("050741319370838cc8e2e590253024697b3837376bd70699f48ca23147c7088f08"),
        rootKey: fromHex("f0006715ba617382e62d3e074a575915e6b2289e4df6dee12fac04f4465812"),
        sendingChain: {
            key: fromHex("de215ccf67f7e13e57d7fac761b87eee20bdc6c1eb9479b2ac83766016a3de64"),
            index: 1,
            messageKeys: []
        },
        senderRatchetKeyPair: {
            public: fromHex("059b1ec3e47026d098ef617b9085459c9ae5dff61067d4d797f2318ac943236957"),
            private: fromHex("c842eebc48d101bc084a2f725e3f1a145829575fff108a7cd5387ae62e55267a")
        },
        previousCounter: 0
    }]
};

describe("axolotl integration node", function() {
    var stub = function() { return 1; };
    it("produces the expected output", function() {
        var expectedCiphertext = "3328bb08080030001221052d2c043f7035101c596a1febb78fc4a8d8dff07db66449530ce1a3396d954" +
            "f6c1a21052e978dcd2f616c2275ff28c740645c2ceec9a7c73c712dd2d55e4b6aa3ec5f442242330a21059b1ec3e47026d098ef6" +
            "17b9085459c9ae5dff61067d4d797f2318ac943236957100118002210ef3c9236a9c9afba0f72ad6eefe739b27b54a8b565750a5e";
        var axol = axolotl({
            getLocalIdentityKeyPair: stub,
            getLocalRegistrationId: stub,
            getLocalSignedPreKeyPair: stub,
            getLocalPreKeyPair: stub
        });
        return axol.encryptMessage(state, new Uint8Array([1, 2, 3, 4]).buffer).then(function(result) {
            var actualBody = ByteBuffer.wrap(result.body).toHex();
            assert.equal(actualBody, expectedCiphertext);
        });
    });
});
