(function () {

  var gulp = require('gulp'),
      jshint = require('gulp-jshint'),
      jasmine = require('gulp-jasmine');

  gulp.task('jshint', function () {
    return gulp.src(['src/**/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });

  gulp.task('jasmine', ['jshint'], function () {
    return gulp.src(['test/**/*-test.js'])
      .pipe(jasmine());
  });

  gulp.task('default', ['jasmine']);

} ());