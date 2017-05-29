var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var DB = require('../models/course.js');


router.get('/',function(req,res,next)
{
	DB.course.find(function (err, data) 
	{
    	if (err) return next(err);
    	res.json(data);
  	});
});

router.get('/sections',function(req,res,next)
{
	DB.section.find(function (err, data) 
	{
    	if (err) return next(err);
    	res.json(data);
  	});
});

router.get('/lessons',function(req,res,next)
{
	DB.lesson.find(function (err, data) 
	{
    	if (err) return next(err);
    	res.json(data);
  	});
});



router.post('/',function(req,res,next)
{
	var cname = req.body.name;
	var sections = req.body.sections;
	var c_obj = {
		name : cname,
	    position : 1,
		duration : 0,
	}
	var course_id;
	DB.course.create(c_obj,function (err, data) 
	{
    	if (err) return next(err);
    	course_id = data._id;
    	add_sections(sections,course_id)
    	res.json(null);
  	});
});

router.post('/addSection',function(req,res,next)
{
	var sections = req.body.sections;
	var course_id = req.body.course_id;
	
	add_sections(sections,course_id)
	res.json(null);
});


router.post('/addLesson',async function(req,res,next)
{
	var lessons = req.body.lessons;
	var section_id = req.body.section_id;
	var course_id;
	var arr = await add_lessons(lessons,section_id,0)
	DB.section.findById(section_id,function(err,data){
		course_id = data.course_id;
		update_c_duration([arr[0] , course_id])
	})
	res.json(null);	
});

router.delete('/delete/:course_id',async function(req,res,next)
{
	var course_ID = req.params.course_id;
	await DB.section.find({course_id : course_ID},function(err,data){
		for(i in data){
			var section_ID = data[i]._id;
			DB.lesson.remove({section_id : section_ID},function(err,data){

			})
			DB.section.remove({_id : section_ID},function(err,data){

			})
		}
	})
	DB.course.remove({_id : course_ID},function(err,data){
	
	})
	res.json(null);

});

router.delete('/deleteSection/:section_id',async function(req,res,next)
{
	var section_ID = req.params.section_id;
	var s_duration = 0;
	await DB.lesson.find({section_id : section_ID},function(err,data){
		for(i in data){
			s_duration += data[i].duration;
			DB.lesson.remove({_id : data[i]._id},function(err,data){

			})
		}
	})
	
	var course_ID;
	DB.section.find({_id : section_ID},function(err,data){
		course_ID = data[0].course_id;
		DB.section.remove({_id : data[0]._id},function(err,data){
			update_c_duration([-s_duration , course_ID])
			res.json(null);
		})
	})
});

router.delete('/deleteLesson/:lesson_id',async function(req,res,next)
{
	var lesson_ID = req.params.lesson_id;
	var section_ID;
	var duration = 0;
	await DB.lesson.find({_id : lesson_ID},function(err,data){
		duration = data[0].duration;
		section_ID = data[0].section_id;
		DB.lesson.remove({_id : data[0]._id},function(err,data){
			
		})
	})
	var course_ID;
	DB.section.find({_id : section_ID},function(err,data){
		course_ID = data[0].course_id;
		update_s_duration([-duration , section_ID])
		update_c_duration([-duration , course_ID])
		res.json(null);
	})
});


module.exports = router;

let update_s_duration = (arr) => {
    return new Promise(
        (resolve, reject) => {
        	s_duration = arr[0];
        	section_id = arr[1];
        	DB.section.findByIdAndUpdate(section_id,{$inc: {duration : s_duration}},function (err, data) 
			{
				if(err) return reject(err);
				resolve([s_duration]);
    		});
    		
        }
    );
};

let update_c_duration = (arr) => {
    return new Promise(
        (resolve, reject) => {
        	c_duration = arr[0];
        	course_id = arr[1];
        	DB.course.findByIdAndUpdate(course_id,{$inc: {duration : c_duration}},function (err, data) 
			{
	    		if (err) return reject(err);
	    	});
    		
        }
    );
};

var count=[]; 
var count1;

let create_section = (sections,course_ID,i) => {
    return new Promise(
        (resolve , reject) => {
        	var s_duration = 0;
			var sname = sections[i].name;
			var s_obj = {
				name : sname,
				position : i,
				duration : 0,
				course_id : course_ID,
			}
			var section_id;
			DB.section.create(s_obj,
				async (err, data_s) => {
					try{
						//if (err) return next(err);
						section_id = data_s._id;
						var lesson = sections[i].lessons;
						var arr = await add_lessons(lesson,section_id,i)
						resolve(arr);
					}
					catch(e){
						reject(e);
					}
				});
			
        }
    );
};

let add_sections = (sections,course_id) => {
    return new Promise(
        async (resolve, reject) => {
        	try{
        		var c_duration=0;
	        	count1=0;
	            for(i in sections)
				{
					var flag = false;
					console.log("in "+i);
					var arr = await create_section(sections,course_id,i);
					c_duration += arr[0];
					count1++;
					if(count1 == sections.length){
		        		flag = true;
		        	}
		        	if(flag){
						update_c_duration([c_duration,course_id]);
					}
				}
			} catch (e) {
		        // This will catch exceptions from DoSomethingThatThrows
		    }	
        }
    );
};

let create_lesson = (lesson,section_ID,j,i) => {
    return new Promise(
        (resolve , reject) => {
            var flag=false;
            var l_obj = {
                name : lesson[j].name,
                position : j,
                duration : lesson[j].duration,
                section_id : section_ID,
            };
            DB.lesson.create(l_obj,function(err , data_l)
            {
                //if(err) return reject(err);
                count[i]++;
	            if(count[i] == lesson.length)
	            {
	                flag=true;
	            }
                resolve([data_l.duration,flag]);
            });
        }
    );
};

let add_lessons = (lesson,section_ID,i) => {
    return new Promise(
        async (resolve, reject) => {
        	try{
        		var j;
	        	count[i]=0;
				var s_duration=0;
	            for(j in lesson)
				{
					var arr = await create_lesson(lesson,section_ID,j,i)
	          	    s_duration+=arr[0];
	          	    if(arr[1])
	                {
	                    var arr = await update_s_duration([s_duration,section_ID]);
	                    resolve([arr[0]]);
	                }
	            }
	        } catch (e) {
		       console.log(e);
		    }
        });
};
