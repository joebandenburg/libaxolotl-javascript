import chai from "chai";
import SessionStateList from "../../src/SessionStateList";
import ProtocolConstants from "../../src/ProtocolConstants";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";

var assert = chai.assert;

describe("SessionStateList", () => {
    var serialisedState;
    var list;
    beforeEach(() => {
        list = new SessionStateList((state) => {
            serialisedState = state;
        });
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
    describe("save", () => {
        it("outputs a string that when deserialised results in the same state", () => {
            var originalState = {
                a: 1,
                b: 2,
                c: new Uint8Array([1, 2, 3]).buffer
            };
            list.addSessionState(originalState);
            list.save();
            assert.typeOf(serialisedState, "string");
            var list2 = new SessionStateList(null, serialisedState);
            var deserialisedState = list2.mostRecentSession();
            assert.equal(deserialisedState.a, originalState.a);
            assert.equal(deserialisedState.b, originalState.b);
            assert.ok(ArrayBufferUtils.areEqual(deserialisedState.c, originalState.c));
        });
    });
});
