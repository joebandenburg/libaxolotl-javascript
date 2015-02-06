[![Build Status](https://travis-ci.org/joebandenburg/libaxolotl-javascript.svg?branch=master)](https://travis-ci.org/joebandenburg/libaxolotl-javascript)

This project is an independent implementation of Axolotl in JavaScript. It is not endorsed by Open Whisper Systems.

Axolotl is a ratcheting forward secrecy protocol that works in synchronous and asynchronous messaging environments.
The protocol overview is available [here](https://github.com/trevp/axolotl/wiki), and the details of the TextSecure wire
format are available [here](https://github.com/WhisperSystems/TextSecure/wiki/ProtocolV2).

Currently this implementation only supports version 3 of the protocol.

**WARNING: This implementation has not yet been independently audited. That means you should probably not use it.**

## Installation

### Node.js

Install using npm:
```
$ npm install axolotl
```

and import using `"axolotl"`:
```javascript
var axolotl = require("axolotl");
```

### Browser

Install using bower:
```
$ bower install axolotl
```

and import using AMD:
```javascript
require(["axolotl"], function(axolotl) {

});
```

or without:
```javascript
window.axolotl(...)
```

## Getting started

### Dependencies

libaxolotl-javascript depends on [traceur-runtime](https://github.com/google/traceur-compiler) and
[protobuf.js](https://github.com/dcodeIO/ProtoBuf.js) and [cryptographic primitives](doc/crypto.md).
These dependencies are not included in the distributed package. If you installed libaxolotl-javascript using npm then
there is nothing more you need to do - npm will download these dependencies for you.

If you are using libaxolotl-javascript in the browser, you will have to provide the library's dependencies yourself. If
you're using AMD, then simply provide the location of these dependencies in your AMD configuration. Otherwise, include
the dependencies on the page before including `axolotl.js`.

### The Store interface

You need to provide an implementation of the `Store` interface when instantiating Axolotl. This is an object that
has the following methods.

*Note that all methods may return a Promise if the operation is asynchronous.*

#### getLocalIdentityKeyPair

```
getLocalIdentityKeyPair() → {KeyPair}
```

Get the local identity key pair created at install time. A key pair is a JavaScript object containing the keys `public`
and `private` which correspond to the public and private keys, respectively. These keys are of type ArrayBuffer.

#### getLocalRegistrationId

```
getLocalRegistrationId() → {Number}
```

Get the local registration identifier created at install time.

#### getLocalSignedPreKeyPair

```
getLocalSignedPreKeyPair(signedPreKeyId) → {KeyPair}
```

Get the local signed pre-key pair associated with the `signedPreKeyId`.

##### Parameters

Name|Type|Description
:---|:---|:----------
`signedPreKeyId`|Number|The identifier of the signed pre-key.

#### getLocalPreKeyPair

```
getLocalPreKeyPair(preKeyId) → {KeyPair}
```

Get the local pre-key pair associated with the `preKeyId`.

##### Parameters

Name|Type|Description
:---|:---|:----------
`preKeyId`|Number|The identifier of the pre-key.

### Using Axolotl

Start by instantiating Axolotl:

```javascript
var axol = axolotl(store);
```

When your application is first installed, the client will likely need to register with the server. To do this, a number
of data needs to be generated:

```javascript
axol.generateIdentityKeyPair().then(...); // Generate our identity key
axol.generateRegistrationId().then(...); // Generate our registration id
axol.generatePreKeys(0, 100).then(...); // Generate the first set of our pre-keys to send to the server
axol.generateLastResortPreKey().then(...); // Generate our last restore pre-key to send to the server
axol.generateSignedPreKey(identityKeyPair, 1).then(...); // Generate our first signed pre-key to send to the server
```

Once registered, sending messages is very simple:

```javascript
var message = convertStringToBytes("Hello bob");
axol.encryptMessage("bob", message).then(function(ciphertext) {
    // Send ciphertext to alice
});
```

and on the receiving side:

```javascript
// When receiving a ciphertext, decide what type it is from the container and then decrypt
axol.decryptPreKeyWhisperMessage("alice", ciphertext).then(function(plaintext) {
    console.log(plaintext); // "Hello bob"
});
```

See [Axolotl.js](src/Axolotl.js) for more detailed API documentation.
