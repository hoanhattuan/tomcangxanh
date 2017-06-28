var arrStation2 = []; //tao mang de chua tat ca cac tram
var arrCheckStation = []; //luu cac tram de xoa socket khi doi vung
var arrDataType = []; //luu danh sach cac loai du lieu de chon xem bieu do
var StationNode = []; //Luu danh sach cac station node trong thong tin tram de so sanh realtime
var arrDataTypeUnit = []; //Mảng chứa các đơn vị đo (đang kiểm tra)
var arrdttypeForRadio = []; //Mảng chứa các id datatype
var arrDataTypeOfId = []; //Mảng chứa id và name của data type
var typeLocation; //Cap quan ly
var queue = []; //Mảng để chờ load dữ liệu
var queue2 = []; //Mảng để chờ load dữ liệu
var queue3 = []; //Mảng chờ load dữ liệu default
var drawCrt = 0; //0 la đang xem bình thường - 1 là đang vẽ
var arrStationName = []; //Lưu danh sách tên trạm để realtime báo ngưỡng
var arrBlockStation = []; //Mảng những trạm bị chặn thông báo
var config = ''; //lưu đường dẫn của service.
var tokend = ''; //lưu token xác thực để sử dụng webservice
var security = ''; //lưu kiểu xác thực của webservice
var user_ID = 0; //lưu user id của người dùng đăng nhập
var socket_global = ''; //lưu socketcuar người dùng
var ispageNotification = false; /*Biến xác định xem có phải đang ở trang xem thông báo hay không
* Nếu phải thì mới gọi hàm getListnotification không thì không gọi.
*
* config,tokend,security,user_ID,socket_global là những biến toàn cục lần đầu load sẽ lấy dữ liệu truyền từ giao diện qua để sd
*/
var arrDataforCharts = [0]; /*Lưu mảng dữ liệu cho xem biểu đồ*/
var stationdefault = 0; /*Lưu station trạm mặc định xem dữ liệu*/
//luu mang du lieu theo tung loai cho bieu do - gan mac dinh phan tu 0 de kiem tra
//neu khong co xem bieu do truoc do thi khong goi ham initchart()

/*Hàm load dữ liệu 1 trạm default cho trang chủ*/
function loadDefaultData(conf,token,secu,sock,stationid){
	var address,_stationnode;
	var pondid = -1;
	var notf;
	// getAllStationNode(conf,token,secu,stationid);
	getStationById(conf,token,secu,stationid,function(data){
		var regionname = "";
		_stationnode = data.station_node;
		StationNode = _stationnode.split('|'); /*Chuyển thành mảng danh sách StationNode để so sánh lấy dữ liệu*/
		address = conf + '/api/data/gettopbystation/' + stationid;
		var optiontemp = "<option value='"+stationid+"'>"+stationid+"</option>";
		$("#selecttemp").html(optiontemp); /*Them 1 select tam roi an di de giai quyet van de realtime default*/
		notf = data.station_name; /*Gán title của box body*/
		getTOPdatabyStaion(address,conf,secu,token,regionname,notf,stationid,pondid,sock); /*Gọi hàm đỗ dữ liệu vào bảng*/
	});
}
/*Hàm lấy  thông tin trạm theo station id*/
function getStationById(config,token,security,StationId,callback){
	jQuery.ajax({
		url : config + '/api/station/getbyid/' + StationId,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách trạm theo stationid. Vui lòng tải lại trang");
		},
	});
}
//Ham duoc goi dau tien khi load giao dien xemdodo len.
function loadFIRST(conf,token,secu,userid,sock,ishompage_loaddata){
	config = conf;
	tokend = token;
	security = secu;
	user_ID = userid;
	socket_global = sock;
	var arrProvince = [];
	var arrDistrict = [];
	var arrWard = [];
	var arrRegion = [];
	var settings = {
	  	"async": true,
	  	"crossDomain": true,
	  	"url": conf + "/api/locationmanager/getlistbyuser/" + userid,
	  	"method": "GET",
	  	"dataType": "json",
	  	"contentType": "application/json; charset=utf-8",
	  	"headers": {
		    "authorization": secu + token
	  	}
	}
	setDefaultDisplayDate();
	blockContent();
	blockFormChart();
	$("#displayChart").css("display","none");
	// $("#btnDisplayChart").css('visibility','hidden');
	$.ajax(settings).done(function (resultdata) {
		typeLocation = resultdata.data.typeLocation;
		if(resultdata.data.typeLocation == "Province"){
			$('#selectPROVINCE').find('option').remove();
			$('#selectPROVINCE').append($("<option></option>").attr("value",-1).text("Chọn tỉnh/TP"));
		}
		else if(resultdata.data.typeLocation == "District"){
			$('#selectDISTRICT').find('option').remove();
			$('#selectDISTRICT').append($("<option></option>").attr("value",-1).text("Chọn quận/huyện"));
		}
		else if(resultdata.data.typeLocation == "Ward"){
			$('#selectWARD').find('option').remove();
			$('#selectWARD').append($("<option></option>").attr("value",-1).text("Chọn xã/phường"));
		}
		else{
			$('#region_hide').css("display","none");
			$('#selectREG3').find('option').remove();
			$('#selectREG3').append($("<option></option>").attr("value",-1).text("Chọn vùng"));
		}
		for(i in resultdata.data.data){
			if(resultdata.data.typeLocation == "Province"){
				arrProvince.push({province_id:resultdata.data.data[i].province_id,province_name:resultdata.data.data[i].province_name});
			}
			else if(resultdata.data.typeLocation == "District"){
				arrDistrict.push({district_id:resultdata.data.data[i].district_id,district_name:resultdata.data.data[i].district_name});
			}
			else if(resultdata.data.typeLocation == "Ward"){
				arrWard.push({ward_id:resultdata.data.data[i].ward_id,ward_name:resultdata.data.data[i].ward_name});
			}
			else{
				/*Mảng arrRegion lưu để push data cho thẻ select*/
				arrRegion.push({region_id:resultdata.data.data[i].region_id,region_name:resultdata.data.data[i].region_name});
			}
		}
		loadRealTime(conf,token,secu,userid,sock,ishompage_loaddata); /*Goi ham realtime thông báo*/
	}).complete(function(){
		var arrayProvince = sortByKey(arrProvince,"province_id");
		var arrayDistrict = sortByKey(arrDistrict,"district_id");
		var arrayWard = sortByKey(arrWard,"ward_id");
		var arrayRegion = sortByKey(arrRegion,"region_id");
		pushDatatoSelect(arrayProvince,arrayDistrict,arrayWard,arrayRegion,typeLocation,conf,token,secu,sock);
	});
	$.ajax().error(function(jqXHR,status,error){
		displayError("Lỗi ! Không thể tải dữ liệu. Vui lòng tải lại trang");
	});
}
/*Hàm sắp xếp phần tử dựa trên  khóa đầu vào*/
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
//Hàm push data vào select
function pushDatatoSelect(arrayProvince,arrayDistrict,arrayWard,arrayRegion,typeLocation,conf,token,secu,sock){
	if(typeLocation == "Province"){
		if(arrayProvince.length != 0){
			arrayProvince.forEach(function(data,index){
				$('#selectPROVINCE').append($("<option></option>").attr("value",data.province_id).text(data.province_name));
				$("#selectPROVINCE").css("display", "block");
			});
		}
		else{
			displayError("Chưa có dữ liệu về tỉnh quản lý !!");
			unblockContent();
			$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
			unblockFormChart();
		}
	}
	else if(typeLocation == "District"){
		if(arrayDistrict.length != 0){
			arrayDistrict.forEach(function(data,index){
				$('#selectDISTRICT').append($("<option></option>").attr("value",data.district_id).text(data.district_name));
				$("#selectDISTRICT").css("display", "block");
			});
		}
		else{
			displayError("Chưa có dữ liệu về huyện quản lý !!");
			unblockContent();
			$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
			unblockFormChart();
		}
	}
	else if(typeLocation == "Ward"){
		if(arrayWard.length != 0){
			arrayWard.forEach(function(data,index){
				$('#selectWARD').append($("<option></option>").attr("value",data.ward_id).text(data.ward_name));
				$("#selectWARD").css("display", "block");
			});
		}
		else{
			displayError("Chưa có dữ liệu về xã quản lý !!");
			unblockContent();
			$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
			unblockFormChart();
		}
	}
	else{
		if(arrayRegion.length != 0){
			arrayRegion.forEach(function(data,index){
				$('#selectREG3').append($("<option></option>").attr("value",data.region_id).text(data.region_name));
				$("#selectREG3").css("display", "block");
			});
		}
		else{
			displayError("Chưa có dữ liệu về vùng quản lý !!");
			unblockContent();
			$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
			unblockFormChart();
		}
	}
	// setDefaultSelected(conf,token,secu,typeLocation,sock);
}
//Ham set default khi vua vao trang xemdodo
// function setDefaultSelected(conf,token,secu,typeLocation,sock){
// 	if(typeLocation == "Province"){
// 		$("#selectPROVINCE").prop("selectedIndex", 2);
// 		loadDISTRICT(conf,token,secu,sock,1);
// 	}
// 	else if(typeLocation == "District"){
// 		$("#selectDISTRICT").prop("selectedIndex", 2);
// 		loadWARD1(conf,token,secu,sock,1);
// 	}
// 	else if(typeLocation == "Ward"){
// 		$("#selectWARD").prop("selectedIndex", 3);
// 		loadREG1(conf,token,secu,sock,1);
// 	}
// 	else{
// 		$("#selectREG3").prop("selectedIndex", 1);
// 		loadSTATION1(conf,token,secu,sock,1);
// 	}
// }

