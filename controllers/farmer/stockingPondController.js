var express = require('express'); //Goi thu vien Express
var service = require('../../services/service'); // Ham ho tro goi API
var config = require('../../config/config.json'); //Dia chi host API
var moment = require('moment'); //Thu vien format ngay phia giao dien

var stockingPondController = express.Router();

//Them chi tiet tha nuoi cho vu nuoi
stockingPondController.get('/them/:stocking_id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	//Thiet lap option goi API lay thong tin vu nuoi
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
					res.render('farmer/stockingpond/createStockingPond',	{	title:'Thêm chi tiết thả nuôi',
																				conf:config.urladdress,
																				token:token,
																				userId:req.user.id,
																				fullName: req.session.fullName,
																				stocking_id: result.data.stocking_id
																			});
				}else{
					res.render('farmer/stockingpond/createStockingPond',	{	title:'Thêm chi tiết thả nuôi',
																				conf:config.urladdress,
																				token:token,
																				userId:req.user.id,
																				fullName: req.session.fullName,
																				stocking_id: 0
																			});
				}
			}
		}
	});
});

//Xu ly cho them chi tiet tha nuoi
stockingPondController.post('/them',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stocking_id = parseInt(req.body.stocking_id) ;
	var pond_id = parseInt(req.body.pond_id);
	var temp = req.body.stockpond_date.split("/");
	var stockpond_date = new Date(temp[2],temp[1] - 1,temp[0]);
	var seed_id = parseInt(req.body.seed_id);
	var stockpond_age = parseInt(req.body.stockpond_age);
	var stockpond_PCR = (req.body.stockpond_PCR == 'co')?true:false;
	var stockpond_PCRresult = req.body.stockpond_PCRresult;
	var stockpond_quantityStock = parseInt(req.body.stockpond_quantityStock);
	var stockpond_density = parseInt(req.body.stockpond_density);
	var stockpond_statusOfSeed = true;
	var stockpond_method = req.body.stockpond_method;
	var stockpond_depth = parseFloat(req.body.stockpond_depth);
	var stockpond_clarity = parseFloat(req.body.stockpond_clarity);
	var stockpond_salinity = parseFloat(req.body.stockpond_salinity);
	var stockpond_DO = parseFloat(req.body.stockpond_DO);
	var stockpond_PHwater = parseFloat(req.body.stockpond_PHwater);
	var stockpond_tempAir = parseFloat(req.body.stockpond_tempAir);
	var stockpond_tempWater = parseFloat(req.body.stockpond_tempWater);
	var stockpond_state = true;

	//Dong goi data cho vao req
	var data = {
		stocking_id: stocking_id,
		pond_id: pond_id,
		stockpond_date: stockpond_date,
		seed_id: seed_id,
		stockpond_age:stockpond_age,
		stockpond_PCR: stockpond_PCR,
		stockpond_PCRresult: stockpond_PCRresult,
		stockpond_quantityStock:stockpond_quantityStock,
		stockpond_density:stockpond_density,
		stockpond_statusOfSeed:stockpond_statusOfSeed,
		stockpond_method:stockpond_method,
		stockpond_depth:stockpond_depth,
		stockpond_salinity:stockpond_salinity,
		stockpond_clarity:stockpond_clarity,
		stockpond_DO:stockpond_DO,
		stockpond_PHwater:stockpond_PHwater,
		stockpond_tempAir:stockpond_tempAir,
		stockpond_tempWater:stockpond_tempWater,
		stockpond_state:stockpond_state
	};
	console.log(data);
	//Thiet lap option goi API create Stocking Pond
	var options = service.setOption('POST',config.urladdress + '/api/stockingPond/create',{'Authorization':token,'Content-Type':'application/x-www-form-urlencoded'},data);
	service.post(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			console.log(result);
			var options = service.setOption('GET',config.urladdress + '/api/seed/getbyid/' + result.data.seed_id,{'Authorization':token},null);
			service.get(options,function(error,result){
				if(error){
					return error; //Loi mang
				}else{
					var result = JSON.parse(result);
					if(result.Error){
						return new Error(); //Loi bag request
					}else{
						var seedUpdate = {
							seed_id:result.data.seed_id,
							bill_id:result.data.bill_id,
							seedquality_id:result.data.seedquality_id,
							seed_numberOfLot:result.data.seed_numberOfLot,
							seed_quantity:result.data.seed_quantity,
							seed_existence:(result.data.seed_existence - data.stockpond_quantityStock) ,
							seed_price:result.data.seed_price,
							seed_source:result.data.seed_source,
							seed_size:result.data.seed_size
						}
						//Thiet lap option goi API update seed
						var options = service.setOption('PUT',config.urladdress + '/api/seed/update/' + result.data.seed_id,{'Authorization':token},seedUpdate);
						service.post(options,function(error,result){
							if(error){
								return error;
							}else{
								var result = JSON.parse(result);
								if(result.Error){
									return new Error();
								}else{
									res.redirect('/quantrac/nongdan/dotnuoi/chitiet/' + data.stocking_id);
								}
							}
						});
					}
				}
			});
		}
	});
});

//Xem chi tiet tha nuoi
stockingPondController.get('/chitiet',service.ensureAuthenticated,function(req,res){
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
								res.render('farmer/stockingpond/detailStockingPond',	{	title:'Chi tiết thả nuôi ao ' + result.data.pond_id,
																							conf:config.urladdress,
																							token:token,
																							userId:req.user.id,
																							fullName: req.session.fullName,
																							stocking_id: result.data.stocking_id,
																							pond_id: result.data.pond_id,
																							seed_id: result.data.seed_id,
																							stockpond_age: result.data.stockpond_age, 
																							stockpond_date:result.data.stockpond_date,
																							stockpond_PCR: result.data.stockpond_PCR,
																							stockpond_PCRresult:result.data.stockpond_PCRresult,
																							stockpond_quantityStock:result.data.stockpond_quantityStock,
																							stockpond_density: result.data.stockpond_density,
																							stockpond_statusOfSeed: result.data.stockpond_statusOfSeed,
																							stockpond_method: result.data.stockpond_method,
																							stockpond_depth: result.data.stockpond_depth,
																							stockpond_salinity: result.data.stockpond_salinity,
																							stockpond_clarity: result.data.stockpond_clarity,
																							stockpond_DO: result.data.stockpond_DO,
																							stockpond_PHwater: result.data.stockpond_PHwater,
																							stockpond_tempAir: result.data.stockpond_tempAir,
																							stockpond_tempWater: result.data.stockpond_tempWater,
																							stockpond_state: result.data.stockpond_state,
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
module.exports = stockingPondController;
