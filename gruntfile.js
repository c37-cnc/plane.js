module.exports = function (grunt) {

    // Load the plugins that provides tasks
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
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
                ' * <%= pkg.name %> version: <%= grunt.file.readJSON("package.json").version %>\n' +
                ' * licensed by Creative Commons Attribution-ShareAlike 3.0\n' +
                ' *\n' +
                ' * Copyright - C37 - http://c37.co - <%= grunt.template.today("yyyy") %>\n' +
                ' */\n'
        },
        concat: {
            browser: {
                files: [
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
                    },
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js'
                    }
                ]
            },
            browserOnly: {
                files: [
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
                    }
                ]
            },
            amd: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.amd.js'
                    },
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.amd.js'
                    }
                ]
            },
            amdOnly: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [
                    {
                        src: ['<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.amd.js'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>',
                report: 'gzip'
            },
            browser: {
                src: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.min.js'
            },
            amd: {
                src: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.amd.js',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.amd.min.js'
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
                tasks: ['dev']
            }
        },
        browser: {
            dist: {
                options: {
                    namespace: "plane"
                },
                files: [
                    {
                        src: ['<%= dirs.dist %>/<%= pkg.name %>.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
                    },
                    {
                        src: ['<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js'
                    }
                ]
            },
            only: {
                options: {
                    namespace: "plane"
                },
                files: [
                    {
                        src: ['<%= dirs.dist %>/<%= pkg.name %>.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
                    }
                ]
            }
        },
        clean: {
            dist: {
                expand: true,
                cwd: '<%= dirs.dist %>/',
                src: ['<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.amd.js', '<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js']
            },
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: false,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'manifest.json'],
                createTag: false,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false
            }
        }
    });

    // Events
    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // Tasks
    // http://gruntjs.com/creating-tasks
    grunt.registerMultiTask('browser', 'Export a module to the window', function () {
        var options = this.options();

        this.files.forEach(function (f) {
            var output = [];
            // grunt.log.writeln(f.src);

            output.push('<%= meta.banner %>');
            output.push('(function (window) {');
            output.push('"use strict";');
            output.push.apply(output, f.src.map(grunt.file.read));

            output.push(grunt.template.process(
                'window.<%= namespace %> = require("<%= namespace %>");', {
                    data: {
                        namespace: options.namespace
                    }
                }));

            output.push('})(window);');

            grunt.file.write(f.dest, grunt.template.process(output.join("\n")));
        });
    });

    grunt.registerTask('minify', ['uglify']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('test', ['qunit']);

    grunt.registerTask('dev', ['concat:browserOnly', 'browser:only', 'concat:amdOnly']);
    grunt.registerTask('dist', ['bump', 'concat', 'browser', 'minify', 'clean']);

    grunt.registerTask('default');
};