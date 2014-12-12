module.exports = function (grunt) {

    // Load the plugins that provides tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            dist: '<%= pkg.directories.dist %>',
            doc: '<%= pkg.directories.doc %>',
            lib: '<%= pkg.directories.lib %>',
            src: '<%= pkg.directories.src %>',
            test: '<%= pkg.directories.test %>'
        },
        meta: {
            banner: '/*!\n' +
                ' * C37 in <%= grunt.template.today("dd-mm-yyyy") %> at <%= grunt.template.today("HH:MM:ss") %> \n' +
                ' *\n' +
                ' * <%= pkg.name %> version: <%= pkg.version %>\n' +
                ' * licensed by Creative Commons Attribution-ShareAlike 3.0\n' +
                ' *\n' +
                ' * Copyright - C37 - http://c37.co - <%= grunt.template.today("yyyy") %>\n' +
                ' */'
        },
        concat: {
            browser: {
                src: [ '<%= dirs.src %>/**/*.js', '<%= dirs.lib %>/utility.js'],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            amd: {
                options: {
                    banner: '<%= meta.banner %>\n'
                },
                src: [ '<%= dirs.src %>/**/*.js', '<%= dirs.lib %>/utility.js'],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>\n',
                report: 'gzip'
            },
            browser: {
                src: '<%= concat.browser.dest %>',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
            amd: {
                src: '<%= concat.amd.dest %>',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.min.js'
            }
        },
        qunit: {
            all: ['<%= dirs.test %>/unit/*.html']
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: '<%= dirs.src %>',
                    // themedir: 'path/to/custom/theme/',
                    outdir: '<%= dirs.doc %>/api'
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    '<%= dirs.src %>/**'
                ],
                tasks: ['concat:browser', 'browser']
                //                tasks: ['concat', 'browser', 'minify']
            }
        },
        browser: {
            dist: {
                src: ['<%= dirs.lib %>/module.js', '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js'],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js',
                options: {
                    namespace: "plane"
                }
            }
        }
    });

    // Events
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Tasks
    grunt.registerMultiTask('browser', 'Export a module to the window', function () {
        var options = this.options(),
            output = [];

        this.files.forEach(function (f) {
            output.push('<%= meta.banner %>\n');
            output.push('(function (window) {');
            output.push('"use strict";');
            output.push.apply(output, f.src.map(grunt.file.read));
            output.push(grunt.template.process(
                'window.<%= namespace %> = require("<%= namespace %>");', {
                    data: {
                        namespace: options.namespace,
                        barename: options.barename
                    }
                }));
            output.push('})(window);');

            grunt.file.write(f.dest, grunt.template.process(output.join("\n")));
        });
    });

    grunt.registerTask('minify', ['uglify']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('test', ['qunit']);

    grunt.registerTask('dist', ['concat', 'browser', 'minify']);
    grunt.registerTask('default', ['dist', 'test']);
};