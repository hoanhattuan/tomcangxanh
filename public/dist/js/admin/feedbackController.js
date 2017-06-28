var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var feedbackController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');

feedbackController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListFeedback", {title: 'Xem danh sách phản hồi',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

feedbackController.get("/them",service.ensureAuthenticated, function(req, res) {
	res.render("admin/sendFeedback", {title: 'Thêm phản hồi',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

feedbackController.post('/them',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		feedback_name : req.body.feedback_name,
		feedback_email : req.body.feedback_email,
		feedback_message :req.body.feedback_message,
		feedback_status : req.body.feedback_status,
	}; 

	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/feedback/sendfeedback' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/phanhoi/danhsach');
		} 
	});
});

// feedbackController.get('/danhsachphanhoi',service.ensureAuthenticated,function(req,res){
// 	var token = "JWT " + req.session.token;
// 	var options = service.setOption('GET',config.urladdress + '/api/feedback/getpagination?page=0&pageSize=100&keyword=',{'Authorization':token});
// 	service.get(options,function(error,data){
// 		if(error){
// 			return error;
// 		}else{
// 			data = JSON.parse(data);
// 			userData = data.data.Items;
// 			res.render('admin/ListFeedback',{title:'Danh sách phản hồi',users:userData, moment: moment});
// 		} 
// 	});
// });

feedbackController.get('/traloi/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/feedback/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/replyFeedback',{title:'Trả lời phản hồi',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

feedbackController.post('/traloi/:id',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_id : req.session.userid,
		feedback_name : req.body.feedback_name,
		feedback_email : req.body.feedback_email,
		feedback_message :req.body.feedback_message,
		feedback_status : req.body.feedback_status,
		feedback_answerContent : req.body.feedback_answerContent,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/feedback/replyfeedback/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/phanhoi/danhsach');
		} 
	});
});

feedbackController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		feedback_name : req.body.feedback_name,
		feedback_email : req.body.feedback_email,
		feedback_message :req.body.feedback_message,
		feedback_status : req.body.feedback_status,
		feedback_answerContent : req.body.feedback_answerContent,
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/feedback/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/phanhoi/danhsach');

		}
	}); 
});

module.exports = feedbackController;