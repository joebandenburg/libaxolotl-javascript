import chai from "chai";
import chaiAsPromise from "chai-as-promised";
import SessionFactory from "../../src/SessionFactory";
import Session from "../../src/Session";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import Messages from "../../src/Messages";
import ProtocolConstants from "../../src/ProtocolConstants";
import crypto from "./FakeCrypto";
import {
    InvalidMessageException,
    DuplicateMessageException,
    InvalidKeyException,
    ConcurrentUseException,
    UnsupportedProtocolVersionException
} from "../../src/Exceptions";
import co from "co";

chai.use(chaiAsPromise);
var assert = chai.assert;

describe("SessionFactory", () => {
});
