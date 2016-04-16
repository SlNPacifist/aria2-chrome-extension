module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sync: {
      main: {
        files: [
          {
            cwd: 'src',
            src: [
              '**/{LICENSE,*.js,*.html,*.css,*.png,*.json,*.svg,*.otf,*.eot,*.ttf,*.woff,*.woff2,*.ico}',
              '!webui-aria2/screenshots/**',
              '!**/.git/**',
              '!webui-aria2/favicon.ico'
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