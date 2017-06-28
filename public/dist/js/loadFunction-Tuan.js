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
var config = '';
var tokend = '';
var security = '';
var user_ID = 0;
var socket_global = '';
var ispageNotification = false; /*Biến xác định xem có phải đang ở trang xem thông báo hay không
* Nếu phải thì mới gọi hàm getListnotification không thì không gọi.
*
* config,tokend,security,user_ID,socket_global là những biến toàn cục lần đầu load sẽ lấy dữ liệu truyền từ giao diện qua để sd
*/
var arrDataforCharts = [0]; /*Lưu mảng dữ liệu cho xem biểu đồ*/
var stationdefault = 0; /*Lưu station trạm mặc định xem dữ liệu*/ 
//luu mang du lieu theo tung loai cho bieu do - gan mac dinh phan tu 0 de kiem tra 
//neu khong co xem bieu do truoc do thi khong goi ham initchart()
var xhtml = '';
conf ="http://103.221.220.184:3000";


/*HÀM LIÊN QUAN TỚI PHẢN HỒI*/
/*HÀM lẤY danh sách phản hồi*/
function getListUser2(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/user/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.user_fullName + '</td>';
					html += '<td>' + items.user_userName + '</td>';
					html += '<td><table><tr><td>Ngày sinh: </td><td>'+ moment(items.user_birthday).format('DD/MM/YYYY') + '</td></tr><tr><td>Số điện thoại:&nbsp  </td><td>' + items.user_phone + '</td></tr><tr><td>Email: </td><td>'+ items.user_email +' </td></tr></table></td>';
                    //Ngày sinh: '+ moment(items.user_birthday).format('DD/MM/YYYY') + '<br>Số điện thoại: ' + items.user_phone + '<br>Email: ' + items.user_email + '</td>';
					if(items.user_lockStatus){html += "<td><a onclick='confirm_edit()'  title='Mở khoá' href='/quantrac/nguoiquantri/nguoidung/mokhoa/"+items.user_id + " ' ><span><i class='glyphicon glyphicon-ok-sign' ></i></span></a></td>";}else{html += "<td><a onclick='confirm_edit()' title='Khoá' href='/quantrac/nguoiquantri/nguoidung/khoa/"+items.user_id + " ' ><span><i class='glyphicon glyphicon-remove-sign' ></i></span></a></td>"};
					//html += '<td><span>Khoá</span></td>' +} else { +'<span>Mở</span>'+ } + '</td>';
					html += "<td><a title='Cập nhật thông tin người dùng' href='/quantrac/nguoiquantri/nguoidung/sua/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					//html += "<a title='Xoá thông tin người dùng' href='/quantrac/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
					//html += "<span class='glyphicon glyphicon-trash'></a>&nbsp";
					//if(items.user_lockStatus){html += "<a title='Mở khoá' href='/nguoiquantri/nguoidung/mokhoa/"+items.user_id + " ' ><span><i class='glyphicon glyphicon-ok-sign' onclick='success()''></i></span></a></td>";}else{html += "<a title='Khoá' href='/quantrac/nguoiquantri/nguoidung/khoa/"+items.user_id +"  ' ><span><i class='glyphicon glyphicon-remove-sign' onclick='success()'></i></span></a></td>"};
					//html +=  + if(items.user_lockStatus) { +'<a href="/nguoiquantri/nguoidung/mokhoa/<%= rs.user_id %>" title="Mở khoá" ><span><i class="glyphicon glyphicon-ok-sign" onclick="success()"></i></span></a>' +} else { +'<a href="/nguoiquantri/nguoidung/khoa/<%= rs.user_id %>" title="Khoá" ><span><i class="glyphicon glyphicon-remove-sign" onclick="success()"></i></span></a>'+ } + '</td>';
					html += '</tr>';
				});
				$("#hienthidsnguoidung").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationUser2('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách người dùng. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationUser2(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListUser2(conf,token,secu,(page-1),pages);
	});
}

