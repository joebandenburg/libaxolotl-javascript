var assert = require("assert");

describe("integration", function() {
    describe("node", function() {
        it("can import the module", function() {
            var axolotl = require("../../dist/axolotl");

            assert.notEqual(axolotl, undefined);
        });
        it("can be invoked", function() {
            var axolotl = require("../../dist/axolotl");
            axolotl({}, {
                getLocalIdentityKeyPair: () => 1,
                getLocalRegistrationId: () => 1,
                getRemotePreKeyBundle: () => 1,
                getLocalSignedPreKeyPair: () => 1,
                getLocalPreKeyPair: () => 1,
                hasSession: () => 1,
                getSession: () => 1,
                putSession: () => 1,
                isRemoteIdentityTrusted: () => 1,
                putRemoteIdentity: () => 1
            });
        });
    });
});
