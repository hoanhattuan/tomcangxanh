var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var postcategoryController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


postcategoryController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListPostCategory", {title: 'Xem danh sách danh mục bài viết',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// o

postcategoryController.get("/them",service.ensureAuthenticated, function(req, res) {
	res.render("admin/createPostCategory", {title: 'Thêm danh mục bài viết mới',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// postcategoryController.get('/danhsach',service.ensureAuthenticated,function(req,res){
// 	var token = "JWT " + req.session.token;
// 	var options = service.setOption('GET',config.urladdress + '/api/postCategory/getpagination?page=0&pageSize=100&keyword=',{'Authorization':token});
// 	service.get(options,function(error,data){
// 		if(error){
// 			return error;
// 		}else{
// 			data = JSON.parse(data);
// 			userData = data.data.Items;
// 			res.render('admin/ListPostCategory',{title:'Danh sách danh mục bài viết',users:userData, moment: moment,token:token});
// 		} 
// 	});
// });

// postcategoryController.get('/them', function(req, res) {
// 	console.log(req.session);
// 	token = "JWT " + req.session.token;
// 	res.render("admin/createPostCategory",{title:'Thêm danh mục bài viết mới',token:token,conf:config.urladdress,  moment: moment});
// });


postcategoryController.post('/them',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		postcate_name : req.body.postcate_name,
		postcate_description : req.body.postcate_description,
		postcate_picture : req.body.postcate_picture,
		postcate_createBy : req.session.username,
		postcate_isDelete :false,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/postCategory/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucbaiviet/danhsach');
		} 
	});
});

postcategoryController.get('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/postCategory/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/updatePostCategory',{title:'Sửa thông tin danh mục bài viết',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

postcategoryController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		postcate_name : req.body.postcate_name,
		postcate_description : req.body.postcate_description,
		postcate_picture : req.body.postcate_picture,
		postcate_updateBy : req.session.username,
		postcate_createBy :req.body.postcate_createBy,
		postcate_createDate: req.body.postcate_createDate,
		postcate_isDelete :false,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/postCategory/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucbaiviet/danhsach');
		} 
	});
});


postcategoryController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/postCategory/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucbaiviet/danhsach');
		}
	}); 
});

postcategoryController.get('/xemthem/:id',service.ensureAuthenticated,function(req,res){
			var id = req.params.id;
			res.render('admin/ListPost',{title:'Danh sách bài viết theo danh mục',id,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		
	
});

module.exports = postcategoryController;