//ham lay ve danh sach quyen
function loadAllRole(config,token,security,callback){
	var arrayDTType = [];
	var arrayDTTId = [];
	queue2.push(1);
	jQuery.ajax({
		url: config + '/api/role/getall',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			resultdata.data.forEach(function(data,index){
				arrayDTTId.push(data.role_id);
				arrayDTType[data.role_id] = [];
				arrayDTType[data.role_id].unshift({role_id:data.role_id,role_name:data.role_name});
			});
			arrayDTTId.sort(); /*Sắp xếp mảng loại dữ liệu*/	
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Không thể tải được dữ liệu của quyens. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			callback(arrayDTTId,arrayDTType);
		}
	});
}
/*HÀM LIÊN QUAN TỚI NGƯỜI DÙNG*/
/*HÀM lẤY danh sách người dùng*/
function getListUser(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/user/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.user_fullName + '</td>';
					html += '<td>' + items.user_userName + '</td>';
					html += '<td>Ngày sinh: '+ items.user_birthday + '<br>Số điện thoại:' + items.user_phone + '<br>Email:' + items.user_email + '</td>';
					//html += '<td>' + if(items.user_lockStatus) { +'<span>Khoá</span>' +} else { +'<span>Mở</span>'+ } + '</td>';
					html += '<td>' + items.user_userName + '</td>';
					html += "<td><a title='Cập nhật thông tin người dùng' href='/nguoiquantri/nguoidung/sua/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>";
					html += "<a title='Xoá thông tin người dùng' href='/quantrac/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a>";
					html += "<a title='Xoá thông tin người dùng' href='/quantrac/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					//html +=  + if(items.user_lockStatus) { +'<a href="/nguoiquantri/nguoidung/mokhoa/<%= rs.user_id %>" title="Mở khoá" ><span><i class="glyphicon glyphicon-ok-sign" onclick="success()"></i></span></a>' +} else { +'<a href="/nguoiquantri/nguoidung/khoa/<%= rs.user_id %>" title="Khoá" ><span><i class="glyphicon glyphicon-remove-sign" onclick="success()"></i></span></a>'+ } + '</td>';
					html += '</tr>';
				});
				$("#hienthidsbinhluan").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationUser('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationUser(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListUser(conf,token,secu,(page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI PHẢN HỒI*/
/*HÀM lẤY danh sách phản hồi*/
function getListFeedback(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	var html3 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/feedback/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					if(items.feedback_answerContent != null){
						html += '<tr>';
						html += '<td><table><tr><td>Người phản hồi:&nbsp </td><td>'+ items.feedback_name + '</td></tr><tr><td>Email:  </td><td>' + items.feedback_email + '</td></tr><tr><td>Ngày gửi: </td><td>'+ moment(items.feedback_createDate).format('DD/MM/YYYY') +' </td></tr></table></td>';
						//html += '<td>'+ items.feedback_name + '<br>' + items.feedback_email + '<br>' + moment(items.feedback_createDate).format('DD/MM/YYYY') + '</td>';
						html += '<td>' + items.feedback_message.substr(0,50) + '... </td>';
						html += '<td>' + items.feedback_answerContent.substr(0,50) + '... </td>';
						html += "<td><a title='Xem chi tiết phản hồi' href='/quantrac/nguoiquantri/phanhoi/xemchitiet/" + items.feedback_id  +"'>"; 
						html += '<span><i class="fa fa-eye" aria-hidden="true"></i></span></a>&nbsp';
						html += "<a onclick='return confirm_delete()' title='Xoá thông tin phản hồi' href='/quantrac/nguoiquantri/phanhoi/xoa/"+ items.feedback_id +"'>"; 
						html += "<span class='glyphicon glyphicon-trash'></a></td>";
						html += '</tr>';
					}
					else{
						html += '<tr style="background: #80bfff">';
						html += '<td><table><tr><td>Người phản hồi:&nbsp </td><td>'+ items.feedback_name + '</td></tr><tr><td>Email:  </td><td>' + items.feedback_email + '</td></tr><tr><td>Ngày gửi: </td><td>'+ moment(items.feedback_createDate).format('DD/MM/YYYY') +' </td></tr></table></td>';
						html += '<td>' + items.feedback_message.substr(0,50) + '... </td>';
						html += '<td>Chưa trả lời </td>';
						html += "<td><a title='Trả lời phản hồi' href='/quantrac/nguoiquantri/phanhoi/traloi/" + items.feedback_id  +"'>"; 
						html += "<span><i class='glyphicon glyphicon-edit' ></i></span></a>&nbsp";
						html += "<a onclick='return confirm_delete()' title='Xoá thông tin phản hồi' href='/quantrac/nguoiquantri/phanhoi/xoa/"+ items.feedback_id +"'>"; 
						html += "<span class='glyphicon glyphicon-trash'></a></td>";
						html += '</tr>';
						
					}
				});
				$("#hienthidsphanhoi").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationFeedback('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách phản hồi. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho feedback*/
function processPaginationFeedback(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListFeedback(conf,token,secu,(page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI BÌNH LUẬN*/
/*HÀM lẤY danh sách bình luận*/
function getListComment(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";

	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/comment/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.post_id + '</td>';
					html += '<td><table><tr><td>Người bình luận:&nbsp </td><td>'+ items.comment_commentByName + '</td></tr><tr><td>Email:  </td><td>' + items.comment_commentByEmail + '</td></tr><tr><td>Ngày gửi: </td><td>'+ moment(items.comment_commentDate).format('DD/MM/YYYY') +' </td></tr></table></td>';
						
					//html += '<td>'+ items.comment_commentByName + '<br>' + items.comment_commentByEmail + '<br>' + moment(items.comment_commentDate).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.comment_content + '</td>';
					html += "<td><a title='Danh sách trả lời cho bình luận' href='/quantrac/nguoiquantri/binhluan/traloi/" + items.comment_id  +"'>"; 
					html += "<span><i class='glyphicon glyphicon-plus' ></i></span></a>&nbsp";
					html += "<a onclick='return confirm_delete()' title='Xoá thông tin bình luận' href='/quantrac/nguoiquantri/binhluan/xoa/"+ items.comment_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '</tr>';
				});
				$("#hienthidsbinhluan").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationComment('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationComment(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListComment(conf,token,secu,(page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI TRẢ LỜI BÌNH LUẬN*/
/*HÀM lẤY danh sách trả lời bình luận*/
function getListAnswerComment(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/answercomment/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.comment_id + '</td>';
					html += '<td><table><tr><td>Người bình luận:&nbsp </td><td>'+ items.anscom_answreByName + '</td></tr><tr><td>Email:  </td><td>' + items.anscom_answerByEmail + '</td></tr><tr><td>Ngày gửi: </td><td>'+ moment(items.anscom_date).format('DD/MM/YYYY') +' </td></tr></table></td>';
					//html += '<td>'+ items.anscom_answreByName + '<br>' + items.anscom_answerByEmail + '<br>' + moment(items.anscom_date).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.anscom_content + '</td>';
					html += "<td><a onclick='return confirm_delete()' title='Xoá thông tin trả lời bình luận' href='/quantrac/nguoiquantri/traloibinhluan/xoa/"+ items.anscom_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '</tr>';
				});
				$("#hienthidsbinhluan").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationAnswerComment('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách. Vui lòng tải lại trang");
		},
	});

}

