var express = require('express');
var sinkController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

sinkController.get('/danhsachtramdieuhanh',service.ensureAuthenticated,function(req,res){
	res.render("manager/tramdieuhanh/danhsachtramdieuhanh",{title:"Danh sách trạm điều hành",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
sinkController.get('/themtramdieuhanh',service.ensureAuthenticated,function(req,res){
	res.render("manager/tramdieuhanh/themtramdieuhanh",{title:"Thêm trạm điều hành",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
sinkController.post('/themtramdieuhanh',service.ensureAuthenticated,function(req,res){
	var region_id = req.body.region_id;
	var sink_name = req.body.sink_name;
	var sink_code = req.body.sink_code;
	var sink_secret = req.body.sink_secret;
	var sink_location = req.body.sink_location;
	var sink_address = req.body.sink_address;
	var options = {
		url: config.urladdress + '/api/sink/create',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			region_id:region_id,
			sink_name:sink_name,
			sink_code:sink_code,
			sink_secret:sink_secret,
			sink_location:sink_location,
			sink_address:sink_address
		}
	};
	service.post(options,function(error,data){
		if(error){
			return error;
		}
		res.redirect('/quantrac/quanly/tramdieuhanh/danhsachtramdieuhanh');
	});
});
sinkController.get('/capnhattramdieuhanh/:id',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	var id = req.params.id;
	var url = config.urladdress+'/api/sink/getbyid/'+id;
	var options = service.setGetHeader(url,{'Authorization':token});
	service.get(options,function(error,data){
		if(error){
			return error;
		}
		else{
			sData = JSON.parse(data);
			sinkData = sData.data;
			res.render("manager/tramdieuhanh/capnhattramdieuhanh",{title:'Cập nhật trạm điều hành',sinkData:sinkData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
		}
	});
	// res.render("manager/tramdieuhanh/themtramdieuhanh",{title:"Thêm trạm điều hành",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
sinkController.post('/capnhattramdieuhanh',service.ensureAuthenticated,function(req,res){
	var sink_id = req.body.sink_id;
	var region_id = req.body.region_id;
	var sink_name = req.body.sink_name;
	var sink_code = req.body.sink_code;
	var sink_secret = req.body.sink_secret;
	var sink_location = req.body.sink_location;
	var sink_address = req.body.sink_address;
	var options = {
		method: 'PUT',
		url: config.urladdress + '/api/sink/update/' + sink_id,
		headers: 
		{
			'content-type': 'application/x-www-form-urlencoded',
			authorization: config.securitycode + req.session.token
		},
		form: 
		{ 
			sink_name: sink_name,
			sink_code: sink_code,
			sink_secret: sink_secret,
			sink_address: sink_address,
			sink_location:sink_location,
			region_id: region_id
		}
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);
		res.redirect('/quantrac/quanly/tramdieuhanh/danhsachtramdieuhanh');
	});
});
module.exports = sinkController;