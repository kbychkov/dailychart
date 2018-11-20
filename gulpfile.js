const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const umd = require('gulp-umd');

gulp.task('js', () => {
  return gulp.src('src/dailychart.js')
    .pipe(babel())
    .pipe(umd())
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/*.js', gulp.parallel('js'));
});

gulp.task('default', gulp.series('js', 'watch'));
