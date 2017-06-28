var express = require('express');
var pondController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

pondController.get('/danhsachao',service.ensureAuthenticated,function(req,res){
	res.render("manager/ao/danhsachao",{title:"Danh sách ao",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
pondController.get('/themao',service.ensureAuthenticated,function(req,res){
	var token = req.session.token;
	res.render("manager/ao/themao",{title:"Thêm ao",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
pondController.post('/themao',function(req,res){
	var region_id = req.body.region_id;
	var user_id = req.body.user_id;
	var pond_width = req.body.pond_width;
	var pond_height = req.body.pond_height;
	var pond_depth = req.body.pond_depth;
	var pond_description = req.body.pond_description;
	var pond_location = req.body.pond_location;
	var pond_address = req.body.pond_address;
	var address = config.urladdress+'/api/pond/create/';
	var options = {
		url: address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			region_id : region_id,
			user_id : user_id,
			pond_width : pond_width,
			pond_height : pond_height,
			pond_depth : pond_depth,
			pond_description : pond_description,
			pond_location : pond_location,
			pond_address : pond_address
		}
	};
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/ao/danhsachao');
	});
});
pondController.get('/capnhatao/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var address = config.urladdress + '/api/pond/getbyid/' +  id;
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
			ponddata = dt.data;
			res.render("manager/ao/capnhatao",{title:"Cập nhật thông tin ao",ponddata:ponddata,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
pondController.post('/capnhatao',function(req,res){
	var token = config.securitycode + req.session.token;
	var pond_id = req.body.pond_id;
	var region_id = req.body.region_id;
	var user_id = req.body.user_id;
	var pond_width = req.body.pond_width;
	var pond_height = req.body.pond_height;
	var pond_depth = req.body.pond_depth;
	var pond_description = req.body.pond_description;
	var pond_location = req.body.pond_location;
	var pond_status = req.body.pond_status;
	var pond_address = req.body.pond_address;
	var address = config.urladdress + '/api/pond/update/' + pond_id;
	var options = {
		method: 'PUT', //muon cap nhat du lieu phai them method la put
		url : address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
		form: {
			region_id : region_id,
			user_id : user_id,
			pond_width : pond_width,
			pond_height : pond_height,
			pond_depth : pond_depth,
			pond_width : pond_width,
			pond_description : pond_description,
			pond_location : pond_location,
			pond_status : pond_status,
			pond_address : pond_address
		}
	};
	service.put(options,function(error,data){
		if(error){
			return error;
		}
		else{
			res.redirect('/quantrac/quanly/ao/danhsachao');
		}
	});
});
module.exports = pondController;
