var express = require('express');
var stockingPondController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');
stockingPondController.get('/xemlichsunuoi/:id',service.ensureAuthenticated,function(req,res){
  var pondid = req.params.id;
	res.render("manager/nhatkynuoi/xemlichsunuoi",{title:"Xem lịch sử nuôi",pondid:pondid,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
module.exports = stockingPondController;