/*Hàm push thông báo quá ngưỡng*/
function loadRealTime(conf,token,secu,userid,sock,ishompage_loaddata){
	config = conf;
	tokend = token;
	security = secu;
	user_ID = userid;
	socket_global = sock;
	var _objListenerForStation;
	/*Gọi hàm lấy về trạm mặc định sau đó gán xem dữ liệu*/
	getStationDefault(conf,token,secu,userid,function(data){
		if(data != null){
			stationdefault = data.station_id;
			if(ishompage_loaddata){
				loadDefaultData(config,token,security,sock,data.station_id);
			}
		}
		else{
			stationdefault = null;
			unblockContent();
			$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
		}
	});
	getStationByUserId(conf,token,secu,userid,function(arrayStation){
		if(arrayStation != null){
			arrayStation.forEach(function(items){
				if(arrStation2.indexOf(items.station_id)  == -1){
					arrStation2.push(items.station_id);
					arrStationName[items.station_id] = [];
					arrStationName[items.station_id] = items.station_name;
				}
			});
			getBlockStationByUserId(conf,token,secu,userid);
			_objListenerForStation = new RealTimePushNotificationForStation({arrStation:arrStation2,sock: socket,conf:config,token:token,secu:security});
			showDefaultStation(config,token,security,userid);
		}
	});
}
/*Hàm hiển thị radio lựa chọn trạm mặc định*/
function showDefaultStation(config,token,security,userid){
	var html = '';
	// getStationByUserId(config,token,security,userid,function(arrayStation){
	/*Lấy mảng danh sách trạm để sử dụng*/
	arrStation2.forEach(function(items){
		html +='<div class="form-group custom-formgroup-sidebar">';
        html +='<label class="control-sidebar-subheading">';
        html += arrStationName[items];
        // html += '<input type="radio" id="rdXemDuLieu" name="rdXemDuLieu" value="' + items + '" class="pull-right" onchange="processStationblock(this,'+items+')">';
		if(items == stationdefault){
			html += '<input type="radio" id="rdXemDuLieu" name="rdXemDuLieu" checked value="' + items + '" class="pull-right" onchange="processStationDefault(this,'+items+')">';
		}
		else{
			html += '<input type="radio" id="rdXemDuLieu" name="rdXemDuLieu" value="' + items + '" class="pull-right" onchange="processStationDefault(this,'+items+')">';
		}
		html +='</label>';
        html +='</div>';
	});
	$("#select-xemdulieu").html(html);
	// });

}
/*Xử lý khi đổi radio*/
function processStationDefault(object,stationid){
	var address = '';
	var type = '';
	if(stationdefault == null){
		address = config + '/api/stationdefault/create?user_id='+user_ID+'&station_id='+stationid;
		type = 'POST';
	}
	else{
		address = config + '/api/stationdefault/update?user_id='+user_ID+'&station_id='+stationid;
		type = 'PUT';
	}
	jQuery.ajax({
		url : address,
		type: type,
		headers: {'Authorization':security + tokend},
		contentType: 'application/json; charset=utf-8',
		success: function(response){
			$("#thongbao").html("Đã chọn trạm mặc định thành công");
			$("#thongbaokhoatram").css("display","block");
			getStationDefault(config,tokend,security,user_ID,function(data){
				if(data != null){
					stationdefault = data.station_id;
					$("#btnDisplayChart").bootstrapToggle('off');
					/*Kiểm tra xem có phải ở trang chủ hay trang xem dữ liệu không. Nếu có mới gọi hàm load lại dữ liệu của bảng*/
					if(ishompage_loaddata){
						loadDefaultData(config,tokend,security,socket_global,data.station_id);
					}
				}
				else{
					stationdefault = null;
					unblockContent();
					$("#btnDisplayChart").prop("disabled", true); //Mở khóa nút xem biểu đồ
				}
			});
			setTimeout(function() {
				$("#thongbaokhoatram").css("display","none");
			}, 3000);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể chọn trạm xem dữ liệu mặc định. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy về id của trạm default xem dữ liệu*/
function getStationDefault(conf,token,secu,userid,callback){
	jQuery.ajax({
		url: conf + '/api/stationdefault/getbyuser/'+ userid,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể lấy được id của trạm mặc định. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm lấy về danh sách 10 thông báo mới nhất chưa đọc dựa trên userid của người quản lý*/
function getNotification(conf,token,secu,userid,index,size,callback){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	jQuery.ajax({
		url: conf + '/api/notification/getbymanager/'+ userid + '?index=' + index + '&size=' + size,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
			// resultdata.data.forEach(function(data,index){
			// 	if(data.notif_readState == 0){
			// 		html += "<li class='bg-info' id='notifialert_"+ data.notif_id +"'>";
			// 	}
			// 	else{
			// 		html += '<li>';
			// 	}
			// 	/*Thông báo chưa đọc hiện màu xanh. Đọc rồi hiện trắng*/
			// 	html += '<a href="#" onclick="showModalNoti('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + data.data_id + ',' + data.threshold_id + ',' + "'" + data.notif_title + "'" + ',' + data.notif_id +','+ data.region_id + ',' + "'" + data.notif_createdDate + "'" + ',' + data.notif_readState +')">';
			// 	html += data.notif_title;
			// 	html += '<p>Thời gian đo: ';
			//
			// 	moment.locale('vi');
			// 	/*So sánh với thời gian hiện tại*/
			// 	html += moment(data.notif_createdDate).utc().format('DD-MM-YYYY, HH:mm') + '</p>';
			// 	html += '</a>';
			// 	html += '</li>';
			// });
			// $("#listNotification").html(html);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách thông báo. Vui lòng tải lại trang");
  		},
	});

}
/*Hàm lấy về số thông báo dựa trên userid của người quản lý*/
function countNotification(sock,userid){
	var html = '';
	sock.emit('login',userid);
    sock.on('login_notification',function(data){
        data.forEach(function(dt){
          	html += dt.notif_totalRow;
          	$("#countmessage").html(html);
          	$("#titlemessage").html(html + " thông báo chưa đọc");
        });
    });
}
/*Hàm lấy về danh sách trạm bị chặn thông báo theo userid*/
function getBlockStationByUserId(conf,token,secu,userid){
	jQuery.ajax({
		url: conf + "/api/blocknotification/getlistbyuser/" + userid,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			resultdata.data.forEach(function(data){
				arrBlockStation.push(data.station_id);
			});
		},
		error:function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy được dữ liệu của trạm bị chặn. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			showBlockStation(conf,token,secu,userid);
		}
	})
}
/*Hàm xử lý mở / khóa thông báo trạm*/
function processStationblock(object,stationid){
	/*CODING*/
	/*object là đối tượng checkbox để kiểm tra xem input có được check hay không*/
	if(object.checked){
		blockStation(config,tokend,security,user_ID,stationid); /*Khóa thông báo trạm*/
	}
	else{
		unblockStation(config,tokend,security,user_ID,stationid); /*Mở khóa thông báo trạm*/
	}
	// CODING
}
/*Hàm khóa thông báo trạm*/
function blockStation(config,tokend,security,user_ID,stationid){
	queue2.push(1);
	jQuery.ajax({
		url : config + '/api/blocknotification/create?user_id='+user_ID+'&station_id='+stationid,
		type: 'POST',
		headers: {'Authorization':security + tokend},
		contentType: 'application/json; charset=utf-8',
		success: function(response){
			$("#thongbao").html("Đã khóa thành công");
			$("#thongbaokhoatram").css("display","block");
			setTimeout(function() {
				$("#thongbaokhoatram").css("display","none");
			}, 3000);
		},
		error: function(jqXHR,textStatus,errorThrown){
			arrBlockStation = [];
			getBlockStationByUserId(config,tokend,security,user_ID);
			displayError("Lỗi ! Không thể khóa thông báo trạm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue2.pop();
		if(queue2.length == 0){
			arrBlockStation = [];
			getBlockStationByUserId(config,tokend,security,user_ID);
		}
	});
}
/*Mở khóa thông báo trạm*/
function unblockStation(config,tokend,security,user_ID,stationid){
	queue3.push(1);
	jQuery.ajax({
		url : config + '/api/blocknotification/delete?user_id='+user_ID+'&station_id='+stationid,
		type: 'DELETE',
		headers: {'Authorization':security + tokend},
		contentType: 'application/json; charset=utf-8',
		success: function(response){
			$("#thongbao").html("Đã mở khóa thành công");
			$("#thongbaokhoatram").css("display","block");
			setTimeout(function() {
				$("#thongbaokhoatram").css("display","none");
			}, 3000);
		},
		error: function(jqXHR,textStatus,errorThrown){
			arrBlockStation = [];
			getBlockStationByUserId(config,tokend,security,user_ID);
			displayError("Lỗi ! Không thể mở khóa thông báo trạm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if(queue3.length == 0){
			arrBlockStation = [];
			getBlockStationByUserId(config,tokend,security,user_ID);
		}
	});
}
/*Hàm lấy danh sách trạm theo userid*/
function getStationByUserId(config,token,security,userid,callback){
	jQuery.ajax({
		url : config + '/api/station/getbyuser/' + userid,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(response){
			callback(response.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách trạm theo userid. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy danh sách trạm theo userid cho trang danh sách trạm*/
function getListStationPaginationByUserId(conf,token,secu,userid,index,pagesize){
	var totals = 0;
	var html = "";
	var html2 = "";
	var keyword = '';
	var presentPage = 0;
	if($('#txtTimKiem').val() != ''){
		$('.pagi-custom').hide();
		keyword = $('#txtTimKiem').val();
	}
	var station_address='',river_name ='',pond_description='',sink_name='',station_updateStatus='',station_location='';
	jQuery.ajax({
		url : config + '/api/station/getpagination/' + userid + '?page=' + index +'&pageSize=' + pagesize +'&keyword=' + keyword,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				presentPage = parseInt(resultdata.data.Page);
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += "<td>" + items.station_name  + "</td>";
					if(items.station_address != null){
						html += "<td>" + items.station_address + "</td>";
						station_address = items.station_address;
					}
					else{
						html += "<td></td>";
						station_address = '';
					}
					if(items.station_location != null){
						station_location = items.station_location;
					}
					else{
						station_location = '';
					}
					if(items.River != null){
						river_name = items.River.river_name;
					}
					else{
						river_name = '';
					}
					if(items.station_updateStatus == true){
						station_updateStatus = 'Có';
					}
					else{
						station_updateStatus = 'Không';
					}
					if(items.Pond != null){
						pond_description = items.Pond.pond_description;
					}
					else{
						pond_description = '';
					}
					if(items.Sink != null){
						sink_name = items.Sink.sink_name;
					}
					else{
						sink_name = '';
					}
					html += "<td>" + items.Region.region_name  + "</td>";
					html += "<td><a title='Cập nhật thông tin trạm' href='/quantrac/quanly/tram/capnhattram/"+ items.station_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";

					html += '<td><a title="Xem chi tiết về trạm" href="#" onclick="showModalStation('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.station_id + ',' + "'" + items.station_name + "'" + ',' + "'" + station_location + "'" + ',' + "'" + items.station_node + "'" + ',' + "'" + station_address + "'" + ',' + items.station_duration + ',' + "'" + station_updateStatus + "'" + ',' + "'" + pond_description + "'" + ',' + "'" + river_name + "'" + ',' + "'" + items.Region.region_name + "'" + ',' + "'" + sink_name + "'" +')">';
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += "<td><a title='Xem các thiết lập cấu hình trạm' href='/quantrac/quanly/tramcauhinh/xemgiatricauhinh/" + items.station_id +"'>";
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += "</tr>";
				});

			}
			else{
				html += "<tr>";
				html += "<td colspan='6'>Không có dữ liệu</td>";
				html += "</tr>";
			}
			$("#hienthitram").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 0; i<= totals-1; i++){
						if(i == presentPage){
							html2 += '<li class="active"><a href="#" onclick="processPaginationStation('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ','  + index + ','  + pagesize +');return false;">'+(i+1)+'</a></li>';
						}
						else{
							html2 += '<li><a href="#" onclick="processPaginationStation('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ','  + index + ','  + pagesize +');return false;">'+(i+1)+'</a></li>';
						}

					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách trạm theo userid. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho station*/
function processPaginationStation(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListStationPaginationByUserId(conf,token,secu,userid,(page-1),pages);
	});
}
/*Hàm lấy danh sách sink*/
function getSink(config,token,security,userid,callback){
	jQuery.ajax({
		url : config + '/api/station/getbyuser/' + userid,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(response){
			callback(response.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách trạm theo userid. Vui lòng tải lại trang");
		},
	});
}
/*Hàm hiển thị các trạm đã tắt trạm*/
function showBlockStation(config,token,security,userid){
	var html = '';
	// getStationByUserId(config,token,security,userid,function(arrayStation){
	/*Lấy mảng danh sách trạm để sử dụng*/
	arrStation2.forEach(function(items){
		html +='<div class="form-group custom-formgroup-sidebar">';
        html +='<label class="control-sidebar-subheading">';
        html += arrStationName[items];
		if(arrBlockStation.indexOf(items) == -1){
			html += '<input type="checkbox" id="cbKhoaTram" name="cbKhoaTram" value="' + items + '" class="pull-right" onchange="processStationblock(this,'+items+')">';
		}
		else{
			html += '<input type="checkbox" id="cbKhoaTram" name="cbKhoaTram" checked value="' + items + '" class="pull-right" onchange="processStationblock(this,'+items+')">';
		}
		html +='</label>';
        html +='</div>';
	});
	$("#select-tattram").html(html);
}
// Được gọi khi người dùng chọn selectPROVINCE -->
function loadDISTRICT(conf,token,secu,sock,state){ //state chi trang thai load 1: default 0: thuong
	resetWhenSelectedProvince();
	queue3.push(1);
	$('#selectDISTRICT1').find('option').remove();
	$('#selectDISTRICT1').append($("<option></option>").attr("value",-1).text("Chọn quận/huyện"));
	provinceId = document.getElementById("selectPROVINCE").value;
	if(provinceId != -1){
		jQuery.ajax({
			url: conf + '/api/location/getdistrictbyprovince/' + provinceId,
			type: 'GET',
			contentType: 'application/json; charset=utf-8',
			success: function(resultdata){
				// var option ='';
				// option += "<option value='" + -1 +"'>Chọn quận/huyện</option>";
				for(i in resultdata.data){
					// option += "<option value='" + resultdata.data[i].district_id +"'>" + resultdata.data[i].district_name +"</option>";
					$('#selectDISTRICT1').append($("<option></option>").attr("value",resultdata.data[i].district_id).text(resultdata.data[i].district_name));
					$("#selectDISTRICT1").css("display", "block");
				}
			},
			error: function(jqXHR,textStatus,errorThrown){
				displayError("Lỗi ! Không thể tải dữ liệu của huyện. Vui lòng tải lại trang");
			},
		}).complete(function() {
			queue3.pop();
			if (queue3.length == 0) {
				//code gi do
			}
		});
	}
}
// Được gọi khi người dùng chọn selectDISTRICT,selectDISTRICT1 -->
function loadWARD1(conf,token,secu,sock,state){
	resetWhenSelectedDistrict();
	queue3.push(1);
	$("#selectWARD2").find('option').remove();
	$("#selectWARD1").find('option').remove();
	var iddis = -1;
	var iddis1 = -1;
	iddis1 = document.getElementById("selectDISTRICT1").value;
	iddis = document.getElementById("selectDISTRICT").value;
	if(iddis1 != ""){
		$('#selectWARD2').append($("<option></option>").attr("value",-1).text("Chọn xã/phường"));
		districtId = document.getElementById("selectDISTRICT1").value;
	}
	if(iddis != ""){
		districtId = document.getElementById("selectDISTRICT").value;
		$('#selectWARD1').append($("<option></option>").attr("value",-1).text("Chọn xã/phường"));
	}
	// districtId = document.getElementById("selectDISTRICT").value;
	jQuery.ajax({
		url: conf + '/api/location/getwardbydistrict/' + districtId,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			for(i in resultdata.data){
				if(iddis1 != ""){
					$('#selectWARD2').append($("<option></option>").attr("value",resultdata.data[i].ward_id).text(resultdata.data[i].ward_name));
					$("#selectWARD2").css("display", "block");
				}
				else{
					$('#selectWARD1').append($("<option></option>").attr("value",resultdata.data[i].ward_id).text(resultdata.data[i].ward_name));
					$("#selectWARD1").css("display", "block");
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của xã. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if (queue3.length == 0) {
			//code gid do
		}
	});
}
//ham tra ve ward id
function wardSELECTED(){
	var idw = -1;
	var idw1 = -1;
	var idw2 = -1;
	var idward1;
	idw1 = document.getElementById("selectWARD2").value;
	idw = document.getElementById("selectWARD1").value;
	idw2 = document.getElementById("selectWARD").value;
	if(idw1 != ""){
		idward1 = document.getElementById("selectWARD2").value;
	}
	if(idw != ""){
		idward1 = document.getElementById("selectWARD1").value;
	}
	if(idw2 != ""){
		idward1 = document.getElementById("selectWARD").value;
	}
	return idward1;
}
/*ẩn các select vùng đi*/
function resetREGION(){
	$("#selectREG").css("display", "none");
	$("#selectREG1").css("display", "none");
	$("#selectREG2").css("display", "none");
	$("#selectREG3").css("display", "none");
}
// Được gọi khi người dùng chọn selectWARD1 -->
function loadREG1(conf,token,secu,sock,state){
	resetWhenSelectedWard();
	queue3.push(1);
	var idw = -1;
	var idw1 = -1;
	var idward1;
	idw1 = document.getElementById("selectWARD2").value;
	idw = document.getElementById("selectWARD1").value;
	idw2 = document.getElementById("selectWARD").value;
	idward1 = wardSELECTED();
	var option ='';
	jQuery.ajax({
		url : conf + '/api/region/getlistbyward/'+idward1,
		type: 'GET',
		headers: {'Authorization':secu+token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			option += "<option value='" + -1 +"'>Chọn vùng</option>";
			for(i in resultdata.data){
				option += "<option value='" + resultdata.data[i].region_id +"'>" + resultdata.data[i].region_name +"</option>";
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của vùng. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if (queue3.length == 0) {
			if(idw1 != ""){
				$("#selectREG2").html(option);
				$("#selectREG2").css("display", "block");
			}
			if(idw != ""){
				$("#selectREG1").html(option);
				$("#selectREG1").css("display", "block");
			}
			if(idw2 != ""){
				$("#selectREG").html(option);
				$("#selectREG").css("display", "block");
			}
		}
	});
}
// Được gọi khi người dùng chọn selectREG1 -->
function loadSTATION1(conf,token,secu,socket,state){
	var idreg2 = -1;
	var idreg1 = -1;
	var regionid;
	resetSELECTEDpondriver();
	idreg2 = document.getElementById("selectREG2").value;
	idreg1 = document.getElementById("selectREG1").value;
	idreg = document.getElementById("selectREG").value;
	idreg3 = document.getElementById("selectREG3").value;
	regionid = regionSELECTED();
	turnOffChart();
	if(regionid == -1){
		resetSTATION();
	}
	$("#btnDisplayChart").prop("disabled", true);
	var option ='';
	jQuery.ajax({
		url:  conf + '/api/station/getbyregion/'+regionid,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {
			// blockContent();
			option += "<option value='" + -1 +"'>Chọn trạm</option>";
			for(i in resultdata.data){
				if((resultdata.data[i].river_id != null) || (resultdata.data[i].pond_id != null)){
					option += "<option value='" + resultdata.data[i].station_id +"'>" + resultdata.data[i].station_name +"</option>";
				}
			}
			option += "<option value='" + 0 +"'>Trạm cầm tay</option>";
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của trạm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if (queue3.length == 0) {
			if(idreg1 != -1){
				$('#selectSTATION1').html(option);
				$('#selectSTATION1').css("display", "block");
			}
			if(idreg2 != -1){
				$('#selectSTATION2').html(option);
				$('#selectSTATION2').css("display", "block");
			}
			if(idreg != -1){
				$('#selectSTATION').html(option);
				$("#selectSTATION").css("display", "block");
			}
			if(idreg3 != -1){
				$('#selectSTATION3').html(option);
				$("#selectSTATION3").css("display", "block");
			}
		}
	});
}
/*hàm tắt button xem biểu đồ*/
function turnOffChart(){
	$("#btnDisplayChart").bootstrapToggle('off');
}
//duoc goi khi loadstation1 hoad loadpond1
function loadDATA(conf,token,secu,sock){
	//socket.removeListener('tenlistener');
	turnOffChart();
	var _objStationListener;
	var stationid = -1;
	var pondid = -1;
	var regionname = regionnameSELECTED();
	var notf = "";
	var address;
	var stationname;
	stationname = stationnameSELECTED();
	stationid = stationSELECTED();
	if(stationid == -1){
		$("#btnDisplayChart").prop("disabled", true);
		resetSELECTEDpondriver();
	}
	//Kiem tra xem tram duoc chon co phai tram cam tay hay khong
	//Neu khong phai thi do lieu - Neu phai thi load vi tri can xem
	if(stationid != 0 && stationid != -1){
		// getAllStationNode(conf,token,secu,stationid);
		/*Gọi callback lấy ra danh sách StationNode*/
		getStationById(conf,token,secu,stationid,function(data){
			_stationnode = data.station_node;
			StationNode = _stationnode.split('|'); /*Chuyển thành mảng*/
		});
		address = conf + '/api/data/gettopbystation/' + stationid;
		notf = stationname;
		blockSELECTEDstationDynamic();
		getTOPdatabyStaion(address,conf,secu,token,regionname,notf,stationid,pondid,sock);
		hidePOND();
		hideRIVER();
	}
	/*Kiểm tra nếu đúng là trạm cầm tay*/
	if(stationid == 0){
		loadLOCATION(conf,token,secu);
		$("#hienthi").html('');
		$("#btnDisplayChart").prop("disabled", true);
		$("#displayChart").css("display","none"); //Neu chọn trạm cầm tay thì phải ẩn xem biểu đồ đi
	}
	displayStateChart = true;
}
//Ham lay ve data moi nhat cua tram
function getTOPdatabyStaion(address,conf,secu,token,regionname,notf,stationid,pondid,sock){
	var riverid = -1;
	jQuery.ajax({
		url : address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			var arrResult = [];
			var dttId;
			for(i in resultdata.data){
				// kiem tra loai da co trong mang ket qua hay chua
				// chua co thi them vao mang ket qua
				dttId = resultdata.data[i].datatype_id;
				if(arrResult[dttId] == null){
					arrResult[dttId] = resultdata.data[i];
				}
			}
			compareData(conf,token,secu,arrResult,regionname,notf,stationid,pondid,riverid,sock);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu số đo của trạm. Vui lòng tải lại trang");
		},
	});
}
//Lấy data khi load SelectPOND
function loadDATAbyPOND(conf,token,secu,sock){
	var _objStationListener;
	var stationid = -1;
	var pondid;
	var pondname;
	var regionid;
	var notf = "";
	var address;
	turnOffChart();
	// regionid = regionSELECTED();
	regionname = regionnameSELECTED();
	pondid = pondSELECTED();
	pondname = pondnameSELECTED();
	address = conf + '/api/data/gettopbyponddynamic/' + pondid;
	notf = pondname;
	if(pondid != -1){
		getTOPdatabyPOND(address,conf,secu,token,regionname,notf,stationid,pondid,sock); //Ham lay ve gia tri do moi nhat
	}
	else{
		turnOffChart();
		$("#btnDisplayChart").prop('disabled',true); /*Nếu chưa chọn ao thì khóa nút xem biểu đồ lại*/
	}

}
function getTOPdatabyPOND(address,conf,secu,token,regionname,notf,stationid,pondid,sock){
	var riverid = -1;
	jQuery.ajax({
		url : address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			var arrResult = [];
			var _today = new Date();
			var dttId,
				_dayOfResult,
				_dayOfData;
			for(i in resultdata.data){
				// kiem tra loai da co trong mang ket qua hay chua
				// chua co thi them vao mang ket qua
				dttId = resultdata.data[i].datatype_id;
				if(arrResult[dttId] == null){
					arrResult[dttId] = resultdata.data[i];
				}
			}
			compareData(conf,token,secu,arrResult,regionname,notf,stationid,pondid,riverid,sock);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu số đo của ao. Vui lòng tải lại trang");
		},
	});
}
//duoc goi khi loadstation1 hoad loadpond1
function loadDATAbyRIVER(conf,token,secu,sock){
	//socket.removeListener('tenlistener');
	turnOffChart();
	var _objStationListener;
	var stationid = -1;
	var pondid = -1;
	var riverid = -1;
	var rivername;
	var regionname = regionnameSELECTED();
	riverid = riverSELECTED();
	rivername = rivernameSELECTED();
	var notf = "";
	var address;
	// console.log(riverid);
	//Kiem tra xem tram duoc chon co phai tram cam tay hay khong
	//Neu khong phai thi do lieu - Neu phai thi load vi tri can xem
	address = conf + '/api/data/gettopbyriverdynamic/' + riverid;
	notf = rivername;
	if((riverid != -1) && (typeof riverid !== 'undefined')){
		getTOPdatabyRIVER(address,conf,secu,token,regionname,notf,stationid,pondid,riverid,sock); //Ham lay ve gia tri do moi nhat
	}
	else{
		// turnOffChart();
		$("#btnDisplayChart").prop('disabled',true); /*Nếu chưa chọn ao thì khóa nút xem biểu đồ lại*/
	}
}
//load data khi chon load du lieu cam tay tren song
function getTOPdatabyRIVER(address,conf,secu,token,regionname,notf,stationid,pondid,riverid,sock){
	jQuery.ajax({
		url : address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			var arrResult = [];
			var _today = new Date();
			var dttId,
				_dayOfResult,
				_dayOfData;
			for(i in resultdata.data){
				// kiem tra loai da co trong mang ket qua hay chua
				// chua co thi them vao mang ket qua
				dttId = resultdata.data[i].datatype_id;
				if(arrResult[dttId] == null){
					arrResult[dttId] = resultdata.data[i];
				}
			}
			compareData(conf,token,secu,arrResult,regionname,notf,stationid,pondid,riverid,sock);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu số đo của sông. Vui lòng tải lại trang");
		},
	});
}

function resetSTATIONselected(){
	$('#selectSTATION').prop('selectedIndex', 0);
}
//ham reset khi selectSTATION duoc chon
function resetPONDselected(){
	$('#selectPOND').prop('selectedIndex', 0);
}
//ham reset select cua station khi pond2 duoc chon
function resetSTATIONseletected2(){
	$('#selectSTATION2').prop('selectedIndex', 0);
}
//ham reset select cua pond khi station2 duoc chon
function resetPONDselected2(){
	$('#selectPOND2').prop('selectedIndex', 0);
}
//Ham lay ra river
function riverSELECTED(){
	var riverid;
	var riid = -1,
		riid1 = -1,
		riid2 = -1,
		riid3 = -1;
	var riid = document.getElementById('selectRIVER').value;
	var riid1 = document.getElementById('selectRIVER1').value;
	var riid2 = document.getElementById('selectRIVER2').value;
	var riid3 = document.getElementById('selectRIVER3').value;
	if(riid != -1){
		riverid = riid;
	}
	if(riid1 != -1){
		riverid = riid1;
	}
	if(riid2 != -1){
		riverid = riid2;
	}
	if(riid3 != -1) {
		riverid = riid3;
	}
	return riverid;
}
/*Hàm lấy tên ao*/
function rivernameSELECTED(){
	var rivername;
	var riid = -1,
		riid1 = -1,
		riid2 = -1,
		riid3 = -1;
	var riid = document.getElementById('selectRIVER').value;
	var riid1 = document.getElementById('selectRIVER1').value;
	var riid2 = document.getElementById('selectRIVER2').value;
	var riid3 = document.getElementById('selectRIVER3').value;
	if(riid != -1){
		rivername = document.getElementById('selectRIVER').options[document.getElementById('selectRIVER').selectedIndex].text;
	}
	else if(riid1 != -1){
		rivername = document.getElementById('selectRIVER1').options[document.getElementById('selectRIVER1').selectedIndex].text;
	}
	else if(riid2 != -1){
		rivername = document.getElementById('selectRIVER2').options[document.getElementById('selectRIVER2').selectedIndex].text;
	}
	else {
		rivername = document.getElementById('selectRIVER3').options[document.getElementById('selectRIVER3').selectedIndex].text;
	}
	return rivername;
}
//Ham lay ra regionid
function regionSELECTED(){
	var regionid;
	var regid = -1,
		regid1 = -1,
		regid2 = -1,
		regid3 = -1;
	var regid = document.getElementById('selectREG').value;
	var regid1 = document.getElementById('selectREG1').value;
	var regid2 = document.getElementById('selectREG2').value;
	var regid3 = document.getElementById('selectREG3').value;
	if(regid != -1){
		regionid = regid;
	}
	else if(regid1 != -1){
		regionid = regid1;
	}
	else if(regid2 != -1){
		regionid = regid2;
	}
	else {
		regionid = regid3;
	}
	return regionid;
}
//ham lay ve ten cua vung
function regionnameSELECTED() {
	var region_name;
	var regid = -1,
		regid1 = -1,
		regid2 = -1,
		regid3 = -1;
	var regid = document.getElementById('selectREG').value;
	var regid1 = document.getElementById('selectREG1').value;
	var regid2 = document.getElementById('selectREG2').value;
	var regid3 = document.getElementById('selectREG3').value;
	if(regid != -1){
		region_name = document.getElementById('selectREG').options[document.getElementById('selectREG').selectedIndex].text;
	}
	else if(regid1 != -1){
		region_name = document.getElementById('selectREG1').options[document.getElementById('selectREG1').selectedIndex].text;
	}
	else if(regid2 != -1){
		region_name = document.getElementById('selectREG2').options[document.getElementById('selectREG2').selectedIndex].text;
	}
	else {
		region_name = document.getElementById('selectREG3').options[document.getElementById('selectREG3').selectedIndex].text;
	}
	return region_name;
}
//Ham lay ra pondid
function pondSELECTED(){
	var pondid;
	var poid = -1,
		poid1 = -1,
		poid2 = -1,
		poid3 = -1;
	poid = document.getElementById('selectPOND').value;
	poid1 = document.getElementById('selectPOND1').value;
	poid2 = document.getElementById('selectPOND2').value;
	poid3 = document.getElementById('selectPOND3').value;
	if(poid != -1){
		pondid = poid;
	}
	else if(poid1 != -1){
		pondid = poid1;
	}
	else if(poid2 != -1){
		pondid = poid2;
	}
	else {
		pondid = poid3;
	}
	return pondid;
}
//ham lay ten ao
function pondnameSELECTED(){
	var pondname;
	var poid = -1,
		poid1 = -1,
		poid2 = -1,
		poid3 = -1;
	poid = document.getElementById('selectPOND').value;
	poid1 = document.getElementById('selectPOND1').value;
	poid2 = document.getElementById('selectPOND2').value;
	poid3 = document.getElementById('selectPOND3').value;
	if(poid != -1){
		pondname = document.getElementById('selectPOND').options[document.getElementById('selectPOND').selectedIndex].text;
	}
	else if(poid1 != -1){
		pondname = document.getElementById('selectPOND1').options[document.getElementById('selectPOND1').selectedIndex].text;
	}
	else if(poid2 != -1){
		pondname = document.getElementById('selectPOND2').options[document.getElementById('selectPOND2').selectedIndex].text;
	}
	else {
		pondname = document.getElementById('selectPOND3').options[document.getElementById('selectPOND3').selectedIndex].text;
	}
	return pondname;
}
//Ham lay ve id cua station
function stationSELECTED(){
	var stationid = -1;
	if($("#selectSTATION").val() != -1){
		stationid = $("#selectSTATION").val();
	}
	else if($("#selectSTATION1").val() != -1){
		stationid = $("#selectSTATION1").val();
	}
	else if($("#selectSTATION2").val() != -1){
		stationid = $("#selectSTATION2").val();
	}
	else {
		stationid = $("#selectSTATION3").val();
	}
	return stationid;
}
//Ham lay ve name cua station
function stationnameSELECTED(){
	var stationname;
	if($("#selectSTATION").val() != -1){
		stationname = document.getElementById('selectSTATION').options[document.getElementById('selectSTATION').selectedIndex].text;
	}
	else if($("#selectSTATION1").val() != -1){
		stationname = document.getElementById('selectSTATION1').options[document.getElementById('selectSTATION1').selectedIndex].text;
	}
	else if($("#selectSTATION2").val() != -1){
		stationname = document.getElementById('selectSTATION2').options[document.getElementById('selectSTATION2').selectedIndex].text;
	}
	else {
		stationname = document.getElementById('selectSTATION3').options[document.getElementById('selectSTATION3').selectedIndex].text;
	}
	return stationname;
}
/*
* Việc sử dụng callback trong hàm và gọi lại callback để khi gọi hàm ta
* có thể sử dụng trực tiếp dữ liệu của chính hàm đó
*/
/*Hàm lấy thông tin của vùng theo id*/
function getRegionById(conf,token,secu,region_id,callback){
	jQuery.ajax({
		url: conf + '/api/region/getbyid/'+region_id,
		type: 'GET',
		headers:{'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdt){
			callback(resultdt.data);
		},
		error:function(jqXHR,error){
			displayError("Lỗi ! Không thể tải dữ liệu theo region id. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy dữ liệu theo data id gọi callback để sử dụng*/
function getDataById(conf,token,secu,dataid,callback){
	jQuery.ajax({
		url: conf + '/api/data/getbyid/'+dataid,
		type: 'GET',
		headers:{'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdt){
			callback(resultdt.data);
		},
		error:function(jqXHR,error){
			displayError("Lỗi ! Không thể tải dữ liệu theo data id. Vui lòng tải lại trang");
		},
	});
}

var queue5 = [];
/*Hàm lấy về thông tin của ngưỡng gọi callback để sử dụng*/
function getInfoThresholdById(conf,token,secu,threshold_id,callback){
	jQuery.ajax({
		url: conf + '/api/threshold/getbyid/' + threshold_id,
		contentType: 'application/json',
		headers:{'Authorization': secu + token},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi không thể tải dữ liệu theo ngưỡng id. Vui lòng tải lại trang web");
		}
	});
}
/*Hàm lấy về lời khuyên gọi callback để sử dụng*/
function getAdviceByThresholdId(conf,token,secu,threshold_id,callback){
	jQuery.ajax({
		url: conf + '/api/advice/getbythreshold/' + threshold_id,
		contentType: 'application/json',
		headers:{'Authorization': secu + token},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi không thể load dữ liệu lời khuyên theo id. Vui lòng tải lại trang web");
		}
	});
}
/*Hàm hiển thị modal xem chi tiết dữ liệu*/
function showModalNoti(conf,token,secu,data_id,threshold_id,notif_title,notif_id,region_id,notif_createdDate,notif_readState){
	var htmlAll = "";
	var htmlAlert = "";
	$("#modal-title").text(notif_title);
	if(notif_readState == 0){
		checkReadNotifi(conf,token,secu,notif_id); /*Gọi hàm đổi trạng thái đọc thông báo*/
		/*check if isset class bg-info, then removeClass bg-info*/
		if($('#notifi_' + notif_id).hasClass('bg-info')){
			if((parseInt($("#countmessage").text())) > 0){
				$("#countmessage").html(parseInt($("#countmessage").text()) - 1);
				$("#titlemessage").html((parseInt($("#titlemessage").text()) - 1) + " thông báo chưa đọc");
			}
		}
		if($('#notifialert_' + notif_id).hasClass('bg-info')){
			if((parseInt($("#countmessage").text())) > 0){
				$("#countmessage").html(parseInt($("#countmessage").text()) - 1);
				$("#titlemessage").html((parseInt($("#titlemessage").text()) - 1) + " thông báo chưa đọc");
			}
		}
		htmlAlert += '<a href="#" onclick="showModalNoti('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + data_id + ',' + threshold_id + ',' + "'" + notif_title + "'" + ',' + notif_id +','+ region_id + ',' + "'" + notif_createdDate + "'" + ',' + 1 +')">';
		htmlAlert += notif_title;
		htmlAlert += '<p>Thời gian đo: ';
		htmlAlert += moment(notif_createdDate).utc().format('DD-MM-YYYY, HH:mm') + '</p>';
		htmlAlert += '</a>';
		htmlAll += "<td><input type='checkbox' value='"+notif_id+"' name='selectNotifi' id='selectNotifi'/></td>";
		htmlAll += "<td>" + notif_title + "</td>";
		htmlAll += "<td>" + moment(notif_createdDate).utc().format('DD-MM-YYYY, HH:mm') + "</td>";
		htmlAll += '<td><a title="Xem chi tiết thông báo" href="#" onclick="showModalNoti('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + data_id + ',' + threshold_id + ',' + "'" + notif_title + "'" + ',' + notif_id +','+ region_id + ',' + "'" + notif_createdDate + "'" + ',' + 1 +')">';
		htmlAll += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
		$('#notifialert_' + notif_id).removeClass('bg-info');
		$('#notifialert_' + notif_id).html(htmlAlert);
		$('#notifi_' + notif_id).removeClass('bg-info');
		$('#notifi_' + notif_id).html(htmlAll);
	}
	var datatype_id = 0;
	var DataTypeUnit = '';
	var max_value_date = 0;
	var advice_message = '';
	var region_name = '';
	if(threshold_id != null){
		getAdviceByThresholdId(conf,token,secu,threshold_id,function(result){
			result.forEach(function(items){
				/*So sánh lấy lời khuyên mới nhất dựa theo thời gian*/
				if(max_value_date < moment(items.advice_createdDate).utc().valueOf()){
					advice_message = items.advice_message;
					max_value_date = moment(items.advice_createdDate).utc().valueOf();
				}
			});
			$(".AdviceMessage").text(advice_message);
		});
	}

	/*Gọi callback lấy dữ liệu*/
	getRegionById(conf,token,secu,region_id,function(result){
		$(".RegionName").text(result.region_name);
	});
	getDataById(conf,token,secu,data_id,function(result){
		datatype_id = result.datatype_id;
		getDataTypeById(conf,token,secu,result.datatype_id,function(resultdata){
			DataTypeUnit = resultdata.datatype_unit;
			$(".DataTypeName").text(resultdata.datatype_name);
			$(".DataValue").text(result.data_value + " " + DataTypeUnit);
		});
		var StationName = arrStationName[result.station_id];
		$(".StationName").text(StationName);
	});
	if(threshold_id != null){
		getInfoThresholdById(conf,token,secu,threshold_id,function(result){
			$(".ThresholdLevel").text(result.threshold_level);
			$(".ThresholdMessage").text(result.threshold_message);
			if(result.threshold_level == 1){
				$("#modal-title").css('color', 'blue');
			}
			else if(result.threshold_level == 2){
				$("#modal-title").css('color', '#C42D2D');
			}
			else{
				$("#modal-title").css('color', '#CC2C2C');
			}
		});
	}
	else{
		$("#modal-title").css('color', '#ffcc00');
	}
	var DateCreated = moment(notif_createdDate).utc().format('DD-MM-YYYY, HH:mm');
	$(".DateCreated").text(DateCreated);
	$("#modalNotifi").modal('show');
}
/*Hàm xử lý dữ liệu cho thông báo các trạm ở sông*/
function processDataForNotiStation(conf,token,secu,data_id,threshold_id,threshold_level,notif_title,notif_id,region_id,notif_createdDate){
	var dtvalue = 0;
	var datatypeid = '';
	var stationid = 0;

	// getAdviceByThresholdId(conf,token,secu,threshold_id);
	queue5.push(1);
	jQuery.ajax({
		url: conf + '/api/data/getbyid/' + data_id,
		contentType: 'application/json',
		headers:{'Authorization': secu + token},
		success: function(resultdata){
			dtvalue = resultdata.data.data_value;
			datatypeid = resultdata.data.datatype_id;
			stationid = resultdata.data.station_id;
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi không thể load dữ liệu theo id. Vui lòng tải lại trang web");
		}
	}).complete(function(){
		queue5.pop();
		if(queue5.length == 0){
			if(arrBlockStation.indexOf(stationid)  == -1){
				PushNotificationForStation(conf,token,secu,data_id,threshold_id,threshold_level,datatypeid,dtvalue,notif_title,stationid,notif_id,region_id,notif_createdDate);
			}
		}
	});
}
//Ham thông báo khi vượt ngưỡng duoc goi khi dung socket cua lop RealTimePushNotificationForStation
function PushNotificationForStation(conf,token,secu,data_id,threshold_id,threshold_level,datatype_id,data_value,notif_title,stationid,notif_id,region_id,notif_createdDate){
	if(threshold_level > 0){
		var datatype_name;
	 	var audio = new Audio('/audio/alarmfrenzy.mp3');
    	audio.play();
    	/*Đang test để 10 giây*/
	 	/*Để ajax load trong hàm vì khi tách hàm thì không gọi api kịp*/
	    jQuery.ajax({
			url: conf + '/api/datatype/getbyid/'+datatype_id,
			type: 'GET',
			headers:{'Authorization': secu + token},
			contentType: 'application/json; charset=utf-8',
			success: function(resultdt){
				datatype_name = resultdt.data.datatype_name;
				Push.create(notif_title, {
					body: "Độ đo " + resultdt.data.datatype_name + " có giá trị đo " + data_value + " vượt ngưỡng " + threshold_level + ". Chọn để xem chi tiết",
					icon: {
				        x16: '/dist/img/icwarn2.png',
				        x32: '/dist/img/icwarn1.png'
				    },
					timeout: 10000,
					onClick: function () {
						window.focus();
						this.close();
						showModalNoti(conf,token,secu,data_id,threshold_id,notif_title,notif_id,region_id,notif_createdDate,0);
					}
				});
			},
			error:function(jqXHR,error){
				displayError("Lỗi ! Không thể tải dữ liệu của các loại dữ liệu đo. Vui lòng tải lại trang");
			},
		});
	}
}
/*Hàm để chuyển trạng thái đọc thông báo notif_readState từ false thành true*/
function checkReadNotifi(conf,token,secu,notif_id){
	queue2.push(1);
	jQuery.ajax({
		url: conf + '/api/notification/getbyid?user_id=' + user_ID + '&notif_id=' +  notif_id,
		type: 'GET',
		headers:{'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdt){
			console.log("Đã đọc thông báo ngưỡng");
		},
		error:function(jqXHR,error){
			displayError("Lỗi ! Không thể chạy hàm đọc thông báo ngưỡng. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			// getNotification(conf,token,secu,user_ID,0,10);
		}
	});
}


/**Viết hàm xử lý check đọc thông báo*/
//ham load Station node
function getAllStationNode(conf,token,secu,idStation){
	var _stationnode;
	jQuery.ajax({
		url: conf + '/api/station/getbyid/' + idStation,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			_stationnode = resultdata.data.station_node;
			StationNode = _stationnode.split('|'); /*Chuyển thành mảng*/
			// console.log("Mảng station node: " + StationNode);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách cách sensor. Vui lòng tải lại trang");
		},
	});
}
//ham tat lua chon vi tri xem tram cam tay khi khong chon xem tram cam tay
function blockSELECTEDstationDynamic(){
	$("#selectLOCATION").css("display", "none");
	$("#selectLOCATION1").css("display", "none");
	$("#selectLOCATION2").css("display", "none");
	$("#selectLOCATION3").css("display", "none");
	$("#selectPOND").css("display", "none");
	$("#selectPOND1").css("display", "none");
	$("#selectPOND2").css("display", "none");
	$("#selectPOND3").css("display", "none");
	$("#selectRIVER").css("display", "none");
	$("#selectRIVER1").css("display", "none");
	$("#selectRIVER2").css("display", "none");
	$("#selectRIVER3").css("display", "none");
}
var arrDataTypeName = [];
/*Hàm trả về ngày mới nhất*/
//Ham so sanh data va tra ve gia tri
function compareData(conf,token,secu,arrResult,regionname,notf,stationid,pondid,riverid,sock){
	var data_value;
	// var _dataType;
	var datecreated;
	var arrdttype = [];
	var arrayDataType = [];
	var html = "";
	var html2 = "";
	var max_date = '',max_value_date = 0;
	jQuery.ajax({
		url: conf + '/api/datatype/getall/',
		type: 'GET',
		headers:{'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdt){
			arrDataType = resultdt.data;
			resultdt.data.forEach(function(data,index){
				arrdttype.push(data.datatype_id); /*Lưu mảng id để load data*/
				arrayDataType[data.datatype_id] = [];
				arrDataTypeOfId[data.datatype_id] = []; //khai bao kiểu mảng chứa dữ liệu
				arrDataTypeOfId[data.datatype_id].unshift({datatype_id:data.datatype_id,datatype_name:data.datatype_name,datatype_unit:data.datatype_unit});
				arrayDataType[data.datatype_id].unshift({datatype_id:data.datatype_id,datatype_name:data.datatype_name,datatype_unit:data.datatype_unit});
				arrDataTypeUnit[data.datatype_id] = []; //khai bao kiểu mảng chứa dữ liệu
				arrDataTypeUnit[data.datatype_id].push(data.datatype_unit);
				arrDataTypeName[data.datatype_id] = [];
				arrDataTypeName[data.datatype_id].push(data.datatype_name);
				/*Điều kiện if lấy về ngày mới nhất lấy dữ liệu*/
				if(arrResult.hasOwnProperty(data.datatype_id)){
					if(max_value_date < moment(arrResult[data.datatype_id].data_createdDate).utc().valueOf()){
						max_date = moment(arrResult[data.datatype_id].data_createdDate).utc().format('DD-MM-YYYY, HH:mm');
					}
				}
			});
			arrdttype.sort(); /*Sắp xếp các datatype_id theo thứ tự tăng dần*/
			arrdttypeForRadio = arrdttype;
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu để hiện thị số đo. Vui lòng tải lại trang");
		}
	}).complete(function(){
		StationNode.forEach(function(items,index){
			// console.log(items);
			html += "<tr>";
			arrayDataType[items].forEach(function(data,index){
				// Cho nay can them dieu kien if neu du lieu cua ao khong du so thuoc tinh can thiet - neu khong kiem tra thi khi khong du so thuoc tinh se bi loi
				if(arrResult.hasOwnProperty(items)){
					data_value = arrResult[items].data_value;
					datecreated = moment(arrResult[items].data_createdDate).utc().format('DD-MM-YYYY, HH:mm:ss');
					datecompare = moment(arrResult[items].data_createdDate).utc().format('DD-MM-YYYY, HH:mm');
					/*Kiểm tra nếu như ngày của dữ liệu không trùng và cũ hơn so với ngày mới nhất thì gạch*/
					if(max_date != datecompare){
						html+= "<td style='color:black;'>" + data.datatype_name +
						"</td>";
						html += "<td style='font-weight:bold;color:black;'>- -</td>";
						html += "<td style='color:black'>";
						html += data.datatype_unit + "</td>";
						html += "<td style='color:black;'>";
						html += "- -</td>";
					}
					else{
						if(arrResult[items].threshold_level == 1){
							html += "<td style='color:blue;'>" + data.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:blue;'>";
							html += data_value;
							html += "</td>";
							html += "<td style='color:blue;'>";
							html += data.datatype_unit + "</td>";
							html += "<td style='color:blue;'>";
							html += datecreated + "</td>";
						}
						else if(arrResult[items].threshold_level == 2){
							html+= "<td style='color:#C42D2D;'>" + data.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#C42D2D;'>";
							html += data_value;
							html += "</td>";
							html += "<td style='color:#C42D2D;'>";
							html += data.datatype_unit + "</td>";
							html += "<td style='color:#C42D2D;'>";
							html += datecreated + "</td>";
						}
						else if(arrResult[items].threshold_level == 3){
							html+= "<td style='color:#CC2C2C;'>" + data.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#CC2C2C;'>";
							html += data_value
							html += "</td>";
							html += "<td style='color:#CC2C2C;'>";
							html += data.datatype_unit + "</td>";
							html += "<td style='color:#CC2C2C;'>";
							html += datecreated + "</td>";
						}
						else if(arrResult[items].threshold_level == 100){
							html+= "<td style='color:#ffcc00;'>" + data.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:#ffcc00;'>";
							html += data_value;
							html += "</td>";
							html += "<td style='color:#ffcc00;'>";
							html += data.datatype_unit + "</td>";
							html += "<td style='color:#ffcc00;'>";
							html += datecreated + "</td>";
						}
						else{

							html+= "<td style='color:black;'>" + data.datatype_name +
							"</td>";
							html += "<td style='font-weight:bold;color:black;'>" + data_value + "</td>";
							html+= "<td style='color:black;'>" + data.datatype_unit +
							"</td>";
							html += "<td style='color:black;'>";
							html += datecreated + "</td>";
						}
					}
				}
				//ham if(arrResult.hasOwnProperty(data.datatype_id)) kiem tra phan tu arrResult co ton tai trong data.datatype_id hay khong
				else{
					html+= "<td style='color:black;'>" + data.datatype_name +
						"</td>";
					html += "<td style='font-weight:bold;color:black;'>- -</td>";
					html += "<td style='color:black'>";
					html += data.datatype_unit + "</td>";
					html += "<td style='color:black;'>";
					html += "- -</td>";
				}
				html += "</tr>";
			});
		});
		html2 = "Số liệu đo của " + regionname + " " + notf;
		$("#hienthi").html(html);

		$("#tieude").html(html2);
		showRadioDataType();
			// loadDATAforDrawCharts(conf,token,secu,moment($("#start_date").val()).format('L'),moment($("#end_date").val()).format('L'));
			//kiem tra neu idstation da ton tai thi xoa socket.on cua idstation
		unblockSelect();
		unblockContent();
		_objStationListener = null;
		/*Thay thế biến sock truyền vào lớp RealTime bằng biến socket_global*/
		_objStationListener = new RealTime({idStation: stationid, idPond: pondid, StationNode: StationNode, idRiver:riverid, dataTypes: arrDataTypeOfId,sockt: socket_global,conf: conf,token: token,secu: secu});
	});
}
/*Hàm set thời gian mặc định khi mở xem biểu đồ*/
function setDefaultDisplayDate(){
		var dateEnd = new Date();
    var dateStart = new Date(dateEnd.getTime() - (1*86400000));// lay thoi gian hien tai tru di 1 ngay
    $("#end_date" ).datetimepicker({
    	format: 'DD/MM/YYYY HH:mm',
    	defaultDate: dateEnd,
    	locale: 'vi',
			ignoreReadonly: true,
			maxDate : 'now' //Kiem tra khong cho chon ngay lon hon ngay hien tai
    });
    $("#start_date" ).datetimepicker({
    	format: 'DD/MM/YYYY HH:mm',
    	defaultDate: dateStart,
    	locale: 'vi',
			ignoreReadonly: true,
			maxDate : 'now' //Kiem tra khong cho chon ngay lon hon ngay hien tai
    });
		/*Check ngày kết thúc không được chọn nhỏ hơn ngày bắt đầu*/
		$("#start_date").on("dp.change", function (e) {
        $('#end_date').data("DateTimePicker").minDate(e.date);
    });
		/*Check ngày bắt không được chọn lớn hơn ngày kết thúc*/
		$("#end_date").on("dp.change", function (e) {
        $('#start_date').data("DateTimePicker").maxDate(e.date);
    });
}
//Ham hien thi vi tri can xem du lieu cua tram cam tay
function loadLOCATION(conf,token,secu){
	if(typeLocation == "Province"){
		$("#selectLOCATION").prop("selectedIndex",0);
		$("#selectLOCATION").css("display", "block");
	}
	else if(typeLocation == "District"){
		$("#selectLOCATION1").prop("selectedIndex",0);
		$("#selectLOCATION1").css("display", "block");
	}
	else if(typeLocation == "Ward"){
		$("#selectLOCATION2").prop("selectedIndex",0);
		$("#selectLOCATION2").css("display", "block");
	}
	else{
		$("#selectLOCATION3").prop("selectedIndex",0);
		$("#selectLOCATION3").css("display", "block");
	}

}
function hidePOND(){
	$("#selectPOND").css("display", "none");
	$("#selectPOND1").css("display", "none");
	$("#selectPOND2").css("display", "none");
	$("#selectPOND3").css("display", "none");
	$("#selectPOND").val("-1");
	$("#selectPOND1").val("-1");
	$("#selectPOND2").val("-1");
	$("#selectPOND3").val("-1");
}
function hideRIVER(){
	$("#selectRIVER").css("display", "none");
	$("#selectRIVER1").css("display", "none");
	$("#selectRIVER2").css("display", "none");
	$("#selectRIVER3").css("display", "none");
	$("#selectRIVER").val("-1");
	$("#selectRIVER1").val("-1");
	$("#selectRIVER2").val("-1");
	$("#selectRIVER3").val("-1");
}
/*Hàm chọn hiển thị sông hoặc ao đo bằng trạm cầm tay*/
function loadSELECTEDLOCATION(conf,token,secu){
	var idloca = -1,
		idloca1 = -1,
		idloca2 = -1,
		idloca3 = -1;
	var id;
	turnOffChart();
	idloca = document.getElementById("selectLOCATION").value;
	idloca1 = document.getElementById("selectLOCATION1").value;
	idloca2 = document.getElementById("selectLOCATION2").value;
	idloca3 = document.getElementById("selectLOCATION3").value;
	if (idloca != -1){
		id = idloca;
	}
	else if (idloca1 != -1){
		id = idloca1;
	}
	else if (idloca2 != -1){
		id = idloca2;
	}
	else {
		id = idloca3;
	}
	if(id == -1){
		hidePOND();
		hideRIVER();
		turnOffChart();
		$("#btnDisplayChart").prop('disabled',true);
	}
	if(id == 1){
		loadPOND1(conf,token,secu);
		hideRIVER();
	}
	if(id==2){
		loadRiver(conf,token,secu);
		hidePOND();
	}
}
//load danh sach cac tram o song
function loadRiver(conf,token,secu){
	var regionid = regionSELECTED();
	resetRiver();
	jQuery.ajax({
		url: conf + '/api/river/getbyregion/' + regionid,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {
			for(i in resultdata.data){
				if(typeLocation == "Province"){

					$('#selectRIVER').append($("<option></option>").attr("value",resultdata.data[i].river_id).text(resultdata.data[i].river_name));
					$("#selectRIVER").css("display", "block");
				}
				else if(typeLocation == "District"){
					$('#selectRIVER1').append($("<option></option>").attr("value",resultdata.data[i].river_id).text(resultdata.data[i].river_name));
					$("#selectRIVER1").css("display", "block");
				}
				else if(typeLocation == "Ward"){
					$('#selectRIVER2').append($("<option></option>").attr("value",resultdata.data[i].river_id).text(resultdata.data[i].river_name));
					$("#selectRIVER2").css("display", "block");
				}
				else{
					$('#selectRIVER3').append($("<option></option>").attr("value",resultdata.data[i].river_id).text(resultdata.data[i].river_name));
					$("#selectRIVER3").css("display", "block");
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của sông. Vui lòng tải lại trang");
		},
	});
}
//reset chon river
function resetRiver(){
	$('#selectRIVER1').find('option').remove();
	$('#selectRIVER1').append($("<option></option>").attr("value",-1).text("Chọn vị trí trên sông"));
	$('#selectRIVER2').find('option').remove();
	$('#selectRIVER2').append($("<option></option>").attr("value",-1).text("Chọn vị trí trên sông"));
	$('#selectRIVER3').find('option').remove();
	$('#selectRIVER3').append($("<option></option>").attr("value",-1).text("Chọn vị trí trên sông"));
	$('#selectRIVER').find('option').remove();
	$('#selectRIVER').append($("<option></option>").attr("value",-1).text("Chọn vị trí trên sông"));
}
//reset chọn ao
function resetPOND(){
	$('#selectPOND1').find('option').remove();
	$('#selectPOND1').append($("<option></option>").attr("value",-1).text("Chọn ao"));
	$('#selectPOND2').find('option').remove();
	$('#selectPOND2').append($("<option></option>").attr("value",-1).text("Chọn ao"));
	$('#selectPOND').find('option').remove();
	$('#selectPOND').append($("<option></option>").attr("value",-1).text("Chọn ao"));
	$('#selectPOND3').find('option').remove();
	$('#selectPOND3').append($("<option></option>").attr("value",-1).text("Chọn ao"));
}
// Được gọi khi người dùng chọn vùng-->
function loadPOND1(conf,token,secu){
	$('#hienthi').html('');
	resetPOND();
	var idregion;
	var idreg2 = -1;
	var idreg1 = -1;
	var idreg = -1;
	idreg2 = document.getElementById("selectREG2").value;
	idreg1 = document.getElementById("selectREG1").value;
	idreg = document.getElementById("selectREG").value;
	idregion = regionSELECTED();
	$('#selectPOND1').find('option').remove();
	$('#selectPOND1').append($("<option></option>").attr("value",-1).text("Chọn ao"));
	jQuery.ajax({
		url: conf + '/api/pond/getbyregion/' + idregion,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {
			for(i in resultdata.data){
				if(idreg1 != -1){
					$('#selectPOND1').append($("<option></option>").attr("value",resultdata.data[i].pond_id).text(resultdata.data[i].pond_description));
					$("#selectPOND1").css("display", "block");
				}
				else if(idreg2 != -1){
					$('#selectPOND2').append($("<option></option>").attr("value",resultdata.data[i].pond_id).text(resultdata.data[i].pond_description));
					$("#selectPOND2").css("display", "block");
				}
				else if(idreg != -1){
					$('#selectPOND').append($("<option></option>").attr("value",resultdata.data[i].pond_id).text(resultdata.data[i].pond_description));
					$("#selectPOND").css("display", "block");
				}
				else{
					$('#selectPOND3').append($("<option></option>").attr("value",resultdata.data[i].pond_id).text(resultdata.data[i].pond_description));
					$("#selectPOND3").css("display", "block");
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của ao. Vui lòng tải lại trang");
		},
	});
}
//An cac tuy chon khac khi chon tinh
function resetWhenSelectedProvince(){
	$("#selecttemp").find('option').remove();
	$("#selectWARD2").css("display","none");
	$("#selectREG2").css("display","none");
	$("#selectSTATION2").css("display","none");
	$("#tieude").html('Số liệu đo');
	resetSELECTEDpondriver();
	turnOffChart();
	$("#btnDisplayChart").prop("disabled", true);
	$("#hienthi").html('');
}
//Xử lý tùy chọn khi thay đổi huyện
function resetWhenSelectedDistrict(){
	$("#selecttemp").find('option').remove();
	$("#selectREG2").css("display","none");
	$("#selectSTATION2").css("display","none");
	$("#selectREG1").css("display","none");
	$("#selectSTATION1").css("display","none");
	$("#tieude").html('Số liệu đo');
	resetSELECTEDpondriver();
	turnOffChart();
	$("#btnDisplayChart").prop("disabled", true);
	$("#hienthi").html('');
}
//Xử lý tùy chọn khi thay đổi xã
function resetWhenSelectedWard(){
	$("#selecttemp").find('option').remove();
	$("#selectSTATION2").css("display","none");
	$("#selectSTATION1").css("display","none");
	$("#selectSTATION").css("display","none");
	$("#selectSTATION3").css("display","none");
	turnOffChart();
	$("#btnDisplayChart").prop("disabled", true);
	$("#tieude").html('Số liệu đo');
	resetSELECTEDpondriver();
}
//ham reset selectSTATION duoc chon
function resetSTATION(){
	$("#selectSTATION2").css("display","none");
	$("#selectSTATION1").css("display","none");
	$("#selectSTATION").css("display","none");
	$("#selectSTATION3").css("display","none");
}
//Ẩn các select ao - sông
function resetSELECTEDpondriver(){
	$("#selecttemp").find('option').remove();
	$("#selectLOCATION3").css("display","none");
	$("#selectLOCATION2").css("display","none");
	$("#selectLOCATION1").css("display","none");
	$("#selectLOCATION").css("display","none");
	$('#selectPOND1').css("display","none");
	$('#selectPOND').css("display","none");
	$('#selectPOND2').css("display","none");
	$('#selectPOND3').css("display","none");
	$('#selectRIVER').css("display","none");
	$('#selectRIVER1').css("display","none");
	$('#selectRIVER2').css("display","none");
	$('#selectRIVER3').css("display","none");
	$("#hienthi").html('');
}

//Danh sách hàm của trang thêm vùng

//ham ben trang capnhatvung
function loadUPDATEVUNG(conf,regid,token,secu){
	jQuery.ajax({
		url: url = conf + '/api/region/getbyid/' + regid,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {'Authorization': secu + token},
		success: function(resultdata){
			$("#region_id").val(resultdata.data.region_id);
			$("#region_name").val(resultdata.data.region_name);
			$("#region_description").val(resultdata.data.region_description); //set du lieu vao the input text
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu vùng dựa trên id vùng. Vui lòng tải lại trang");
		},
	});
}

//Hien thi lua chon radio o loai du lieu nao de hien du lieu
function showRadioDataType(){
	var html = '';
	var i = 0;
	html +="<label>Loại dữ liệu</label>";
	StationNode.forEach(function(data){
		arrDataTypeOfId[data].forEach(function(arrDataType){
	    	//Chọn loại dữ liệu đầu tiên để checked làm mặc định xem dữ liệu.
	    	if(i == 0){
	    		html +=
		        '<div class="radio">'+
		            '<label name="radName">'+
		                '<input type="radio" name="radDataType" value="'+ arrDataType.datatype_id +'" checked onclick="initChart()">' +
		                arrDataType.datatype_name +
		            '</label>'+
		        '</div>';
	    	}
	    	else{
	    		html +=
		        '<div class="radio">'+
		            '<label name="radName">'+
		                '<input type="radio" name="radDataType" value="'+ arrDataType.datatype_id +'" onclick="initChart()">' +
		                arrDataType.datatype_name +
		            '</label>'+
		        '</div>';
	    	}
	    	i++;
	    });
	});
    $('#radioDataType').html(html);

}
/*Hàm vẽ biểu đồ dựa trên dữ liệu từ hàm loadDataforDrawCharts*/
function drawChart() {
    var rdchecked;
    var rdText;
    var options;
    for(var i = 0 ; i < document.getElementsByName("radDataType").length ; i++){
        if(document.getElementsByName("radDataType")[i].checked){
            rdchecked = document.getElementsByName("radDataType")[i].value;
            rdText = document.getElementsByName('radName')[i].textContent;
        }
    }
    console.log("Xem biểu đồ của " + rdchecked);
    // var data = new google.visualization.DataTable();
    var dtforchart = [];
    dtforchart.push([{label: 'Ngày', type: 'datetime'},{label: rdText , type: 'number'}]);
    /*doi type tu date thanh datetime*/
    arrDataforCharts[rdchecked].forEach(function(dataitems){
        dtforchart.push([new Date(dataitems.date_create),dataitems.data_value]);
        /*Cần thêm giờ vào thời gian xem trên biểu đồ*/
    });
    if(dtforchart.length == 1){
    	var html = '';
    	html += "<strong>" + rdText + " không có dữ liệu đo trong thời gian này </strong>";
    	$("#displayerror").html(html);
			$("#displayerror").css("display","block");
    }
	var data = google.visualization.arrayToDataTable(dtforchart);
	options = {
        title: 'Biểu đồ theo dõi ' + rdText,
        vAxis: {
            title: arrDataTypeUnit[rdchecked]
        },
        height: 400,
        hAxis: {
            title: "Thời gian" ,
            gridlines: {
                count: -1,
                units: {
                  days: {format: ['MMM dd']},
                  hours: {format: ['HH:mm','ha']},
                  // hours: {format: ['HH:mm', 'ha']},
                }
            },
            minorGridlines: {
                units: {
                  hours: {format: ['HH:mm:ss a','ha']},
                  // hours: {format: ['HH:mm', 'ha']},
                  minutes: {format: ['HH:mm a Z', ':mm']}
                }
            }
        },
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    chart.draw(data, options);
}
function exportToExcel(htmltable){
    var uri = 'data:application/vnd.ms-excel;base64,';
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    var base64 = function(s) {
        return window.btoa(unescape(encodeURIComponent(s)))
    };
    var format = function(s, c) {
        return s.replace(/{(\w+)}/g, function(m, p) {
            return c[p];
        })
    };
    var ctx = {
        worksheet : 'Worksheet',
        table : htmltable
    }
    var link = document.createElement("a");mom
    link.download = "REPORT.xls";
    link.href = uri + base64(format(template, ctx));
    link.click();
}
//Ham block cac thanh phan khi load data
function blockContent(){
	$("#selectPROVINCE").prop("disabled", true);
	$("#selectDISTRICT1").prop("disabled", true);
	$("#selectDISTRICT").prop("disabled", true);
	$("#selectSTATION").prop("disabled", true);
	$("#selectSTATION1").prop("disabled", true);
	$("#selectSTATION2").prop("disabled", true);
	$("#selectSTATION3").prop("disabled", true);
	$("#selectWARD").prop("disabled", true);
	$("#selectWARD1").prop("disabled", true);
	$("#selectWARD2").prop("disabled", true);
	$("#selectREG2").prop("disabled", true);
	$("#selectREG").prop("disabled", true);
	$("#selectREG1").prop("disabled", true);
	$("#selectREG3").prop("disabled", true);
	$("#btnDisplayChart").prop("disabled", true);
}
function blockFormChart(){
	$("#start_date").prop("disabled", true);
	$("#end_date").prop("disabled", true);
	$("#btnXemBieuDo").prop("disabled", true);
	$('input[name="radDataType"]').attr('disabled', true);
	//$("input[type=radio]").attr('disabled', true);

}
//Ham unblock cac thanh phan khi load xong data
function unblockContent(){
	$("#selectPROVINCE").prop("disabled", false);
	$("#selectDISTRICT1").prop("disabled", false);
	$("#selectDISTRICT").prop("disabled", false);
	$("#selectSTATION").prop("disabled", false);
	$("#selectSTATION1").prop("disabled", false);
	$("#selectSTATION2").prop("disabled", false);
	$("#selectSTATION3").prop("disabled", false);
	$("#selectWARD").prop("disabled", false);
	$("#selectWARD1").prop("disabled", false);
	$("#selectWARD2").prop("disabled", false);
	$("#selectREG2").prop("disabled", false);
	$("#selectREG").prop("disabled", false);
	$("#selectREG1").prop("disabled", false);
	$("#selectREG3").prop("disabled", false);
	$("#btnDisplayChart").prop("disabled", false); //Mở khóa nút xem biểu đồ
}
//Ham unblock khi load xong du lieu bieu do
function unblockFormChart(){
	$("#start_date").prop("disabled", false);
	$("#end_date").prop("disabled", false);
	$("#btnXemBieuDo").prop("disabled", false);
	$('input[name="radDataType"]').attr('disabled', false);
	//$("input[type=radio]").attr('disabled', false);
}
//Ham dua gia tri vao bieu do
function initChart(){
	$("#displayerror").css("display","none"); //Khi chon loai du lieu khac thi tat thong bao loi
    google.charts.load('current', {'packages':['corechart'],'language': 'vi'});
    google.charts.setOnLoadCallback(drawChart);
}
/*############################################ĐÃ FIX ĐƯỢC LỖI KHÔNG REST ID CỦA TRẠM,AO,SÔNG###############*/
/*Lấy dữ liệu vẽ biểu đồ cho trạm*/
function getDataStation(conf,token,secu,start_date,end_date,_stationId,callback){
	var address = "";
	address = conf + '/api/data/getbystation/' + _stationId +'?dateStart=' + start_date + '&dateEnd=' + end_date;
	jQuery.ajax({
		url: address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của trạm để hiển thị cho biểu đồ. Vui lòng tải lại trang");
		},
	});
}
/*Lấy dữ liệu vẽ biểu đồ cho ao*/
function getDataPond(conf,token,secu,start_date,end_date,_idPond,callback){
	var address = "";
	address = conf + '/api/data/getbyponddynamic/' + _idPond +'?dateStart=' + start_date + '&dateEnd=' + end_date;
	jQuery.ajax({
		url: address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của ao để hiển thị cho biểu đồ. Vui lòng tải lại trang");
		},
	});
}
/*Lấy dữ liệu vẽ biểu đồ cho sông*/
function getDataRiver(conf,token,secu,start_date,end_date,_idRiver,callback){
	var address = "";
	address = conf + '/api/data/getbyriverdynamic/' + _idRiver +'?dateStart=' + start_date + '&dateEnd=' + end_date;
	jQuery.ajax({
		url: address,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của sông để hiển thị cho biểu đồ. Vui lòng tải lại trang");
		},
	});
}
//Ham de lay du lieu ve bieu do
function loadDATAforDrawCharts(conf,token,secu,start_date,end_date){ //state chi trang thai load 1: default 0: thuong
	var _idStation = -1
		, _idPond = -1
		,_idRiver = -1;
	var _stationId = -1;
	var htmltable = '';
	var htmltitle = '';
	var _idStation_temp = -1;
	_idStation = stationSELECTED();
	if($("#selecttemp").val() != null){
		_idStation_temp = $("#selecttemp").val(); /*FIX BUG XEM BIỂU ĐỒ VỚI TRẠM MẶC ĐỊNH*/
	}
	else{
		_idStation_temp = -1;
	}
	drawCrt = 1;
	_idPond = pondSELECTED();
	_idRiver = riverSELECTED();
	console.log("Trạm: " + _stationId +", Ao: " + _idPond + ", Sông: " + _idRiver);
	if((_idStation > 0)||(_idStation_temp != -1)){
		if(_idStation != -1){
			_stationId = _idStation;
		}
		else{
			_stationId = _idStation_temp;
		}

		getDataStation(conf,token,secu,start_date,end_date,_stationId,function(data){
			arrDataType.forEach(function(dttt){
				htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
				arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
				arrDataforCharts[dttt.datatype_id] = [];
				data.forEach(function(dta){
						htmltable += "<tr>";
						// htmltable += "<td>" + arrDataTypeName[dta.datatype_id] + "</td>";
						htmltable += "<td>"  + dta.data_value + "</td>";
						htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
						htmltable += "</tr>";
					if(dttt.datatype_id==dta.datatype_id){
						//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
						moment.locale('vi');
						arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
					}
				});
			});
			htmltitle += "<th>Thời gian đo</th>";
			$("#titile-table-data").html(htmltitle);
			$("#bodyexport").html(htmltable);
			console.log(arrDataforCharts);
			initChart(); //Goi ham ve bieu do
			drawCrt = 0;
			unblockFormChart();
			unblockContent();
		});
		// address = conf + '/api/data/getbystation/' + _stationId +'?dateStart=' + start_date + '&dateEnd=' + end_date;
	}
	else{
		if(_idPond != -1){
			getDataPond(conf,token,secu,start_date,end_date,_idPond,function(data){
				arrDataType.forEach(function(dttt){
					htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
					arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
					arrDataforCharts[dttt.datatype_id] = [];
					data.forEach(function(dta){
							htmltable += "<tr>";
							// htmltable += "<td>" + arrDataTypeName[dta.datatype_id] + "</td>";
							htmltable += "<td>"  + dta.data_value + "</td>";
							htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
							htmltable += "</tr>";
						if(dttt.datatype_id==dta.datatype_id){
							//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
							moment.locale('vi');
							arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
						}
					});
				});
				htmltitle += "<th>Thời gian đo</th>";
				$("#titile-table-data").html(htmltitle);
				$("#bodyexport").html(htmltable);
				console.log(arrDataforCharts);
				initChart(); //Goi ham ve bieu do
				drawCrt = 0;
				unblockFormChart();
				unblockContent();
			});
		}
		else if((_idRiver != -1)&&(typeof _idRiver !== 'undefined')){
			getDataRiver(conf,token,secu,start_date,end_date,_idRiver,function(data){
				arrDataType.forEach(function(dttt){
					htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
					arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
					arrDataforCharts[dttt.datatype_id] = [];
					data.forEach(function(dta){
							htmltable += "<tr>";
							// htmltable += "<td>" + arrDataTypeName[dta.datatype_id] + "</td>";
							htmltable += "<td>"  + dta.data_value + "</td>";
							htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
							htmltable += "</tr>";
						if(dttt.datatype_id==dta.datatype_id){
							//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
							moment.locale('vi');
							arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
						}
					});
				});
				htmltitle += "<th>Thời gian đo</th>";
				$("#titile-table-data").html(htmltitle);
				$("#bodyexport").html(htmltable);
				console.log(arrDataforCharts);
				initChart(); //Goi ham ve bieu do
				drawCrt = 0;
				unblockFormChart();
				unblockContent();
			});
		}
		else{
			turnOffChart();
			$("#btnDisplayChart").prop('disabled',true);
		}
	}
}
//Ham thay doi khi thay loi lua chon xem bieu do.
function changeOnOffChart(conf,token,secu){
	var dateEnd = new Date();
	var dateStart = new Date(dateEnd.getTime() - (1*86400000));// lay thoi gian hien tai tru di 1 ngay
	if($("#btnDisplayChart").prop('checked')){ //Kiem tra neu nhu button toggle duoc chon la bat thi thuc hien
		setDefaultDisplayDate();
		showRadioDataType();
		var start_date,
			end_date;
		start_date = $("#start_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
		end_date = $("#end_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
		if((start_date == null) && (end_date == null)){
			end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
	        start_date = new Date(end_date.getTime() - (1*86400000));  /*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
	        $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
	        $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
		}
		$("#displayChart").css("display","block");
		 //Hien thi xem bieu do
		$('input[name="radDataType"]').attr('disabled', false);
		//$("input[type=radio]").attr('disabled', false);
		viewdependenceDate(conf,token,secu); //Goi ham ve bieu do
	}
	else{
		//$("input[type=radio]").attr('disabled', true);
		$('input[name="radDataType"]').attr('disabled', true);
		$("#displayChart").css("display", "none");
		$('#start_date').datetimepicker('clear');
		$("#start_date" ).datetimepicker({
    	format: 'DD/MM/YYYY HH:mm',
    	defaultDate: dateStart,
    	locale: 'vi',
			ignoreReadonly: true,
			maxDate : 'now' //Kiem tra khong cho chon ngay lon hon ngay hien tai
    });

    // $('#end_date').datetimepicker('clear');
	}
}
/*Hàm xem dữ liệu được gọi từ button xem biểu đồ*/
function viewdependenceDate(conf,token,secu){
	var start_date,
		end_date;
	/*
	* Khi thời gian xem dữ liệu không hợp lệ ta tiến hành gán lại thời gian xem dữ liệu
	* Cách 2 ngày kể từ ngày hiện tại
	*/
	start_date = $("#start_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
	end_date = $("#end_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
 	/*	Kiểm tra khi ngày bắt đầu và kết thúc rỗng	*/
  if((start_date == null) && (end_date == null)){
      end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(end_date.getTime() - (1*86400000));  /*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#displayerror").html("Ngày bắt đầu và ngày kết thúc rỗng");
      $("#displayerror").css("display","block");
  }
  else if(start_date == null){
      end_date = new Date(end_date); /*Convert ngày kết thúc trong input*/
      start_date = new Date(end_date.getTime() - (1*86400000));/*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
  	$("#displayerror").html("Ngày bắt đầu rỗng");
      $("#displayerror").css("display","block");
  }
  else if(end_date == null){
      end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(start_date); /*Convert ngày bắt đầu trong input*/
      $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
     	$("#displayerror").html("Ngày kết thúc rỗng");
    	$("#displayerror").css("display","block");
  }
  else if(start_date - end_date > 0){
  	end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(end_date.getTime() - (1*86400000));  /*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
  		$("#displayerror").html("Ngày không hợp lệ. Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
    	$("#displayerror").css("display","block");
  }
  /*Kiểm tra nếu thời gian chọn xem dữ liệu lớn hơn 7 ngày thì thông báo chờ*/
  else if(end_date - start_date >= (7*86400000)){
  	start_date = new Date(start_date);
	end_date = new Date(end_date);
  	$("#displayerror").html("Thời gian bạn chọn xem dữ liệu quá lâu. Vui lòng chờ giây lát trong lúc tải dữ liệu");
  	$("#displayerror").css("display","block");
  	setTimeout(function() {
  		$("#displayerror").css("display","none");
  	}, 3000);
  }
  else{
      end_date = new Date(end_date);/*Convert ngày kết thúc trong input*/
      start_date = new Date(start_date);/*Convert ngày bắt đầu trong input*/
  }
  start_date = start_date.getFullYear() +"-"+ (start_date.getMonth()+1) + "-" + start_date.getDate() +" " + start_date.getHours() + ":" + start_date.getMinutes() + ":"+ start_date.getSeconds();
  end_date = end_date.getFullYear() +"-"+ (end_date.getMonth()+1) + "-" + end_date.getDate() +" " + end_date.getHours() + ":" + end_date.getMinutes() + ":"+ end_date.getSeconds();
	blockFormChart();
	blockContent();
	//comment khong hieu doan nay viet de lam gi
	// var riverid = -1;
	// var stationid = stationSELECTED();
	// var pondid = pondSELECTED();
	// riverid = riverSELECTED();
	loadDATAforDrawCharts(conf,token,secu,start_date,end_date);
}
/*hàm hiện thông báo lỗi */
function displayError(stringText){
	$("#ErrorMessage").html(stringText);
	$("#ErrorMessage").css("display","block");
}
/******************CÁC HÀM SỬ DỤNG CHO ROUTES CHUYÊN GIA******************/
/*CÁC HÀM CHO TRANG THÊM,CẬP NHẬT NGƯỠNG, DANH SÁCH NGƯỠNG*/
/*Ham lay ve tat ca cac loai du lieu* co sap xep*/
function loadDataTypeForAddThreshold(config,token,security,callback){
	var arrayDTType = [];
	var arrayDTTId = [];
	queue2.push(1);
	jQuery.ajax({
		url: config + '/api/datatype/getall',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			resultdata.data.forEach(function(data,index){
				arrayDTTId.push(data.datatype_id);
				arrayDTType[data.datatype_id] = [];
				arrayDTType[data.datatype_id].unshift({datatype_id:data.datatype_id,datatype_name:data.datatype_name,datatype_unit:data.datatype_unit});
			});
			arrayDTTId.sort(); /*Sắp xếp mảng loại dữ liệu*/
		},
		error: function(jqXHR,textStatus,errorThrown){
			 displayError("Không thể tải được dữ liệu của các loại số liệu đo. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			callback(arrayDTTId,arrayDTType);
		}
	});
}
//ham lay ve danh sach vung dua tren id user
function loadRegionByUserIdForAddThreshold(config,token,security,userid,callback){
	var arrayReg = [];
	jQuery.ajax({
		url : config + '/api/region/getbyuser/' + userid,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.length > 0 ){
				resultdata.data.forEach(function(item, index) {
					arrayReg.push({region_id:item.region_id,region_name:item.region_name});
				});
				callback(arrayReg);
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của vùng. Vui lòng tải lại trang");
		},
	});
}

//ham lay ve danh sach do tuoi cua tom
function loadAgeForAddThreshold(config,token,security,callback){
	queue3.push(1);
	var arrayAge = [];
	var arrayAgeId = [];
	jQuery.ajax({
		url : config + '/api/age/getall',
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.length > 0){
				resultdata.data.forEach(function(item, index) {
					arrayAge.push({age_id:item.age_id,age_description:item.age_description});
				});
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của độ tuổi tôm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if (queue3.length == 0) {
			callback(arrayAge);
		}
	});
}
//ham lay ve danh sach loài (tom,ca)
function loadSpeciesForAddThreshold(config,token,security,callback){
	queue5.push(1);
	var arraySpecies = [];
	var arraySpeciesId = [];
	jQuery.ajax({
		url : config + '/api/species/getall',
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			resultdata.data.forEach(function(item, index) {
				arraySpecies.push({species_id:item.species_id,species_name:item.species_name});
			});
			arraySpeciesId.sort();
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của loài tôm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue5.pop();
		if (queue5.length == 0) {
			callback(arraySpecies);
		}
	});
}
/*Hàm lấy về thông tin của loại dữ liệu theo id tự gọi callback để sử dụng trong hàm*/
function getDataTypeById(config,token,security,datatype_id,callback){
	jQuery.ajax({
		url: config + '/api/datatype/getbyid/' + datatype_id,
		type: 'GET',
		headers:{'Authorization': security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error:function(jqXHR,error){
			displayError("Lỗi ! Không thể tải dữ liệu của các loại dữ liệu đo. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy về thông tin của vùng đã có ở dòng 1043 - getRegionById*/
//ham lay ve danh sach do tuoi cua tom
function getAgeById(config,token,security,age_id,callback){
	jQuery.ajax({
		url : config + '/api/age/getbyid/' + age_id,
		type: 'GET',
		headers: {'Authorization': security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của độ tuổi tôm theo id. Vui lòng tải lại trang");
		},
	});
}
//ham lay ve thong tin loài (tom,ca) theo id loai
function getSpeciesById(config,token,security,species_id,callback){
	jQuery.ajax({
		url : config + '/api/species/getbyid/' + species_id,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của loài tôm theo id. Vui lòng tải lại trang");
		},
	});
}
/*CÁC HÀM CHO TRANG THÊM,CẬP NHẬT LỜI KHUYÊN, DANH SÁCH LỜI KHUYÊN*/
function getThresholdForAddAdvice(config,token,security,callback){
	jQuery.ajax({
		url : config + '/api/threshold/getallname/',
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của loại dữ liệu để thêm lời khuyên. Vui lòng tải lại trang");
		},
	});
}
/*HÀM TRẢ VỀ DANH SÁCH LỜI KHUYÊN CÓ PHÂN TRANG ( KHÔNG THEO USER CHUYÊN GIA)*/
function getListAdvice(conf,token,secu,index,pagesize){
	var totals = 0;
	var html2 = "";
	var html = "";
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/advice/getpagination?page=' + index + '&pageSize=' + pagesize +'&keyword='+keyword,
  		headers:{
	  		'Content-Type' : 'application/x-www-form-urlencoded',
  			'authorization': secu + token
  		},
  		success: function(resultdata){
  			totals = resultdata.data.TotalPages;
				if(resultdata.data.Items.length > 0){
						resultdata.data.Items.forEach(function(items){
			        html += "<tr>";
			        html += "<td>" + items.Threshold.threshold_name + "</td>";
			        html += "<td>" + items.advice_message + "</td>";
							html += "<td>" + items.User.user_fullName + "</td>";
			        html += "<td>" + moment(items.advice_createdDate).format('DD-MM-YYYY, HH:mm') + "</td>";
			        html += "<td><a href='/quantrac/chuyengia/loikhuyen/capnhatloikhuyen/"+items.advice_id+"'>";
			        html += "<span class='glyphicon glyphicon-pencil'></span>";
			        html += "</a></td>";
			        html += "</tr>";
				   });
				}
				else{
					 html += "<tr>";
					 html += "<td colspan='5'>Không có dữ liệu</td>";
					 html += "</tr>";
				}
		    $("#hienthidslk").html(html);
	      if(totals != 0){
	        if(totals > 1){
	          for(i = 1; i<= totals; i++){
	             html2 += '<li><a href="#" onclick="processPaginationAdvice('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
	          }
	          $('.pagi-custom').html(html2);
						$('.pagi-custom').show();
	        }
	      }
  		},
  		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của danh sách lời khuyên. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý click pagination*/
function processPaginationAdvice(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListAdvice(conf,token,secu,(page-1),pages);
	});
}
/*HÀM SINH RA SỐ KÍ TỰ TỰ ĐỘNG*/
function generateCharater(sokytu){
	var chuoi = "ABCDEFGHIJKLMNOPQRSTWUVZabcdefghijklmnopqrstwuvz0123456789";
	var dodaichuoi  = chuoi.length;
	var chuoiTao = "";
	while(sokytu > 0){
		chuoiTao += chuoi.charAt(Math.floor(Math.random()*dodaichuoi)); /*Random ký tự*/
		sokytu--;
	}
	return chuoiTao;
}
/*Hàm tạo chuỗi nhận từ sự kiện click của nút tạo sink code*/
function generateCode(sokytu,station_code){
	var chuoi = generateCharater(sokytu);
	$(station_code).val(chuoi);
}
/*HÀM LẤY THÔNG TIN CỦA USER THEO USERID*/

/*HÀM THÊM SỬA DANH SÁCH AO*/
//ham lay ve danh sach vung dua tren id user
function getAllRegionByUserId(conf,token,secu,userid,callback){
	jQuery.ajax({
		url : conf + '/api/region/getbyuser/' + userid,
		type: 'GET',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của vùng theo user id. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy dữ liệu ao cho thêm cập nhật trạm*/
function getPondbyUserId(conf,token,secu,userid,callback){
	jQuery.ajax({
		url : conf + '/api/pond/getlistbyuser/'+ userid,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của ao theo user id. Vui lòng tải lại trang");
		},
	});
}
/*HÀM lấy danh sách AO*/
function getListPondbyUserId(conf,token,secu,userid,index,pagesize){
	var keyword = "";
	var totals = "";
	var html = "";
	var html2 = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url : conf + '/api/pond/getpagination/'+ userid +'?page=' + index +'&pageSize=' + pagesize +'&keyword='+keyword,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items.length > 0){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.pond_description + '</td>';
					html += '<td>' + items.pond_width + '</td>';
					html += '<td>' + items.pond_height + '</td>';
					html += '<td>' + items.pond_depth + '</td>';
					html += '<td>' + items.pond_address + '</td>';
					html += '<td>' + items.Region.region_name + '</td>';
					html += '<td>' + items.User.user_fullName + '</td>';
					html += "<td><a title='Cập nhật thông tin ao' href='/quantrac/quanly/ao/capnhatao/"+ items.pond_id +"'>";
          html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += "<td><a title='Xem lịch sử nuôi của ao' href='/quantrac/quanly/nhatkynuoi/xemlichsunuoi/"+ items.pond_id +"'>";
          html += '<i class="fa fa-eye"></i></a></td>';
					html += "<td><a title='Xem hoạt động chăm sóc' href='/quantrac/quanly/hoatdong/xemhoatdongchamsoc/"+ items.pond_id +"'>";
          html += '<i class="fa fa-eye"></i></a></td>';
					html += '</tr>';
		   });

			}
			else{
				html += '<tr>';
				html += '<td colspan="8">Không có dữ liệu</td>';
				html += '</tr>';
			}
			$("#hienthidsao").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationPond('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + userid  +  ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của ao theo user id. Vui lòng tải lại trang");
		},
	});
}
var pagenoti = 0,sizenoti = 0;
/*HÀM LẤY DANH SÁCH THÔNG BÁO HIỆN RA TRANG RIÊNG*/
/*Xử lý click pagination cho ao*/
function processPaginationPond(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';

	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    var page = parseInt($("ul.pagi-custom .active a").text());
	    pagenoti = (page-1)*pagesize;
			// var pagesize = 10;
			getListPondbyUserId(conf,token,secu,userid,(page-1),pagesize);
	});
}
/*Hàm lấy về danh sách 10 thông báo mới nhất chưa đọc dựa trên userid của người quản lý*/
function getListNotification(conf,token,secu,userid,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	ispageNotification = true;
	$('.loading-info').show();
	jQuery.ajax({
		url: conf + '/api/notification/getbymanager/'+ userid + '?index=' + index + '&size=' + size,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.length){
				resultdata.data.forEach(function(data,index){
					if(data.notif_readState == 0){
						html += "<tr class='bg-info' id='notifi_"+data.notif_id+"'>";
					}
					else{
						html += "<tr>";
					}
					html += "<td><input type='checkbox' value='"+data.notif_id+"' name='selectNotifi' id='selectNotifi'/></td>";
					html += "<td class='notif_title_"+data.notif_id+"'>" + data.notif_title + "</td>";
					moment.locale('vi');
					html += "<td  class='notif_createdDate_"+data.notif_id+"'>" + moment(data.notif_createdDate).utc().format('DD-MM-YYYY, HH:mm') + "</td>";
					html += '<td class="notif_seen_'+data.notif_id+'"><a title="Xem chi tiết thông báo" href="#" onclick="showModalNoti('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + data.data_id + ',' + data.threshold_id + ',' + "'" + data.notif_title + "'" + ',' + data.notif_id +','+ data.region_id + ',' + "'" + data.notif_createdDate + "'" + ',' + data.notif_readState +')">';
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += "</tr>";
				});
				$("#hienthitb").append(html);
				$('.loading-info').hide();
			}
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách thông báo. Vui lòng tải lại trang");
  		},
	});
}
/*HÀM LIÊN QUAN TỚI NGƯỠNG*/
/*HÀM lẤY danh sách ngưỡng*/
function getListThreshold(conf,token,secu,textcontrol,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	var totals = 0;
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/threshold/getpagination?page=' + index +'&pageSize='+ size +'&keyword='+keyword,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items.length > 0){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.threshold_name + '</td>';
					html += '<td>' + items.threshold_start + '</td>';
					html += '<td>' + items.threshold_end + '</td>';
					html += '<td>' + items.threshold_level + '</td>';
					html += "<td><a title='Cập nhật thông tin ngưỡng' href='/quantrac/"+textcontrol+"/nguong/capnhatnguong/"+ items.threshold_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += '<td><a title="Xem chi tiết về ngưỡng" href="#" onclick="showModalThreshold('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.threshold_id + ',' + "'" + items.datatype_id + "'" + ',' + items.region_id  + ',' + items.age_id +','+ items.species_id + ',' + "'" + items.threshold_name + "'" + ',' + items.threshold_start + ',' + items.threshold_end + ',' + items.threshold_level + ',' + "'" + items.threshold_message + "'" + ',' + "'" + items.threshold_createdDate + "'" + ',' + items.threshold_timeWarning + ',' + items.threshold_type +')">';
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
		   });
			}
			else{
				html += '<tr>';
				html += '<td colspan="6">Không có dữ liệu</td>';
				html += '</tr>';
			}
			$("#hienthids").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationThreshold('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + "'" + textcontrol + "'" +  ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách ngưỡng. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm xử lý phân trang cho threshold*/
/*Xử lý phân trang cho threshold*/
function processPaginationThreshold(conf,token,secu,textcontrol,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    pagenoti = (page-1)*pages;
	    getListThreshold(conf,token,secu,textcontrol,(page-1),pages);
	});
}
/*HÀM lẤY thông tin về loài và độ tuổi theo id*/

/*Hàm hiển thị modal dữ liệu của ngưỡng*/
function showModalThreshold(conf,token,secu,threshold_id,datatype_id,region_id,age_id,species_id,threshold_name,threshold_start,threshold_end,threshold_level,threshold_message,threshold_createdDate,threshold_timeWarning,threshold_type){
	/*Gọi callback lấy dữ liệu*/
	$(".threshold_name").text(threshold_name);
	getDataTypeById(conf,token,secu,datatype_id,function(resultdata){
		$(".datatype_name").text(resultdata.datatype_name);
	});
	getRegionById(conf,token,secu,region_id,function(result){
		$(".region_name").text(result.region_name);
	});
	getSpeciesById(conf,token,secu,species_id,function(resultspecies){
		$(".species_name").text(resultspecies.species_name);
	});
	getAgeById(conf,token,secu,species_id,function(resultage){
		$(".age_name").text(resultage.age_description);
	});
	$(".threshold_start_end").text(threshold_start + " - " + threshold_end);
	$(".threshold_level").text(threshold_level);
	$(".threshold_message").text(threshold_message);
	$(".threshold_createdDate").text(moment(threshold_createdDate).format('DD-MM-YYYY, HH:mm'));
	$(".threshold_timeWarning").text(threshold_timeWarning);
	if(threshold_type == 1){
		$(".threshold_type").text("Ngưỡng cho ao");
	}
	else if(threshold_type == 0){
		$(".threshold_type").text("Ngưỡng cho sông");
	}
	else{
		$(".threshold_type").text("Ngưỡng cho các vị trí khác");
	}
	$("#modalThreshold").modal('show');
}
/*Hàm hiển thị modal dữ liệu của trạm*/
function showModalStation(conf,token,secu,station_id,station_name,station_location,station_node,station_address,station_duration,station_updateStatus,pond_description,river_name,region_name,sink_name){
	/*Gọi callback lấy dữ liệu*/
	$(".station_name").text(station_name);

	if(pond_description == ''){
		$(".p_description").hide();
	}
	if(sink_name == ''){
		$('.s_name').hide();
	}
	if(station_address == ''){
		$('.s_address').hide();
	}
	if(station_location == ''){
		$('.s_location').hide();
	}
	if(river_name == ''){
		$('.r_name').hide();
	}
	$(".pond_description").text(pond_description);
	$(".river_name").text(river_name);
	$(".region_name").text(region_name);
	$(".sink_name").text(sink_name);
	$(".station_address").text(station_address);
	$(".station_location").text(station_location);
	$(".station_duration").text(station_duration);
	$(".station_updateStatus").text(station_updateStatus);
	$("#modalStation").modal('show');
}
/*HÀm cho trạm điều hướng*/
function getListSink(conf,token,secu,userid,index,size){
	var html = "";
	var html2 = "";
	var totals = 0;
	var keyword = "";
	var presentPage = 0;
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/sink/getpagination/' + userid +'?page=' + index +'&pageSize='+ size +'&keyword=' +keyword,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				presentPage = parseInt(resultdata.data.Page);
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.sink_name + '</td>';
					html += '<td>' + items.sink_address + '</td>';
					html += '<td>' + items.sink_code + '</td>';
					html += "<td><a title='Cập nhật thông tin trạm điều hành' href='/quantrac/quanly/tramdieuhanh/capnhattramdieuhanh/"+ items.sink_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += '<td><Button onclick="getListStationBySinkId('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.sink_id + ',' + "'" + items.sink_name + "'" + ')">';
					html += '<i class="fa fa-eye" aria-hidden="true"></i></Button></td>';
					html += '</tr>';
		    });

			}
			else{
				html += '<tr>';
				html += '<td colspan="5">Không có dữ liệu</td>';
				html += '</tr>';
			}
			$("#hienthitramdh").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						if(i == presentPage){
							html2 += '<li class="active"><a href="#" onclick="processPaginationSink('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
						}
						else{
							html2 += '<li><a href="#" onclick="processPaginationSink('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
						}
					}+
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách trạm điều hành. Vui lòng tải lại trang");
  		},
	});
}
/*Xử lý phân trang cho sink*/
function processPaginationSink(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListSink(conf,token,secu,userid,(page-1),pages);
	});
}
/*Hàm lấy danh sách được quản lý bởi id của trạm điều hành (sink_id)*/
function getListStationBySinkId(conf,token,secu,sink_id,sink_name){
	var html = "";
	$('.sink_title').html("Danh sách trạm được quản lý bởi " + sink_name);
	jQuery.ajax({
		url: conf + '/api/station/getbysink/' + sink_id,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			if(resultdata.length > 0){
				resultdata.data.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.station_name +'</td>';
					html += '<td>' + items.station_address +'</td>';
					html += '</tr>';
				});
				$('#dsTram').html(html);
				$('#modalStationMin').modal('show');
			}
			else{
				alert(sink_name + " không quản lý trạm nào");
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi không thể tải danh sách trạm theo id của trạm điều hành");
		},

	});
}
//ham lay ve danh sach loài (tom,ca)
function getListSpecies(conf,token,secu,index,pagesize){
	var totals = 0;
	var html = "";
	var html2 = "";
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	var i = 1;
	jQuery.ajax({
		url : conf + '/api/species/getpagination/?page=' + index +'&pageSize=' + pagesize +'&keyword=' +keyword,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += "<td>" + i++  + "</td>";
					html += "<td>" + items.species_name  + "</td>";
					html += "<td><a title='Cập nhật thông tin  loài thả nuôi' href='/quantrac/quanly/loaithanuoi/capnhatloaithanuoi/"+ items.species_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += "</tr>";
				});
			}
			else{
				html += '<tr>';
				html += "<td colspan='3'>Không có dữ liệu</td>";
				html += '</tr>';
			}
			$("#hienthidsloai").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationSpecies('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách loài thả nuôi. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho species*/
function processPaginationSpecies(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListSpecies(conf,token,secu,(page-1),pages);
	});
}
/*Hàm lấy danh sách vùng theo userid có phân trang*/
function getListRegionByUserId(conf,token,secu,userid,index,pagesize){
	var totals = 0;
	var html = "";
	var html2 = "";
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url : config + '/api/region/getpagination/' + userid + '?page=' + index +'&pageSize=' + pagesize +'&keyword='+keyword,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += "<td>" + items.region_name  + "</td>";
					html += "<td>" + items.ward_name + "</td>";
					html += "<td><a id='btnCapNhat' title='Cập nhật thông tin  vùng' href='/quantrac/quanly/vung/capnhatvung/"+ items.region_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += "</tr>";
				});
			}
			else{
				html += "<tr>";
				html += "<td colspan='3'>Không có dữ liệu</td>";
				html += "</tr>";
			}
			$("#hienthidsvung").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						if(i == 1){
							html2 += '<li><a href="#" onclick="processPaginationRegion('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
						}
						else{
							html2 += '<li><a href="#" onclick="processPaginationRegion('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + userid + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
						}
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách vùng theo userid. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho station*/
function processPaginationRegion(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListRegionByUserId(conf,token,secu,userid,(page-1),pages);
	});
}
/*Hàm lấy danh sách configtype*/
function getListConfigType(conf,token,secu,callback){
	jQuery.ajax({
		url: conf + '/api/configtype/getall',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải dữ liệu configtype. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm lấy các configtype cha*/
function getListConfigTypeParent(conf,token,secu,callback){
	var arrayParentConfigType = [];
	queue.push(1);
	jQuery.ajax({
		url: conf + '/api/configtype/getall',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			resultdata.data.forEach(function(items){
				if(items.configtype_parentId == null){
					arrayParentConfigType.push({configtype_id:items.configtype_id,configtype_name:items.configtype_name});
				}
			});
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải dữ liệu configtype parent. Vui lòng tải lại trang");
  		},
	}).complete(function(){
		queue.pop();
		if(queue.length == 0){
			callback(arrayParentConfigType);
		}
	});
}
/*Hàm lấy về các trạm điều hành phục vụ cho trang thêm trạm*/
function getAllSink(conf,token,secu,callback){
	jQuery.ajax({
		url: conf + '/api/sink/getall',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải dữ liệu trạm điều hành. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm lấy về các trạm sông phục vụ cho trang thêm trạm*/
function getRiverByUser(conf,token,secu,userid,callback){
	jQuery.ajax({
		url: conf + '/api/river/getbyuser/' + userid,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải dữ liệu trạm sông. Vui lòng tải lại trang");
  		},
	});
}
/*HÀm cho trạm điều hướng*/
function getListAge(conf,token,secu,index,pagesize){
	var html = "";
	var html2 = "";
	var totals = 0;
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/age/getpagination?page=' + index +'&pageSize='+ pagesize +'&keyword='+keyword,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.age_valueMin + " - " + items.age_valueMax + " ngày" + '</td>';
					html += '<td>' + items.age_description + '</td>';
					html += "<td><a title='Cập nhật độ tuổi' href='/quantrac/quanly/dotuoi/capnhatdotuoi/"+ items.age_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += '</tr>';
		    });
			}
			else{
				html += '<tr>';
				html += "<td colspan='3'>Không có dữ liệu</td>";
				html += '</tr>';
			}
			$("#dsdotuoi").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationAge('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách trạm điều hướng. Vui lòng tải lại trang");
  		},
	});
}
/*Xử lý phân trang cho sink*/
function processPaginationAge(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListAge(conf,token,secu,(page-1),pages);
	});
}
/*Hàm lấy danh sách user để thêm ao*/
function getAllUserByKeyWord(conf,token,secu){
	var keyword = "";
	var html = "";
	// html += "<option value='"+-1+"'>Chọn người dùng</option>";
	if($("#txtTimKiem").val() != ''){
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/user/getlistfarmer?keyword='+keyword,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.length > 0){
				resultdata.data.forEach(function(items){
					html += "<option value='"+ items.user_id +"'>" + items.user_userName + "</option>";
				});
				// $("#user_id").html(html); /*Đỗ dữ liệu*/
			}
			else{
				html += "<option value='"+ -1 +"'>Chọn người dùng</option>";
			}
			$("#user_id").html(html); /*Đỗ dữ liệu*/
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải thông tin người dùng theo từ khóa. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm lấy thông tin người dùng theo user id*/
function getUserById(conf,token,secu,userid,callback){
	jQuery.ajax({
		url: conf + '/api/user/getbyid/' + userid,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải thông tin người dùng theo user. Vui lòng tải lại trang");
  		},
	});
}
/*Hàm lấy về danh sách xã theo cấp quản lý phục vụ cho việc thêm vùng*/
/*Bên trên có  1 hàm tương tự như hàm này tuy nhiên việc thay đổi cấu trúc hàm quá nhiều sẽ ảnh hưởng nên phải viết hàm mới*/
var arrayWard = []; /*Lưu mảng các xã được quản lý*/
function getLocationManage(conf,token,secu,userid,ward_id){
	var arrayProvince = [];
	var arrayDistrict = [];
	var options = "";
	options += "<option value='" + -1 + "'>Chọn xã phường</option>";
	queue.push(1);
	jQuery.ajax({
		url : conf + "/api/locationmanager/getlistbyuser/" + userid,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.data != null){
				typeLocation = resultdata.data.typeLocation;
				if(typeLocation == "Region"){
					$("#region_name").prop('disabled',true);
					$("#region_description").prop('disabled',true);
					$("#ward_id").prop('disabled',true);
					$("#btnThemVung").prop('disabled',true);
					$("#btnThem").prop('disabled',true);
					$("#btnCapNhatVung").prop('disabled',true);
					$("#btnCapNhat").prop('disabled',true);
					alert("Người quản lý cấp vùng không được thêm vùng");
				}
				for(i in resultdata.data.data){
					if(resultdata.data.typeLocation == "Province"){
						arrayProvince.push({province_id:resultdata.data.data[i].province_id,province_name:resultdata.data.data[i].province_name});
					}
					if(resultdata.data.typeLocation == "District"){
						arrayDistrict.push({district_id:resultdata.data.data[i].district_id,district_name:resultdata.data.data[i].district_name});
					}
					if(resultdata.data.typeLocation == "Ward"){
						if(resultdata.data.data[i].ward_id === ward_id){
							console.log("id bên trong: " + resultdata.data.data[i].ward_id);
							options += "<option selected value='" + resultdata.data.data[i].ward_id + "'>" + resultdata.data.data[i].ward_name +"</option>";
						}
						else{
							options += "<option value='" + resultdata.data.data[i].ward_id + "'>" + resultdata.data.data[i].ward_name +"</option>";
						}
						$("#ward_id").html(options);
						$("#ward_id").selectpicker('refresh');
					}
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của danh sách cấp xã theo user id. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue.pop();
		var _arrayProvince = sortByKey(arrayProvince,"province_id");
		var _arrayDistrict = sortByKey(arrayDistrict,"district_id");
		if(queue.length == 0){
			if(typeLocation == "Province"){
				getArrayDisTrictManage(conf,token,secu,_arrayProvince,ward_id);
			}
			if(typeLocation == "District"){
				getArrayWardManage(conf,token,secu,_arrayDistrict,ward_id);
			}
		}
		/*Đối với trường hợp quản lý cấp vùng sẽ không được thêm vùng*/
	});
}
/*Hàm lấy về danh sách huyện để truy vấn lấy danh sách xã dựa trên mảng danh sách tỉnh*/
function getArrayDisTrictManage(conf,token,secu,_arrayProvince,ward_id){
	queue2.push(1);
	_arrayProvince.forEach(function(items,index){
		getDistrictManage(conf,token,secu,items.province_id,ward_id);
	});
}
/*Hàm lấydanh sách huyện của từng tỉnh*/
function getDistrictManage(conf,token,secu,province_id,ward_id){
	var arrayDistrict = [];
	jQuery.ajax({
		url : conf + '/api/location/getdistrictbyprovince/' + province_id,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data != null){
				resultdata.data.forEach(function(items){
					arrayDistrict.push({district_id:items.district_id,district_name:items.district_name});
		   	});
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của huyện theo id của tỉnh. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			getArrayWardManage(conf,token,secu,arrayDistrict,ward_id);
		}
	});
}
/*Hàm nhận vào mảng các huyện để lấy danh sách xã*/
function getArrayWardManage(conf,token,secu,_arrayDistrict,ward_id){
	queue5.push(1);
	_arrayDistrict.forEach(function(items) {
		getWARDmanage(conf,token,secu,items.district_id,ward_id);
	});
}
/*Hàm lấydanh sách xã của từng huyện*/
function getWARDmanage(conf,token,secu,district_id,ward_id){
	var arrayWard = [];
	var options = "";
	// options += "<option value='" + -1 + "'>Chọn xã/phường</option>";
	jQuery.ajax({
		url : conf + '/api/location/getwardbydistrict/' + district_id,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data != null){
				resultdata.data.forEach(function(items){
					if(items.ward_id == ward_id){
						options += "<option selected value='" + items.ward_id + "'>" + items.ward_name +"</option>";
					}
					else{
						options += "<option value='" + items.ward_id + "'>" + items.ward_name +"</option>";
					}
		   	});
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của xã theo id của huyện. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			$("#ward_id").append(options);
			$("#ward_id").selectpicker('refresh');
		}
	});
}
/*HÀM TẠM ĐỂ BIẾT INSERT THÀNH CÔNG HAY KHÔNG - HÀM XEM DANH SACH TRẠM CẤU HÌNH*/
function getListStationConfig(conf,token,secu,index,pagesize){
	var keyword = "";
	var totals = "";
	var html = "";
	var html2 = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url : conf + '/api/stationconfig/getpagination/?page=' + index +'&pageSize=' + pagesize +'&keyword='+keyword,
		type: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			'Authorization':secu + token
		},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.stationconfig_id + '</td>';
					html += '<td>' + items.configtype_id + '</td>';
					html += '<td>' + items.station_id + '</td>';
					html += '<td>' + items.stationconfig_value + '</td>';
					html += '<td>' + moment(items.stationconfig_createDate).utc().format('DD-MM-YYYY, HH:mm') + '</td>';
					html += "<td><a title='Cập nhật thông tin ao' href='/quantrac/quanly/tramcauhinh/capnhattramcauhinh/"+ items.stationconfig_id +"'>";
          html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += '</tr>';
		   });
	     $("#hienthitramch").html(html);
			}
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationStaionConfig('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của ao theo user id. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho sink*/
function processPaginationStaionConfig(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListStationConfig(conf,token,secu,(page-1),pagesize);
	});
}
/*Hàm hiển thị modal xem thong tin ca nhan*/
function showModalUserInfo(conf,token,secu,userid){
	$(".modal-title").text("Thông tin cá nhân của người dùng");
	var level_info = "";
	var status_sendmessage = "";
	getUserById(conf,token,secu,userid,function(data){
		$('.user_userName').text(data.user_userName);
		$('.user_fullName').text(data.user_fullName);
		$('.user_birthday').text(moment(data.user_birthday).utc().format('DD-MM-YYYY, HH:mm'));
		$('.user_phone').text(data.user_phone);
		$('.user_email').text(data.user_email);
		$('.user_address').text(data.user_address);
		if(data.user_levelManager == 1){
			level_info = "Tỉnh";
		}
		else if(data.user_levelManager == 2){
			level_info = "Huyện";
		}
		else if(data.user_levelManager == 3){
			level_info = "Xã";
		}
		else{
			level_info = "Vùng";
		}
		$('.user_levelManager').text(level_info);
	});
	$("#modalInfoUser").modal('show');
}
/*Hàm gửi dữ liệu cấu hình lên server*/
/*Mỗi lần cấu hình từng station_id
* array_station_config là mảng chứa dữ liệu cấu hình có dạng
*
station_config:[{
		configtype_id: configtype_id,
		stationconfig_value: stationconfig_value,
		stationconfig_status: stationconfig_status,
		stationconfig_createDate: stationconfig_createDate
}]
*/
/*Hàm gửi các thiết lập cấu hình sử dụng api*/
function setUpStationConfig(conf,token,secu,array_station_config,callback){
		var request = $.ajax({
				url: conf + '/api/stationconfig/setup/',
				method : 'POST',
				contentType: 'application/json; charset=utf-8',
				data: array_station_config,
				headers:{
						'Content-Type':'application/x-www-form-urlencoded',
						'Authorization': secu + token
				}
		});
		request.done(function(rs){
				if(rs.Error){
						displayError("Lỗi ! Không thể thiết lập cấu hình trạm. Vui lòng tải lại trang.");
						callback(true,null);
				}else{
						callback(false,rs.data);
				}
		});
		request.fail(function(jqXHR, textStatus){
				displayError("Lỗi ! Không thể thiết lập cấu hình trạm. Vui lòng tải lại trang.");
				callback(true,null);
		});
}
/*hàm sử dụng sessionStorage để lưu lại giá trị tạm thời*/
function usingSessionStorageForStationConfig(){
    if(typeof(Storage) !== "undefined"){
        if(sessionStorage.stationconfig){
            var stt = 1;
            var html = '';
						// console.log(moment().format('DD-MM-YYYY, HH:mm'));
						$("#tblListStationConfig").show();
            stationconfig = JSON.parse(sessionStorage.stationconfig);
						console.log(stationconfig.stationid);
						$("#station_id").val(stationconfig.stationid).change();
						dislayStationConfig(conf,token,secu,stationconfig.stationid);
            stationconfig.data.forEach(function(items){
							html += '<tr>';
							html += '<td class="text-center">' + stt + '</td>';
							html += '<td class="text-center">' + items.configtype_name + '</td>';
							html += '<td class="text-center">' + items.stationconfig_value + '</td>';
							html += '<td class="text-center"><a href="" onclick="updateSetUpStationConfig('+stt+');return false;">';
							html += '<span class="glyphicon glyphicon-pencil"></span></a>';
							html += '<a style="margin-left:8px" href="" onclick="deleteSetUpStationConfig('+stt+');return false;">';
							html += '<span class="glyphicon glyphicon-remove"></span></a></td>';
							html += '</tr>';
              stt++;
            });
            if(html != ''){
                $('#listStationConfig').html(html);
            }
        }
				else{
            stationconfig = {
								stt:0,
								stationid:0,
                data:[]
            };
            sessionStorage.stationconfig = JSON.stringify(stationconfig);
            console.log(sessionStorage.stationconfig);
        }
    }
		else{
        alert('Xin vui lòng sử dụng Chrome 4.0, IE 8.0, FireFox 3.5, Safari 4.0 hoặc Opera 11.5 trở lên để dùng chức năng này');
    }
}
/* Ham thêm vào từng loại cấu hình để lưu tạm vào sessionStorage */
function setUpOneConfig(){
	if($('#frmTramCauHinh').valid()){
		$('#station_id').prop('disabled',true);
		$('#btnLuuCauHinh').prop('disabled',false);
		$("#tblListStationConfig").show();
    var html = '';
    var station_config;
		var stt = 1;
		// var stationconfig_createDate = moment().format('DD-MM-YYYY, HH:mm');
		// station_config = {
		// 	station_config_stt:stationconfig.stt, /*Mởi thêm*/
		// 	configtype_id: $('#configtype_id').val(),
		// 	configtype_name: $('#configtype_id :selected').text(), /*Lấy tên của loại cấu hình để hiển thị*/
		// 	stationconfig_value: $('#stationconfig_value').val(),
		// 	stationconfig_status: false,
		// 	stationconfig_createDate: stationconfig_createDate
		// }
		//
		// stationconfig.stationid = $('#station_id').val();
		// stationconfig.data.push(station_config);
		// sessionStorage.stationconfig = JSON.stringify(stationconfig);
		// console.log(sessionStorage.stationconfig);
		// html += '<tr>';
		// html += '<td class="text-center">' + stationconfig.stt + '</td>';
		// html += '<td class="text-center">' + $('#configtype_id :selected').text() + '</td>';
		// html += '<td class="text-center">' + station_config.stationconfig_value + '</td>';
		// html += '<td class="text-center"><a href="" onclick="updateSetUpStationConfig('+stationconfig.stt+');return false;">';
		// html += '<span class="glyphicon glyphicon-pencil"></span></a>';
		// html += '<a style="margin-left:8px" href="" onclick="deleteSetUpStationConfig('+stationconfig.stt+');return false;">';
		// html += '<span class="glyphicon glyphicon-remove"></span></a></td>';
		// html += '</tr>';
		// // console.log(html);
		// // $('#listStationConfig').append(html);
		// $('#listStationConfig').html($('#listStationConfig').html() + html);
		// clearAllItemStationConfig();
		var arrayConfigTypeId = [];
		stationconfig.data.forEach(function(items){
			arrayConfigTypeId.push(items.configtype_id);
		});
		if(arrayConfigTypeId.indexOf($('#configtype_id').val()) == -1){
			stationconfig.stt++;
			var stationconfig_createDate = moment().format('DD-MM-YYYY, HH:mm');
			station_config = {
				station_config_stt:stationconfig.stt, /*Mởi thêm*/
				configtype_id: $('#configtype_id').val(),
				configtype_name: $('#configtype_id :selected').text(), /*Lấy tên của loại cấu hình để hiển thị*/
				stationconfig_value: $('#stationconfig_value').val(),
			}

			stationconfig.stationid = $('#station_id').val();
			stationconfig.data.push(station_config);
			sessionStorage.stationconfig = JSON.stringify(stationconfig);
			console.log(sessionStorage.stationconfig);
			html += '<tr>';
			html += '<td class="text-center">' + stationconfig.stt + '</td>';
			html += '<td class="text-center">' + $('#configtype_id :selected').text() + '</td>';
			html += '<td class="text-center">' + station_config.stationconfig_value + '</td>';
			html += '<td class="text-center"><a href="" onclick="updateSetUpStationConfig('+stationconfig.stt+');return false;">';
			html += '<span class="glyphicon glyphicon-pencil"></span></a>';
			html += '<a style="margin-left:8px" href="" onclick="deleteSetUpStationConfig('+stationconfig.stt+');return false;">';
			html += '<span class="glyphicon glyphicon-remove"></span></a></td>';
			html += '</tr>';
			$('#listStationConfig').html($('#listStationConfig').html() + html);
			clearAllItemStationConfig();
		}
		else{
			alert('Loại cấu hình này đã được thiết lập giá trị. Bạn có thể thay đổi giá trị cấu hình');
		}
	}
}
/*Hàm gửi dữ liệu lên server ssau khi đã cấu hình tất cả các loại cấu hình*/
function setUpAllConfig(){
	$('#btnLuuCauHinh').prop('disabled',true);
	var station_id = $("#station_id").val();
	var dataStationConfig = {
		station_id:station_id,
		station_config:[]
	}
	if(stationconfig.stt > 0){
		stationconfig.data.forEach(function(items){
			var temp = {
				configtype_id: items.configtype_id,
				stationconfig_value: items.stationconfig_value,
				stationconfig_status: items.stationconfig_status,
				stationconfig_createDate: items.stationconfig_createDate
			};
			dataStationConfig.station_config.push(temp);
		});
		console.log(dataStationConfig);
		/*Do không truyền conf,secu và token nên sử dụng biến toàn cục đã được lưu lại khi gọi realtime*/
		setUpStationConfig(config,tokend,security,dataStationConfig,function(error,data){
			if(!error){
				stationconfig.data = [];
				stationconfig.stationid = 0;
				sessionStorage.clear();
				$('#station_id').prop('disabled',false);
				$("#station_id").prop('selectedIndex',0);
				clearAllItemStationConfig();
			}
		});
		$("#stationconfig_value").val('');
		$("#listStationConfig").html('');
		$("#tblListStationConfig").hide();
	}
}
/*Hàm xử lý khi người dùng hủy thiết lập xóa bỏ sessionStorage*/
function cancelSetUpStationConfig(){
	$("#listStationConfig").html('');
	$("#tbListStationConfig").hide();
	$('#btnLuuCauHinh').prop('disabled',false);
	sessionStorage.clear();
}
/*Hàm hủy bỏ các thông số khi đã cấu hình xong*/
function clearAllItemStationConfig(){
	// jQuery("select#station_id option[value='-1']").attr("selected", "selected");
	// $("#station_id").prop('selectedIndex',1);
	$("#configtype_id").prop('selectedIndex',0);
	$("#stationconfig_value").val('');
}
/*Hàm xóa một thiết lập cấu hình*/
function deleteSetUpStationConfig(itemsDelete){
	var index = 0;
	var stt = 1;
	var count = -1;
	var htmlDelete = '';
	stationconfig.data.forEach(function(items){
		count++;
		if(items.station_config_stt == itemsDelete){
			index = count;
		}
	});
	stationconfig.data.splice(index,1); /*Hàm spice - index là vị trí cần xóa - 1 là số phần tử cần xóa trong mảng data*/
	stationconfig.stt--;
	sessionStorage.stationconfig = JSON.stringify(stationconfig);
	console.log(sessionStorage.stationconfig);
	if(stationconfig.stt > 0){
		stationconfig.data.forEach(function(items){
			htmlDelete += '<tr>';
			htmlDelete += '<td class="text-center">' + stt + '</td>';
			htmlDelete += '<td class="text-center">' + items.configtype_name + '</td>';
			htmlDelete += '<td class="text-center">' + items.stationconfig_value + '</td>';
			htmlDelete += '<td class="text-center"><a href="" onclick="updateSetUpStationConfig('+stt+');return false;">';
			htmlDelete += '<span class="glyphicon glyphicon-pencil"></span></a>';
			htmlDelete += '<a style="margin-left:8px" href="" onclick="deleteSetUpStationConfig('+stt+');return false;">';
			htmlDelete += '<span class="glyphicon glyphicon-remove"></span></a></td>';
			htmlDelete += '</tr>';
			stt++;
		});
		$('#listStationConfig').html(htmlDelete);
	}
	else{
		$("#listStationConfig").html('');
		$("#btnLuuCauHinh").prop('disabled',true);
		$("#tblListStationConfig").hide();
	}
}
/*Hàm hiển thị modal cho cập nhật một cấu hình đã thêm*/
function updateSetUpStationConfig(itemsUpdate){
	var index = 0;
	var stt = 1;
	var count = -1;
	stationconfig.data.forEach(function(items){
		count++;
		if(items.station_config_stt == itemsUpdate){
			index = count;
		}
	});
	var arrayConfigParent = [];
	var html3 = "";
	var dataUpdate = stationconfig.data[index]; /*Hàm spice - index là vị trí cần xóa - 1 là số phần tử cần xóa trong mảng data*/
	getListConfigTypeParent(config,tokend,security,function(response){
		response.forEach(function(items){
			arrayConfigParent.push({configtype_id:items.configtype_id,configtype_name:items.configtype_name});
			html3 += "<optgroup label='"+items.configtype_name+"  '>";
			html3 += "</optgroup>";
		});
		$("#configtypeid").html(html3);
	});
	getListConfigType(config,tokend,security,function(data){
		// html2 += "<option value='"+-1+"'>Chọn loại cấu hình</option>";
		if(data != null){
			/*Chạy qua mảng các phần tử cha để appendTo các phẩn tử con vào*/
			arrayConfigParent.forEach(function(dt){
				data.forEach(function(items){
					if(dt.configtype_id==items.configtype_parentId){
						$("<option/>").attr("value", items.configtype_id).append(items.configtype_name).appendTo("optgroup[label='" + dt.configtype_name + "  ']");
						if(items.configtype_id == dataUpdate.configtype_id){
							$("#configtypeid").val(dataUpdate.configtype_id);
						}
					}
				});
			});
		}
	});
	$("#station_config_stt").val(dataUpdate.station_config_stt);
	$("#stationconfigvalue").val(dataUpdate.stationconfig_value);
	$("#modalUpdateStationConfig").modal('show');
}
/*Hàm cập nhật thay đổi dữ liệu khi người dùng nhấn nút lưu ở modal*/
function saveSetUpStationConfig(){
	if($('#frmCNTramCauHinh').valid()){
		var index = 0;
		var stt = 1;
		var count = -1;
		var htmlUpdate = '';
		stationconfig.data.forEach(function(items){
			count++;
			if(items.station_config_stt == parseInt($("#station_config_stt").val())){
				index = count;
			}
		});
		var stationconfig_createDate = moment().format('DD-MM-YYYY, HH:mm');
		station_config = {
			station_config_stt:$("#station_config_stt").val(), /*Mởi thêm*/
			configtype_id: $('#configtypeid').val(),
			configtype_name: $('#configtypeid :selected').text(), /*Lấy tên của loại cấu hình để hiển thị*/
			stationconfig_value: $('#stationconfigvalue').val(),
			stationconfig_status: false,
			stationconfig_createDate: stationconfig_createDate
		}
		stationconfig.data[index] = station_config;
		sessionStorage.stationconfig = JSON.stringify(stationconfig);
		var stt = 1;
		stationconfig.data.forEach(function(items){
			htmlUpdate += '<tr>';
			htmlUpdate += '<td class="text-center">' + stt + '</td>';
			htmlUpdate += '<td class="text-center">' + items.configtype_name + '</td>';
			htmlUpdate += '<td class="text-center">' + items.stationconfig_value + '</td>';
			htmlUpdate += '<td class="text-center"><a href="" onclick="updateSetUpStationConfig('+stt+');return false;">';
			htmlUpdate += '<span class="glyphicon glyphicon-pencil"></span></a>';
			htmlUpdate += '<a style="margin-left:8px" href="" onclick="deleteSetUpStationConfig('+stt+');return false;">';
			htmlUpdate += '<span class="glyphicon glyphicon-remove"></span></a></td>';
			htmlUpdate += '</tr>';
			stt++;
		});
		$("#listStationConfig").html(htmlUpdate);
		$("#pushNoti").html("Đã cập nhật thành công");
		$("#pushNoti").css("display","block");
		setTimeout(function () {
			$("#pushNoti").css("display","none");
		}, 2000);
	}
}
/*Hàm hiển thị lịch sử nuôi dựa trên id của ao*/
function getStockingPondByPondId(conf,token,secu,pondid,callback){
	jQuery.ajax({
		url: conf + '/api/stockingpond/getbypond/' + pondid,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải nhật ký vụ nuôi của ao. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy tên của loại đợt thả nuôi*/
function getStockingType(conf,token,secu,callback){
	jQuery.ajax({
		url: conf + '/api/stockingtype/getall',
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải loại đợt thả nuôi. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy dữ liệu của đợt thả nuôi theo id*/
function getStockingById(conf,token,secu,stockingid,callback){
	jQuery.ajax({
		url: conf + '/api/stocking/getbyid/' +stockingid,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của đợt thả nuôi theo id vụ nuôi. Vui lòng tải lại trang");
		},
	});
}
/*Hàm lấy thông tin về giống theo id*/
function getSeedById(conf,token,secu,seed_id,callback){
	jQuery.ajax({
		url: conf + '/api/seed/getbyid/' + seed_id,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu về giống. Vui lòng tải lại trang.");
		},
	});
}
/*Hàm lấy thông tin về chất lượng giống theo id*/
function getSeedById(conf,token,secu,seedquality_id,callback){
	jQuery.ajax({
		url: conf + '/api/seedquality/getbyid/' + seedquality_id,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu về giống. Vui lòng tải lại trang.");
		},
	});
}
/*Hàm lấy về giá trị cấu hình*/
function getStationConfigByStationId(conf,token,secu,stationid,callback){
	jQuery.ajax({
		url: conf + '/api/stationconfig/getbystationid/' + stationid,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải giá trị cấu hình theo id trạm. Vui lòng tải lại trang.");
		},
	});
}
/*Hàm xóa một giá trị cấu hình*/
function deleteStationConfigStationConfigId(conf,token,secu,stationconfig_id,callback){
	var request = $.ajax({
			url: conf + '/api/stationconfig/delete/' + stationconfig_id,
			method : 'DELETE',
			contentType: 'application/json; charset=utf-8',
			headers:{
					'Content-Type':'application/x-www-form-urlencoded',
					'Authorization': secu + token
			},
			data:{}
	});
	request.done(function(rs){
			if(rs.Error){
					displayError("Lỗi ! Không thể xóa thiết lập cấu hình trạm của loại cấu hình. Vui lòng tải lại trang.");
					callback(true,null);
			}else{
					callback(false,rs.data);
			}
	});
	request.fail(function(jqXHR, textStatus){
			displayError("Lỗi ! Không thể xóa thiết lập cấu hình trạm. Vui lòng tải lại trang.");
			callback(true,null);
	});
}
/*Hàm xóa cấu hình theo 1 trạm*/
function deleteStationConfigByStationId(conf,token,secu,station_id,callback){
	var request = $.ajax({
			url: conf + '/api/stationconfig/deletestation/' + station_id,
			method : 'DELETE',
			contentType: 'application/json; charset=utf-8',
			headers:{
					'Content-Type':'application/x-www-form-urlencoded',
					'Authorization': secu + token
			},
			data:{}
	});
	request.done(function(rs){
			if(rs.Error){
					displayError("Lỗi ! Không thể xóa thiết lập cấu hình của trạm. Vui lòng tải lại trang.");
					callback(true,null);
			}else{
					callback(false,rs.data);
			}
	});
	request.fail(function(jqXHR, textStatus){
			displayError("Lỗi ! Không thể xóa thiết lập cấu hình của trạm. Vui lòng tải lại trang.");
			callback(true,null);
	});
}
/*Hàm xử lý để hiển thị nhật ký nuôi*/
function displayHistoryStockingPond(conf,token,secu,pond_id){
	var arrayStockingTypeName = [];
	var arrayData = [];
	var html = "";
	getStockingType(conf,token,secu,function(data){
		if(data.length > 0){
			data.forEach(function(items){
				arrayStockingTypeName[items.stockingtype_id] = [];
				arrayStockingTypeName[items.stockingtype_id] = items.stockingtype_name;
			});
		}
	});
	var promise = new Promise(function(resolve,reject){
		getStockingPondByPondId(conf,token,secu,pond_id,function(data){
			if(data.length > 0){
				console.log(data);
				data.forEach(function(items){
					getStockingById(conf,token,secu,items.stocking_id,function(data){
						arrayData.push({stockingtype_name:arrayStockingTypeName[data.stockingtype_id],stockpond_date:items.stockpond_date,stockpond_density:items.stockpond_density,stockpond_quantityStock:items.stockpond_quantityStock,stockpond_depth:items.stockpond_depth,stockpond_clarity:items.stockpond_clarity,stockpond_salinity:items.stockpond_salinity,stockpond_DO:items.stockpond_DO,stockpond_PHwater:items.stockpond_PHwater,stockpond_tempAir:items.stockpond_tempAir,stockpond_tempWater:items.stockpond_tempWater});
						resolve(arrayData);
					});
				});
			}
			else{
				alert('Không có dữ liệu');
				window.location.href = "/quantrac/quanly/ao/danhsachao";
			}
		});
	});
	promise.then(function(success){
		// console.log(arrayData);
		arrayData.forEach(function(items){
      html += "<tr>";
      html += "<tr>";
      html += "<td class='text-center' colspan='2' style='background-color:#367FA9;color:white;'>Vụ nuôi "+items.stockingtype_name+"</td>";
      html += "</tr>";
			html += "<tr>";
      html += "<td>Ngày nuôi</td>";
      html += "<td>"+moment(items.stockpond_date).utc().format("DD-MM-YYYY hh:mm")+"</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Tỉ trọng</td>";
      html += "<td>"+items.stockpond_density+"</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Số giống</td>";
      html += "<td>"+items.stockpond_quantityStock+" con</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Độ sâu của ao</td>";
      html += "<td>"+items.stockpond_depth+" m</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Độ trong của ao</td>";
      html += "<td>"+items.stockpond_clarity+"</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Độ mặn của ao</td>";
      html += "<td>"+items.stockpond_salinity+" ppt</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Nồng độ oxy của ao</td>";
      html += "<td>"+items.stockpond_DO+" mg/l</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Nồng độ pH của ao</td>";
      html += "<td>"+items.stockpond_PHwater+" pH</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Nhiệt độ không khí của ao</td>";
      html += "<td>"+items.stockpond_tempAir+" °C</td>";
      html += "</tr>";
      html += "<tr>";
      html += "<td>Nhiệt độ nước của ao</td>";
      html += "<td>"+items.stockpond_tempWater+" °C</td>";
      html += "</tr>";
		});
		$("#dslichsunuoi").html(html);
	});
}
/*Hàm kiem tra mật khẩu mới có giống mật khẩu cũ hay không. Nếu giống thì báo 1. Ngược lại null*/
function checkPass(conf,token,secu,userid,callback){
	var request = $.ajax({
			url: conf + '/api/user/checkpass/' + userid,
			method : 'POST',
			contentType: 'application/json; charset=utf-8',
			headers:{
					'Content-Type':'application/x-www-form-urlencoded',
					'Authorization': secu + token
			},
			data:{
				newPassword:$("#newPassword").val()
			}
	});
	request.done(function(rs){
			if(rs.Error){
					callback(true,null);
			}else{
					callback(false,rs.data);
			}
	});
	request.fail(function(jqXHR, textStatus){
			callback(true,null);
	});
}
/*Hàm đổi mật khẩu*/
function changePassWord(conf,token,secu,userid,callback){
	var request = $.ajax({
			url: conf + '/api/user/changepassword/' + userid,
			method : 'PUT',
			contentType: 'application/json; charset=utf-8',
			headers:{
					'Content-Type':'application/x-www-form-urlencoded',
					'Authorization': secu + token
			},
			data:{
				oldPassword : $("#oldPassword").val(),
				newPassword : $("#newPassword").val(),
				comparePassword : $("#comparePassword").val()
			}
	});
	request.done(function(rs){
			if(rs.Error){
					callback(true,null);
			}else{
					callback(false,rs.data);
			}
	});
	request.fail(function(jqXHR, textStatus){
			callback(true,null);
	});
}
/*Hàm xử lý cho việc đổi mật khẩu người dùng*/
//roleText để xác định người dùng có quyền nào để chuyển trang
function changeUserPassword(conf,token,secu,userid,roleText){
	if($("#frmCNMatKhau").valid()){
		checkPass(conf,token,secu,userid,function(error,data){
			if(data != 1){
				changePassWord(conf,token,secu,userid,function(error,items){
					if(!error){
						alert('Cập nhật mật khẩu thành công');
						window.location.href = "/quantrac/" + roleText;
					}
					else{
						displayError("Lỗi ! Mật khẩu cũ không chính xác");
					}
				});
			}
			else{
				$("#errornewPassword").html("Mật khẩu mới không được giống mật khẩu cũ");
				$("#errornewPassword").css("font-weight","bold");
				$("#errornewPassword").css("color","#DD4B64");
			}
		});
	}
}
/*Hàm lấy về danh sách các hoạt động chăm sóc*/
function getActivityByPondId(conf,token,secu,pondid){
	var start_date,
		end_date,startdate,enddate,htmlactivity ='';
	$("#ErrorMessage").hide();
	start_date = $("#start_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
	end_date = $("#end_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
	startdate = moment(start_date).format('YYYY-MM-DD HH:mm');
	enddate = moment(end_date).format('YYYY-MM-DD HH:mm');
	var activitytype_id = $("#selectActivityType").val();
	if(activitytype_id == null){
		activitytype_id = -1;
	}
	jQuery.ajax({
		url: conf + '/api/activity/getbypondmanager/'+pondid+'?actitype_id='+activitytype_id+'&dateStart='+startdate+'&dateEnd='+enddate,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': secu + token
		},
		success: function(resultdata){

			if(resultdata.data.length > 0 ){
				resultdata.data.forEach(function(items,ỉndex){
					htmlactivity += "<tr>";
					htmlactivity += "<td>" +items.Stocking_Pond.Pond[0].pond_description+ "</td>";
					htmlactivity += "<td>" +items.Activity_Type.actitype_name+ "</td>";
					htmlactivity += "<td>" +moment(items.activity_date).utc().format("DD-MM-YYYY, HH:mm")+ "</td>";
					htmlactivity += "<td>" +items.activity_note+ "</td>";
					htmlactivity += "</tr>";
				});
				$("#hienthidshoatdong").html(htmlactivity);
			}
			else{
				$("#hienthidshoatdong").html('');
				displayError('Không có dữ liệu trong thời gian này');
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu về các hoạt động chăm sóc theo id của ao. Vui lòng tải lại trang.");
		},
	});
}
/*Hàm hiển thị danh sách cách hoạt động*/
function displayActivityOfPond(conf,token,secu,pond_id){
	var arrayStockingTypeName = [];
	var arrayStationName = [];
	var arrayData = [];
	var html = "";
	$("#ErrorMessage").hide();
	getStockingType(conf,token,secu,function(data){
		if(data.length > 0){
			data.forEach(function(items){
				arrayStockingTypeName[items.stockingtype_id] = [];
				arrayStockingTypeName[items.stockingtype_id] = items.stockingtype_name;
			});
		}
	});
	var promise = new Promise(function(resolve,reject){
		getActivityByPondId(conf,token,secu,pond_id,function(data){
			if(data.length > 0){
				data.forEach(function(items,index){
					getStockingById(conf,token,secu,items.stocking_id,function(data){
						arrayData.push({stockingtype_name:arrayStockingTypeName[data.stockingtype_id],activity_date:items.activity_date,activity_note:items.activity_note,pond_description:items.Stocking_Pond.Pond[0].pond_description,actitype_name:items.Activity_Type.actitype_name});
						resolve(arrayData);
					});
				});

			}
			else{
				displayError('Không có dữ liệu trong thời gian này');
				// window.location.href = "/quantrac/quanly/ao/danhsachao";
			}
		});
	});
	promise.then(function(success){
		console.log(arrayData.length);
		console.log(arrayData);
		if(arrayData.length > 0 ){
			arrayData.forEach(function(items,ỉndex){
				html += "<tr>";
				html += "<td>" +items.pond_description+ "</td>";
				html += "<td>" +items.actitype_name+ "</td>";
				html += "<td>" +items.stockingtype_name+ "</td>";
				html += "<td>" +moment(items.activity_date).utc().format("DD-MM-YYYY, HH:mm")+ "</td>";
				html += "<td>" +items.activity_note+ "</td>";
				html += "</tr>";
			});
			$("#hienthidshoatdong").html(html);
		}
	});
}
/*Ham lay ve tat ca cac loai du lieu khong sap xep*/
function loadDataType(config,token,security,callback){
	jQuery.ajax({
		url: config + '/api/datatype/getall',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			callback(resultdata.data);
		},
		error: function(jqXHR,textStatus,errorThrown){
			 displayError("Không thể tải được dữ liệu của các loại số liệu đo. Vui lòng tải lại trang");
		},
	});
}
// /*Hàm lấy danh sách sensor*/
function getListSensor(conf,token,secu,index,pagesize){
 	var totals = 0;
	var html2 = "";
	var html = "";
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	jQuery.ajax({
		url: conf + '/api/sensor/getpagination?page=' + index + '&pageSize=' + pagesize +'&keyword='+keyword,
  		headers:{
	  		'Content-Type' : 'application/x-www-form-urlencoded',
  			'authorization': secu + token
  		},
  		success: function(resultdata){
  			totals = resultdata.data.TotalPages;
				if(resultdata.data.Items.length > 0){
					resultdata.data.Items.forEach(function(items){
						html += "<tr>";
						html += "<td>" + items.sensor_name + "</td>";
						html += "<td>" +items.Station.station_name + "</td>";
						html += "<td>" +items.Data_Type.datatype_name+ "</td>";
						html += "<td>" + items.sensor_serialNumber + "</td>";
						html += "<td><a href='/quantrac/quanly/sensor/capnhatsensor/"+items.sensor_id+"'>";
						html += "<span class='glyphicon glyphicon-pencil'></span>";
						html += "</a></td>";
						html += "</tr>";
				 });
				}
				else{
					html += "<tr>";
					html += "<td colspan='5'>Không có dữ liệu</td>";
					html += "</tr>";
				}
				$("#hienthidssensor").html(html);
				if(totals != 0){
						if(totals > 1){
							for(i = 1; i<= totals; i++){
								html2 += '<li><a href="#" onclick="processPaginationSensor('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ','  + index + ','  + pagesize +');return false;">'+i+'</a></li>';
							}
							$('.pagi-custom').html(html2);
							$('.pagi-custom').show();
						}
				}
  		},
  		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể tải dữ liệu của danh sách sensor. Vui lòng tải lại trang");
		},
	})
}
/*Xử lý click pagination*/
function processPaginationSensor(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListSensor(conf,token,secu,(page-1),pages);
	});
}
// //ham lay ve danh sach loại hoạt động
function getListActivityType(conf,token,secu,index,pagesize){
	var totals = 0;
	var html = "";
	var html2 = "";
	var keyword = "";
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	var i = 1;
	jQuery.ajax({
		url : conf + '/api/activitytype/getpagination/?page=' + index +'&pageSize=' + pagesize +'&keyword=' +keyword,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += "<td>" + i++  + "</td>";
					html += "<td>" + items.actitype_name  + "</td>";
					html += "<td><a title='Cập nhật thông tin loại hoạt động' href='/quantrac/quanly/loaihoatdong/capnhatloaihoatdong/"+ items.actitype_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += "</tr>";
				});
			}
			else{
				html += '<tr>';
				html += "<td colspan='3'>Không có dữ liệu</td>";
				html += '</tr>';
			}
			$("#hienthidshoatdong").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationActivityType('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách loại hoạt động. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho species*/
function processPaginationActivityType(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListActivityType(conf,token,secu,(page-1),pages);
	});
}
// //ham lay ve danh sach trạm sông
function getListRiverPagination(conf,token,secu,userid,index,pagesize){
	var totals = 0;
	var html = "";
	var html2 = "";
	var keyword = "";
	var arrayRegionName = [];
	if($("#txtTimKiem").val() != ''){
		$('.pagi-custom').hide();
		keyword = $("#txtTimKiem").val();
	}
	var i = 1;
	getAllRegionByUserId(conf,token,secu,userid,function(data){
		if(data.length > 0){
			data.forEach(function(items){
				arrayRegionName[items.region_id] = [];
				arrayRegionName[items.region_id] = items.region_name;
			});
		}
	});
	jQuery.ajax({
		url : conf + '/api/river/getpagination/' + userid +'?page=' + index +'&pageSize=' + pagesize +'&keyword=' +keyword,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data.Items.length > 0){
				totals = resultdata.data.TotalPages;
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += "<td>" + i++  + "</td>";
					html += "<td>" + items.river_name  + "</td>";
					html += "<td>" + arrayRegionName[items.region_id]  + "</td>";
					html += "<td>" + items.river_description  + "</td>";
					html += "<td><a title='Cập nhật thông tin trạm sông' href='/quantrac/quanly/song/capnhattramsong/"+ items.river_id +"'>";
					html += "<span class='glyphicon glyphicon-pencil'></a></td>";
					html += "</tr>";
				});

			}
			else{
				html += '<tr>';
				html += "<td colspan='5'>Không có dữ liệu</td>";
				html += '</tr>';
			}
			$("#dstramsong").html(html);
			if(totals != 0){
				if(totals > 1){
					for(i = 1; i<= totals; i++){
						html2 += '<li><a href="#" onclick="processPaginationRiver('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + userid + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
					}
					$('.pagi-custom').html(html2);
					$('.pagi-custom').show();
				}
			}
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách trạm sông. Vui lòng tải lại trang");
		},
	});
}
/*Xử lý phân trang cho species*/
function processPaginationRiver(conf,token,secu,userid,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
	    $(selector).removeClass('active');
	    $(this).addClass('active');
	    pages = 10;
	    var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
	    getListRiverPagination(conf,token,secu,userid,(page-1),pages);
	});
}
/*Hàm lấy về các thiết lập cấu hình khi người dùng đổi trạm*/
function dislayStationConfig(conf,token,secu,station_id){
	var arrayChildConfigType = [];
	var html = "";
	getListConfigType(conf,token,secu,function(data){
		if(data.length > 0){
			data.forEach(function(items){
				if(items.configtype_parentId != null){
					arrayChildConfigType[items.configtype_id] = [];
					/*Lưu danh sách tên của các loại cấu hình*/
					arrayChildConfigType[items.configtype_id].push(items.configtype_name);
				}
			});
		}
	});
	/*Delay 1 giây để đảm bảo cho việc load tên loại cấu hình sẵn sàng*/
	setTimeout(function () {
		getStationConfigByStationId(conf,token,secu,station_id,function(data){
			if(data.length > 0){
				var stt = 1;
				data.forEach(function(items){
					html += "<tr class='"+items.stationconfig_id+"'>";
					html += "<td>"+stt+"</td>";
					html += "<td>" + arrayChildConfigType[items.configtype_id] + "</td>";
					html += "<td>" + items.stationconfig_value + "</td>";
					if(items.stationconfig_status == 0){
						html += "<td>Đã cập nhật cấu hình</td>";
					}
					else{
						html += "<td>Chưa cập nhật cấu hình</td>";
					}
					html += "<tr>";
					stt++;
				});
				$("#ListStationConfigByStation").html(html);
				$("#tblListStationConfigByStation").show();
			}
			else{
				$("#tblListStationConfigByStation").hide();
			}
		});
	}, 1000);
}
/*Hàm lấy  thông tin của loại cấu hình theo id*/
function getConfigTypeById(config,token,security,configtype_id){
	console.log(configtype_id);
	jQuery.ajax({
		url : config + '/api/configtype/getbyid/' + configtype_id,
		type: 'GET',
		headers: {'Authorization':security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			$("#configtype_description").html(resultdata.data.configtype_discription);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy thông tin loại cấu hình theo id. Vui lòng tải lại trang");
		},
	});
}
/*####################################### HÀM KIỂM TRA#####################################*/
/*XEM DỮ LIỆU CHUYÊN GIA*/
// Được gọi khi người dùng chọn selectREG1 -->
function loadSTATION(conf,token,secu,socket,state){
	var regionid;
	$("#selecttemp").find('option').remove();
	resetSELECTEDpondriver();
	regionid = document.getElementById("selectRegion").value;
	hidePondRiver();
	if(regionid == -1){
		hidePondRiver();
	}
	turnOffChart();
	$("#btnDisplayChart").prop("disabled", true);
	var option ='';
	jQuery.ajax({
		url:  conf + '/api/station/getbyregion/'+regionid,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {

			// blockContent();
			option += "<option value='" + -1 +"'>Chọn trạm</option>";
			for(i in resultdata.data){
				if((resultdata.data[i].river_id != null) || (resultdata.data[i].pond_id != null)){
					option += "<option value='" + resultdata.data[i].station_id +"'>" + resultdata.data[i].station_name +"</option>";
				}
			}
			option += "<option value='" + 0 +"'>Trạm cầm tay</option>";
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của trạm. Vui lòng tải lại trang");
		},
	}).complete(function() {
		queue3.pop();
		if (queue3.length == 0) {
			$('#selectSTTION').html(option);
			$('#selectSTTION').css("display", "block");
		}
	});
}
function hidePondRiver(){
	$("#hienthi").html('');
	$('#selectPond').find('option').remove();
	$('#selectRiver').find('option').remove();
	$('#selectLocation').hide();
	$('#selectPond').hide();
	$('#selectRiver').hide();
}
//Khoa các nut khi load dữ liệu
function blockSelect(){
	$("#selectRegion").prop('disabled',true);
	$("#selectSTTION").prop('disabled',true);
	$("#selectLocation").prop('disabled',true);
	$("#selectPond").prop('disabled',true);
	$("#selectRiver").prop('disabled',true);
}
function unblockSelect(){
	$("#selectRegion").prop('disabled',false);
	$("#selectSTTION").prop('disabled',false);
	$("#selectLocation").prop('disabled',false);
	$("#selectPond").prop('disabled',false);
	$("#selectRiver").prop('disabled',false);
}
//duoc goi khi loadstation1 hoad loadpond1
function loadDATAExpert(conf,token,secu,sock){
	turnOffChart();
	//socket.removeListener('tenlistener');
	hidePondRiver();
	$("#selecttemp").find('option').remove();
	var _objStationListener;
	var stationid = -1;
	var pondid = -1;
	var regionname = document.getElementById('selectRegion').options[document.getElementById('selectRegion').selectedIndex].text;
	// var regionname = regionnameSELECTED();
	var notf = "";
	var address;
	var stationname;
	stationname = document.getElementById('selectSTTION').options[document.getElementById('selectSTTION').selectedIndex].text;
	stationid = document.getElementById("selectSTTION").value;
	if(stationid == -1){
		hidePondRiver();
		$("#btnDisplayChart").prop("disabled",true);
	}
	//Kiem tra xem tram duoc chon co phai tram cam tay hay khong
	//Neu khong phai thi do lieu - Neu phai thi load vi tri can xem


	if(stationid != 0 && stationid != -1){
		// getAllStationNode(conf,token,secu,stationid);
		/*Gọi callback lấy ra danh sách StationNode*/
		blockSelect();
		getStationById(conf,token,secu,stationid,function(data){
			_stationnode = data.station_node;
			StationNode = _stationnode.split('|'); /*Chuyển thành mảng*/
		});

		address = conf + '/api/data/gettopbystation/' + stationid;
		notf = stationname;
		blockSELECTEDstationDynamic();
		getTOPdatabyStaion(address,conf,secu,token,regionname,notf,stationid,pondid,sock);
		hidePOND();
		hideRIVER();
	}
	/*Kiểm tra nếu đúng là trạm cầm tay*/
	if(stationid == 0){
		loadLocationExpert(conf,token,secu);
		$("#selectLocation").val(-1);
		$("#hienthi").html('');
	}
	displayStateChart = true;
}
/*Hàm hiển thị vị trí xem trạm cầm tay cho chuyên gia*/
function loadLocationExpert(conf,token,secu) {
	$("#selectLocation").show();
}
function loadLocationExpertSelected(conf,token,secu){
	id = $("#selectLocation").val();
	turnOffChart();
	if(id == -1){
		$("#selectPond").hide();
		$("#selectRiver").hide();
		$("#btnDisplayChart").prop("disabled",true);
	}
	if(id == 1){
		$('#selectRiver').find('option').remove();
		loadPondExpert(conf,token,secu);
		$("#selectPond").show();
		$("#selectRiver").hide();
	}
	if(id==2){
		$('#selectPond').find('option').remove();
		loadRiverExpert(conf,token,secu);
		$("#selectPond").hide();
		$("#selectRiver").show();
	}
}
// Được gọi khi người dùng chọn vùng-->
function loadPondExpert(conf,token,secu){
	$('#hienthi').html('');
	var idregion;
	idregion = $("#selectRegion").val();
	$('#selectPond').find('option').remove();
	$('#selectPond').append($("<option></option>").attr("value",-1).text("Chọn ao"));
	jQuery.ajax({
		url: conf + '/api/pond/getbyregion/' + idregion,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {
			for(i in resultdata.data){
					$('#selectPond').append($("<option></option>").attr("value",resultdata.data[i].pond_id).text(resultdata.data[i].pond_description));
					$("#selectPond").css("display", "block");
			}
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của ao. Vui lòng tải lại trang");
		},
	});
}
//Lấy data khi load SelectPOND
function loadDATAbyPONDExpert(conf,token,secu,sock){
	blockSelect();
	turnOffChart();
	var stationid = -1;
	var pondid;
	var pondname;
	var regionid;
	var notf = "";
	var address;
	// turnOffChart();
	// regionid = regionSELECTED();
	regionname = document.getElementById('selectRegion').options[document.getElementById('selectRegion').selectedIndex].text;
	pondid = $("#selectPond").val();
	pondname = document.getElementById('selectPond').options[document.getElementById('selectPond').selectedIndex].text;
	address = conf + '/api/data/gettopbyponddynamic/' + pondid;
	notf = pondname;
	if(pondid != -1){
		getTOPdatabyPOND(address,conf,secu,token,regionname,notf,stationid,pondid,sock); //Ham lay ve gia tri do moi nhat
	}
	else{
		unblockSelect();
		$("#btnDisplayChart").prop("disabled",true);
	}
}
function loadRiverExpert(conf,token,secu){
	var regionid = $("#selectRegion").val();
	$('#selectRiver').find('option').remove();
	$('#selectRiver').append($("<option></option>").attr("value",-1).text("Chọn trạm sông"));
	jQuery.ajax({
		url: conf + '/api/river/getbyregion/' + regionid,
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata) {
			for(i in resultdata.data){
				$('#selectRiver').append($("<option></option>").attr("value",resultdata.data[i].river_id).text(resultdata.data[i].river_name));
				$("#selectRiver").css("display", "block");
			}
		},
		error: function(jqXHR,textStatus,errorThrown) {
			displayError("Lỗi ! Không thể tải dữ liệu của sông. Vui lòng tải lại trang");
		},
	});
}
//ham lay du lieu cho trạm sông chuyên gia
function loadDATAbyRiverExpert(conf,token,secu,sock){
	blockSelect();
	turnOffChart();
	var stationid = -1;
	var pondid = -1;
	var riverid = -1;
	var rivername;
	var regionname = document.getElementById('selectRegion').options[document.getElementById('selectRegion').selectedIndex].text;
	riverid = $('#selectRiver').val();
	rivername = document.getElementById('selectRiver').options[document.getElementById('selectRiver').selectedIndex].text;
	var notf = "";
	var address;
	// console.log(riverid);
	//Kiem tra xem tram duoc chon co phai tram cam tay hay khong
	//Neu khong phai thi do lieu - Neu phai thi load vi tri can xem
	address = conf + '/api/data/gettopbyriverdynamic/' + riverid;
	notf = rivername;
	if((riverid != -1) && (typeof riverid !== 'undefined')){
		getTOPdatabyRIVER(address,conf,secu,token,regionname,notf,stationid,pondid,riverid,sock); //Ham lay ve gia tri do moi nhat
	}
	else{
		unblockSelect();
		$("#btnDisplayChart").prop("disabled",true);
	}
}
/*Hàm lấy ds loại hđ xem hđ chăm sóc*/
function getActivityType(conf,token,secu,callback){
	jQuery.ajax({
		url : conf + '/api/activitytype/getpagination/?page=0&pageSize=1000&keyword',
		type: 'GET',
		headers: {'Authorization':secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			callback(resultdata.data.Items);
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Lỗi ! Không thể lấy danh sách loại hoạt động. Vui lòng tải lại trang");
		},
	});
}
//Ham thay doi khi thay loi lua chon xem bieu do.
function changeOnOffChartExpert(conf,token,secu){
	var dateEnd = new Date();
	var dateStart = new Date(dateEnd.getTime() - (1*86400000));// lay thoi gian hien tai tru di 1 ngay
	if($("#btnDisplayChart").prop('checked')){ //Kiem tra neu nhu button toggle duoc chon la bat thi thuc hien
		console.log('Uncheck');
		setDefaultDisplayDate();
		showRadioDataType();
		$("#displayChart").css("display","block");
		 //Hien thi xem bieu do
		$('input[name="radDataType"]').attr('disabled', false);
		//$("input[type=radio]").attr('disabled', false);
		viewdependenceDateExpert(conf,token,secu); //Goi ham ve bieu do
	}
	else{
		$("#displayChart").css("display", "none");
		// $('#start_date').datetimepicker('clear');
		$("#start_date" ).datetimepicker({
			format: 'DD/MM/YYYY HH:mm',
			defaultDate: dateStart,
			locale: 'vi',
			ignoreReadonly: true,
			maxDate : 'now' //Kiem tra khong cho chon ngay lon hon ngay hien tai
		});
		$('input[name="radDataType"]').attr('disabled', true);
	}
}

