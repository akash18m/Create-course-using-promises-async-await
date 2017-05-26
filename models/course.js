var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var DBcourse = new mongoose.Schema({
  name: String,
  position: Number,
  duration: Number,
  updated_at: { type: Date, default: Date.now },
});

var DBsection = new mongoose.Schema({
  name: String,
  position: Number,
  duration: Number,
  course_id: ObjectId,
  updated_at: { type: Date, default: Date.now },
});

var DBlesson = new mongoose.Schema({
  name: String,
  position: Number,
  duration: Number,
  section_id: ObjectId,
  updated_at: { type: Date, default: Date.now },
});


var course = mongoose.model('course', DBcourse);
var section = mongoose.model('section', DBsection);
var lesson = mongoose.model('lesson', DBlesson);

module.exports = {
  course,
  section,
  lesson,
};