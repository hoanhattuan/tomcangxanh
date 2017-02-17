var express = require('express');
var service = require('../../services/service');
var config = require('../../config/config.json');
var dataController = express.Router();

//Lay du lieu theo tram
dataController.get('/xemsodo',service.ensureAuthenticated,function(req,res){
	//Thiet lap token, lay user_id de xac dinh cac tram, dinh nghia cac bien truyen vao view
	var token = "JWT " + req.session.token;
	var user_id = req.user.id;
	var userStation;
	var riverStation = "[";
	//Goi ham lay danh sach tram theo user_id, ket qua tra ve se chia thanh 2 nhanh co hoac ko co du lieu
	var options = service.setOption('GET',config.urladdress + '/api/station/getbyuser/'+ user_id,{'Authorization':token},null);
	service.get(options,function(error,data){
		if(error){
			return error;
		}else{
			var data = JSON.parse(data);
			//Nhanh khong co du lieu
			if(data.length<= 0){
				//Goi ham lay tat ca cac tram, de chon tram nguon va dich o song, ket qua co 2 nhanh
				var options = service.setOption('GET',config.urladdress + '/api/station/getall',{'Authorization':token},null);
				service.get(options,function(error,data){
					if(error){
						return;
					}else{
						var data = JSON.parse(data);
						if(data.length<=0){
							res.render('farmer/data/getbystation',{title:'Xem dữ liệu đo',conf:config.urladdress,token:token,userStations:null,riverStations:null});
						}else{
							//Lay du lieu tien hanh lap de lay cac tram dau nguon va cuoi nguon
							dataRiverStation = data.data;
							for(var i = 0 ; i < dataRiverStation.length;++i){
								if(dataRiverStation[i].river_id != null){
									riverStation+='{"station_id":"'+ dataRiverStation[i].station_id + '", "station_name":"'+dataRiverStation[i].station_name + '"},';
								}
							}
							riverStation = riverStation.slice(0,riverStation.length-1);
							riverStation += "]";
							riverStation= JSON.parse(riverStation);
							res.render('farmer/data/getbystation',{title:'Xem dữ liệu đo',conf:config.urladdress,token:token,userStations:null,riverStations:riverStation});
						}
					}
				});
			}else{
				//Nhanh co du lieu
				userStation = data.data;
				//Goi ham lay tat ca danh sach tram de tim tram dau nguon va cuoi nguon
				var options = service.setOption('GET',config.urladdress + '/api/station/getall',{'Authorization':token},null);
				service.get(options,function(error,data){
					if(error){
						return;
					}else{
						var data = JSON.parse(data);
						if(data.length<=0){
							res.render('farmer/data/getbystation',{title:'Xem dữ liệu đo',conf:config.urladdress, token:token,userStations:userStation,riverStations:null});
						}else{
							//Chay vong lap tim cac tram dau nguon va cuoi nguon
							dataRiverStation = data.data;
							for(var i = 0 ; i < dataRiverStation.length;++i){
								if(dataRiverStation[i].river_id != null){
									riverStation+='{"station_id":"'+ dataRiverStation[i].station_id + '", "station_name":"'+dataRiverStation[i].station_name + '"},';
								}
							}
							riverStation = riverStation.slice(0,riverStation.length-1);
							riverStation += "]";
							riverStation= JSON.parse(riverStation);
							res.render('farmer/data/getbystation',{title:'Xem dữ liệu đo',conf:config.urladdress,token:token,userStations:userStation,riverStations:riverStation});
						}
					}
				});
			}
		}
	});
});

module.exports = dataController;
