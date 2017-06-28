var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var activityController = express.Router(); 

//Them hoat dong
activityController.get('/them',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var params = req.query;
	var options = service.setOption('GET',config.urladdress + '/api/stockingPond/getbystocking/' + params.stocking_id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				pondOfStocking = result.data;
				//Thiet lap option goi API de lay thong tin vu nuoi
				var options = service.setOption('GET',config.urladdress + '/api/stockingPond/getdetail?stocking_id=' + params.stocking_id + '&pond_id=' + params.pond_id,{'Authorization':token},null);
				service.get(options,function(error,result){
					if(error){
						return error; //Loi mang
					}else{
						var result = JSON.parse(result);
						if(result.Error){
							return new Error(); //Loi bag request
						}else{
							if(result.data != null){
								res.render('farmer/activity/addActivity',	{	title:'Thêm hoạt động ao ' + result.data.pond_id,
																				conf:config.urladdress,
																				token:token,
																				userId:req.user.id,
																				fullName: req.session.fullName,
																				moment: moment,
																				stocking_id: result.data.stocking_id,
																				pond_id: result.data.pond_id,
																				pondOfStocking:pondOfStocking
																			});
							}else{
								res.send('Trang không tồn tại');
							}
						}
					}
				});
			}
		}
	});
});

//Danh sach hoat dong
activityController.get('/danhsach',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var pondOfStocking;
	var params = req.query;
	//Thiet lap option goi API de lay thong tin vu nuoi
	var options = service.setOption('GET',config.urladdress + '/api/stockingPond/getbystocking/' + params.stocking_id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				pondOfStocking = result.data;
				//Thiet lap option goi API de lay thong tin vu nuoi
				var options = service.setOption('GET',config.urladdress + '/api/stockingPond/getdetail?stocking_id=' + params.stocking_id + '&pond_id=' + params.pond_id,{'Authorization':token},null);
				service.get(options,function(error,result){
					if(error){
						return error; //Loi mang
					}else{
						var result = JSON.parse(result);
						if(result.Error){
							return new Error(); //Loi bag request
						}else{
							if(result.data != null){
								res.render('farmer/activity/activityList',	{	title:'Chăm sóc ao ' + result.data.pond_id,
																				conf:config.urladdress,
																				token:token,
																				userId:req.user.id,
																				fullName: req.session.fullName,
																				moment: moment,
																				stocking_id: result.data.stocking_id,
																				pond_id: result.data.pond_id,
																				pondOfStocking:pondOfStocking
																			});
							}else{
								res.send('Trang không tồn tại');
							}
						}
					}
				});
			}
		}
	});
});

module.exports = activityController;
