"use strict";
const chai = require("chai");
const ArrayBufferUtils = require("../../src/ArrayBufferUtils");

var assert = chai.assert;

describe("ArrayBufferUtils", () => {
    describe("areEqual", () => {
        it("returns true for equal arrays", () => {
            var left = new Uint8Array([1, 2, 3]).buffer;
            var right = new Uint8Array([1, 2, 3]).buffer;
            assert.ok(ArrayBufferUtils.areEqual(left, right));
            assert.ok(ArrayBufferUtils.areEqual(right, left));
        });
        it("returns false for arrays of unequal length", () => {
            var left = new Uint8Array([1, 2, 3]).buffer;
            var right = new Uint8Array([1, 2, 3, 4]).buffer;
            assert.notOk(ArrayBufferUtils.areEqual(left, right));
            assert.notOk(ArrayBufferUtils.areEqual(right, left));
        });
        it("returns false for arrays of equal length but unequal values", () => {
            var left = new Uint8Array([1, 2, 3]).buffer;
            var right = new Uint8Array([1, 2, 4]).buffer;
            assert.notOk(ArrayBufferUtils.areEqual(left, right));
            assert.notOk(ArrayBufferUtils.areEqual(right, left));
        });
    });
    describe("concat", () => {
        it("concats all buffers into one large buffer if passed as varargs", () => {
            var a = new Uint8Array([1, 2, 3]).buffer;
            var b = new Uint8Array([4]).buffer;
            var c = new Uint8Array([5, 6, 7, 8]).buffer;
            var expected = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
            var actual = ArrayBufferUtils.concat(a, b, c);
            assert.ok(ArrayBufferUtils.areEqual(expected, actual));
        });
        it("concats all buffers into one large buffer if passed as an array", () => {
            var a = new Uint8Array([1, 2, 3]).buffer;
            var b = new Uint8Array([4]).buffer;
            var c = new Uint8Array([5, 6, 7, 8]).buffer;
            var expected = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
            var actual = ArrayBufferUtils.concat([a, b, c]);
            assert.ok(ArrayBufferUtils.areEqual(expected, actual));
        });
    });
    describe("stringify", () => {
        it("converts an arrayBuffer to a string", () => {
            var buffer = new Uint8Array([48, 99, 21, 170, 191, 5]).buffer;
            var expected = "306315aabf05";
            var actual = ArrayBufferUtils.stringify(buffer);
            assert.equal(actual, expected);
        });
    });
    describe("parse", () => {
        it("converts a string to an arrayBuffer", () => {
            var string = "306315aabf05";
            var expected = new Uint8Array([48, 99, 21, 170, 191, 5]).buffer;
            var actual = ArrayBufferUtils.parse(string);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
    });
});
