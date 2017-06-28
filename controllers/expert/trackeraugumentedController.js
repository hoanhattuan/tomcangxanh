var express = require('express');
var service = require('../../service');
var http = require ('http');
var request = require('request');
var trackeraugumentedController = express.Router();
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc

trackeraugumentedController.get("/danhsachnhatkytangtruong",service.ensureAuthenticated, function(req, res) {
  	var url = config.urladdress + '/api/trackeraugumented/getall';
  	var options = {
  		url: url,
  		headers:{
	  		'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		}
  	};
  	res.render("danhsachnhatkytangtruong", {title: 'Xem nhật ký tăng trưởng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid});
});
module.exports = trackeraugumentedController;