class RealTime{
	constructor(input){
		// gán giá trị tham số truyền vào cho các thuộc tính của đối tượng
		this.idStation = input.idStation;
		this.dataTypes = input.dataTypes;
		this.idPond = input.idPond;
		this.idRiver = input.idRiver;
		this.StationNode = input.StationNode;
		this.conf = input.conf;
		this.token = input.token;
		this.secu = input.secu;
		this.socket = input.sockt; //truyen ket noi socket tu ngoai vao file xemdodo.ejs
		// Khai báo phương thức cho đối tượng
		if(this.idStation != -1){
			console.log("class is created with idStation: " + this.idStation);
			this.realTime();
		}
		else if(this.idPond != -1){
			console.log("class is created with idPond: " + this.idPond);
			this.realTime1();
		}
		else{
			console.log("class is created with idRiver: " + this.idRiver);
			this.realTime2();
		}
	}
	//Ham realTime de nghe socket cua tram
	//ham realTime1 de nghe socket cua ao
	// Định nghĩa phương thức
	realTime(){
		// Khai báo mảng _arrDtType gán giá trị của thuộc tích dataTypes của đối tượng vào
		// lý do để không gây hiểu lầm khi sử dụng this.dataType bên trong this.socket gây mất giá trị
		var _arrDtType = this.dataTypes;
		var _stationid = this.idStation;
		var StationNode = this.StationNode;
		this.socket.on("station_data_1_" + _stationid, function(data){
			var html = "";
			var datecreated;
			var _arrData = [],
				data_value;
			for (i in data){
				_arrData[data[i].datatype_id] = data[i];

				console.log("Data type: "+data[i].datatype_id+" - Data value:" +data[i].data_value + " - Threshsold: " +data[i].threshold_level);
			}
			/* Duyệt qua từng loại dữ liệu để lấy giá trị*/
			for(i in StationNode){
				html+="<tr>";
				_arrDtType[StationNode[i]].forEach(function(arrdatatype,index){
					if(_arrData.hasOwnProperty(StationNode[i])){
						data_value = _arrData[StationNode[i]].data_value;
						if(arrDataforCharts.length != 1){
							arrDataforCharts[StationNode[i]].shift();
							arrDataforCharts[StationNode[i]].push({date_create: moment(_arrData[StationNode[i]].data_createdDate).utc().format("YYYY-MM-DD HH:mm:ss"),data_value:_arrData[StationNode[i]].data_value});
						}
						datecreated = moment(_arrData[StationNode[i]].data_createdDate).utc().format('DD-MM-YYYY, HH:mm:ss');
						//ham if kiem tra neu qua nguong thi doi mau
						if(_arrData[StationNode[i]].threshold_level == 1){
							html+= "<td style='color:blue;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:blue;'>";
							html += data_value;
							html += "</td>";
							html+= "<td style='color:blue;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='color:blue;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 2){
							html+= "<td style='color:#C42D2D;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#C42D2D;'>";
							html += data_value;
							html += "</td>";
							html+= "<td style='color:#C42D2D;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='color:#C42D2D;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 3){
							html+= "<td style='color:#CC2C2C;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#CC2C2C;'>";
							html += data_value
							html += "</td>";
							html+= "<td style='color:#CC2C2C;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='color:#CC2C2C;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 100){
							html+= "<td style='color:#ffcc00;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#ffcc00;'>";
							html += data_value
							html += "</td>";
							html+= "<td style='color:#ffcc00;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='color:#ffcc00;'>";
							html += datecreated + "</td>";
						}
						else{
							html+= "<td style='color:black;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:black;'>" + data_value + "</td>";
							html+= "<td style='font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='color:black;'>";
							html += datecreated + "</td>";
						}
					}
					else{
						html+= "<td style='color:black;'>" + arrdatatype.datatype_name +
							"</td>";
						html += "<td style='font-weight:bold;color:black;'>-</td>";
						html+= "<td style='font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
						"</td>";
						html += "<td style='color:black;'>";
						html += "- -</td>";
					}
					html+="</tr>";
				});
			}
			if(_stationid == $("#selectSTATION1").val() || _stationid == $("#selectSTTION").val() || _stationid == $("#selecttemp").val() || _stationid == $("#selectSTATION2").val() || _stationid == $("#selectSTATION3").val() || _stationid == $("#selectSTATION").val()){
				$("#hienthi").html(html);
				if(arrDataforCharts.length != 1){
					if($("#btnDisplayChart").prop('checked')){
						initChart();
					}
				}
			}
		});
	}
	realTime1(){
		// Khai báo mảng _arrDtType gán giá trị của thuộc tích dataTypes của đối tượng vào
		// lý do để không gây hiểu lầm khi sử dụng this.dataType bên trong this.socket gây mất giá trị
		var _arrDtType = this.dataTypes;
		var _pondid = this.idPond;
		var datecreated;
		this.socket.on("station_data_0_" + _pondid, function(data){
			var html = "";
			var _arrData = [],
				data_value;
			// chuẩn bị mảng json kết quả nhận dc từ sự kiện socket
			// chuẩn bị mảng json kết quả nhận dc từ sự kiện socket
			for (i in data){
				_arrData[data[i].datatype_id] = data[i];

				console.log("Data type: "+data[i].datatype_id+" - Data value:" +data[i].data_value + " - Threshsold: " +data[i].threshold_level);
			}
			// Duyệt qua từng loại dữ liệu để lấy giá trị
			for(i in StationNode){
				html+="<tr>";
				_arrDtType[StationNode[i]].forEach(function(arrdatatype,index){
					if(_arrData.hasOwnProperty(StationNode[i])){
						data_value = _arrData[StationNode[i]].data_value;
						if(arrDataforCharts.length != 1){
							arrDataforCharts[StationNode[i]].shift();
							arrDataforCharts[StationNode[i]].push({date_create: moment(_arrData[StationNode[i]].data_createdDate).utc().format("YYYY-MM-DD HH:mm:ss"),data_value:_arrData[StationNode[i]].data_value});
						}
						datecreated = moment(_arrData[StationNode[i]].data_createdDate).utc().format('DD-MM-YYYY, h:mm a');
						//ham if kiem tra neu qua nguong thi doi mau
						if(_arrData[StationNode[i]].threshold_level == 1){
							html+= "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>"+ data_value;
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 2){
							html+= "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>" + data_value;
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 3){
							html+= "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>" + data_value
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 4){
							html+= "<td style='font-weight:bold;font-size:18px;color:#D90505;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D90505;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>"+ data_value
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#D90505;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D90505;'>";
							html += datecreated + "</td>";
						}
						else{
							html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:black;'>" + data_value + "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:black;'>";
							html += datecreated + "</td>";
						}
					}
					else{
						html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_name +
							"</td>";
						html += "<td style='font-weight:bold;font-size:18px;color:black;'>-</td>";
						html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
						"</td>";
						html += "<td style='font-weight:bold;font-size:18px;color:black;'>";
						html += "- -</td>";
					}
					html+="</tr>";
				});
			}
			if(_pondid == $("#selectPOND1").val() || _pondid == $("#selectPOND2").val() || _pondid == $("#selectPOND3").val() || _pondid == $("#selectPOND").val()){
				$("#hienthi").html(html);
				if(arrDataforCharts.length != 1){
					if($("#btnDisplayChart").prop('checked')){
						initChart();
					}
				}
			}
		});
	}
	realTime2(){
		// Khai báo mảng _arrDtType gán giá trị của thuộc tích dataTypes của đối tượng vào
		// lý do để không gây hiểu lầm khi sử dụng this.dataType bên trong this.socket gây mất giá trị
		var _arrDtType = this.dataTypes;
		var _riverid = this.idRiver;
		this.socket.on("station_data_2_" + _riverid, function(data){
			var html = "";
			var _arrData = [],
				data_value;
			// chuẩn bị mảng json kết quả nhận dc từ sự kiện socket
			// chuẩn bị mảng json kết quả nhận dc từ sự kiện socket
			for (i in data){
				_arrData[data[i].datatype_id] = data[i];

				console.log("Data type: "+data[i].datatype_id+" - Data value:" +data[i].data_value + " - Threshsold: " +data[i].threshold_level);
			}
			// Duyệt qua từng loại dữ liệu để lấy giá trị
			for(i in StationNode){
				html+="<tr>";
				_arrDtType[StationNode[i]].forEach(function(arrdatatype,index){
					if(_arrData.hasOwnProperty(StationNode[i])){
						data_value = _arrData[StationNode[i]].data_value;
						if(arrDataforCharts.length != 1){
							arrDataforCharts[StationNode[i]].shift();
							arrDataforCharts[StationNode[i]].push({date_create: moment(_arrData[StationNode[i]].data_createdDate).utc().format("YYYY-MM-DD HH:mm:ss"),data_value:_arrData[StationNode[i]].data_value});
						}
						datecreated = moment(_arrData[StationNode[i]].data_createdDate).utc().format('DD-MM-YYYY, h:mm a');
						//ham if kiem tra neu qua nguong thi doi mau
						if(_arrData[StationNode[i]].threshold_level == 1){
							html+= "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>"+ data_value;
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D0461F;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 2){
							html+= "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>" + data_value;
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#C42D2D;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 3){
							html+= "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>" + data_value
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#CC2C2C;'>";
							html += datecreated + "</td>";
						}
						else if(_arrData[StationNode[i]].threshold_level == 4){
							html+= "<td style='font-weight:bold;font-size:18px;color:#D90505;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D90505;'>";
							html += "<img src='/dist/img/icwarning2.png' title='icon'>"+ data_value
							html += "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:#D90505;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:#D90505;'>";
							html += datecreated + "</td>";
						}
						else{
							html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:black;'>" + data_value + "</td>";
							html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
							"</td>";
							html += "<td style='font-weight:bold;font-size:18px;color:black;'>";
							html += datecreated + "</td>";
						}
					}
					else{
						html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_name +
							"</td>";
						html += "<td style='font-weight:bold;font-size:18px;color:black;'>-</td>";
						html+= "<td style='font-weight:bold;font-size:18px;color:black;'>" + arrdatatype.datatype_unit +
						"</td>";
						html += "<td style='font-weight:bold;font-size:18px;color:black;'>";
						html += "- -</td>";
					}
					html+="</tr>";
				});
			}
			if(_riverid == $("#selectRIVER1").val() || _riverid == $("#selectRIVER2").val() || _riverid == $("#selectRIVER3").val() || _riverid == $("#selectRIVER").val()){
				$("#hienthi").html(html);
				if(arrDataforCharts.length != 1){
					if($("#btnDisplayChart").prop('checked')){
						initChart();
					}
				}
			}
		});
	}
}
// Lop RealTimePushNotification chua ham  realTimePushNotification thuc hien viec nghe socket tat ca
class RealTimePushNotificationForStation{
	constructor(input){
		this.socket = input.sockt; //truyen ket noi socket tu ngoai vao file xemdodo.ejs
		// Khai báo phương thức cho đối tượng
		this.arrStation = input.arrStation2;
		this.conf = input.conf;
		this.token = input.token;
		this.secu = input.secu;
		this.realTimePushNotificationForStation();
		console.log("Đã bật realtime thông báo ngưỡng cho trạm");
	}

