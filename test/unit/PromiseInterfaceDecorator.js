"use strict";
const chai = require("chai");

const PromiseInterfaceDecorator = require("../../src/PromiseInterfaceDecorator");

var assert = chai.assert;

describe("PromiseInterfaceDecorator", () => {
    it("throws if the passed in object doesn't implement the required interface", () => {
        assert.throws(() => {
            new PromiseInterfaceDecorator({}, ["test"]);
        });
    });
    it("wraps the object's methods so that they return promises", () => {
        var impl = new PromiseInterfaceDecorator({
            test: () => 3
        }, ["test"]);
        assert.instanceOf(impl.test(), Promise);
    });
});
