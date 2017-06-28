var express = require('express');
var service = require('../services/service');
var farmerRouter = express.Router();

var pondController = require('../controllers/farmer/pondController');
var dataController = require('../controllers/farmer/dataController');
var stokingController = require('../controllers/farmer/stokingController');
var billController = require('../controllers/farmer/billController');
// var seedController = require('../controllers/farmer/seedController');
var notificationController = require('../controllers/farmer/notificationController');
var stockingPondController = require('../controllers/farmer/stockingPondController');
var activityController = require('../controllers/farmer/activityController');
var havestController = require('../controllers/farmer/havestController');
var trackerAugmentedController = require('../controllers/farmer/trackerAugmentedController');
var userController = require('../controllers/farmer/userController');
//var pondPreparationController = require('../controllers/farmer/pondPreparationController');

farmerRouter.get('/',service.ensureAuthenticated,function(req,res){
	//res.render('farmerLayout', { title: 'Trang chủ'});
	res.redirect('/quantrac/nongdan/dulieu/xemsodo');
});

//Pond controller
farmerRouter.use('/aonuoi', pondController);

//Data controller
farmerRouter.use('/dulieu', dataController);

//Stoking controller
farmerRouter.use('/dotnuoi', stokingController);

//Bill controller
farmerRouter.use('/hoadon', billController);

// //Seed controller
// farmerRouter.use('/giongnuoi', seedController);

//Notification controller
farmerRouter.use('/thongbao', notificationController);

//Stocking Pond controller
farmerRouter.use('/chitietthanuoi', stockingPondController);

//Activity controller
farmerRouter.use('/hoatdong', activityController);

//Havest controller
farmerRouter.use('/thuhoach', havestController);

//trackerAugmented Controller
farmerRouter.use('/tangtruong', trackerAugmentedController);

//pondPreparation Controller 
//farmerRouter.use('/chuanbiao', pondPreparationController);

//user controller
farmerRouter.use('/nguoidung', userController);

module.exports = farmerRouter;
