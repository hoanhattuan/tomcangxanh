var express = require('express');
var sensorController = express.Router();
var request = require("request");
var service = require('../../service');
var config = require('../../config/config.json');

sensorController.get('/danhsachsensor',service.ensureAuthenticated,function(req,res){
	res.render("manager/sensor/danhsachsensor",{title:"Danh sách sensor",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
sensorController.get('/themsensor',service.ensureAuthenticated,function(req,res){
	res.render("manager/sensor/themsensor",{title:"Thêm sensor",secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
sensorController.post('/themsensor',service.ensureAuthenticated,function(req,res){
	var station_id = req.body.station_id;
	var datatype_id = req.body.datatype_id;
	var sensor_name = req.body.sensor_name;
	var sensor_serialNumber = req.body.sensor_serialNumber;
	var options = {
		method: 'POST',
		url: config.urladdress + '/api/sensor/create',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			station_id: station_id,
			datatype_id: datatype_id,
			sensor_name: sensor_name,
			sensor_serialNumber: sensor_serialNumber,
		}
	};
  console.log(options);
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		res.redirect('/quantrac/quanly/sensor/danhsachsensor');
	});
});
sensorController.get('/capnhatsensor/:id',service.ensureAuthenticated,function(req,res){
	var id = req.params.id;
	var ssData,sensorData;
	var options = {
		url: config.urladdress + '/api/sensor/getbyid/' + id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
	};
	service.get(options,function(error,data){
		if (error) throw new Error(error);
		ssData = JSON.parse(data);
		sensorData = ssData.data;
		res.render("manager/sensor/capnhatsensor",{title:"Cập nhật sensor",sensorData:sensorData,secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
	});
});
sensorController.post('/capnhatsensor',service.ensureAuthenticated,function(req,res){
  var sensor_id = req.body.sensor_id;
  var station_id = req.body.station_id;
	var datatype_id = req.body.datatype_id;
	var sensor_name = req.body.sensor_name;
	var sensor_serialNumber = req.body.sensor_serialNumber;
	var options = {
		method: 'PUT',
		url: config.urladdress + '/api/sensor/update/' + sensor_id,
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'authorization': config.securitycode + req.session.token
		},
		form:{
			station_id: station_id,
			datatype_id: datatype_id,
			sensor_name: sensor_name,
			sensor_serialNumber: sensor_serialNumber,
		}
	};
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		console.log(body);
		res.redirect('/quantrac/quanly/sensor/danhsachsensor');
	});
});
module.exports = sensorController;
