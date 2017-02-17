var express = require('express');
var adminRouter = express.Router();

var adminController = require('../controllers/admin/userController');

adminRouter.get('/',function(req,res){
	res.render('adminLayout', { title: 'Trang chủ'});
});

adminRouter.use('/nguoidung', adminController);


module.exports = adminRouter;
