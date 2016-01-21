(function (module) {
	'use strict';

	module.exports = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.config('concat', {
			javascript: {
				src: ['src/js/**/*.js'],
				dest: 'dist/authentication-tools.js',
				force: true
			}
		});
	};

})(module);