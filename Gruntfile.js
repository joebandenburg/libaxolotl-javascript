"use strict";

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-mocha-test"); // For server-side testing
    grunt.loadNpmTasks("grunt-karma"); // For client-side testing
    grunt.loadNpmTasks("grunt-pure-cjs");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-blanket");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-traceur");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-jscs");

    grunt.initConfig({
        clean: {
            all: {
                src: ["coverage/", "dist/", "build/"]
            }
        },
        jshint: {
            all: {
                src: ["Gruntfile.js", "index.js", "src/**/*.js", "test/**/*.js"],
                options: {
                    jshintrc: true
                }
            }
        },
        jscs: {
            all: {
                src: ["index.js", "src/**/*.js", "test/**/*.js"]
            }
        },
        copy: {
            coverage: {
                src: ["build/test/**"],
                dest: "coverage/"
            }
        },
        blanket: {
            all: {
                src: "build/src/",
                dest: "coverage/build/src/"
            }
        },
        mochaTest: {
            unitTests: {
                src: ["test/unit/**/*.js"],
                options: {
                    require: ["mocha-traceur"]
                }
            },
            integrationTests: {
                src: ["test/integration/node/**/*.js"],
                options: {
                    clearRequireCache: true
                }
            },
            coverage: {
                src: ["coverage/build/test/unit/**/*.js"],
                options: {
                    reporter: "html-cov",
                    quiet: true,
                    captureFile: "coverage/index.html",
                    clearRequireCache: true
                }
            }
        },
        karma: {
            integrationTests: {
                options: {
                    configFile: "karma.conf.js"
                }
            }
        },
        pure_cjs: {
            dist: {
                files: {
                    "build/axolotl.js": ["build/index.js"]
                },
                options: {
                    exports: "axolotl",
                    external: {
                        protobufjs: {
                            global: "dcodeIO.ProtoBuf",
                            id: "__external_1"
                        },
                        "traceur/bin/traceur-runtime": {
                            amd: "traceur-runtime",
                            global: "1",
                            id: "__external_2"
                        },
                        "axolotl-crypto": {
                            global: "axolotlCrypto"
                        }
                    }
                }
            }
        },
        traceur: {
            dist: {
                options: {
                    modules: "commonjs"
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    src: ["**/*.js"],
                    dest: "build/src"
                }, {
                    src: ["index.js"],
                    dest: "build/index.js"
                }, {
                    expand: true,
                    cwd: "test/",
                    src: ["**/*.js"],
                    dest: "build/test"
                }]
            }
        },
        concat: {
            dist: {
                src: ["banner.js", "build/axolotl.js"],
                dest: "dist/axolotl.js"
            }
        }
    });

    grunt.registerTask("coverage", ["traceur", "copy:coverage", "blanket", "mochaTest:coverage"]);

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["clean", "check", "mochaTest:unitTests"]);
    grunt.registerTask("default", ["test"]);
    grunt.registerTask("dist", ["default", "traceur", "pure_cjs", "concat"]);
    grunt.registerTask("integration-test", ["dist", "mochaTest:integrationTests", "karma:integrationTests"]);
};