"use strict";
const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
const SessionFactory = require("../../src/SessionFactory");
const Session = require("../../src/Session");
const ArrayBufferUtils = require("../../src/ArrayBufferUtils");
const Messages = require("../../src/Messages");
const ProtocolConstants = require("../../src/ProtocolConstants");
const crypto = require("./FakeCrypto");

chai.use(chaiAsPromise);
var assert = chai.assert;

describe("SessionFactory", () => {
});
