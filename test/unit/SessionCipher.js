"use strict";
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const SessionCipher = require("../../src/SessionCipher");
const SessionState = require("../../src/SessionState");
const Session = require("../../src/Session");
const Messages = require("../../src/Messages");
const InvalidMessageException = require("../../src/Exceptions").InvalidMessageException;
const crypto = require("./FakeCrypto");
const co = require("co");

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("SessionCipher", () => {
    describe("decryptMessage", () => {
        it("rejects message with wrong version number", co.wrap(function*() {
            var state = new SessionState({
                sessionVersion: 3
            });
            var session = new Session();
            session.addState(state);
            var sessionCipher = new SessionCipher(crypto);
            var message = Messages.encodeWhisperMessage({
                version: {
                    current: 2,
                    max: 3
                },
                message: {},
                mac: new ArrayBuffer(8)
            });
            yield assert.isRejected(sessionCipher.decryptWhisperMessage(session, message), InvalidMessageException);
        }));
    });
});
