var express = require('express');
var userController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');
var datetime = require('node-datetime');

userController.get('/xemthongtincanhan/:id',service.ensureAuthenticated, function(req, res) {
	var token = config.securitycode + req.session.token;
	if(req.params.id == req.session.userid){
		var id = req.params.id;
		var url = config.urladdress+'/api/user/getbyid/'+id;
		var options = service.setGetHeader(url,{'Authorization':token});
		service.get(options,function(error,data){
			if(error){
				return error;
			}
			else{
				uData = JSON.parse(data);
				userData = uData.data;
				res.render("expert/nguoidung/xemthongtincanhan",{title:'Xem thông tin cá nhân',userData:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
			}
		});
	}
	else{
		res.redirect('/quantrac/chuyengia');
	}
});
userController.post('/capnhatthongtincanhan', function(req, res) {
	var user_id = req.body.user_id;
	var user_fullName = req.body.user_fullName;
	var user_userName = req.body.user_userName;
	var datenow = datetime.create(req.body.user_birthday);
	var formatted = datenow.format('Y/d/m'); /*Do thu vien convert sai nen phai dua thang thay ngay va ngay thay cho thang*/
	var user_birthday = formatted;
	var user_phone = req.body.user_phone;
	var user_email = req.body.user_email;
	var user_address = req.body.user_address;
	var role_id = req.body.role_id;
	var user_levelManager = req.body.user_levelManager;
	var address = config.urladdress + "/api/user/update/" + user_id;
	var token = config.securitycode + req.session.token;
	var options = {
		method: 'PUT',
		url: address,
		headers:
		{
			'content-type': 'application/x-www-form-urlencoded',
			'authorization': token
		},
		form:
		{
			user_id : user_id,
			user_fullName : user_fullName,
			user_userName : user_userName,
			user_birthday : user_birthday,
			user_phone : user_phone,
			user_email : user_email,
			user_address : user_address,
			role_id : role_id,
			user_levelManager : user_levelManager
		}
	};
	service.put(options,function(error,data){
		if (error){
	  		throw new Error(error);
	  }
		console.log(data);
		res.redirect('/quantrac/chuyengia');
	});
});
userController.get('/capnhatmatkhau/:id',service.ensureAuthenticated, function(req, res) {
	if(req.params.id == req.session.userid){
		res.render("expert/nguoidung/capnhatmatkhau",{title:'Cập nhật mật khẩu',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
	}
	else{
		res.redirect('/quantrac/chuyengia');
	}

});
userController.post('/capnhatmatkhau', function(req, res) {
	var user_id = req.body.user_id;
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var comparePassword = req.body.comparePassword;
	var address = config.urladdress + "/api/user/changepassword/" + user_id;
	var token = config.securitycode + req.session.token;
	var options = {
		method: 'PUT',
		url: address,
		headers:
		{
			'content-type': 'application/x-www-form-urlencoded',
			'authorization': token
		},
		form:
		{
			oldPassword : oldPassword,
			newPassword : newPassword,
			comparePassword : comparePassword
		}
	};
	service.put(options,function(error,data){
		if (error){
	  		throw new Error(error);
	  }
		console.log(data);
		res.redirect('/quantrac/chuyengia');
	});
});
module.exports = userController;
