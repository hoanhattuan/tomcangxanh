var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var userController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


/* GET home page. */
userController.get('/taonguoidung', function(req, res) {
	console.log(req.session);
	res.render("admin/createUser");
});

userController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListUser", {title: 'Xem danh sách người dùng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});


userController.get('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/user/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/updateuser',{title:'Sửa thông tin người dùng',moment:moment,users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});

userController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_fullName : req.body.user_fullName,
		user_userName : req.body.user_userName,
		user_birthday :req.body.user_birthday,
		user_phone : req.body.user_phone,
		user_email : req.body.user_email,
		user_address :req.body.user_address,
		user_onlineStatus :req.body.user_onlineStatus,
		user_sendSms : req.body.user_sendSms,
		role_id: req.body.role_id
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/user/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/nguoidung/danhsach');
		} 
	});
});

userController.get('/them', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	res.render("admin/createUser",{title:'Thêm người dùng mới',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});


userController.post('/them',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_fullName : req.body.user_fullName,
		user_userName : req.body.user_userName,
		user_password : req.body.user_password,
		user_birthday :req.body.user_birthday,
		user_phone : req.body.user_phone,
		user_email : req.body.user_email,
		user_address :req.body.user_address,
		user_sendSms : req.body.user_sendSms,
		role_id: req.body.role_id
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/user/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/nguoidung/danhsach');
		} 
	});
});

userController.get('/khoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		user_fullName : req.body.user_fullName,
		user_userName : req.body.user_userName,
		user_birthday :req.body.user_birthday,
		user_phone : req.body.user_phone,
		user_email : req.body.user_email,
		user_address :req.body.user_address,
		user_onlineStatus :req.body.user_onlineStatus,
		user_sendSms : req.body.user_sendSms,
		role_id: req.body.role_id
	};
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/user/clockuser/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/nguoidung/danhsach');

		}
	}); 
});

userController.get('/mokhoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		user_fullName : req.body.user_fullName,
		user_userName : req.body.user_userName,
		user_birthday :req.body.user_birthday,
		user_phone : req.body.user_phone,
		user_email : req.body.user_email,
		user_address :req.body.user_address,
		user_onlineStatus :req.body.user_onlineStatus,
		user_sendSms : req.body.user_sendSms,
		role_id: req.body.role_id
	};
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/user/unclockuser/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/nguoidung/danhsach');

		}
	}); 
});





module.exports = userController;