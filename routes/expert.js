var express = require('express');
var expertRouter = express.Router();
var thresholdController = require('../controllers/expert/thresholdController');
var adviceController = require('../controllers/expert/adviceController');
var dataController = require('../controllers/expert/dataController');
var userController = require('../controllers/expert/userController');
var notificationController = require('../controllers/expert/notificationController');
var service = require('../services/service');
var config = require('../config/config.json'); //goi toi file cau hinh duong dan
expertRouter.get('/',service.ensureAuthenticated,function(req,res){
	res.render('expertLayout', { title: 'Trang chủ',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
expertRouter.use('/nguong',thresholdController);
expertRouter.use('/loikhuyen',adviceController);
expertRouter.use('/dulieu',dataController);
expertRouter.use('/nguoidung', userController);
expertRouter.use('/thongbao', notificationController);
module.exports = expertRouter;
