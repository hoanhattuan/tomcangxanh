var express = require('express');
var notificationController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

notificationController.get('/xemthongbao',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	res.render("expert/thongbao/xemthongbao",{title:"Xem thông báo",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
module.exports = notificationController;
