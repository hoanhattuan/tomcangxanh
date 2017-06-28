var express = require('express'); //Goi thu vien Express
var service = require('../../services/service'); // Ham ho tro goi API
var config = require('../../config/config.json'); //Dia chi host API
var moment = require('moment'); //Thu vien format ngay phia giao dien

var stokingController = express.Router();

//Them dot nuoi moi
stokingController.get('/them',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	res.render('farmer/stocking/createStocking',	{	title:'Thêm đợt thả nuôi',
														conf:config.urladdress,
														token:token,
														userId:req.user.id,
														fullName: req.session.fullName
													});
});

//Xu li them dot nuoi
stokingController.post('/them',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stockingtype_id = req.body.stockingtype_id ;
	var species_id = req.body.species_id;
	var stocking_quantity = req.body.stocking_quantity;
	var stocking_note = (req.body.stocking_note.length == 0)?"":req.body.stocking_note;
	var stocking_date = new Date();
	//Dong goi data cho vao req
	var data = {
		user_id: req.user.id,
		stockingtype_id: parseInt(stockingtype_id),
		species_id: parseInt(species_id),
		stocking_quantity: parseInt(stocking_quantity),
		stocking_note: stocking_note,
		stocking_date:stocking_date,
		stocking_status:true
	};
	//Thiet lap option goi API create stoking
	var options = service.setOption('POST',config.urladdress + '/api/stocking/create',{'Authorization':token},data);
	service.post(options,function(error,result){
		if(error){
			return error;
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error();
			}else{
				res.redirect('/quantrac/nongdan/dotnuoi/danhsach');
			}
		}
	});
});

//Danh sach dot tha nuoi
stokingController.get('/danhsach',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	res.render('farmer/stocking/stockingList',	{	title:'Quản lý thả nuôi',
													conf:config.urladdress,
													token:token,
													userId:req.user.id,
													fullName: req.session.fullName,
													moment:moment
												});
});

//Xem chi tiet tha nuoi
stokingController.get('/chitiet/:stocking_id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stockingOfUser;
	var options = service.setOption('GET',config.urladdress + '/api/stocking/getbyuser/' + req.user.id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				stockingOfUser = result.data;
				var flashCheckExes = false;
				stockingOfUser.forEach(function(stocking){
					if(stocking.stocking_id == req.params.stocking_id){
						flashCheckExes = true;
					}
				});
				if(flashCheckExes){
					//Thiet lap option goi API de lay thong tin vu nuoi
					var options = service.setOption('GET',config.urladdress + '/api/stocking/getbyid/' + req.params.stocking_id,{'Authorization':token},null);
					service.get(options,function(error,result){
						if(error){
							return error; //Loi mang
						}else{
							var result = JSON.parse(result);
							if(result.Error){
								return new Error(); //Loi bag request
							}else{
								if(result.data != null){
									res.render('farmer/stocking/detailStocking',	{	title:'Đợt thả nuôi số ' + req.params.stocking_id,
																						conf:config.urladdress,
																						token:token,
																						userId:req.user.id,
																						fullName: req.session.fullName,
																						stocking_id: result.data.stocking_id,
																						stockingtype_id: result.data.stockingtype_id,
																						species_id:result.data.species_id,
																						stocking_quantity: result.data.stocking_quantity,
																						stocking_status:result.data.stocking_status,
																						stocking_note:result.data.stocking_note,
																						stocking_date: result.data.stocking_date,
																						stockingOfUser:stockingOfUser
																					});
								}else{
									res.send('Trang không tồn tại');
								}
							}
						}
					});
				}else{
					res.send('Trang không tồn tại');
				}
			}
		}
	});
});

module.exports = stokingController;
