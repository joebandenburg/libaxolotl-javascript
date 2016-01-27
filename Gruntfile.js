"use strict";

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");

    grunt.initConfig({
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
        mochaTest: {
            unitTests: {
                src: ["test/unit/**/*.js"],
            },
            integrationTests: {
                src: ["test/integration/node/**/*.js"],
                options: {
                    clearRequireCache: true
                }
            }
        }
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check", "mochaTest:unitTests"]);
    grunt.registerTask("default", ["test"]);
    grunt.registerTask("integration-test", ["mochaTest:integrationTests"]);
};