function getListAnswerComment2(id,conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/answercomment/getbycomment/'+id,
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data != null){
				resultdata.data.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.comment_id + '</td>';
					html += '<td><table><tr><td>Người bình luận:&nbsp </td><td>'+ items.anscom_answreByName + '</td></tr><tr><td>Email:  </td><td>' + items.anscom_answerByEmail + '</td></tr><tr><td>Ngày gửi: </td><td>'+ moment(items.anscom_date).format('DD/MM/YYYY') +' </td></tr></table></td>';
					//html += '<td>'+ items.anscom_answreByName + '<br>' + items.anscom_answerByEmail + '<br>' + moment(items.anscom_date).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.anscom_content + '</td>';
					html += "<td><a onclick='return confirm_delete()' title='Xoá thông tin trả lời bình luận' href='/quantrac/nguoiquantri/traloibinhluan/xoa/"+ items.anscom_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '</tr>';
				});
				$("#hienthidsbinhluan").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationAnswerComment('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationAnswerComment(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListAnswerComment(conf,token,secu,(page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI BÀI VIẾT*/
/*HÀM lẤY danh sách bài biết*/
function getListPostCaterogy(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";

	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/postCategory/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td><img src="' + items.postcate_picture + '" height="100" width="100"></td>';
					html += '<td>' + items.postcate_name + '</td>';
					html += '<td>' + items.postcate_description + '</td>';
					html += '<td>' + items.postcate_createBy + '<br>'+moment(items.postcate_createDate).format('DD/MM/YYYY');+'</td>';
					html += "<td><a title='Cập nhật thông tin bài viết' href='/quantrac/nguoiquantri/danhmucbaiviet/sua/"+ items.postcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xem bài viết thuộc danh mục' href='/quantrac/nguoiquantri/danhmucbaiviet/xemthem/"+ items.postcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
					html += "<a onclick='return confirm_delete()' title='Xoá thông tin danh mục' href='/quantrac/nguoiquantri/danhmucbaiviet/xoa/"+ items.postcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					//html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ','  + "'" + items.prodcate_image + "'" + ',' + "'" + items.prodcate_name + "'"  + ',' + "'" + items.prodcate_description + "'" + ','  + "'" + items.prodcate_createBy + "'" + ',' + "'" + items.prodcate_createDate + "'" + ',' + "'" + items.prodcate_updateBy + "'" + ',' + "'" + items.prodcate_updateDate + "'" +')">'; 

					html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.post_id + ',' + "'" + items.post_title + "'" + ',' + "'" + items.postcate_name + "'" + ','  + "'" + items.post_createBy + "'" + ',' + "'" + items.post_createDate + "'" + ',' + "'" + items.post_updateBy + "'" + ',' + "'" + items.post_updateDate + "'" +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				});
				$("#hienthidsbaiviet").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPostCategory('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationPostCategory(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListPostCaterogy(conf,token,secu,(page-1),pages);
	});
}

