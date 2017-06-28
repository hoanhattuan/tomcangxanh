var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var prodController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');

prodController.get('/', function(req, res) {
	res.render('users/Product', { title: 'Sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

prodController.post('/themsanpham',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		postcate_id : 27,
		post_description :req.body.post_description,
		user_id : req.session.userid,
		post_title : 'Rao bán tôm',
		post_content : req.body.post_content +' Số điện thoại liên hệ: '+ req.body.post_title,
		post_createBy : req.session.username,
		post_smallPicture: req.body.post_smallPicture,
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

module.exports = prodController;