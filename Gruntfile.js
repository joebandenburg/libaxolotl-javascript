"use strict";

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-mocha-test"); // For server-side testing
    grunt.loadNpmTasks("grunt-karma"); // For client-side testing
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-blanket");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
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
                    jshintrc: ".jshintrc"
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
        concat: {
            dist: {
                src: ["banner.js", "build/axolotl.js"],
                dest: "dist/axolotl.js"
            }
        }
    });

    grunt.registerTask("coverage", ["copy:coverage", "blanket", "mochaTest:coverage"]);

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["clean", "check", "mochaTest:unitTests"]);
    grunt.registerTask("default", ["test"]);
    grunt.registerTask("dist", ["default", "concat"]);
    grunt.registerTask("integration-test", ["dist", "mochaTest:integrationTests", "karma:integrationTests"]);
};
