var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var trackerAugmentedController = express.Router(); 

//Them hoat dong
trackerAugmentedController.get('/them',service.ensureAuthenticated,function(req,res){
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
								res.render('farmer/trackerAugmented/addTrackerAugmented',	{	title:'Thêm chi tiết theo dõi ao ' + result.data.pond_id,
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

//Xu li them dot nuoi
trackerAugmentedController.post('/them',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stocking_id = parseInt(req.body.stocking_id) ;
	var pond_id = parseInt(req.body.pond_id);
	var temp = req.body.trackeraugmented_date.split("/");
	var trackeraugmented_date = new Date(temp[2],temp[1] - 1,temp[0]);
	var trackeraugmented_age = parseInt(req.body.trackeraugmented_age); 
	var trackeraugmented_weightAvg = parseFloat(req.body.trackeraugmented_weightAvg);
	var trackeraugmented_speedOfGrowth = parseFloat(req.body.trackeraugmented_speedOfGrowth); 
	var tracker_augmented_survival = parseFloat(req.body.tracker_augmented_survival); 
	var trackeraugmented_densityAvg = parseFloat(req.body.trackeraugmented_densityAvg); 
	var trackeraugmented_biomass = parseFloat(req.body.trackeraugmented_biomass);  
	var trackeraugmented_note = (req.body.trackeraugmented_note.length == 0)?"":req.body.trackeraugmented_note;
	//Dong goi data cho vao req
	var data = {
		stocking_id: stocking_id,
		pond_id: pond_id,
		trackeraugmented_date: trackeraugmented_date,
		trackeraugmented_age:trackeraugmented_age,
		trackeraugmented_densityAvg: trackeraugmented_densityAvg,
		trackeraugmented_weightAvg: trackeraugmented_weightAvg,
		trackeraugmented_speedOfGrowth:trackeraugmented_speedOfGrowth,
		tracker_augmented_survival:tracker_augmented_survival,
		trackeraugmented_biomass:trackeraugmented_biomass,
		trackeraugmented_note:trackeraugmented_note,
		trackeraugmented_number:0
	};
	//Thiet lap option goi API lay danh sach theo doi tang truong cua ao pond_id tai vu stocking_id
	var options = service.setOption('GET',config.urladdress + '/api/trackerAugmented/getbymaxnumber?stocking_id=' + stocking_id + '&pond_id=' + pond_id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error;
		}else{
			var result = JSON.parse(result);
			if(!result.data){
				data.trackeraugmented_number = 1;
			}else{
				data.trackeraugmented_number = result.data + 1;
			}
			console.log(data);
			//Thiet lap option goi API create track augmented
			var options = service.setOption('POST',config.urladdress + '/api/trackerAugmented/create',{'Authorization':token},data);
			service.post(options,function(error,result){
				if(error){
					return error;
				}else{
					var result = JSON.parse(result);
					if(result.Error){
						return new Error();
					}else{
						//console.log(result);
						res.redirect('/quantrac/nongdan/tangtruong/danhsach?stocking_id=' + result.data.stocking_id + '&pond_id=' + result.data.pond_id);
					}
				}
			});
		}
	});
});

//Danh sach theo doi tang truong
trackerAugmentedController.get('/danhsach',service.ensureAuthenticated,function(req,res){
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
								res.render('farmer/trackerAugmented/trackerAugmentedList',	{	title:'Bảng theo dõi tăng trưởng ao  ' + result.data.pond_id,
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

module.exports = trackerAugmentedController;
