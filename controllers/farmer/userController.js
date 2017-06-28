var express = require('express'); //Goi thu vien Express
var service = require('../../services/service'); // Ham ho tro goi API
var config = require('../../config/config.json'); //Dia chi host API
var moment = require('moment'); //Thu vien format ngay phia giao dien

var userController = express.Router();

userController.get('/capnhatmatkhau/:id',service.ensureAuthenticated, function(req, res) {
	if(req.params.id == req.session.userid){
		var token = "JWT " + req.session.token;
		res.render("farmer/user/changePassword",{title:'Cập nhật mật khẩu',conf:config.urladdress,
																								token:token,
																								userId:req.user.id,
																								fullName: req.session.fullName,
																								moment: moment,
																							});
	}
	else{
		res.redirect('/quantrac/nongdan');
	}
});

userController.get('/thongtincanhan2/:id',service.ensureAuthenticated, function(req, res) {
	if(req.params.id == req.session.userid){
		var token = "JWT " + req.session.token;
		res.render("farmer/user/info",{title:'Thông tin cá nhân',conf:config.urladdress,
																								token:token,
																								userId:req.user.id,
																								fullName: req.session.fullName,
																								moment: moment,
																							});
	}
	else{
		res.redirect('/quantrac/nongdan');
	}
});

userController.get('/thongtincanhan/:id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stockingOfUser;
	var options = service.setOption('GET',config.urladdress + '/api/user/getbyid/' + req.user.id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				
				userData = result.data;
				res.render("farmer/user/info",{title:'Thông tin cá nhân',conf:config.urladdress,
																								token:token,
																								userId:req.user.id,
																								fullName: req.session.fullName,
																								moment: moment,
																								userData:userData,
																							});
			}
		}
	});
});


module.exports = userController;