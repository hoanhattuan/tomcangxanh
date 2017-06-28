var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var newsController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');

newsController.get('/', function(req, res) {
	res.render('users/Post', { title: 'Bài viết',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

newsController.get('/chitietbaiviet/:id',function(req,res){
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
			res.render("users/PostDetail", {title: 'Chi tiết bài viết ',moment: moment,users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

module.exports = newsController;