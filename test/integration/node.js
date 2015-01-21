var assert = require("assert");

describe("integration", function() {
    describe("node", function() {
        it("can import the module", function() {
            var axolotl = require("../../dist/axolotl");

            assert.notEqual(axolotl, undefined);
        });
        it("can be invoked", function() {
            var axolotl = require("../../dist/axolotl");
            var stub = () => 1;
            axolotl({
                generateKeyPair: stub,
                calculateAgreement: stub,
                randomBytes: stub,
                sign: stub,
                verifySignature: stub,
                hmac: stub,
                encrypt: stub,
                decrypt: stub
            }, {
                getLocalIdentityKeyPair: stub,
                getLocalRegistrationId: stub,
                getRemotePreKeyBundle: stub,
                getLocalSignedPreKeyPair: stub,
                getLocalPreKeyPair: stub,
                hasSession: stub,
                getSession: stub,
                putSession: stub,
                isRemoteIdentityTrusted: stub
            });
        });
    });
});
