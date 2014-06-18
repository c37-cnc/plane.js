/* global module: false */
module.exports = function (grunt) {

    // dependencies
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks("grunt-es6-module-transpiler");

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
                src: "amd/**/*.amd.js",
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js'
            }//,
//            dist: {
//                src: ['<%= dirs.src %>/main.js', '<%= dirs.src %>/*.js'],
//                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js'
//            }
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
        clean: {
            amd: ['amd']
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
        transpile: {
            amd: {
                type: 'amd',
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js'],
                    dest: 'amd/',
                    ext: '.amd.js'
                }]
            },
        },
        watch: {
            scripts: {
                files: [
                    '<%= dirs.src %>/**'
                ],
                tasks: ['concat']
            }
        },
        browser: {
            dist: {
                src: ['dist/module.js', '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js'],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js',
                options: {
                    barename: "plane",
                    namespace: "Plane"
                }
            }
        }
    });

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    grunt.registerMultiTask('browser', "Export a module to the window", function () {
        var options = this.options(),
            output = [];

        this.files.forEach(function (f) {
            
//            output.push('<%= meta.banner %>\n');
            output.push('(function(window) {');
            output.push.apply(output, f.src.map(grunt.file.read));

            output.push(grunt.template.process(
                'window.<%= namespace %> = require("<%= barename %>");', {
                    data: {
                        namespace: options.namespace,
                        barename: options.barename
                    }
                }));
            output.push('})(window);');

            grunt.file.write(f.dest, grunt.template.process(output.join("\n")));
        });
    });


    // task: dist
    grunt.registerTask('dist', ['concat', 'uglify']);

    // task: minify
    grunt.registerTask('minify', ['uglify']);

    // task: clear
    grunt.registerTask('clear', ['clean']);

    // task: doc
    grunt.registerTask('doc', ['yuidoc']);

    // task: test
    grunt.registerTask('test', ['qunit']);

    // task: default
    grunt.registerTask('default', ['dist', 'test']);
};