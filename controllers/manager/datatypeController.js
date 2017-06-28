var express = require('express');
var datatypeController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

datatypeController.get('/danhsachloaidulieu',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var address = config.urladdress+'/api/datatype/getall';
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
			// console.log(data);
			dt = JSON.parse(data);
			datatype = dt.data;
			res.render("manager/loaidulieu/danhsachloaidulieu",{title:"Danh sách loại dữ liệu",dataty:datatype,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
	// console.log(options);
});
datatypeController.get('/themloaidulieu',service.ensureAuthenticated,function(req,res){
	var token = req.session.token;
	res.render("manager/loaidulieu/themloaidulieu",{title:"Thêm loại dữ liệu",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
datatypeController.post('/themloaidulieu',function(req,res){
	var datatype_id = req.body.datatype_id;
	var datatype_name = req.body.datatype_name;
	var datatype_description = req.body.datatype_description;
	var datatype_unit = req.body.datatype_unit;
	var address = config.urladdress+'/api/datatype/create/';
	var options = {
		url: address,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'authorization': config.securitycode + req.session.token },
		form:{
			datatype_id:datatype_id,
			datatype_name: datatype_name,
			datatype_description: datatype_description,
			datatype_unit: datatype_unit
		}
	};
	console.log(options);
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/loaidulieu/danhsachloaidulieu');
	});
});
datatypeController.get('/capnhatloaidulieu/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var address = config.urladdress + '/api/datatype/getbyid/' +  id;
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
			datatype = dt.data;
			res.render("manager/loaidulieu/capnhatloaidulieu",{title:"Cập nhật loại dữ liệu",dttype:datatype,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
datatypeController.post('/capnhatloaidulieu',function(req,res){
	var token = config.securitycode + req.session.token;
	var datatype_id = req.body.datatype_id;
	var address = config.urladdress + '/api/datatype/update/'+datatype_id;
	var datatype_name = req.body.datatype_name;
	var datatype_description = req.body.datatype_description;
	var datatype_unit = req.body.datatype_unit;
	var options = {
		method: 'PUT', //muon cap nhat du lieu phai them method la put
		url : address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
		form: {
			datatype_name: datatype_name,
			datatype_description : datatype_description,
			datatype_unit: datatype_unit
		}
	};
	service.put(options,function(error,data){
		if(error){
			return error;
		}
		else{
			res.redirect('/quantrac/quanly/loaidulieu/danhsachloaidulieu');
		}
	});
});
module.exports = datatypeController;