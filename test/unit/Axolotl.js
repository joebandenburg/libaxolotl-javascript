import chai from "chai";
import Axolotl from "../../src/Axolotl";

var assert = chai.assert;

describe("Axolotl", () => {
    it("is frozen", () => {
        var axolotl = new Axolotl();
        assert.throws(() => {
            axolotl.foo = 3;
        });
    });
});
