var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var billController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');


billController.get('/danhsachhoadon',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var options = service.setOption('GET',config.urladdress + '/api/bill/getall',{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			res.render('admin/ListBill',{title:'Danh sách hoá đơn',users:userData, moment: moment,token:token});
		} 
	});
});

billController.get('/sua/:id',service.ensureAuthenticated,function(req,res){
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

billController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	console.log('Vao trong ruot');
	var token = "JWT " + req.session.token;
	var body ={
		user_id : req.body.user_id,
		stocking_id : req.body.stocking_id,
		bill_total :req.body.bill_total,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/bill/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/hoadon/danhsachhoadon');
		} 
	});
});


billController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={
		
	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/bill/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/hoadon/danhsachhoadon');

		}
	}); 
});

billController.get('/chitiet/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/other/getbybill/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render('admin/ListOther',{title:'Chi tiết hoá đơn',users:userData,token:token,conf:config.urladdress,  moment: moment});
		} 
	});
});

module.exports = billController;