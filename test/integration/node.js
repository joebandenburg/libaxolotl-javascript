var assert = require("assert");

describe("integration", function() {
    describe("node", function() {
        it("can import the module", function() {
            var axolotl = require("../../dist/axolotl");

            assert.notEqual(axolotl, undefined);
        });
        it("can be invoked", function() {
            var axolotl = require("../../dist/axolotl");
            axolotl({});
        });
    });
});
