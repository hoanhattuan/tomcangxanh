var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var fooController = express.Router();
var http = require ('http');
var request = require('request');
var passport = require('passport');
var moment = require('moment');

fooController.get('/', function(req, res) {
	res.render('users/Food', { title: 'Món ăn',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});




module.exports = fooController;