/*Hàm hiển thị modal dữ liệu của bài viết*/
function showModalPost(conf,token,secu,post_id,post_title,postcate_name,post_createBy,post_createDate,post_updateBy,post_updateDate){
	/*Gọi callback lấy dữ liệu*/
	$(".post_title").text(post_title);
	//$(".post_content").text(post_content);
	$(".postcate_name").text(postcate_name);
	$(".post_createBy").text(post_createBy);
	$(".post_updateBy").text(post_updateBy);
	$(".post_createDate").text(moment(post_createDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$(".post_updateDate").text(moment(post_updateDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$("#modalPost").modal('show');
}


/*HÀM lẤY danh sách bài biết*/
function getListPostbyPostCategory(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/post/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td><img src="' + items.post_smallPicture + '" height="100" width="100"></td>';
					html += '<td>' + items.post_title.substr(0,50) + '...</td>';
					html += '<td>' + items.post_description.substr(0,50) + '...</td>';
					html += "<td><a title='Cập nhật thông tin bài viết' href='/quantrac/nguoiquantri/baiviet/sua/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xem bình luận bài viết' href='/quantrac/nguoiquantri/baiviet/traloi/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
					html += "<a onclick='return confirm_delete()' title='Xoá thông tin danh mục' href='/quantrac/nguoiquantri/baiviet/xoa/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					//html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ','  + "'" + items.prodcate_image + "'" + ',' + "'" + items.prodcate_name + "'"  + ',' + "'" + items.prodcate_description + "'" + ','  + "'" + items.prodcate_createBy + "'" + ',' + "'" + items.prodcate_createDate + "'" + ',' + "'" + items.prodcate_updateBy + "'" + ',' + "'" + items.prodcate_updateDate + "'" +')">'; 

					html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.post_id + ',' + "'" + items.post_title + "'" + ',' + "'" + items.Post_Category.postcate_name + "'" + ','  + "'" + items.post_createBy + "'" + ',' + "'" + items.post_createDate + "'" + ',' + "'" + items.post_updateBy + "'" + ',' + "'" + items.post_updateDate + "'" +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				});
				$("#hienthidsbaiviet").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPostbyPostCategory('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationPostbyPostCategory(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListPostbyPostCategory(conf,token,secu,(page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI BÀI VIẾT*/
/*HÀM lẤY danh sách bài biết*/
function getListPost(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/post/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					//if (items.postcate_id != 27) {
						html += '<tr>';
						html += '<td><img src="' + items.post_smallPicture + '" height="100" width="100"></td>';
						html += '<td>' + items.post_title.substr(0,50) + '...</td>';
						if(items.post_description != null){
							html += '<td>' + items.post_description.substr(0,50) + '...</td>';
						}
						else
						{
							html += '<td>Rỗng</td>';
						};
						
						html += "<td><a title='Cập nhật thông tin bài viết' href='/quantrac/nguoiquantri/baiviet/sua/"+ items.post_id +"'>"; 
						html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
						html += "<a title='Xem bình luận bài viết' href='/quantrac/nguoiquantri/baiviet/traloi/"+ items.post_id +"'>"; 
						html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
						html += "<a onclick='return confirm_delete()' title='Xoá thông tin bài viết' href='/quantrac/nguoiquantri/baiviet/xoa/"+ items.post_id +"'>"; 
						html += "<span class='glyphicon glyphicon-trash'></a></td>";
					//html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ','  + "'" + items.prodcate_image + "'" + ',' + "'" + items.prodcate_name + "'"  + ',' + "'" + items.prodcate_description + "'" + ','  + "'" + items.prodcate_createBy + "'" + ',' + "'" + items.prodcate_createDate + "'" + ',' + "'" + items.prodcate_updateBy + "'" + ',' + "'" + items.prodcate_updateDate + "'" +')">'; 

					html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.post_id + ',' + "'" + items.post_title + "'" + ',' + "'" + items.Post_Category.postcate_name + "'" + ','  + "'" + items.post_createBy + "'" + ',' + "'" + items.post_createDate + "'" + ',' + "'" + items.post_updateBy + "'" + ',' + "'" + items.post_updateDate + "'" +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				//}

			});
				$("#hienthidsbaiviet").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPost('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationPost(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListPost(conf,token,secu,(page-1),pages);
	});
}

/*Hàm hiển thị modal dữ liệu của bài viết*/
function showModalPost(conf,token,secu,post_id,post_title,postcate_name,post_createBy,post_createDate,post_updateBy,post_updateDate){
	/*Gọi callback lấy dữ liệu*/
	$(".post_title").text(post_title);
	//$(".post_content").text(post_content);
	$(".postcate_name").text(postcate_name);
	$(".post_createBy").text(post_createBy);
	$(".post_updateBy").text(post_updateBy);
	$(".post_createDate").text(moment(post_createDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$(".post_updateDate").text(moment(post_updateDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$("#modalPost").modal('show');
}

/*HÀM LIÊN QUAN TỚI DANH MỤC SẢN PHẨM*/
/*HÀM lẤY danh sách danh mục sản phẩm*/
function getListProductCategory(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/productcategory/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					//html += '<td><img src="' + items.prodcate_image + '" height="100" width="100"></td>';
					html += '<td>' + items.prodcate_name + '</td>';
					html += '<td>' + items.prodcate_description.substr(0,50) + '...</td>';
					html += '<td>' + items.prodcate_createBy + '<br>'+moment(items.prodcate_createDate).format('DD/MM/YYYY');+'</td>';
					html += "<td><a title='Cập nhật thông tin danh mục' href='/quantrac/nguoiquantri/danhmucsanpham/sua/"+ items.prodcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a onclick='return confirm_delete()' title='Xoá thông tin danh mục' href='/quantrac/nguoiquantri/danhmucsanpham/xoa/"+ items.prodcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalProductCategory('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.prodcate_id + ',' + "'" + items.prodcate_image + "'" + ',' + "'" + items.prodcate_name + "'"  + ',' + "'" + items.prodcate_description + "'" + ','  + "'" + items.prodcate_createBy + "'" + ',' + "'" + items.prodcate_createDate + "'" + ',' + "'" + items.prodcate_updateBy + "'" + ',' + "'" + items.prodcate_updateDate + "'" +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				});
				$("#hienthids").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationProductCategory('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách danh mục sản phẩm. Vui lòng tải lại trang");
		},
	});

}
/*Xử lý phân trang cho productcategory*/
function processPaginationProductCategory(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListProductCategory(conf,token,secu,(page-1),pages);
	});
}

/*Hàm hiển thị modal dữ liệu của danh mục sản phẩm*/
function showModalProductCategory(conf,token,secu,prodcate_id,prodcate_image,prodcate_name,prodcate_description,prodcate_createBy,prodcate_createDate,prodcate_updateBy,prodcate_updateDate){
	/*Gọi callback lấy dữ liệu*/
	$(".prodcate_name").text(prodcate_name);
	$(".prodcate_image").text('<img src="' + prodcate_image + '" height="300" width="300">');
	$(".prodcate_description").text(prodcate_description);
	$(".prodcate_createBy").text(prodcate_createBy);
	$(".prodcate_updateBy").text(prodcate_updateBy);
	$(".prodcate_createDate").text(moment(prodcate_createDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$(".prodcate_updateDate").text(moment(prodcate_updateDate).utc().format('DD-MM-YYYY, HH:mm'));	
	$("#modalProductCategory").modal('show');
}

/*HÀM LIÊN QUAN TỚI LOẠI SẢN PHẨM*/
/*HÀM lẤY danh sách loại sản phẩm*/
function getListProductType(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/producttype/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td>' + items.Product_Category.prodcate_name + '</td>';
					html += '<td>' + items.prodtype_typeName + '</td>';
					html += "<td><a title='Cập nhật thông tin loại sản phẩm' href='/quantrac/nguoiquantri/loaisanpham/sua/"+ items.prodtype_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a onclick='return confirm_delete()' title='Xoá thông tin loại sản phẩm' href='/quantrac/nguoiquantri/loaisanpham/xoa/"+ items.prodtype_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '<td><a title="Xem chi tiết về loại sản phẩm" href="#" onclick="showModalProductType('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.prodtype_id + ',' + "'" + items.Product_Category.prodcate_name + "'"+ ',' + "'" + items.prodtype_typeName + "'" + ',' + items.prodcate_id +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				});
				$("#hienthidsloaisanpham").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationProductType('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách loại sản phẩm. Vui lòng tải lại trang");
		},
	});

}


/*Hàm xử lý phân trang cho productcategory*/
/*Xử lý phân trang cho productcategory*/
function processPaginationProductType(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 10;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getListProductType(conf,token,secu,(page-1),pages);
	});
}

