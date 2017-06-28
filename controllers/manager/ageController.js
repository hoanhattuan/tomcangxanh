var express = require('express');
var ageController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

ageController.get('/danhsachdotuoi',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var address = config.urladdress+'/api/age/getall';
	var options = {
		url: address, //duong dan se lay du lieu
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'Authorization': token} //set headers
	};
	service.get(options,function(error,data){
		if(error){
			return error;
		}
		else{
			dt = JSON.parse(data);
			agedata = dt.data;
			res.render("manager/dotuoi/danhsachdotuoi",{title:"Danh sách độ tuổi của tôm",agedata:agedata,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
ageController.get('/themdotuoi',service.ensureAuthenticated,function(req,res){
	var token = req.session.token;
	res.render("manager/dotuoi/themdotuoi",{title:"Thêm độ tuổi của tôm",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
ageController.post('/themdotuoi',function(req,res){
	var age_valueMin = req.body.age_valueMin;
	var age_valueMax = req.body.age_valueMax;
	var age_description = req.body.age_description;
	var address = config.urladdress+'/api/age/create/';
	var options = {
		url: address,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'authorization': config.securitycode + req.session.token },
		form:{
			age_valueMin: age_valueMin,
			age_valueMax: age_valueMax,
			age_description: age_description
		}
	};
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/dotuoi/danhsachdotuoi');
	});
});
ageController.get('/capnhatdotuoi/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var address = config.urladdress + '/api/age/getbyid/' +  id;
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
			agedata = dt.data;
			res.render("manager/dotuoi/capnhatdotuoi",{title:"Cập nhật độ tuổi của tôm",agedata:agedata,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
ageController.post('/capnhatdotuoi',function(req,res){
	var token = config.securitycode + req.session.token;
	var age_id = req.body.age_id;
	var age_valueMin = req.body.age_valueMin;
	var age_valueMax = req.body.age_valueMax;
	var age_description = req.body.age_description;
	var address = config.urladdress + '/api/age/update/' + age_id;
	var options = {
		method: 'PUT', //muon cap nhat du lieu phai them method la put
		url : address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
		form: {
			age_valueMin: age_valueMin,
			age_valueMax: age_valueMax,
			age_description: age_description
		}
	};
	service.put(options,function(error,data){
		if(error){
			return error;
		}
		else{
			res.redirect('/quantrac/quanly/dotuoi/danhsachdotuoi');
		}
	});
});
module.exports = ageController;