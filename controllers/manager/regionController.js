var express = require('express');
var regionController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');
/* Them vung. */
regionController.get('/themvung',service.ensureAuthenticated, function(req, res) {
	res.render("manager/vung/themvung",{title:'Thêm vùng mới',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
regionController.post('/themvung', function(req, res) {
	var region_id = req.body.region_id;
	var region_name = req.body.region_name;
	var region_description = req.body.region_description;
	var ward_id = req.body.ward_id;
	var options = {
		url: config.urladdress+'/api/region/create/',
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'authorization': config.securitycode + req.session.token },
		form:{
			region_id: region_id,
			region_name: region_name,
			region_description: region_description,
			ward_id: ward_id
		}
	};
	service.post(options,function(error,body){
		if(error){
			return error;
		}
		console.log(body);
		res.redirect('/quantrac/quanly/vung/danhsachvung');
	});

});
regionController.get('/danhsachvung',service.ensureAuthenticated, function(req, res) {
	res.render("manager/vung/danhsachvung",{title:'Danh sách vùng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
/*Cap nhat vung*/
regionController.get('/capnhatvung/:id',service.ensureAuthenticated, function(req, res) {
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var url = config.urladdress+'/api/region/getbyid/'+id;
	var options = service.setGetHeader(url,{'Authorization':token});
	// console.log(url);
	service.get(options,function(error,data){
		if(error){
			return error;
		}
		else{
			rData = JSON.parse(data);
			regionData = rData.data;
			res.render("manager/vung/capnhatvung",{title:'Cập nhật vùng mới',regData:regionData,regid:id,wardid:regionData.ward_id,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
regionController.post('/capnhatvung/', function(req, res) {
	var region_id = req.body.region_id;
	var region_name = req.body.region_name;
	var region_description = req.body.region_description;
	var ward_id = req.body.ward_id;
	var address = config.urladdress + "/api/region/update/" + region_id;
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
			region_name: region_name,
			region_description: region_description,
			ward_id: ward_id
		}
	};
	service.put(options,function(error,data){
		if (error){
	  		throw new Error(error);
	  	}
		res.redirect('/quantrac/quanly/vung/danhsachvung');
	});
});
module.exports = regionController;
