var express = require('express');
var mongoose = require('mongoose');
var createCourse = require('./routes/createCourse.js');
var app=express();
var bodyParser = require('body-parser');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.Promise = global.Promise;
// connect to MongoDB
mongoose.connect('mongodb://localhost/Node1')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/createCourse',createCourse);

var server = app.listen(2000,function(req,res)
{
	console.log('server started successfully');
});
