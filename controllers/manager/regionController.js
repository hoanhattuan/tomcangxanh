var express = require('express');
var regionController = express.Router();
var request = require('request');
var service = require('../../service');
/* Them vung. */
regionController.get('/themvung',service.ensureAuthenticated, function(req, res) {
	res.render("manager/vung/themvung",{title:'Thêm vùng mới'});
});
regionController.post('/themvung', function(req, res) {
	var regid = req.body.region_id;
	var regname = req.body.region_name;
	var regdescription = req.body.region_description;
	var wardid = req.body.ward_id;	
	var token = "JWT " + req.session.token;
	var options = {
		url: config.urladdress + '/api/region/create/',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': token
		},
		form:{
			region_id: regid,
			region_name: regname,
			region_description: regdescription,
			ward_id: wardid
		}
	};
	service.post(options,function(error,body){
		if(error){
			return error;
		}
		console.log(body);
		res.redirect('/');
	});

});
/*Cap nhat vung*/
regionController.get('/capnhatvung/:id', function(req, res) {
	res.render("manager/vung/capnhatvung",{title:'Cập nhật vùng mới'});
});
regionController.post('/capnhatvung/:id', function(req, res) {
	var regid = req.params.id;
	var regname = req.body.region_name;
	var regdescription = req.body.region_description;
	var wardid = req.body.ward_id;
	var token = "JWT " + req.session.token;
	var options = {
		type: 'PUT',
		url: config.urladdress + '/api/region/update/'+regid,
		headers: 
		{ 
			'content-type': 'application/x-www-form-urlencoded',
			'authorization': token
		},
		form: 
		{ 
			region_id: regid,
			region_name: regname,
			region_description: regdescription,
			ward_id: wardid 
		}
	};
	service.put(options,function(error,body){
		if(error){return error;}
		console.log(regid);
		res.redirect('/');
	});
	
});
module.exports = regionController;
