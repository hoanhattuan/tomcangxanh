var express = require('express');
var service = require('../../service');
var http = require ('http');
var request = require('request');
var dataController = express.Router();
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc


dataController.get("/xemdulieu",service.ensureAuthenticated, function(req, res) {
  res.render("expert/dulieu/xemdulieu", {title: 'Xem dữ liệu',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

module.exports = dataController;
