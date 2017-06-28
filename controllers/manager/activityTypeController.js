var express = require('express');
var activityTypeController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

activityTypeController.get('/danhsachloaihoatdong',service.ensureAuthenticated,function(req,res){
	res.render("manager/loaihoatdong/danhsachloaihoatdong",{title:"Danh sách loại hoạt động",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
activityTypeController.get('/themloaihoatdong',service.ensureAuthenticated,function(req,res){
	res.render("manager/loaihoatdong/themloaihoatdong",{title:"Thêm loại hoạt động",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
activityTypeController.post('/themloaihoatdong',function(req,res){
	var actitype_name = req.body.actitype_name;
	var address = config.urladdress+'/api/activitytype/create/';
	var options = {
		url: address,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'authorization': config.securitycode + req.session.token },
		form:{
			actitype_name: actitype_name
		}
	};
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/loaihoatdong/danhsachloaihoatdong');
	});
});
activityTypeController.get('/capnhatloaihoatdong/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var address = config.urladdress + '/api/activitytype/getbyid/' +  id;
	var options = {
		url : address,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
	};
	service.get(options,function(error,data){
		if(error){
			return error;
		}
		else{
			dt = JSON.parse(data);
			activitytypedata = dt.data;
			res.render("manager/loaihoatdong/capnhatloaihoatdong",{title:"Cập nhật loại hoạt động",activitytypedata:activitytypedata,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
activityTypeController.post('/capnhatloaihoatdong',function(req,res){
	var token = config.securitycode + req.session.token;
	var actitype_id = req.body.actitype_id;
	var actitype_name = req.body.actitype_name;
	var address = config.urladdress + '/api/activitytype/update/' + actitype_id;
	var options = {
		method: 'PUT', //muon cap nhat du lieu phai them method la put
		url : address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
		form: {
			actitype_name: actitype_name
		}
	};
	service.put(options,function(error,data){
		if(error){
			return error;
		}
		else{
			res.redirect('/quantrac/quanly/loaihoatdong/danhsachloaihoatdong');
		}
	});
});
module.exports = activityTypeController;
