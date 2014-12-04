'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      api: ['config/**/*.js', 'libs/**/*.js', 'client/model/**/*.js', 'client/routes/**/*.js', '*.js'],
      test: ['test/*.js', 'test/helpers/*.js', 'test/routes/*.js']
    },

    mochaTest: {
      options: {reporter: 'spec', timeout: 10000},
      unit: {
        src: ['test/*.js']
      },
      routes: {
        options: {slow: 300},
        src: ['test/routes/**/*.js']
      }
    },

    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      },
      test: {
        NODE_ENV: 'test'
      },
      testLocal: {
        NODE_ENV: 'testLocal'
      },
      coverage: {
        NODE_ENV: 'testLocal',
        APP_DIR_FOR_CODE_COVERAGE: '../coverage/instrument/'
      }
    },

    watch: {
      lint: {
        files: '<%= jshint.files.src %>',
        tasks: 'jshint'
      },
      test: {
        files: ['test/unit/*.js'],
        tasks: ['jshint', 'mochaTest:unit']
      }
    },

    nodemon: {
      dev: {
        script: 'bin/www',
        options: {
          ext: 'js,json'
        }
      }
    },

    concurrent: {
      target: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    /*Coverage*/
    instrument: {
      files: ['api/routes/*.js', 'api/model/*.js', 'libs/*.js', 'config/*.js', 'bin/*', 'app.js'],
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument/'
      }
    },

    clean: {
      coverage: {
        src: ['test/coverage/']
      }
    },

    copy: {
      configs: {
        expand: true,
        flatten: true,
        src: ['config/*.json'],
        dest: 'test/coverage/instrument/config'
      },
      views: {
        expand: true,
        flatten: true,
        src: ['client/views/*.ejs'],
        dest: 'test/coverage/instrument/client/views'
      }
    },

    storeCoverage: {
      options: {
        dir: 'test/coverage/reports'
      }
    },

    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail'
      }
    }

  });

  // tasks
  grunt.registerTask('server', ['concurrent:target']);
  grunt.registerTask('default', ['env:dev', 'jshint', 'server']);
  grunt.registerTask('test', ['env:test', 'mochaTest:unit', 'mochaTest:routes', 'env:dev']);
  grunt.registerTask('testLocal', ['env:testLocal', 'mochaTest:unit', 'mochaTest:routes', 'env:dev']);
  grunt.registerTask('coverage',
    ['jshint', 'clean', 'copy:configs', 'copy:views', 'env:coverage',
      'instrument', 'mochaTest:unit', 'mochaTest:routes',
      'storeCoverage', 'makeReport']);
};