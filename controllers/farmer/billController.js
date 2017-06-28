var express = require('express'); //Goi thu vien Express de tao Router
var service = require('../../services/service'); // Goi cac ham ho tro API
var config = require('../../config/config.json'); //Goi tap tin cau hinh HOST
var moment = require('moment'); //Thu vien ho tro dinh dang ngay

var billController = express.Router(); 

//Danh sach hoa don
// billController.get('/danhsach',service.ensureAuthenticated,function(req,res){
// 	var token = "JWT " + req.session.token; // Token de goi API
// 	res.render('farmer/bill/billList',	{	title:'Danh sách hóa đơn',
// 											conf:config.urladdress,
// 											token:token,
// 											userId:req.user.id,
// 											fullName: req.session.fullName,
// 											moment:moment
// 										});
// });

//Nhap hang
// billController.get('/nhaphang',service.ensureAuthenticated,function(req,res){
// 	var token = "JWT " + req.session.token; // Token de goi API
// 	res.render('farmer/bill/addBill',	{	title:'Hoá đơn nhập hàng',
// 											conf:config.urladdress,
// 											token:token,
// 											userId:req.user.id,
// 											fullName: req.session.fullName,
// 											moment: moment
// 										});
// }); 

billController.get('/danhsach',service.ensureAuthenticated,function(req,res){
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
						res.render('farmer/bill/billList',	{	title:'Hóa đơn đợt thả nuôi số ' + params.stocking_id,
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
						res.render('farmer/bill/billList',	{	title:'Hóa đơn đợt thả nuôi số ' + stockingOfUser[0].stocking_id,
																conf:config.urladdress,
																token:token,
																userId:req.user.id,
																fullName: req.session.fullName,
																moment: moment,
																stockingOfUser: stockingOfUser,
																stocking_id: stockingOfUser[0].stocking_id
															});
					}else{
						res.render('farmer/bill/billList',	{	title:'Chưa có đợt thả nuôi nào được tạo',
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

//Nhap hang
billController.get('/them/:stocking_id',service.ensureAuthenticated,function(req,res){
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
						res.render('farmer/bill/addBill',	{	title:'Thêm hóa đơn cho đợt thả nuôi số ' +  req.params.stocking_id,
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

//Xem chi tiet hoa don
billController.get('/capnhat/:bill_id',service.ensureAuthenticated,function(req,res){
	var token = "JWT " + req.session.token; // Token de goi API
	//Thiet lap option goi API lay thong tin hoa don
	var options = service.setOption('GET',config.urladdress + '/api/bill/getbyid/' + req.params.bill_id,{'Authorization':token},null);
	service.get(options,function(error,result){
		if(error){
			return error; //Loi mang
		}else{
			var result = JSON.parse(result);
			if(result.Error){
				return new Error(); //Loi bag request
			}else{
				if(result.data.user_id == req.user.id){
					res.render('farmer/bill/updateBill',	{	title:'Cập nhật hóa đơn số ' + result.data.bill_id,
																conf:config.urladdress,
																token:token,
																userId:req.user.id,
																fullName: req.session.fullName,
																moment: moment,
																bill_id: result.data.bill_id,
																stocking_id: result.data.stocking_id,
																bill_dateInBill: result.data.bill_dateInBill,
																bill_createDate: result.data.bill_createDate,
																bill_total: result.data.bill_total
															});	
				}else{
					res.send('Trang không tồn tại');
				}
				
			}
		}
	});
});

module.exports = billController;
