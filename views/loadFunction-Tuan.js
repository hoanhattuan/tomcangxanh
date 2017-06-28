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
					html += '<td>Ngày sinh: '+ moment(items.user_birthday).format('DD/MM/YYYY') + '<br>Số điện thoại: ' + items.user_phone + '<br>Email: ' + items.user_email + '</td>';
					if(items.user_lockStatus){html += '<td><span>Khoá</span></td>';}else{html += '<td><span>Mở</span></td>'};
					//html += '<td><span>Khoá</span></td>' +} else { +'<span>Mở</span>'+ } + '</td>';
					html += "<td><a title='Cập nhật thông tin người dùng' href='/nguoiquantri/nguoidung/sua/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xoá thông tin người dùng' href='/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a>&nbsp";
					if(items.user_lockStatus){html += '<a href="/nguoiquantri/nguoidung/mokhoa/'+items.user_id + ' title="Mở khoá" ><span><i class="glyphicon glyphicon-ok-sign" onclick="success()"></i></span></a></td>';}else{html += '<a href="/nguoiquantri/nguoidung/khoa/'+items.user_id + ' title="Khoá" ><span><i class="glyphicon glyphicon-remove-sign" onclick="success()"></i></span></a></td>'};
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
      		displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
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
					html += "<a title='Xoá thông tin người dùng' href='/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a>";
					html += "<a title='Xoá thông tin người dùng' href='/nguoiquantri/nguoidung/xoa/"+ items.user_id +"'>"; 
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
					html += '<tr>';
					html += '<td>'+ items.feedback_name + '<br>' + items.feedback_email + '<br>' + moment(items.feedback_createDate).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.feedback_message + '</td>';
					html += '<td>' + items.feedback_answerContent + '</td>';
					html += "<td><a title='Trả lời phản hồi' href='/nguoiquantri/phanhoi/traloi/" + items.feedback_id  +"'>"; 
					html += "<span><i class='glyphicon glyphicon-edit' ></i></span></a>&nbsp";
					html += "<a title='Xoá thông tin phản hồi' href='/nguoiquantri/phanhoi/xoa/"+ items.feedback_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					html += '</tr>';
		        });
	        	$("#hienthidsphanhoi").html(html);
			}
			for(i = 1; i<= totals; i++){
				html2 += '<li><a href="#" onclick="processPaginationFeedback('+ "'" +conf + "'" + ',' + "'" + token + "'" + ','  + "'" + secu + "'" + ',' + index + ','  + pagesize +');return false;">'+i+'</a></li>';
			
			}
			$('.pagi-custom').html(html2);
		},
		error: function(jqXHR,error,errorThrown){
      		displayError("Lỗi ! Không thể tải danh sách bài viết. Vui lòng tải lại trang");
  		},
	});
		
}
/*Xử lý phân trang cho productcategory*/
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
					html += '<td>'+ items.comment_commentByName + '<br>' + items.comment_commentByEmail + '<br>' + moment(items.comment_commentDate).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.comment_content + '</td>';
					html += "<td><a title='Danh sách trả lời cho bình luận' href='/nguoiquantri/binhluan/traloi/" + items.comment_id  +"'>"; 
					html += "<span><i class='glyphicon glyphicon-plus' ></i></span></a>&nbsp";
					html += "<a title='Xoá thông tin bình luận' href='/nguoiquantri/binhluan/xoa/"+ items.comment_id +"'>"; 
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
					html += '<td>'+ items.anscom_answreByName + '<br>' + items.anscom_answerByEmail + '<br>' + moment(items.anscom_date).format('DD/MM/YYYY') + '</td>';
					html += '<td>' + items.anscom_content + '</td>';html += "<td><a title='Xoá thông tin trả lời bình luận' href='/nguoiquantri/traloibinhluan/xoa/"+ items.anscom_id +"'>"; 
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
					html += "<td><a title='Cập nhật thông tin bài viết' href='/nguoiquantri/danhmucbaiviet/sua/"+ items.postcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xem bài viết thuộc danh mục' href='/nguoiquantri/danhmucbaiviet/xemthem/"+ items.postcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
					html += "<a title='Xoá thông tin danh mục' href='/nguoiquantri/danhmucbaiviet/xoa/"+ items.postcate_id +"'>"; 
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
					html += '<td>' + items.post_title + '</td>';
					html += '<td>' + items.post_description + '</td>';
					html += "<td><a title='Cập nhật thông tin bài viết' href='/nguoiquantri/baiviet/sua/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xem bình luận bài viết' href='/nguoiquantri/baiviet/traloi/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
					html += "<a title='Xoá thông tin danh mục' href='/nguoiquantri/baiviet/xoa/"+ items.post_id +"'>"; 
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
					html += '<tr>';
					html += '<td><img src="' + items.post_smallPicture + '" height="100" width="100"></td>';
					html += '<td>' + items.post_title + '</td>';
					html += '<td>' + items.post_description + '</td>';
					html += "<td><a title='Cập nhật thông tin bài viết' href='/nguoiquantri/baiviet/sua/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xem bình luận bài viết' href='/nguoiquantri/baiviet/traloi/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-plus'></a>&nbsp";
					html += "<a title='Xoá thông tin danh mục' href='/nguoiquantri/baiviet/xoa/"+ items.post_id +"'>"; 
					html += "<span class='glyphicon glyphicon-trash'></a></td>";
					//html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ','  + "'" + items.prodcate_image + "'" + ',' + "'" + items.prodcate_name + "'"  + ',' + "'" + items.prodcate_description + "'" + ','  + "'" + items.prodcate_createBy + "'" + ',' + "'" + items.prodcate_createDate + "'" + ',' + "'" + items.prodcate_updateBy + "'" + ',' + "'" + items.prodcate_updateDate + "'" +')">'; 

					 html += '<td><a title="Xem chi tiết về danh mục" href="#" onclick="showModalPost('+ "'" + conf + "'" + ',' + "'" + token + "'" + ',' + "'" + secu + "'" + ',' + items.post_id + ',' + "'" + items.post_title + "'" + ',' + "'" + items.Post_Category.postcate_name + "'" + ','  + "'" + items.post_createBy + "'" + ',' + "'" + items.post_createDate + "'" + ',' + "'" + items.post_updateBy + "'" + ',' + "'" + items.post_updateDate + "'" +')">'; 
					html += '<i class="fa fa-eye" aria-hidden="true"></i></a></td>';
					html += '</tr>';
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
					html += '<td><img src="' + items.prodcate_image + '" height="100" width="100"></td>';
					html += '<td>' + items.prodcate_name + '</td>';
					html += '<td>' + items.prodcate_description + '</td>';
					html += '<td>' + items.prodcate_createBy + '<br>'+moment(items.prodcate_createDate).format('DD/MM/YYYY');+'</td>';
					html += "<td><a title='Cập nhật thông tin danh mục' href='/nguoiquantri/danhmucsanpham/sua/"+ items.prodcate_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xoá thông tin danh mục' href='/nguoiquantri/danhmucsanpham/xoa/"+ items.prodcate_id +"'>"; 
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
					html += "<td><a title='Cập nhật thông tin loại sản phẩm' href='/nguoiquantri/loaisanpham/sua/"+ items.prodtype_id +"'>"; 
					html += "<span class='glyphicon glyphicon-edit'></a>&nbsp";
					html += "<a title='Xoá thông tin loại sản phẩm' href='/nguoiquantri/loaisanpham/xoa/"+ items.prodtype_id +"'>"; 
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
      		displayError("Lỗi ! Không thể tải danh sách danh mục sản phẩm. Vui lòng tải lại trang");
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
		contentType: 'application/json',
		headers:{
			'Authorization': security + token,
		},
		success: function(resultdata){
			resultdata.data.forEach(function(data,index){
				arrayDTTId.push(data.postdcate_id);
				arrayDTType[data.postdcate_id] = [];
				arrayDTType[data.prodcpostdcate_idate_id].unshift({postdcate_id:data.postdcate_id,postcate_name:data.postcate_name});
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

/*hàm hiện thông báo lỗi */
function displayError(stringText){
	$("#ErrorMessage").html(stringText);
	$("#ErrorMessage").css("display","block");
}