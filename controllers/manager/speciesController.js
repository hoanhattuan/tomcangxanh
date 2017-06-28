var express = require('express');
var speciesController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

speciesController.get('/danhsachloaithanuoi',service.ensureAuthenticated,function(req,res){
	res.render("manager/loaithanuoi/danhsachloaithanuoi",{title:"Danh sách loài thả nuôi",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
speciesController.get('/themloaithanuoi',service.ensureAuthenticated,function(req,res){
	var token = req.session.token;
	res.render("manager/loaithanuoi/themloaithanuoi",{title:"Thêm loài thả nuôi của tôm",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
speciesController.post('/themloaithanuoi',function(req,res){
	var species_name = req.body.species_name;
	var address = config.urladdress+'/api/species/create/';
	var options = {
		url: address,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded',
		'authorization': config.securitycode + req.session.token },
		form:{
			species_name: species_name
		}
	};
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/loaithanuoi/danhsachloaithanuoi');
	});
});
speciesController.get('/capnhatloaithanuoi/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var address = config.urladdress + '/api/species/getbyid/' +  id;
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
			speciesdata = dt.data;
			res.render("manager/loaithanuoi/capnhatloaithanuoi",{title:"Cập nhật loài thả nuôi",speciesdata:speciesdata,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
});
speciesController.post('/capnhatloaithanuoi',function(req,res){
	var token = config.securitycode + req.session.token;
	var species_id = req.body.species_id;
	var species_name = req.body.species_name;
	var address = config.urladdress + '/api/species/update/' + species_id;
	var options = {
		method: 'PUT', //muon cap nhat du lieu phai them method la put
		url : address,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Authorization': token
		},
		form: {
			species_name: species_name
		}
	};
	service.put(options,function(error,data){
		if(error){
			return error;
		}
		else{
			res.redirect('/quantrac/quanly/loaithanuoi/danhsachloaithanuoi');
		}
	});
});
module.exports = speciesController;