/*Hàm hiển thị modal dữ liệu của productcategory*/
function showModalProductType(conf,token,secu,prodtype_id,prodcate_name,prodtype_typeName,prodcate_id){
	/*Gọi callback lấy dữ liệu*/
	$(".prodcate_name").text(prodcate_name);
	$(".prodtype_typeName").text(prodtype_typeName);
	$("#modalProductType").modal('show');
}

//ham lay ve danh sach danh mục san pham
function loadProductCategoryforProductType(config,token,security,callback){
	var arrayDTType = [];
	var arrayDTTId = [];
	queue2.push(1);
	jQuery.ajax({
		url: config + '/api/productCategory/getallname',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			resultdata.data.forEach(function(data,index){
				arrayDTTId.push(data.prodcate_id);
				arrayDTType[data.prodcate_id] = [];
				arrayDTType[data.prodcate_id].unshift({prodcate_id:data.prodcate_id,prodcate_name:data.prodcate_name});
			});
			arrayDTTId.sort(); /*Sắp xếp mảng loại dữ liệu*/	
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Không thể tải được dữ liệu của danh mục sản phẩm. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			callback(arrayDTTId,arrayDTType);
		}
	});
}

//ham lay ve danh sach danh mục bai viet
function loadPostCategoryforPost(config,token,security,callback){
	var arrayDTType = [];
	var arrayDTTId = [];
	queue2.push(1);
	jQuery.ajax({
		url: config + '/api/postCategory/getallname',
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			console.log(resultdata.data);
			resultdata.data.forEach(function(data,index){
				console.log(data.postcate_id);
				arrayDTTId.push(data.postcate_id);
				arrayDTType[data.postcate_id] = [];
				arrayDTType[data.postcate_id].unshift({postcate_id:data.postcate_id,postcate_name:data.postcate_name});
			});
			arrayDTTId.sort(); /*Sắp xếp mảng loại dữ liệu*/	
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Không thể tải được dữ liệu của danh mục bài viết. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			callback(arrayDTTId,arrayDTType);
		}
	});
}

//ham lay ve danh sach loai san pham
function loadHarvestDetailforGuest(config,token,security){
	var html = "";
	var html2 = "";
	harvestId = $('#harvest_id').find(":selected").val();
	//console.log(harvestId);
	// alert("vô");
	jQuery.ajax({
		url:  config + '/api/harvestdetail/getbyharvest/' + harvestId,
		type: 'GET',
		headers: {'Authorization': security + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			//console.log('harvestId');
			totals = resultdata.data.TotalPages;
			if(resultdata.data != null){
				//html += '<div class="responsive-text-area">';
					//html += '<textarea class="textareainput" name="post_content" id="post_content">';
					var i =0;

					resultdata.data.forEach(function(items){
						i++;
					//html += '<div class="responsive-text-area">';
					//html += '<textarea class="textareainput" name="post_content" id="post_content">';
					html += '<p>Đợt thu hoạch : '+items.harvedeta_number +'</p>';
					html += '<p id="producttype'+items.prodtype_id+i+'">Loại tôm: </p>';
					//html += '<p>'+items.prodtype_id+':';
					producttypename(items.prodtype_id,config,token,security,i);
					html += '<p>Giá: '+items.harvedeta_price+' VND</p>';
					html += '<p id="unit'+items.unit_id+i+'">Trọng lượng : ';
					html += items.harvedeta_weight+' </p>';

					//html += '<p id="unit'+items.unit_id+i+'"></p>';
					unitname(items.unit_id,config,token,security,i);
					//html += '<p>.</p>';
					//html += '<p>.</p>';
					//html += '</textarea>';
					//html += '</div>';
					
					//html += '';		
				});
				console.log(html);
				//html += '</textarea>';
					//html += '</div>';
					$("#content").html(html);
					$("#content2").html(html);
					CKEDITOR.instances['post_content'].setData(html);
					// document.getElementById("post_content").value = html;
					//$("#post_content").val(html);
					// $("#post_content").val(html);
					// document.getElementById("post_content").value += html;
					
				}

			},
			error: function(jqXHR,error,errorThrown){
				displayError("Lỗi ! Không thể tải danh sách danh mục sản phẩm. Vui lòng tải lại trang");
			},
		});

}

function unitname(id,config,token,security,y){
	console.log(id);
	jQuery.ajax({
		url: config + '/api/unit/getbyid/'+id,
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
				//console.log(resultdata.data.unit_name);
				var abc = '';
				abc = 'unit'+id+y;
				//console.log(abc);
				var html = document.getElementById(abc).innerHTML += resultdata.data.unit_name;
				return resultdata.data.unit_name;
			},
			error: function(jqXHR,textStatus,errorThrown){
				displayError("Không thể tải được dữ liệu của đơn vị sản phẩm. Vui lòng tải lại trang");
			},
		}).complete(function(){

		});

	}

	function producttypename(id,config,token,security,y){
		console.log(id);
		jQuery.ajax({
			url: config + '/api/producttype/getbyid/'+id,
			contentType: 'application/json',
			headers:{
				'Authorization': security + token,
			},
			success: function(resultdata){
				//console.log(resultdata.data.unit_name);
				var abc = '';
				abc = 'producttype'+id+y;
				//console.log(abc);
				var html = document.getElementById(abc).innerHTML += resultdata.data.prodtype_typeName;
				return resultdata.data.prodtype_typeName;
			},
			error: function(jqXHR,textStatus,errorThrown){
				displayError("Không thể tải được dữ liệu của đơn vị sản phẩm. Vui lòng tải lại trang");
			},
		}).complete(function(){

		});

	}
