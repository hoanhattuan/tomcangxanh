var express = require('express');
var farmerRouter = express.Router();

var pondController = require('../controllers/farmer/pondController');
var dataController = require('../controllers/farmer/dataController');

farmerRouter.get('/',function(req,res){
	res.render('farmerLayout', { title: 'Trang chủ'});
});

//Pond controller
farmerRouter.use('/aonuoi', pondController);

//Data controller
farmerRouter.use('/dulieu', dataController);

module.exports = farmerRouter;
