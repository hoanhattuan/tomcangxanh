var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var postController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');

postController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListPost", {title: 'Xem danh sách bài viết',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// o

postController.get("/them",service.ensureAuthenticated, function(req, res) {
	res.render("admin/createPost", {title: 'Thêm bài viết mới',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// postController.get('/danhsach',service.ensureAuthenticated,function(req,res){
// 	var token = "JWT " + req.session.token;
// 	var options = service.setOption('GET',config.urladdress + '/api/post/getpagination?page=0&pageSize=100&keyword=',{'Authorization':token});
// 	service.get(options,function(error,data){
// 		if(error){
// 			return error;
// 		}else{
// 			data = JSON.parse(data);
// 			userData = data.data.Items;
// 			console.log(userData);
// 			res.render('admin/ListPost',{title:'Danh sách bài viết',users:userData, moment: moment,token:token});
// 		} 
// 	});
// });

// postController.get('/them', function(req, res) {
// 	console.log(req.session);
// 	token = "JWT " + req.session.token;
// 	res.render("admin/createPost",{title:'Thêm bài viết mới',token:token,conf:config.urladdress,  moment: moment});
// });


postController.post('/them',function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_id : req.session.userid,
		post_description: req.body.post_description,
		postcate_id : req.body.postcate_id,
		post_title : req.body.post_title,
		post_content : req.body.post_content,
		post_smallPicture : req.body.post_smallPicture,
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
			res.redirect('/quantrac/nguoiquantri/baiviet/danhsach');
		} 
	});
});

postController.get('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/post/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render("admin/updatePost", {title: 'Cập nhật thông tin bài viết ',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

postController.post('/sua/:id',function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_id : 1,
		postcate_id : req.body.postcate_id,
		post_title : req.body.post_title,
		post_description:req.body.post_description,
		post_content : req.body.post_content,
		post_smallPicture : req.body.post_smallPicture,
		post_createBy : req.body.post_createBy,
		post_createDate : req.body.post_createDate,
		post_updateBy : req.session.username,
		post_isDelete :false,
		post_isPublic: true,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/post/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/baiviet/danhsach');
		} 
	});
});


postController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/post/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/baiviet/danhsach');
		}
	}); 
});

postController.get('/traloi/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/answercomment/getbycomment/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/ListAnswerComment',{title:'Danh sách trả lời bình luận',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

module.exports = postController;