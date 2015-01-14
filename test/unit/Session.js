import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import Session from "../../src/Session";
import SessionState from "../../src/SessionState";
import SessionStateList from "../../src/SessionStateList";
import Messages from "../../src/Messages";
import {InvalidMessageException} from "../../src/Exceptions";
import crypto from "./FakeCrypto";
import co from "co";

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("Session", () => {
    describe("decryptMessage", () => {
        it("rejects message with wrong version number", co.wrap(function*() {
            var state = new SessionState({
                sessionVersion: 3
            });
            var sessionStateList = new SessionStateList();
            sessionStateList.addSessionState(state);
            var session = new Session(crypto, sessionStateList);
            var message = Messages.encodeWhisperMessage({
                version: {
                    current: 2,
                    max: 3
                },
                message: {},
                mac: new ArrayBuffer(8)
            });
            yield assert.isRejected(session.decryptWhisperMessage(message), InvalidMessageException);
        }));
    });
});
