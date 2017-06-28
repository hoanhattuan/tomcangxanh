var express = require('express');
var service = require('../../services/service');
var http = require ('http');
var request = require('request');
var producttypeController = express.Router();
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc

producttypeController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListProductType", {title: 'Xem danh sách loại sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// o

producttypeController.get("/them",service.ensureAuthenticated, function(req, res) {
	res.render("admin/createProductType", {title: 'Thêm loại sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

producttypeController.post("/them",service.ensureAuthenticated, function(req, res) {
	var token = "JWT " + req.session.token;
	var body ={
		prodtype_typeName : req.body.prodtype_typeName,
		prodcate_id : req.body.prodcate_id,
	}; 
	console.log(body); 
	// console.log(token);
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/producttype/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/loaisanpham/danhsach');
		} 
	});
  // res.render("admin/ListProductCategory", {title: 'Xem danh sách danh mục sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

producttypeController.get("/sua/:id",service.ensureAuthenticated, function(req, res) {
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/producttype/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render("admin/updateProductType", {title: 'Sửa loại sản phẩm',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});	

producttypeController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var body ={
		prodtype_typeName : req.body.prodtype_typeName,
		prodcate_id : req.body.prodcate_id,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/producttype/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/loaisanpham/danhsach');
		} 
	});
});

producttypeController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={

	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/producttype/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/quantrac/nguoiquantri/loaisanpham/danhsach');
		}
	}); 
});

module.exports = producttypeController;