var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var commentController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


commentController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListComment", {title: 'Xem danh sách bình luận',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

commentController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/comment/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/binhluan/danhsach');
		}
	}); 
});

commentController.get('/traloi/:id',service.ensureAuthenticated,function(req,res){
	var id2 = req.params.id;
	res.render("admin/ListAnswerByComment", {title: 'Xem danh sách trả lời bình luận',id2,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

module.exports = commentController;