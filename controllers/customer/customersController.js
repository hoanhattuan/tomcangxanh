var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var cusController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


 // customersController.get('/',function(req,res){
 // res.render('userLayout', { title: 'Trang chá»§'});
 // });
//customersController.get('/themphanhoi', function(req, res) {
//	console.log(req.session);
//	res.render('users/sendFeedback', { title: 'ThÃªm pháº£n há»“i'});
//});
cusController.get('/themphanhoi', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	res.render('users/sendFeedback', {title:'Thêm phản hồi',token:token});
});

cusController.post('/themphanhoi',function(req,res){
	console.log('Vao trong ruot');
	var token = "" ;
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
			res.redirect('/trangchu/themphanhoi');
		} 
	});
})
cusController.get('/gioithieu', function(req, res) {
	res.render('users/Introduce', { title: 'Giới thiệu',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
cusController.get('/baiviet', function(req, res) {
	res.render('users/Post', { title: 'Bài viết',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

cusController.get('/sanpham', function(req, res) {
	res.render('users/Product', { title: 'Sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

cusController.get('/chitietbaiviet/:id',function(req,res){
	//var token = "JWT " + req.session.token;
	var token ="";
	var id = req.params.id; 
	var options = service.setOption('GET', 'http://103.221.220.184:3000/api/post/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render("users/PostDetail", {title: 'Chi tiáº¿t bÃ i viáº¿t ',moment:moment,users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

cusController.post('/thembinhluan/:id',function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		comment_commentByName : req.body.comment_commentByName,
		post_id : req.body.post_id,
		comment_content : req.body.comment_content,
		comment_commentByEmail :req.body.comment_commentByEmail
	}; 

	//console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/comment/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			var post = req.body.post_id;
			res.redirect('/khachhang/tintuc/chitietbaiviet/'+post);
			
		} 
	});
});

cusController.post('/themsanpham',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		postcate_id : 27,
		user_id : req.session.userid,
		post_title : req.session.username +' '+ req.body.post_title,
		post_content : req.body.post_content,
		post_createBy : req.session.username,
		post_isDelete :false,
		post_isPublic: true,
		

	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/post/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			var post = req.body.post_id;
			res.redirect('/khachhang/sanpham');
			
		} 
	});
});


cusController.post('/themtraloi/:id',function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		anscom_answreByName : req.body.anscom_answreByName,
		comment_id : req.body.comment_id,
		anscom_content : req.body.anscom_content,
		anscom_answerByEmail :req.body.anscom_answerByEmail
	}; 

	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/answercomment/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			var post = req.body.post_id;
			res.redirect('/khachhang/tintuc/chitietbaiviet/'+post);
			
		} 
	});
})

module.exports = cusController;