var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var dataController = express.Router(); 

//Trang xem du lieu quan sat 
dataController.get('/xemsodo',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var arrayStation; // Chua danh sach cac tram ma nguoi dung co the xem
	//Goi API lay danh sach cac tram co the xem
	var options = service.setOption('GET',config.urladdress + '/api/station/getbyuser/' + req.user.id, {'Authorization':token}, null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi khi truyen nhan du lieu
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi Bag Request
			}else{
				arrayStation = result.data;
				//Goi API lay tram xem mac dinh
				var options = service.setOption('GET',config.urladdress + '/api/stationdefault/getbyuser/' + req.user.id, {'Authorization':token}, null);
				service.get(options,function(error,result){
					if(error){
						return error; //Loi khi truyen du lieu
					}else{
						var result = JSON.parse(result);
						if(result.Error){
							return new Error(); //Loi Bag Request
						}else{
							if(result.data == null){
								//Truyen du lieu qua giao dien
								res.render('farmer/data/showdata',	{	title:'Xem dữ liệu đo',
																		conf:config.urladdress,
																		token:token,
																		userId:req.user.id ,
																		fullName: req.session.fullName,
																		arrayStation:arrayStation,
																		stationDefaultId: null,
																		moment:moment
																	});
							}else{
								//Truyen du lieu qua giao dien
								res.render('farmer/data/showdata',	{	title:'Xem dữ liệu đo',
																		conf:config.urladdress,
																		token:token,
																		userId:req.user.id ,
																		fullName: req.session.fullName,
																		arrayStation:arrayStation,
																		stationDefaultId: result.data.station_id,
																		moment:moment
																	});
							}
						} 
					}
				});				
			}
		}
	});
});

module.exports = dataController;
