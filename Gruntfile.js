module.exports = function (grunt) {

    // Load the plugins that provides tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks("grunt-es6-module-transpiler");

    // Project configuration
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
            files: {
//                options: {
//                    banner: '<%= meta.banner %>\n'
//                },
                src: "amd/**/*.amd.js",
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>\n',
                report: 'gzip'
            },
            build: {
                src: '<%= concat.files.dest %>',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        qunit: {
            all: ['<%= dirs.test %>/unit/*.html']
        },
        clean: {
            amd: ['amd', '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js']
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
                    src: ['**/*.js', '!utility/module.js'],
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
                tasks: ['module', 'concat', 'browser', 'minify', 'clear']
            }
        },
        browser: {
            dist: {
                src: ['<%= dirs.src %>/utility/module.js', '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.amd.js'],
                dest: '<%= dirs.dist %>/<%= pkg.name %>-<%= pkg.version %>.js',
                options: {
                    barename: "plane",
                    namespace: "Plane"
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

    grunt.registerTask('minify', ['uglify']);
    grunt.registerTask('module', ['transpile']);
    grunt.registerTask('clear', ['clean']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('test', ['qunit']);

    grunt.registerTask('dist', ['module', 'concat', 'browser', 'minify', 'clear']);
    grunt.registerTask('default', ['dist', 'test']);
};