function viewdependenceDateExpert(conf,token,secu){
	var start_date,
		end_date;
	/*
	* Khi thời gian xem dữ liệu không hợp lệ ta tiến hành gán lại thời gian xem dữ liệu
	* Cách 2 ngày kể từ ngày hiện tại
	*/
	start_date = $("#start_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
	end_date = $("#end_date").data("DateTimePicker").date(); //Lấy dữ liệu từ input
 	/*	Kiểm tra khi ngày bắt đầu và kết thúc rỗng	*/
  if((start_date == null) && (end_date == null)){
      end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(end_date.getTime() - (1*86400000));  /*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#displayerror").html("Ngày bắt đầu và ngày kết thúc rỗng");
      $("#displayerror").css("display","block");
  }
  else if(start_date == null){
      end_date = new Date(end_date); /*Convert ngày kết thúc trong input*/
      start_date = new Date(end_date.getTime() - (1*86400000));/*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
  	$("#displayerror").html("Ngày bắt đầu rỗng");
      $("#displayerror").css("display","block");
  }
  else if(end_date == null){
      end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(start_date); /*Convert ngày bắt đầu trong input*/
			console.log(end_date);
      $("#end_date").	datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
     	$("#displayerror").html("Ngày kết thúc rỗng");
    	$("#displayerror").css("display","block");
  }
  else if(start_date - end_date > 0){
  	end_date = new Date();/*Khởi tạo giá trị ngày hiện tại*/
      start_date = new Date(end_date.getTime() - (1*86400000));  /*Khởi tạo giá trị ngày hiện tại cách ngày kết thúc 1 ngày*/
      $("#end_date").datetimepicker('defaultDate',end_date); /*Set giá trị cho input nhập dữ liệu*/
      $("#start_date").datetimepicker('defaultDate',start_date); /*Set giá trị cho input nhập dữ liệu*/
  		$("#displayerror").html("Ngày không hợp lệ. Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
    	$("#displayerror").css("display","block");
  }
  /*Kiểm tra nếu thời gian chọn xem dữ liệu lớn hơn 7 ngày thì thông báo chờ*/
  else if(end_date - start_date >= (30*86400000)){
  	start_date = new Date(start_date);
	end_date = new Date(end_date);
  	$("#displayerror").html("Thời gian chọn xem dữ liệu quá lâu. Vui lòng chờ giây lát trong lúc tải dữ liệu");
  	$("#displayerror").css("display","block");
  	setTimeout(function() {
  		$("#displayerror").css("display","none");
  	}, 3000);
  }
  else{
      end_date = new Date(end_date);/*Convert ngày kết thúc trong input*/
      start_date = new Date(start_date);/*Convert ngày bắt đầu trong input*/
  }
  start_date = start_date.getFullYear() +"-"+ (start_date.getMonth()+1) + "-" + start_date.getDate() +" " + start_date.getHours() + ":" + start_date.getMinutes() + ":"+ start_date.getSeconds();
  end_date = end_date.getFullYear() +"-"+ (end_date.getMonth()+1) + "-" + end_date.getDate() +" " + end_date.getHours() + ":" + end_date.getMinutes() + ":"+ end_date.getSeconds();
	blockFormChart();
	blockContent();
	//comment khong hieu doan nay viet de lam gi
	// var riverid = -1;
	// var stationid = stationSELECTED();
	// var pondid = pondSELECTED();
	// riverid = riverSELECTED();
	loadDATAforDrawChartsforExpert(conf,token,secu,start_date,end_date);
}
//Ham lay du lieu ve bieu do cho ng dung chuyen gia
// //Ham de lay du lieu ve bieu do
function loadDATAforDrawChartsforExpert(conf,token,secu,start_date,end_date){ //state chi trang thai load 1: default 0: thuong
	var _idStation = -1
		, _idPond = -1
		,_idRiver = -1;
	var _stationId = -1;
	var htmltable = '';
	var htmltitle = '';
	var _idStation_temp = -1;

	_idStation = $('#selectSTTION').val();
	_idPond = $("#selectPond").val();
	_idRiver = $("#selectRiver").val();
	if($("#selecttemp").val() != null){
		_idStation_temp = $("#selecttemp").val(); /*FIX BUG XEM BIỂU ĐỒ VỚI TRẠM MẶC ĐỊNH*/
	}
	else{
		_idStation_temp = -1;
	}
	drawCrt = 1;
	// _idPond = pondSELECTED();
	// _idRiver = riverSELECTED();
	if((_idStation > 0)||(_idStation_temp != -1)){
		if(_idStation != -1){
			_stationId = _idStation;
		}
		else{
			_stationId = _idStation_temp;
		}

		getDataStation(conf,token,secu,start_date,end_date,_stationId,function(data){
			arrDataType.forEach(function(dttt){
				htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
				arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
				htmltable += "<tr>";
				arrDataforCharts[dttt.datatype_id] = [];
				data.forEach(function(dta){
					if(dttt.datatype_id==dta.datatype_id){
						//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
						moment.locale('vi');
						arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
						htmltable += "<td>"  + dta.data_value + "</td>";
						// htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
					}
				});
			});
			htmltable += "</tr>";
			// htmltitle += "<th>Thời gian đo</th>";
			$("#titile-table-data").html(htmltitle);
			$("#bodyexport").html(htmltable);
			console.log(arrDataforCharts);
			initChart(); //Goi ham ve bieu do
			drawCrt = 0;
			unblockFormChart();
			unblockContent();

		});
		// address = conf + '/api/data/getbystation/' + _stationId +'?dateStart=' + start_date + '&dateEnd=' + end_date;
	}
	else{
		if(_idPond != -1){
			console.log("Ao");
			getDataPond(conf,token,secu,start_date,end_date,_idPond,function(data){
				arrDataType.forEach(function(dttt){
					htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
					arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
					arrDataforCharts[dttt.datatype_id] = [];
					data.forEach(function(dta){
							htmltable += "<tr>";
							htmltable += "<td>" + arrDataTypeName[dta.datatype_id] + "</td>";
							htmltable += "<td>"  + dta.data_value + "</td>";
							htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
							htmltable += "</tr>";
						if(dttt.datatype_id==dta.datatype_id){
							//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
							moment.locale('vi');
							arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
						}
					});
				});
				htmltitle += "<th>Thời gian đo</th>";
				$("#titile-table-data").html(htmltitle);
				$("#bodyexport").html(htmltable);
				console.log(arrDataforCharts);
				initChart(); //Goi ham ve bieu do
				drawCrt = 0;
				unblockFormChart();
				unblockContent();
			});
		}
		else if((_idRiver != -1)&&(typeof _idRiver !== 'undefined')){
			console.log("Sông");
			getDataRiver(conf,token,secu,start_date,end_date,_idRiver,function(data){
				arrDataType.forEach(function(dttt){
					htmltitle += "<th>" + arrDataTypeName[dttt.datatype_id] + "</th>";
					arrDataforCharts.splice(0,1); //Ham splice go bo phan tu o vi tri 0 go di 1 phan tu
					arrDataforCharts[dttt.datatype_id] = [];
					data.forEach(function(dta){
							htmltable += "<tr>";
							htmltable += "<td>" + arrDataTypeName[dta.datatype_id] + "</td>";
							htmltable += "<td>"  + dta.data_value + "</td>";
							htmltable += "<td>"  + moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm") + "</td>";
							htmltable += "</tr>";
						if(dttt.datatype_id==dta.datatype_id){
							//Luu du lieu vao mang theo tung loai du lieu - ham unshift de them du lieu vao mang sap xep theo id
							moment.locale('vi');
							arrDataforCharts[dttt.datatype_id].unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm"),data_value:dta.data_value});
						}
					});
				});
				htmltitle += "<th>Thời gian đo</th>";
				$("#titile-table-data").html(htmltitle);
				$("#bodyexport").html(htmltable);
				console.log(arrDataforCharts);
				initChart(); //Goi ham ve bieu do
				drawCrt = 0;
				unblockFormChart();
				unblockContent();
			});
		}
		// else{
		// 	turnOffChart();
		// 	$("#btnDisplayChart").prop('disabled',true);
		// }
	}
	console.log("Trạm: " + _stationId +", Ao: " + _idPond + ", Sông: " + _idRiver);
}
