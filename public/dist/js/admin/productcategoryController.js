var express = require('express');
var service = require('../../services/service');
var http = require ('http');
var request = require('request');
var productcategoryController = express.Router();
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc

productcategoryController.get("/danhsach",service.ensureAuthenticated, function(req, res) {
	res.render("admin/ListProductCategory", {title: 'Xem danh sách danh mục sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
// o

productcategoryController.get("/them",service.ensureAuthenticated, function(req, res) {
	res.render("admin/createProductCategory", {title: 'Thêm danh sách danh mục sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

productcategoryController.post("/them",service.ensureAuthenticated, function(req, res) {
	var token = "JWT " + req.session.token;
	var body ={
		prodcate_name : req.body.prodcate_name,
		prodcate_image : req.body.prodcate_image,
		prodcate_description : req.body.prodcate_description,
		prodcate_createBy : req.session.username,
		prodcate_isDelete :false,
	}; 
	console.log(body); 
	// console.log(token);
	var id = req.params.id; 
	var options = service.setOption('post',config.urladdress + '/api/productcategory/create' ,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.post(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucsanpham/danhsach');
		} 
	});
  // res.render("admin/ListProductCategory", {title: 'Xem danh sách danh mục sản phẩm',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

productcategoryController.get("/sua/:id",service.ensureAuthenticated, function(req, res) {
	var token = "JWT " + req.session.token;
	var id = req.params.id; 
	var options = service.setOption('GET',config.urladdress + '/api/productcategory/getbyid/' + id,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			data = JSON.parse(data);
			userData = data.data;
			console.log(userData);
			res.render("admin/updateProductCategory", {title: 'Sửa danh sách danh mục sản phẩm',users:userData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		} 
	});
});	

productcategoryController.post('/sua/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token;
	var body ={
		prodcate_name : req.body.prodcate_name,
		prodcate_image : req.body.prodcate_image,
		prodcate_description : req.body.prodcate_description,
		prodcate_createBy : req.body.prodcate_createBy,
		prodcate_createDate :req.body.prodcate_createDate,
		prodcate_updateBy : req.session.username,
		prodcate_isDelete :false,
	}; 
	console.log(body); 
	var id = req.params.id; 
	var options = service.setOption('put',config.urladdress + '/api/productcategory/update/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucsanpham/danhsach');
		} 
	});
});

productcategoryController.get('/xoa/:id', function(req, res) {
	console.log(req.session);
	token = "JWT " + req.session.token;
	var body ={

	};
	var id = req.params.id;
	var options = service.setOption('delete',config.urladdress + '/api/productcategory/delete/' + id,{'Authorization':token,'Content-Type': 'application/x-www-form-urlencoded'},body);
	service.put(options,function(error,data){
		if(error){
			return error;
		}else{ 
			res.redirect('/nguoiquantri/danhmucsanpham/danhsach');
		}
	}); 
});

module.exports = productcategoryController;