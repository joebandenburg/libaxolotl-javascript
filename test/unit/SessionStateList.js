import chai from "chai";
import SessionStateList from "../../src/SessionStateList";
import ProtocolConstants from "../../src/ProtocolConstants";

var assert = chai.assert;

describe("SessionStateList", () => {
    var list;
    beforeEach(() => {
        list = new SessionStateList();
    });
    it("is initially empty", () => {
        assert.equal(list.sessions.length, 0);
    });
    describe("addSessionState", () => {
        it("puts the session onto the front of sessions array", () => {
            var state1 = 1;
            var state2 = 2;
            list.addSessionState(state1);
            list.addSessionState(state2);
            assert.equal(list.sessions.length, 2);
            assert.equal(list.sessions[0], state2);
            assert.equal(list.sessions[1], state1);
        });
        it("removes the last element if the list is full", () => {
            var state1 = {};
            list.addSessionState(state1);
            for (var i = 1; i < ProtocolConstants.maximumSessionsPerIdentity; i++) {
                list.addSessionState({});
            }
            assert.equal(list.sessions[ProtocolConstants.maximumSessionsPerIdentity - 1], state1);
            list.addSessionState({});
            assert.equal(list.sessions.length, ProtocolConstants.maximumSessionsPerIdentity);
            assert.notEqual(list.sessions[ProtocolConstants.maximumSessionsPerIdentity - 1], state1);
        });
    });
    describe("removeSessionState", () => {
        it("removes the session from the list", () => {
            var state1 = 1;
            var state2 = 2;
            var state3 = 3;
            list.addSessionState(state1);
            list.addSessionState(state2);
            list.addSessionState(state3);
            list.removeSessionState(state2);
            assert.equal(list.sessions.length, 2);
            assert.equal(list.sessions[0], state3);
            assert.equal(list.sessions[1], state1);
        });
    });
    describe("mostRecentSession", () => {
        it("returns the head of the list", () => {
            var state1 = 1;
            var state2 = 2;
            list.addSessionState(state1);
            list.addSessionState(state2);
            assert.equal(list.mostRecentSession(), state2);
        });
    });
});
