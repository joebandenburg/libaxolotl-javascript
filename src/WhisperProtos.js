"use strict";
// Generated file. DO NOT EDIT!!
module.exports = require("protobufjs").newBuilder({})["import"]({
    "package": "textsecure",
    "messages": [
        {
            "name": "WhisperMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "ratchetKey",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "counter",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "previousCounter",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "ciphertext",
                    "id": 4
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "PreKeyWhisperMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "registrationId",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "preKeyId",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "signedPreKeyId",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "baseKey",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "identityKey",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "message",
                    "id": 4
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "KeyExchangeMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "baseKey",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "ratchetKey",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "identityKey",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "baseKeySignature",
                    "id": 5
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "SenderKeyMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "iteration",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "ciphertext",
                    "id": 3
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "SenderKeyDistributionMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "iteration",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "chainKey",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "signingKey",
                    "id": 4
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {
        "java_package": "org.whispersystems.libaxolotl.protocol",
        "java_outer_classname": "WhisperProtos"
    },
    "services": []
}).build("textsecure");
