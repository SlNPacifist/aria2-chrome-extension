module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sync: {
      main: {
        files: [
          {
            cwd: 'src',
            src: [
              '**/{LICENSE,*.png,*.json,*.svg,*.ico}',
              '!webui-aria2/screenshots/**',
              '!**/.git/**',
              '!webui-aria2/flags/**',
              '!webui-aria2/fonts/**'
            ],
            dest: 'dist/'
          },
          {
            cwd: 'src',
            src: [
              'webui-aria2/flags/**/{us,th,nl,cn,pl,fr,de}.svg',
              '!**/.git/**',
            ],
            dest: 'dist/'
          },
          {
            cwd: 'src',
            src: 'webui-aria2/fonts/fontawesome-webfont.woff2',
            dest: 'dist/'
          },
        ],
        verbose: true,
        updateAndDelete: true
      },
    },
    uglify: {
      main: {
        files: [{
            expand: true,
            cwd: 'src',
            src: ['**/*.js', '!**/.git/**'],
            dest: 'dist'
        }]
      }
    },
    cssmin: {
      main: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.css', '!**/.git/**', '!webui-aria2/css/font-awesome.css'],
          dest: 'dist'
        }]
      }
    },
    htmlmin: {
      main: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.html', '!**/.git/**'],
          dest: 'dist'
        }]
      },
    }
  });

  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.registerTask('combine', ['sync', 'uglify', 'cssmin', 'htmlmin']);
}