module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: [
              './**/{LICENSE,*.js,*.html,*.css,*.png,*.json,*.svg,*.otf,*.eot,*.ttf,*.woff,*.woff2,*.ico}',
              '!./webui-aria2/screenshots/**',
              '!./**/.git/**',
              '!./**/node_modules/**',
              '!./dist/**',
              '!./**/Gruntfile.{js,coffee}',
              '!./**/package.json',
              '!./webui-aria2/favicon.ico'
            ],
            dest: 'dist/'
          },
        ]
      },
    },
    sync: {
      main: {
        files: [
          {
            src: [
              './**/{LICENSE,*.js,*.html,*.css,*.png,*.json,*.svg,*.otf,*.eot,*.ttf,*.woff,*.woff2,*.ico}',
              '!./webui-aria2/screenshots/**',
              '!./**/.git/**',
              '!./**/node_modules/**',
              '!./dist/**',
              '!./**/Gruntfile.{js,coffee}',
              '!./**/package.json',
              '!./webui-aria2/favicon.ico'
            ],
            dest: 'dist/'
          },
        ],
        verbose: true,
        updateAndDelete: true
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-sync');
}