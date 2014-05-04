/* global module: false */
module.exports = function (grunt) {

    // configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            dist: '<%= pkg.directories.dist %>',
            doc: '<%= pkg.directories.doc %>',
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
                ' * Copyright - C37 http://c37.co - 2014\n' +
                ' */'
        },

        concat: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            dist: {
                src: [
                    '<%= dirs.src %>/plane.js',
                    '<%= dirs.src %>/*/**/*.js'
                ],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>\n'
            },
            build: {
                src: '<%= concat.dist.dest %>',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
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
                tasks: ['concat']
            }
        }
    });

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    // dependencies
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // task: dist
    grunt.registerTask('dist', ['concat', 'uglify']);

    // task: doc
    grunt.registerTask('doc', ['yuidoc']);

    // task: test
    grunt.registerTask('test', ['qunit']);

    // task: default
    grunt.registerTask('default', ['dist', 'test']);
};