var express = require('express');
var stationController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

stationController.get('/danhsachtram',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	res.render("manager/tram/danhsachtram",{title:"Danh sách trạm",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
stationController.get('/themtram',service.ensureAuthenticated,function(req,res){
	var token = config.securitycode + req.session.token;
	res.render("manager/tram/themtram",{title:"Thêm trạm",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
stationController.post('/themtram',service.ensureAuthenticated,function(req,res){
	var s_node = req.body.station_node;
	// var station_node = s_node.join('|'); /*Ghep chuoi tu mang cho giong dinh dang cua station node*/
	var station_node = '';
	if(typeof s_node === 'undefined'){
		station_node = '';
	}
	else{
		var tostr = s_node.toString();
		if (tostr.indexOf(',') !== -1) {
			station_node = s_node.join('|'); /*Ghep chuoi tu mang cho giong dinh dang cua station node neu la nhieu loai du lieu*/
		} else {
			station_node = s_node; /*Neu la 1 loai du lieu*/
		}
	}
	var sink_id = req.body.sink_id;
	var region_id = req.body.region_id;
	var river_id = req.body.river_id;
	var pond_id = req.body.pond_id;
	var station_name = req.body.station_name;
	var station_code = req.body.station_code;
	var station_location = req.body.station_location;
	var station_secret = req.body.station_secret;
	var station_address = req.body.station_address;
	var station_status = 1;
	var station_updateStatus = 0;
	var station_duration = req.body.station_duration;
	var options = {
		method: 'POST',
		url: config.urladdress + '/api/station/create',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			sink_id: sink_id,
			region_id: region_id,
			pond_id: pond_id,
			station_name: station_name,
			station_code: station_code,
			station_location: station_location,
			station_node: station_node,
			station_secret: station_secret,
			station_address: station_address,
			station_duration: station_duration,
			river_id: river_id,
			station_status: station_status,
			station_updateStatus: station_updateStatus
		}
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		res.redirect('/quantrac/quanly/tram/danhsachtram');
	});
});
stationController.get('/capnhattram/:id',service.ensureAuthenticated,function(req,res){
	var id = req.params.id;
	var staData,stationData;
	var options = {
		url: config.urladdress + '/api/station/getbyid/' + id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
	};
	service.get(options,function(error,data){
		if (error) throw new Error(error);
		staData = JSON.parse(data);
		stationData = staData.data;
		res.render("manager/tram/capnhattram",{title:"Cập nhật trạm",stationData:stationData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
	});
});
stationController.post('/capnhattram',service.ensureAuthenticated,function(req,res){
	var station_id = req.body.station_id;
	var s_node = req.body.station_node;
	var station_node = '';
	if(typeof s_node === 'undefined'){
		station_node = '';
	}
	else{
		var tostr = s_node.toString();
		if (tostr.indexOf(',') !== -1) {
			station_node = s_node.join('|'); /*Ghep chuoi tu mang cho giong dinh dang cua station node neu la nhieu loai du lieu*/
		} else {
			station_node = s_node; /*Neu la 1 loai du lieu*/
		}
	}
	// console.log('Chieu dai: ' + s_node.length);
	// if(s_node.length > 1){
	// 	var station_node = s_node.join('|'); /*Ghep chuoi tu mang cho giong dinh dang cua station node*/
	// }

	// var station_node = s_node.join('|'); /*Ghep chuoi tu mang cho giong dinh dang cua station node*/
	var sink_id = req.body.sink_id;
	var region_id = req.body.region_id;
	var river_id = req.body.river_id;
	var pond_id = req.body.pond_id;
	var station_name = req.body.station_name;
	var station_code = req.body.station_code;
	var station_location = req.body.station_location;
	var station_secret = req.body.station_secret;
	var station_address = req.body.station_address;
	var station_status = 1;
	var station_updateStatus = 0;
	var station_duration = req.body.station_duration;
	var options = {
		method: 'PUT',
		url: config.urladdress + '/api/station/update/' + station_id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			sink_id: sink_id,
			region_id: region_id,
			pond_id: pond_id,
			station_name: station_name,
			station_code: station_code,
			station_location: station_location,
			station_node: station_node,
			station_secret: station_secret,
			station_address: station_address,
			station_duration: station_duration,
			river_id: river_id,
			station_status: station_status,
			station_updateStatus: station_updateStatus
		}
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		// console.log(body);
		res.redirect('/quantrac/quanly/tram/danhsachtram');
	});
});
module.exports = stationController;
