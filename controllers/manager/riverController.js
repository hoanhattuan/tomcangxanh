var express = require('express');
var riverController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

riverController.get('/danhsachtramsong',service.ensureAuthenticated,function(req,res){
	res.render("manager/song/danhsachtramsong",{title:"Danh sách trạm sông",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
riverController.get('/themtramsong',service.ensureAuthenticated,function(req,res){
	res.render("manager/song/themtramsong",{title:"Thêm trạm sông",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
riverController.post('/themtramsong',service.ensureAuthenticated,function(req,res){
	var river_name = req.body.river_name;
	var region_id = req.body.region_id;
	var river_location = req.body.river_location;
	var river_description = req.body.river_description;
	var options = {
		method: 'POST',
		url: config.urladdress + '/api/river/create',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			river_name: river_name,
			region_id: region_id,
			river_location: river_location,
			river_description: river_description,
		}
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		res.redirect('/quantrac/quanly/song/danhsachtramsong');
	});
});
riverController.get('/capnhattramsong/:id',service.ensureAuthenticated,function(req,res){
	var id = req.params.id;
	var rData,riverData;
	var options = {
		url: config.urladdress + '/api/river/getbyid/' + id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
	};
	service.get(options,function(error,data){
		if (error) throw new Error(error);
		rData = JSON.parse(data);
		riverData = rData.data;
		res.render("manager/song/capnhattramsong",{title:"Cập nhật trạm sông",riverData:riverData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
	});
});
riverController.post('/capnhattramsong',service.ensureAuthenticated,function(req,res){
  var river_id = req.body.river_id;
  var river_name = req.body.river_name;
	var region_id = req.body.region_id;
	var river_location = req.body.river_location;
	var river_description = req.body.river_description;
	var options = {
		method: 'PUT',
		url: config.urladdress + '/api/river/update/' + river_id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			river_name: river_name,
			region_id: region_id,
			river_location: river_location,
			river_description: river_description,
		}
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		res.redirect('/quantrac/quanly/song/danhsachtramsong');
	});
});
module.exports = riverController;
