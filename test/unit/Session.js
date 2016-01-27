"use strict";
const chai = require("chai");
const Session = require("../../src/Session");
const ProtocolConstants = require("../../src/ProtocolConstants");
const ArrayBufferUtils = require("../../src/ArrayBufferUtils");

var assert = chai.assert;

describe("Session", () => {
    var session;
    beforeEach(() => {
        session = new Session();
    });
    it("is initially empty", () => {
        assert.equal(session.states.length, 0);
    });
    it("clones the passed in state", () => {
        var otherSession = {
            states: [{}, {}]
        };
        var session = new Session(otherSession);
        assert.equal(session.states.length, 2);
    });
    describe("addState", () => {
        it("puts the session onto the front of sessions array", () => {
            var state1 = 1;
            var state2 = 2;
            session.addState(state1);
            session.addState(state2);
            assert.equal(session.states.length, 2);
            assert.equal(session.states[0], state2);
            assert.equal(session.states[1], state1);
        });
        it("removes the last element if the list is full", () => {
            var state1 = {};
            session.addState(state1);
            for (var i = 1; i < ProtocolConstants.maximumSessionStatesPerIdentity; i++) {
                session.addState({});
            }
            assert.equal(session.states[ProtocolConstants.maximumSessionStatesPerIdentity - 1], state1);
            session.addState({});
            assert.equal(session.states.length, ProtocolConstants.maximumSessionStatesPerIdentity);
            assert.notEqual(session.states[ProtocolConstants.maximumSessionStatesPerIdentity - 1], state1);
        });
    });
    describe("removeState", () => {
        it("removes the session from the list", () => {
            var state1 = 1;
            var state2 = 2;
            var state3 = 3;
            session.addState(state1);
            session.addState(state2);
            session.addState(state3);
            session.removeState(state2);
            assert.equal(session.states.length, 2);
            assert.equal(session.states[0], state3);
            assert.equal(session.states[1], state1);
        });
    });
    describe("mostRecentState", () => {
        it("returns the head of the list", () => {
            var state1 = 1;
            var state2 = 2;
            session.addState(state1);
            session.addState(state2);
            assert.equal(session.mostRecentState(), state2);
        });
    });
});