//ham lay ve danh sach stocking
function loadStokingforGuest(id,config,token,security,callback){
	var arrayDTType = [];
	var arrayDTTId = [];
	console.log(id);
	queue2.push(1);
	jQuery.ajax({
		url: config + '/api/stocking/getpagination/'+id,
		type: 'GET',
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			//console.log(resultdata.data);
			resultdata.data.Items.forEach(function(data,index){
				//console.log(data.stocking_id);
				arrayDTTId.push(data.stocking_id);
				arrayDTType[data.stocking_id] = [];
				arrayDTType[data.stocking_id].unshift({stocking_id:data.stocking_id,stocking_date:data.stocking_date});
			});
			arrayDTTId.sort(); /*Sắp xếp mảng loại dữ liệu*/	
		},
		error: function(jqXHR,textStatus,errorThrown){
			displayError("Không thể tải được dữ liệu của vụ mùa. Vui lòng tải lại trang");
		},
	}).complete(function(){
		queue2.pop();
		if(queue2.length == 0){
			callback(arrayDTTId,arrayDTType);
		}
	});
}

// Được gọi khi người dùng chọn selectstocking -->
function loadHarvestforGuest(conf,token,secu,id){ 
	queue3.push(1);
	$('#harvest_id').find('option').remove();
	$('#harvest_id').append($("<option></option>").attr("value",-1).text("Chọn thu hoạch"));
	//stockingId = document.getElementById("stocking_id").value;
	stockingId = $('#stocking_id ').find(":selected").val();
	console.log(stockingId);
	if(stockingId != -1){
		console.log('ssss');
		jQuery.ajax({
			url: conf + '/api/harvest/getpagination/'+ id +'?stocking_id=' + stockingId +'&page=0&pageSize=100&keyword',
			type: 'GET',
			contentType: 'application/json; charset=utf-8',
			headers:{
				'Authorization': secu + token,
			},
			success: function(resultdata){
				
				for(i in resultdata.data.Items){
					$('#harvest_id').append($("<option></option>").attr("value",resultdata.data.Items[i].harvest_id).text(moment(resultdata.data.Items[i].harvest_harvestDate).format('DD/MM/YYYY') ));
					$("#harvest_id").css("display", "block");
				}
			},
			error: function(jqXHR,textStatus,errorThrown){
				displayError("Lỗi ! Không thể tải dữ liệu. Vui lòng tải lại trang");
			},
		}).complete(function() {
			queue3.pop();
			if (queue3.length == 0) {
				//code gi do
			}
		});
	}
}

/*HÀM LIÊN QUAN TỚI THU HOACH*/
/*HÀM lẤY danh sách thu hoach */
function getListHarvest(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/harvest/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					html += '<tr>';
					html += '<td><img src="' + items.prodcate_image + '" height="100" width="100"></td>';
					html += '<td>' + items.prodcate_name + '</td>';
					html += '<td>' + items.prodcate_description + '</td>';
					html += '<td>' + items.prodcate_createBy + '<br>'+moment(items.prodcate_createDate).format('DD/MM/YYYY');+'</td>';
					html += "<td><a title='Cập nhật thông tin danh mục' href='/nguoiquantri/danhmucsanpham/sua/"+ items.prodcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xoá thông tin danh mục' href='/nguoiquantri/danhmucsanpham/xoa/"+ items.prodcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalThreshold('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' +  items.prodcate_image + "'" + ',' + items.prodcate_name  + ',' + items.prodcate_description +','+ items.prodcate_createBy + ',' + "'" + items.prodcate_createDate + "'" + ',' + items.prodcate_updateBy + ',' + items.prodcate_updateDate +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
				});
				$("#hienthids").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationProductCategory('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách danh mục sản phẩm. Vui lòng tải lại trang");
		},
	});

}


