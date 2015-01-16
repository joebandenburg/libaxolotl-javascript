import chai from "chai";
import sinon from "sinon";

import SequentialOperationQueue from "../../src/SequentialOperationQueue";

var assert = chai.assert;

describe("SequentialOperationQueue", () => {
    var queue;
    beforeEach(() => {
        queue = new SequentialOperationQueue();
    });
    describe("wrap", () => {
        var resolvers;
        var rejectors;
        var wrappedFn;
        var fn;
        beforeEach(() => {
            resolvers = [];
            rejectors = [];
            fn = sinon.spy(() => {
                return new Promise(function(resolve, reject) {
                    resolvers.push(resolve);
                    rejectors.push(reject);
                });
            });
            wrappedFn = queue.wrap(fn);
        });
        it("calls the wrappee", (done) => {
            wrappedFn();
            setTimeout(() => {
                assert.ok(fn.calledOnce);
                done();
            }, 10);
        });
        it("passes arguments through to wrappee", (done) => {
            wrappedFn(2, 3, 4);
            setTimeout(() => {
                assert.ok(fn.calledWith(2, 3, 4));
                done();
            }, 10);
        });
        it("doesn't call the wrappee again while the first call's promise isn't resolved or rejected", (done) => {
            wrappedFn();
            wrappedFn();
            setTimeout(() => {
                assert.ok(fn.calledOnce);
                done();
            }, 10);
        });
        it("doesn't resolve or reject returned promise immediately", (done) => {
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            wrappedFn().then(resolved, rejected);
            setTimeout(() => {
                assert.notOk(resolved.called);
                assert.notOk(rejected.called);
                done();
            }, 10);
        });
        it("resolves returned promise when the wrappee's returned promise is resolved", (done) => {
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            wrappedFn().then(resolved, rejected);
            setTimeout(() => {
                resolvers[0]();
                setTimeout(() => {
                    assert.ok(resolved.called);
                    assert.notOk(rejected.called);
                    done();
                }, 10);
            }, 10);
        });
        it("rejects returned promise when the wrappee's returned promise is rejected", (done) => {
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            wrappedFn().then(resolved, rejected);
            setTimeout(() => {
                rejectors[0]();
                setTimeout(() => {
                    assert.notOk(resolved.called);
                    assert.ok(rejected.called);
                    done();
                }, 10);
            }, 10);
        });
        it("calls the queued wrappee call when the first promise is resolved", (done) => {
            wrappedFn();
            wrappedFn();
            setTimeout(() => {
                resolvers[0]();
                setTimeout(() => {
                    assert.ok(fn.calledTwice);
                    done();
                }, 10);
            }, 10);
        });
        it("calls the queued wrappee call when the first promise is rejected", (done) => {
            wrappedFn();
            wrappedFn();
            setTimeout(() => {
                rejectors[0]();
                setTimeout(() => {
                    assert.ok(fn.calledTwice);
                    done();
                }, 10);
            }, 10);
        });
        it("resolves returned queued promise when the wrappee's returned promise is resolved", (done) => {
            wrappedFn();
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            wrappedFn().then(resolved, rejected);
            setTimeout(() => {
                resolvers[0]();
                setTimeout(() => {
                    resolvers[1]();
                    setTimeout(() => {
                        assert.ok(resolved.called);
                        assert.notOk(rejected.called);
                        done();
                    }, 10);
                }, 10);
            }, 10);
        });
        it("rejects returned queued promise when the wrappee's returned promise is rejected", (done) => {
            wrappedFn();
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            wrappedFn().then(resolved, rejected);
            setTimeout(() => {
                rejectors[0]();
                setTimeout(() => {
                    rejectors[1]();
                    setTimeout(() => {
                        assert.notOk(resolved.called);
                        assert.ok(rejected.called);
                        done();
                    }, 10);
                }, 10);
            }, 10);
        });
    });
});
