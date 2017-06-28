var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var notificationController = express.Router(); 

//Trang lay toan bo thong bao
notificationController.get('/danhsach',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	//Goi API danh sach thong bao cua nguoi dung o trang 1
	var options = service.setOption('GET',config.urladdress + '/api/notification/getbyuser/' + req.user.id + '?index=' + 0, {'Authorization':token}, null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi khi truyen nhan du lieu
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi Bag Request
			}else{
				res.render('farmer/notification/allNotification',	{	title:'Danh sách thông báo',
																		conf:config.urladdress,
																		token:token,
																		userId:req.user.id,
																		fullName: req.session.fullName,
																		moment: moment,
																		arrayNotification: result.data
																	});
			}
		}
	});
});

module.exports = notificationController;
