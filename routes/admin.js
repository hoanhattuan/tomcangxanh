var express = require('express');
var adminRouter = express.Router();

var adminController = require('../controllers/admin/userController');
var feedbackController = require('../controllers/admin/feedbackController');
// var billController = require('../controllers/admin/billController');
// var otherController = require('../controllers/admin/otherController');
var commentController = require('../controllers/admin/commentController');
var answercommentController = require('../controllers/admin/answercommentController');
var postcategoryController = require('../controllers/admin/postcategoryController');
var postController = require('../controllers/admin/postController');
var productcategoryController = require('../controllers/admin/productcategoryController');
var producttypeController = require('../controllers/admin/productTypeController');
var service = require('../services/service');
var config = require('../config/config.json');
adminRouter.get('/',function(req,res){
	res.render('adminLayout', { title: 'Trang chủ',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});

adminRouter.use('/nguoidung', adminController);
adminRouter.use('/phanhoi',feedbackController);
// adminRouter.use('/hoadon',billController);
// adminRouter.use('/chitiethoadon',otherController);
adminRouter.use('/binhluan',commentController);
adminRouter.use('/traloibinhluan',answercommentController);
adminRouter.use('/danhmucbaiviet',postcategoryController);
adminRouter.use('/baiviet',postController);
adminRouter.use('/danhmucsanpham',productcategoryController);
adminRouter.use('/loaisanpham',producttypeController);

module.exports = adminRouter;
