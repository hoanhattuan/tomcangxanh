var express = require('express');
var stationconfigController = express.Router();
var request = require("request");
var service = require('../../service');
var datetime = require('node-datetime');
var config = require('../../config/config.json');

stationconfigController.get('/xemdanhsachtramcauhinh',service.ensureAuthenticated,function(req,res){
	res.render("manager/tramcauhinh/danhsachtramcauhinh",{title:"Danh sách trạm cấu hình",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
stationconfigController.get('/thietlaptramcauhinh',service.ensureAuthenticated,function(req,res){
	res.render("manager/tramcauhinh/themtramcauhinh",{title:"Thêm trạm cấu hình",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
stationconfigController.get('/xemgiatricauhinh/:id',service.ensureAuthenticated,function(req,res){
	var stationid = req.params.id;
	res.render("manager/tramcauhinh/xemgiatricauhinh",{title:"Xem giá trị cấu hình",stationid:stationid,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
module.exports = stationconfigController;
