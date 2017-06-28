var express = require('express');
var customerRouter =  express.Router();
var customerController = require('../controllers/customer/customersController');
var productController = require('../controllers/customer/productController');
var newController = require('../controllers/customer/newController');
var foodController = require('../controllers/customer/foodController');

customerRouter.get('/',function(req,res){
	res.render('userLayout', { title: 'Trang chủ'});
});

customerRouter.use('/trangchu', customerController);
customerRouter.use('/sanpham', productController);
customerRouter.use('/tintuc', newController);
customerRouter.use('/monan', foodController);

module.exports = customerRouter;
