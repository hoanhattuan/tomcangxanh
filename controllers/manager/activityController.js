var express = require('express');
var activityController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');
activityController.get('/xemhoatdongchamsoc/:id',service.ensureAuthenticated,function(req,res){
  var pondid = req.params.id;
	res.render("manager/hoatdong/xemhoatdongchamsoc",{title:"Xem các hoạt động chăm sóc",pondid:pondid,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
module.exports = activityController;
