import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import SessionCipher from "../../src/SessionCipher";
import SessionState from "../../src/SessionState";
import Session from "../../src/Session";
import Messages from "../../src/Messages";
import {InvalidMessageException} from "../../src/Exceptions";
import crypto from "./FakeCrypto";
import co from "co";

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
