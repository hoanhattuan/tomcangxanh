var express = require('express');
var service = require('../../service');
var http = require ('http');
var request = require('request');
var thresholdController = express.Router();
var datetime = require('node-datetime');
var config = require('../../config/config.json'); //goi toi file cau hinh duong dan
//,service.ensureAuthenticated them vao giua get de yeu cau chung thuc

thresholdController.get("/danhsachnguong",service.ensureAuthenticated, function(req, res) {
  res.render("manager/nguong/danhsachnguong", {title: 'Xem danh sách ngưỡng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName});
});
thresholdController.get("/themnguong",service.ensureAuthenticated,function(req,res){
    res.render("manager/nguong/themnguong",{title: 'Thêm ngưỡng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,fullName:req.session.fullName})
});
thresholdController.post("/themnguong",function(req,res){
    var datenow = datetime.create();
    var formatted = datenow.format('Y-m-d H:M:S');
    var datatype_id = req.body.datatype_id;
    var region_id = req.body.region_id;
    var age_id = req.body.age_id;
    var species_id = req.body.species_id;
    var threshold_name = req.body.threshold_name;
    var threshold_start = req.body.threshold_start;
    var threshold_end = req.body.threshold_end;
    var threshold_level = req.body.threshold_level;
    var threshold_message = req.body.threshold_message;
    var threshold_createdDate = formatted;
    var threshold_timeWarning = req.body.threshold_timeWarning;
    var threshold_type = req.body.threshold_type;
    var options = {
      url: config.urladdress+'/api/threshold/create/',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded',
      'authorization': config.securitycode + req.session.token },
      form:{
        datatype_id: datatype_id,
        region_id: region_id,
        age_id: age_id,
        species_id: species_id,
        threshold_name: threshold_name,
        threshold_start: threshold_start,
        threshold_end: threshold_end,
        threshold_level: threshold_level,
        threshold_message: threshold_message,
        threshold_createdDate: threshold_createdDate,
        threshold_timeWarning: threshold_timeWarning,
        threshold_type: threshold_type
      }
    };
    // console.log(options);
    service.post(options,function(error,body){
      if(error){
        return error;
      }
      res.redirect('/quantrac/quanly/nguong/danhsachnguong');
    });
});
thresholdController.get("/capnhatnguong/:id",service.ensureAuthenticated,function(req,res){
    var id = req.params.id;
    var threshold_type;
    var options = {
      url: config.urladdress+'/api/threshold/getbyid/' + id,
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'authorization': config.securitycode + req.session.token },
    };
    service.get(options,function(error,data){
      if(error){
        return error;
      }
      else{
        TData = JSON.parse(data);
        thresholdData = TData.data;
        if(thresholdData.threshold_type == true){
          threshold_type = 1;
        }
        else if(thresholdData.threshold_type == false){
          threshold_type = 0;
        }
        else{
          threshold_type = null;
        }
        res.render("manager/nguong/capnhatnguong",{title: 'Cập nhật ngưỡng',secu:config.securitycode,conf:config.urladdress,token:req.session.token,userid:req.session.userid,username:req.session.username,thresholdData:thresholdData,threshold_type:threshold_type,fullName:req.session.fullName});
      }
    });
});
thresholdController.post('/capnhatnguong/', function(req, res) {
    var datatype_id = req.body.datatype_id;
    var datenow = datetime.create();
    var formatted = datenow.format('Y-m-d H:M:S');
    var region_id = req.body.region_id;
    var age_id = req.body.age_id;
    var species_id = req.body.species_id;
    var threshold_id = req.body.threshold_id;
    var threshold_name = req.body.threshold_name;
    var threshold_start = req.body.threshold_start;
    var threshold_end = req.body.threshold_end;
    var threshold_level = req.body.threshold_level;
    var threshold_message = req.body.threshold_message;
    var threshold_createdDate = formatted;
    var threshold_timeWarning = req.body.threshold_timeWarning;
    var threshold_type = req.body.threshold_type;
    var address = config.urladdress + "/api/threshold/update/" + threshold_id;
    var token = config.securitycode + req.session.token;
    var options = {
      method: 'PUT',
      url: address,
      headers: { 
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': token
      },
      form: {
        datatype_id: datatype_id,
        region_id: region_id,
        age_id: age_id,
        species_id: species_id,
        threshold_name: threshold_name,
        threshold_start: threshold_start,
        threshold_end: threshold_end,
        threshold_level: threshold_level,
        threshold_message: threshold_message,
        threshold_createdDate: threshold_createdDate,
        threshold_timeWarning: threshold_timeWarning,
        threshold_type: threshold_type
      }
    };
    // console.log(options);
    service.put(options,function(error,data){
      if (error){
          throw new Error(error);
        }
      res.redirect('/quantrac/quanly/nguong/danhsachnguong');
    });
});
module.exports = thresholdController;