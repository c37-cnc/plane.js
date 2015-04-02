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
            dev: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [
                    {
                        src: ['<%= dirs.src %>/plane.js', '<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
                    }
                ]
            },
            dist: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [
                    {
                        src: ['<%= dirs.src %>/plane.js', '<%= dirs.src %>/**/*.js'],
                        dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>',
                mangle: true,
                compress: {
                    sequences: true,
                    properties: true,
                    dead_code: true,
                    conditionals: true,
                    comparisons: true,
                    booleans: true,
                    hoist_funs: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                },
                report: 'gzip'
            },
            dist: {
                src: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.js',
                dest: '<%= dirs.dist %>/<%= pkg.name %>-v<%= grunt.file.readJSON("package.json").version %>.min.js'
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
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: false,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
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

    grunt.registerTask('minify', ['uglify']);
    grunt.registerTask('doc', ['yuidoc']);
    grunt.registerTask('test', ['qunit']);

    grunt.registerTask('dev', ['concat:dev']);
    grunt.registerTask('dist', ['bump', 'concat:dist', 'minify:dist']);

    grunt.registerTask('default');
};