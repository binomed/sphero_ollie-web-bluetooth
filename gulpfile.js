"use strict";
// Include gulp
var fs = require("fs");
var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps")
var path = require("path");
var browserSync = require("browser-sync").create();
var sass = require('gulp-sass');

var browserify = require("browserify");
var source = require('vinyl-source-stream');
var reload = browserSync.reload;

gulp.task('watch',['browserify', 'sass'], function(){
  browserSync.init({
     server:'./'
  });
  gulp.watch("./sass/**/*.scss", ['sass']);
  gulp.watch("./scripts/**/*.js", ['browserify']);  
  gulp.watch("./**/*.html").on('change', reload);  
  gulp.watch("./bundle.js").on('change', reload);
});

gulp.task('sass',function(){
  return gulp.src('./sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass()).on('error', function logError(error) {
      console.error(error);
  })
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./css'))
  .pipe(reload({stream:true}));  
});

gulp.task('browserify',function(){
  return browserify(['./scripts/app.js'], {debug:true})
    .bundle()    
    .on('error', function(err){
      console.log(err);
      this.emit('end');
    })    
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./'));
});


/* Default task */
gulp.task("default", ["watch"]);
