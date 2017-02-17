var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var service = require('../../service');
var http = require ('http');
var request = require('request');
var dataController = express.Router();
var request = require('request');
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc


dataController.get("/xemdodo",service.ensureAuthenticated, function(req, res) {
  res.render("xemdodo", {title: 'Xem độ đo',conf:config.urladdress,token:req.session.token,userid:req.user.id});
});

module.exports = dataController;