/*HÀM LIÊN QUAN TỚI */
/*HÀM lẤY danh sách */
function getPostforGuest(index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	var html3 = "";
	
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/post/getpagination?page=' + index +'&pageSize='+ size +'&keyword',
		type: 'GET',
		//headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data.Items != null){
				
				resultdata.data.Items.forEach(function(items){
					if (resultdata.data.Items.postcate_id != 27) {
						// html += '<div class="col-sm-4">';
						// html += '<div class="well">';
						// html += '<img src="' + items.post_smallPicture + '" class="img-responsive" style="width:100%" alt="Image">';
						// html += '<p> ' + moment(items.post_createDate).format('DD/MM/YYYY') + '</p>';
						// html += '<h2 class="entry-title"><a href="#">'+items.post_title+'</a></h2>';
						// html3 = "";
						// html3 += items.post_description;
						// console.log(html3);
						// html += '<p>'+html3.substr(0,200)+' ...</p>';
						// html += '<a class="btn btn-primary" href="chitietbaiviet/'+items.post_id+'">Xem</a>';
						// html += '</div>';
						// html += '</div>';
						
						// html += '';
						// html += '';
						// html += '';
						// html += '';
						// html += '';
						



					//if (items.postcate_id != 27) {
						html += '<div class=" col-sm-4 " style="height: 750px;">';
						html += '<div class="well" style="height: 700px;">'
						html += '<div class=" blog-post blog-large wow fadeInLeft" data-wow-duration="300ms" data-wow-delay="0ms" style="border: 0px; margin: 15px;">';
						html += '<article>';
						html += '<header class="entry-header">';
						html += '<div class="entry-thumbnail" style="height: 300px;">';
						html += '<img class="img-responsive" src="' + items.post_smallPicture + '" width="100%" height="100%" >';
						html += '</div>';
						html += '<div class="entry-date">' + moment(items.post_createDate).format('DD/MM/YYYY') + '</div>';
						html += '<h2 class="entry-title"><a href="/tintuc/chitietbaiviet/'+items.post_id+'">'+items.post_title+'</a></h2>';
						html += '</header>';
						html += '<div class="entry-content">';
						html3 = "";
						html3 += items.post_description;
						console.log(html3);
						html += '<p>'+html3.substr(0,200)+' ...</p>';
						html += '<a class="btn btn-primary" href="/tintuc/chitietbaiviet/'+items.post_id+'">Xem</a>';
						html += '</div>';
						html += '</article>';
						html += '</div>';
						html += '</div>';
						html += '</div>';

					//}
					
				}else
				{
					html += '<div class="col-sm-4" style="height: 500px;padding: 10px 10px ;">';
					html += '<div class=" blog-post blog-large wow fadeInLeft" data-wow-duration="300ms" data-wow-delay="0ms" style="border: 0px; margin: 15px">';
					html += '<article>';
					html += '<header class="entry-header">';
					html += '<div class="entry-thumbnail">';
					html += '<img class="img-responsive" src="/images/product.jpg" alt="" height="300px" width="300px" >';
					html += '</div>';
					html += '<div class="entry-date">' + moment(items.post_createDate).format('DD/MM/YYYY') + '</div>';
					html += '<h2 class="entry-title"><a href="#">'+items.post_title+'</a></h2>';
					html += '</header>';
					html += '<div class="entry-content">';
					html += '<a class="btn btn-primary" href="chitietbaiviet/'+items.post_id+'">Xem</a>';
					html += '</div>';
					html += '</article>';
					html += '</div>';
					html += '</div>';
				};	
			});
				
				$("#hienthi").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPPost('+  index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}

function getFoodforGuest(index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	var html3 = "";
	
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/post/getbypostcategory/25',
		type: 'GET',
		//headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			
			totals = resultdata.data.TotalPages;
			if(resultdata.data != null){
				
				resultdata.data.forEach(function(items){
						html += '<div class=" col-sm-4 " style="height: 750px;">';
						html += '<div class="well" style="height: 700px;">'
						html += '<div class=" blog-post blog-large wow fadeInLeft" data-wow-duration="300ms" data-wow-delay="0ms" style="border: 0px; margin: 15px;">';
						html += '<article>';
						html += '<header class="entry-header">';
						html += '<div class="entry-thumbnail" style="height: 300px;">';
						html += '<img class="img-responsive" src="' + items.post_smallPicture + '" width="100%" height="100%" >';
						html += '</div>';
						html += '<div class="entry-date">' + moment(items.post_createDate).format('DD/MM/YYYY') + '</div>';
						html += '<h2 class="entry-title"><a href="/tintuc/chitietbaiviet/'+items.post_id+'">'+items.post_title+'</a></h2>';
						html += '</header>';
						html += '<div class="entry-content">';
						
						html += '<p>'+items.post_description.substr(0,200)+' ...</p>';
						html += '<a class="btn btn-primary" href="/tintuc/chitietbaiviet/'+items.post_id+'">Xem</a>';
						html += '</div>';
						html += '</article>';
						html += '</div>';
						html += '</div>';
						html += '</div>';

				
			});
				
				$("#hienthi").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPPost('+  index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}

/*HÀM LIÊN QUAN TỚI */
/*HÀM lẤY danh sách */
function getProductforGuest(conf,token,secu,index,size){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	var html3 = "";
	// alert("vô");
	jQuery.ajax({
		url:  conf + '/api/post/getbypostcategory/27',
		type: 'GET',
		headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			if(resultdata.data != null){
				
				resultdata.data.forEach(function(items){

					html += '<div class="col-sm-4" style="height: 500px;padding: 10px 10px ;">';
					html += '<div class=" blog-post blog-large wow fadeInLeft" data-wow-duration="300ms" data-wow-delay="0ms" style="border: 0px; margin: 15px">';
					html += '<article>';
					html += '<header class="entry-header">';
					html += '<div class="entry-thumbnail">';
					html += '<img class="img-responsive" src="'+items.post_smallPicture+'" alt="" height="300px" width="300px" >';
					html += '</div>';
					html += '<div class="entry-date">' + moment(items.post_createDate).format('DD/MM/YYYY') + '</div>';
					html += '<h2 class="entry-title"><a href="#">'+items.post_title+'</a></h2>';
					html += '</header>';
					html += '<div class="entry-content">';
					html += '<p>'+items.post_description.substr(0,200)+' ...</p>';
					html += '<a class="btn btn-primary" href="/tintuc/chitietbaiviet/'+items.post_id+'">Xem</a>';
					html += '</div>';
					html += '</article>';
					html += '</div>';
					html += '</div>';
					html3 += '<a href="/khachhang/tintuc/chitietbaiviet/'+items.post_id+'">' +items.post_description.substr(0,100)+'...</a><br>';	
				});
				
				$("#hienthi").html(html);
				$("#hienthi2").html(html3);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPPost('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}

/*Xử lý phân trang cho productcategory*/
function processPaginationPPost(conf,token,secu,index,pagesize){
	var selector = '.pagi-custom li';
	$(selector).on('click', function(){
		$(selector).removeClass('active');
		$(this).addClass('active');
		pages = 3;
		var page = parseInt($("ul.pagi-custom .active a").text()); /*Lấy số ở trên pagination phân trang chuyển thành số*/
		pagenoti = (page-1)*pages;
		getPostforGuest((page-1),pages);
	});
}

/*HÀM LIÊN QUAN TỚI */
/*HÀM lẤY danh sách */
function getPostDetailforGuest(id){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	jQuery.ajax({
		url:  conf + '/api/post/getbyid/' + id,
		type: 'GET',
		//headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			if(resultdata.data != null){
				
				
				html += resultdata.data.post_content;
				


				$("#hienthi").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPPost(' + index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải  bài viết. Vui lòng tải lại trang");
		},
	});

}

/*HÀM LIÊN QUAN TỚI */
/*HÀM lẤY danh sách */
function getCommentPostforPost(index,size,id){
	// showModalNoti(conf,token,secu,threshold_level,datatype_name,datatype_id,data_value,notif_title,stationid,datecreated,threshold_message,notif_id)
	var html = "";
	var html2 = "";
	// alert("vô");

	jQuery.ajax({
		url:  conf + '/api/comment/getbypost/' + id,
		type: 'GET',
		//headers: {'Authorization': secu + token},
		contentType: 'application/json; charset=utf-8',
		success: function(resultdata){
			totals = resultdata.data.TotalPages;
			
			if(resultdata.data.Items != null){
				resultdata.data.Items.forEach(function(items){
					
					html += '<div class="media">';
					html += '<a class="pull-left" href="#">';
					html += '<img class="media-object" src="/images/chat.jpg" alt="" height="64px" width="64px">';
					html += '</a>';
					html += '<div class="media-body">';
					html += '<h4 class="media-heading">' + items.comment_commentByName + '&nbsp';
					html += '<small>'+ moment(items.comment_commentDate).format('DD/MM/YYYY')+'</small>';
					html += '</h4>';
					html += items.comment_content;
					if(items.answer_comments != null){
						items.answer_comments.forEach(function(items){
							html += '<div class="media">';
							html += '<a class="pull-left" href="#">';
							html += '<img class="media-object" src="/images/chat.jpg" alt="" height="64px" width="64px">';
							html += '</a>';
							html += '<div class="media-body">';
							html += '<h4 class="media-heading">' + items.anscom_answreByName + '&nbsp';
							html += '<small>'+ moment(items.anscom_date).format('DD/MM/YYYY')+'</small>';
							html += '</h4>';
							html += items.anscom_content;

							//html += '<div><a href="https://www.w3schools.com">Visit W3Schools</a></div>';
							html += '</div>';
							//html += '<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#demo">Simple collapsible</button>';
							html += '</div>';
						});
					}
					//html += '<br><span class="glyphicons glyphicons-comments"></span>';
					html += '<br><a data-toggle="collapse" href="#ans' + items.comment_id + '">Trả lời</a>';
					html += '<div id="ans' + items.comment_id + '" class="collapse">';html += '<div class="well">';
					html += '<h4>Trả lời bình luận:</h4>';
					html += '<form role="ansform" method="post" action="/trangchu/themtraloi/'+items.comment_id+'">';
					html += '<div class="form-group">';
					html += '<input type="hidden" name="comment_id" value="'+items.comment_id+'">';
					html += '<input type="hidden" name="post_id" value="'+id+'">';
					html += '<input class="form-control" type="text" name="anscom_answreByName" value="" placeholder="Nhập tên của bạn">';
					html += '</div>';
					html += '<div class="form-group">';
					html += '<input class="form-control" type="text" name="anscom_answerByEmail" placeholder="Nhập email của bạn">';
					html += '</div>';
					html += '<div class="form-group">';
					html += '<textarea class="form-control" rows="3" name="anscom_content" placeholder="Viết trả lời"></textarea>';
					html += '</div>';
					html += '<button type="submit" class="btn btn-primary">Gửi trả lời</button>';
					html += '</form>';
					html += '</div>';
					html += '</div>';
					html += '</div></div>';
				});
				$("#cmt").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationPPost('+  index + ','  + pagesize +');return false;">'+i+'</a></li>';

			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
			displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
		},
	});

}


/*hàm hiện thông báo lỗi */
function displayError(stringText){
	$("#ErrorMessage").html(stringText);
	$("#ErrorMessage").css("display","block");
}

/*hàm xác nhận xoá */
function confirm_delete() {
	return confirm('Bạn có chắc chắn xoá không?');
}

function confirm_edit() {
	return confirm('Bạn có chắc chắn thay đổi không?');
}

//ham gui hinh
var socket;
window.onload = function() {
	
	socket = io.connect();
	
	socket.emit("setRole","sender");

	socket.on("greeting", function(data){
		console.log(data);
	});

	document.getElementById("fileSelector").addEventListener("change", function(){		
		submitImg();
	});

	socket.emit('setRole', 'receiver');
	socket.on('receivePhoto', function(data){
		console.log(data);
		document.getElementById("showPhoto").src = data.path;
		document.getElementById("post_smallPicture").value = data.path;
	});

};

function submitImg(){
	var selector 	= document.getElementById("fileSelector");
	var img 			= document.getElementById("review");

	var reader = new FileReader();
	reader.onload = function (e) {
		img.src = e.target.result;
		socket.emit("sendPhoto", {base64:e.target.result});
	}
	reader.readAsDataURL(selector.files[0]);
}

var roles = {
	sender  : "",
	receiver    : ""  
};
io.sockets.on('connection', function (socket) { 
	socket.on('setRole', function (data) {
		socket.role = data.trim();
		roles[socket.role] = socket.id;
		console.log("Role "+ socket.role + " is connected.");    
	}); 

	socket.on("sendPhoto", function(data){
		var guess = data.base64.match(/^data:image\/(png|jpeg);base64,/)[1];
		var ext = "";
		switch(guess) {
			case "png"  : ext = ".png"; break;
			case "jpeg" : ext = ".jpg"; break;
			default     : ext = ".bin"; break;
		}
		var savedFilename = "http://quantrac.iotlab.net.vn/upload/"+randomString(10)+ext;

		fs.writeFile(__dirname+"/public"+savedFilename, getBase64Image(data.base64), 'base64', function(err) {
			if (err !== null)
				console.log(err);
			else 
				io.to(roles.receiver).emit("receivePhoto", {
					path: savedFilename,
				});
			console.log("Send photo success!");
		});
	});

	socket.on('disconnect', function() {
		console.log("Role " + socket.role + " is disconnect.");
	}); 
});

function randomString(length)
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	console.log(text);
	return text;
}
function getBase64Image(imgData) {
	return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}