	// Định nghĩa phương thức
	realTimePushNotificationForStation(){
		//nghe vượt ngưỡng của sông
		var arrStation = this.arrStation;
		var conf = this.conf;
		var token = this.token;
		var secu = this.secu;
		var html = "";
		//duyet qua mang cac tram
		arrStation2.forEach(function(items){
			socket_global.on("notifi_data_" + items, function(dataresult){
				console.log(dataresult);
				$("#countmessage").html(parseInt($("#countmessage").text()) + 1);
				$("#titlemessage").html((parseInt($("#titlemessage").text()) + 1) + " thông báo chưa đọc");
				getNotification(conf,token,secu,user_ID,0,10,function(dataNotifi){
					dataNotifi.forEach(function(data,index){
						if(data.notif_readState == 0){
							html += "<li class='bg-info' id='notifialert_"+ data.notif_id +"'>";
						}
						else{
							html += '<li>';
						}
						/*Thông báo chưa đọc hiện màu xanh. Đọc rồi hiện trắng*/
						html += '<a href="#" onclick="showModalNoti('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + data.data_id + ',' + data.threshold_id + ',' + "'" + data.notif_title + "'" + ',' + data.notif_id +','+ data.region_id + ',' + "'" + data.notif_createdDate + "'" + ',' + data.notif_readState +')">';
						html += data.notif_title;
						html += '<p>Thời gian đo: ';

						moment.locale('vi');
						/*So sánh với thời gian hiện tại*/
						html += moment(data.notif_createdDate).utc().format('DD-MM-YYYY, HH:mm') + '</p>';
						html += '</a>';
						html += '</li>';
					});
					$("#listNotification").html(html);
				}); /*Load lại thông báo*/
				getDataById(conf,token,secu,dataresult.data_id,function(items){
					var station_id = items.station_id;
					var data_value = items.data_value;
					getDataTypeById(conf,token,secu,items.datatype_id,function(item){
						if(arrBlockStation.indexOf(station_id)  == -1){
							var audio = new Audio('/audio/alarmfrenzy.mp3');
					    audio.play();
							Push.create(dataresult.notif_title, {
								body: "Độ đo " + item.datatype_name + " có giá trị đo " + data_value + " vượt ngưỡng " + dataresult.threshold_level + ". Chọn để xem chi tiết",
								icon: {
							        x16: '/dist/img/icwarn2.png',
							        x32: '/dist/img/icwarn1.png'
							    },
								timeout: 10000,
								onClick: function () {
									window.focus();
									this.close();
									showModalNoti(conf,token,secu,dataresult.data_id,dataresult.threshold_id,dataresult.notif_title,dataresult.notif_id,dataresult.region_id,dataresult.notif_createdDate,0);
								}
							});
						}
					});
				});
				// processDataForNotiStation(conf,token,secu,dataresult.data_id,dataresult.threshold_id,dataresult.threshold_level,dataresult.notif_title,dataresult.notif_id,dataresult.region_id,dataresult.notif_createdDate);
			});
		});
	}
}
