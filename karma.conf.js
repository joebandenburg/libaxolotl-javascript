module.exports = function(config) {
    config.set({
        frameworks: ["mocha", "chai"],

        files: [
            "bower_components/axolotl-crypto-curve25519/curve25519.js",
            "bower_components/axolotl-crypto/axolotl-crypto.js",
            "node_modules/bytebuffer/dist/ByteBufferAB.js",
            "node_modules/protobufjs/dist/ProtoBuf.noparse.js",
            "node_modules/traceur/bin/traceur-runtime.js",
            "dist/axolotl.js",
            "test/integration/web/**/*.js"
        ],
        browsers: ["Firefox"],
        client: {
            mocha: {
                reporter: "html", // change Karma's debug.html to the mocha web reporter
                ui: "bdd"
            }
        },
        singleRun: true
    });
};