var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var havestController = express.Router(); 

//Nhap hang
havestController.get('/them/:stocking_id',service.ensureAuthenticated,function(req,res){
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
				if(req.params.stocking_id){
					var flashCheckExes = false;
					stockingOfUser.forEach(function(stocking){
						if(stocking.stocking_id == req.params.stocking_id){
							flashCheckExes = true;
						}
					});
					if(flashCheckExes){
						res.render('farmer/havest/addHavest',	{	title:'Thêm thu hoạch cho đợt nuôi số ' +  req.params.stocking_id,
																	conf:config.urladdress,
																	token:token,
																	userId:req.user.id,
																	fullName: req.session.fullName,
																	moment: moment,
																	stockingOfUser: stockingOfUser,
																	stocking_id: req.params.stocking_id
																});
					}else{
						res.send('Trang không tồn tại');
					}
				}else{
					res.send('Trang không tồn tại');
				}
			}
		}
	});
});

//Nhap hang
havestController.get('/danhsach',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	var stockingOfUser;
	var params = req.query;
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
				if(params.stocking_id){
					var flashCheckExes = false;
					stockingOfUser.forEach(function(stocking){
						if(stocking.stocking_id == params.stocking_id){
							flashCheckExes = true;
						}
					});
					if(flashCheckExes){
						res.render('farmer/havest/havestList',	{	title:'Thu hoạch của đợt nuôi số ' + params.stocking_id,
																	conf:config.urladdress,
																	token:token,
																	userId:req.user.id,
																	fullName: req.session.fullName,
																	moment: moment,
																	stockingOfUser: stockingOfUser,
																	stocking_id: params.stocking_id
																});
					}else{
						res.send('Trang không tồn tại');
					}
				}else{
					if(stockingOfUser.length != 0){
						res.render('farmer/havest/havestList',	{	title:'Thu hoạch của đợt nuôi số ' + stockingOfUser[0].stocking_id,
																	conf:config.urladdress,
																	token:token,
																	userId:req.user.id,
																	fullName: req.session.fullName,
																	moment: moment,
																	stockingOfUser: stockingOfUser,
																	stocking_id: stockingOfUser[0].stocking_id
																});
					}else{
						res.render('farmer/havest/havestList',	{	title:'Chưa có đợt thả nuôi nào được tạo',
																	conf:config.urladdress,
																	token:token,
																	userId:req.user.id,
																	fullName: req.session.fullName,
																	moment: moment,
																	stockingOfUser: stockingOfUser,
																	stocking_id: 0
																});
					}
				}
			}
		}
	});
});

//Xem chi tiet hoa don
havestController.get('/capnhat/:havest_id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	//Thiet lap option goi API lay thong tin hoa don
	var options = service.setOption('GET',config.urladdress + '/api/harvest/getbyid/' + req.params.havest_id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				if(result.data.user_id == req.user.id){
					res.render('farmer/havest/updateHavest',	{	title:'Cập nhật đợt thu hoạch số' + result.data.harvest_id,
																	conf:config.urladdress,
																	token:token,
																	userId:req.user.id,
																	fullName: req.session.fullName,
																	moment: moment,
																	harvest_id: result.data.harvest_id,
																	harvest_harvestDate: result.data.harvest_harvestDate,
																	stocking_id: result.data.stocking_id
																});	
				}else{
					res.send('Trang không tồn tại');
				}
				
			}
		}
	});
});

module.exports = havestController;
