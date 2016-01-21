(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.config('uglify', {
			bundle: {
				files: [{
					src: ['dist/authentication-tools.js'],
					dest: 'dist/authentication-tools.min.js'
				}]
			}
		});
	};

})(module);