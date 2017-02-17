var express = require('express');
var managerRouter = express.Router();

var regionController = require('../controllers/manager/regionController');
var dataController = require('../controllers/manager/dataController');
//region controller

managerRouter.get('/',function(req,res){
	res.render('index', { title: 'Trang chủ'});
});
managerRouter.use('/vung', regionController);
managerRouter.use('/dulieu', dataController);
module.exports = managerRouter;
