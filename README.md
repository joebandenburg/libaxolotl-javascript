[![Build Status](https://travis-ci.org/joebandenburg/libaxolotl-javascript.svg?branch=master)](https://travis-ci.org/joebandenburg/libaxolotl-javascript)

A JavaScript port of [libaxolotl](https://github.com/WhisperSystems/libaxolotl-android). Axolotl is a ratcheting forward
secrecy protocol that works in synchronous and asynchronous messaging environments. The protocol overview is available
[here](https://github.com/trevp/axolotl/wiki), and the details of the wire format are available
[here](https://github.com/WhisperSystems/TextSecure/wiki/ProtocolV2).

## Getting started

### Node.js

```
$ npm install axolotl
```

```javascript
var axolotl = require("axolotl");
```

### Browser

```
$ bower install axolotl
```

With AMD:
```javascript
require(["axolotl"], function(axolotl) {

});
```
or without:
```javascript
window.axolotl(...)
```