var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var otherController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


otherController.get('/danhsachchitiethoadon',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var options = service.setOption('GET',config.urladdress + '/api/other/getall',{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			res.render('admin/ListOther',{title:'Danh sách chi tiết hoá đơn',users:userData, moment: moment,token:token});
		} 
	});
});

otherController.get('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/bill/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/updateBill',{title:'Sửa thông tin hoá đơn',users:userData,token:token,conf:config.urladdress,  moment: moment});
		} 
	});
});

otherController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_id : req.body.user_id,
		stocking_id : req.body.stocking_id,
		bill_total :req.body.bill_total,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/other/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/chitiethoadon/danhsachchitiethoadon');
		} 
	});
});


otherController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/other/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/chitiethoadon/danhsachchitiethoadon');

		}
	}); 
});

module.exports = otherController;