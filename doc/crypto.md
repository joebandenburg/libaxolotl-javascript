libaxolotl-javascript requires an implementation of the `Crypto` interface. There are implementations for Node.js and
WebCrypto [here](https://github.com/joebandenburg/libaxolotl-crypto-node) and
[here](https://github.com/joebandenburg/libaxolotl-crypto-web), respectively.

The rest of this page documents the interface so that you may create your own implementation.

### The Crypto interface

This is an object that has the following methods.

*Note that all methods may return a Promise if the operation is asynchronous.*

#### generateKeyPair

```
generateKeyPair() → {KeyPair}
```

Generate a fresh, random [Curve25519](http://en.wikipedia.org/wiki/Curve25519) public/private key pair suitable for use
with Diffie-Hellman key agreements. The returned private key should be an ArrayBuffer consisting of 32 bytes. The
returned public key should be an ArrayBuffer consisting of 33 bytes, where the first byte is equal to `0x05`.

#### calculateAgreement

```
calculateAgreement(theirPublicKey, ourPrivateKey) → {ArrayBuffer}
```

Compute a [Curve25519](http://en.wikipedia.org/wiki/Curve25519) Diffie-Hellman key agreement.

##### Parameters

Name|Type|Description
:---|:---|:----------
`theirPublicKey`|ArrayBuffer|Their 33 byte public key.
`ourPrivateKey`|ArrayBuffer|Our 32 byte private key.

#### randomBytes

```
randomBytes(byteCount) → {ArrayBuffer}
```

Generate `byteCount` bytes of cryptographically secure random data and return as an ArrayBuffer.

##### Parameters

Name|Type|Description
:---|:---|:----------
`byteCount`|Number|The number of bytes to generate.

#### sign

```
sign(privateKey, dataToSign) → {ArrayBuffer}
```

Produce an [Ed25519](http://en.wikipedia.org/wiki/EdDSA) signature. The returned signature should be an ArrayBuffer
consisting of 64 bytes.

##### Parameters

Name|Type|Description
:---|:---|:----------
`privateKey`|ArrayBuffer|The 32 byte private key to use to generate the signature.
`dataToSign`|ArrayBuffer|The data to be signed. May be any length.

#### verifySignature

```
verifySignature(publicKey, dataToSign, purportedSignature) → {Boolean}
```

Verify an [Ed25519](http://en.wikipedia.org/wiki/EdDSA) signature.

##### Parameters

Name|Type|Description
:---|:---|:----------
`privateKey`|ArrayBuffer|The 33 byte public half of the key used to produce the signature.
`dataToSign`|ArrayBuffer|The data that was signed. May be any length.
`purportedSignature`|ArrayBuffer|The purported signature to check.

#### hmac

```
hmac(key, data) → {ArrayBuffer}
```

Produce a HMAC-HASH using SHA-256. The returned ArrayBuffer should consist of 32 bytes.

##### Parameters

Name|Type|Description
:---|:---|:----------
`key`|ArrayBuffer|The mac key. May be any length.
`data`|ArrayBuffer|The data to be hashed. May be any length.

#### encrypt

```
encrypt(key, plaintext, iv) → {ArrayBuffer}
```

Encrypt the `plaintext` using AES-256-CBC with PKCS#7 padding.

##### Parameters

Name|Type|Description
:---|:---|:----------
`key`|ArrayBuffer|The 32 byte cipher key.
`plaintext`|ArrayBuffer|The data to be encrypted. May be any length.
`iv`|ArrayBuffer|A 16 byte random initialisation vector.

#### decrypt

```
decrypt(key, ciphertext, iv) → {ArrayBuffer}
```

Decrypt the `ciphertext` using AES-256-CBC with PKCS#7 padding.

##### Parameters

Name|Type|Description
:---|:---|:----------
`key`|ArrayBuffer|The 32 byte cipher key used to encrypt the data.
`ciphertext`|ArrayBuffer|The data to be decrypted. Should have a length that is a multiple of 16 bytes.
`iv`|ArrayBuffer|The 16 byte initialisation vector used to encrypt the data.