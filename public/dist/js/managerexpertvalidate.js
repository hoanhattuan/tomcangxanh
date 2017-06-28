$(document).ready(function(){
	/*ĐỊNH NGHĨA ĐỂ XÉT TRƯỜNG HỢP CHƯA CHỌN SELECT*/
	$.validator.setDefaults({
			errorClass:'help-block',
			highlight:function(element){
					$(element).closest('.form-group').addClass('has-error');
			},
			unhighlight:function(element){
					$(element).closest('.form-group').removeClass('has-error');
			}
	});
	$.validator.addMethod("valueNotEquals", function(value, element, arg){
  		return arg != value;
 	}, "Value must not equal arg.");
	$.validator.addMethod("isEmail", function (value, element) {
        if (/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value)) {
            return true;
        } else {
            return false;
        };
    }, "Email không hợp lệ");
 	/*Ngưỡng*/
	$("#frmNguong").validate({
		rules: {
			threshold_name: {
				required: true,
				minlength: 3,
				maxlength: 255,
			},
			datatype_id: {
				valueNotEquals: "-1",
			},
			region_id: {
				valueNotEquals: "-1",
			},
			age_id: {
				valueNotEquals: "-1",
			},
			species_id: {
				valueNotEquals: "-1",
			},
			threshold_level: {
				valueNotEquals: "-1",
			},
			threshold_start: {
				required: true,
				number: true,
				range: [0,100],
				maxlength: 4,
			},
			threshold_end: {
				required: true,
				number: true,
				min: function() {
          return parseInt($('[name="threshold_start"]').val())+1;
        },
			},
			threshold_message: {
				required: true,
				minlength: 5,
				maxlength: 1024,
			},
			threshold_timeWarning: {
				required: true,
				number: true,
				range: [0,100],
				maxlength: 4,
			}
		},
		messages: {
			threshold_name: {
				required: 'Tên ngưỡng không được rỗng.',
				minlength: 'Tên ngưỡng phải có ít nhất 4 kí tự',
				maxlength: 'Tên ngưỡng không được vượt quá 255 kí tự',
			},
			datatype_id: {
				valueNotEquals: 'Vui lòng chọn loại dữ liệu',
			},
			region_id: {
				valueNotEquals: 'Vui lòng chọn vùng',
			},
			age_id: {
				valueNotEquals: 'Vui lòng chọn độ tuổi của tôm',
			},
			species_id: {
				valueNotEquals: 'Vui lòng chọn loại giống',
			},
			threshold_level: {
				valueNotEquals: 'Vui lòng chọn cấp độ',
			},
			threshold_start: {
				required: 'Số liệu ngưỡng bắt đầu không được rỗng.',
				number: 'Số liệu ngưỡng bắt đầu không hợp lệ',
				range: 'Số liệu ngưỡng bắt đầu phải nằm trong khoảng từ 0 đến 100',
				maxlength: 'Số liệu nhập quá lớn có thể không hợp lệ',
			},
			threshold_end: {
				required: 'Số liệu ngưỡng kết thúc không được rỗng.',
				number: 'Số liệu ngưỡng kết thúc không hợp lệ',
				min: 'Số liệu ngưỡng kết thúc phải lớn hơn số liệu ngưỡng bắt đầu',
			},
			threshold_message: {
				required: 'Nội dung cảnh báo ngưỡng không được rỗng.',
				minlength: 'Nội dung cảnh báo ngưỡng phải có ít nhất 5 kí tự',
				maxlength: 'Nội dung cảnh báo ngưỡng không vượt quá 1024 kí tự',
			},
			threshold_timeWarning: {
				required: 'Thời gian cảnh báo không được rỗng',
				number: 'Thời gian cảnh báo phải là một số',
				range: 'Thời gian cảnh báo phải lớn hơn 0 và nhỏ hơn 100',
				maxlength: 'Thời gian cảnh báo không hợp lệ',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Check cập nhật thông tin cá nhân*/
	//chua check email ngay sinh
	$("#frmCNTTCaNhan").validate({
		/*Chưa check birthday*/
		rules: {
			user_fullName: {
				required: true,
				minlength: 1,
				maxlength: 50,
			},
			user_address: {
				maxlength: 500,
			},
			user_phone: {
				required: true,
				minlength:9,
				maxlength: 15,
			},
			user_email: {
				maxlength: 100,
				isEmail: true,
			},
		},
		messages: {
			user_fullName: {
				required: 'Họ tên không được rỗng',
				minlength: 'Họ tên phải có ít nhất 1 kí tự',
				maxlength: 'Họ tên không được vượt quá 50 kí tự',
			},
			user_address: {
				maxlength: 'Địa chỉ không được vượt quá 500 kí tự',
			},
			user_phone: {
				required: 'Số điện thoại không được rỗng',
				minlength: 'Số điện thoại có ít nhất 9 kí tự',
				maxlength: 'Số điện thoại không được vượt quá 15 kí tự',
			},
			user_email: {
				maxlength: 'Email không được vượt quá 100 kí tự',
				isEmail: 'Email không hợp lệ',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Check mật khẩu*/
	//chua check mật khẩu cũ
	$("#frmCNMatKhau").validate({
		/*Chưa check birthday*/
		rules: {
			oldPassword: {
				required: true,
			},
			newPassword: {
				required: true,
				minlength: 4,
				maxlength: 255,
			},
			comparePassword: {
				required: true,
				equalTo : "#newPassword",
			},
		},
		messages: {
			oldPassword: {
				required: 'Mật khẩu cũ không được rỗng',
			},
			newPassword: {
				required: 'Mật khẩu mới không được rỗng',
				minlength: 'Mật khẩu mới phải có ít nhất 4 kí tự',
				maxlength: 'Mật khẩu mới không được vượt quá 255 kí tự',
			},
			comparePassword: {
				required: 'Xác nhận mật khẩu không được rỗng',
				equalTo : "Xác nhận mật khẩu phải giống với mật khẩu mới",
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Lời khuyên*/
	$("#frmLoiKhuyen").validate({
		rules: {
			advice_title: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			advice_message: {
				required: true,
				minlength: 8,
				maxlength: 1024,
			},
			threshold_id: {
				valueNotEquals: "-1",
			},
		},
		messages: {
			advice_title: {
				required: 'Lời khuyên cho gửi tin nhắn không được rỗng',
				minlength: 'Lời khuyên cho gửi tin nhắn phải có ít nhất 3 kí tự',
				maxlength: 'Lời khuyên cho gửi tin nhắn không được vượt quá 100 kí tự',
			},
			advice_message: {
				required: 'Lời khuyên không được rỗng',
				minlength: 'Lời khuyên phải có ít nhất 8 kí tự',
				maxlength: 'Lời khuyên không được vượt quá 1024 kí tự',
			},

			threshold_id: {
				valueNotEquals: 'Vui lòng chọn ngưỡng để cho lời khuyên',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Độ tuổi*/
	$("#frmDoTuoi").validate({
		rules: {
			age_valueMin: {
				required: true,
				number: true,
				range: [0,400],
			},
			age_valueMax: {
				required: true,
				number: true,
				min: function() {
          return parseInt($('[name="age_valueMin"]').val())+1;
        },
                /*Kiem tra gia tri nho nhat phai la gia tri age_valueMin*/
			},
			age_description: {
				required: true,
				minlength: 4,
				maxlength: 255,
			},
		},
		messages: {
			age_valueMin: {
				required: 'Giá trị bắt đầu không được rỗng.',
				number: "Dữ liệu nhập phải là số",
				range: "Dữ liệu không hợp lệ. Dữ liệu nhập phải là số dương. Không lớn hơn 400",
			},
			age_valueMax: {
				required: 'Giá trị kết thúc không được rỗng.',
				number: "Dữ liệu nhập phải là số",
				min: "Giá trị kết thúc phải lớn hơn giá trị bắt đầu",
			},
			age_description: {
				required: 'Mô tả không được rỗng.',
				minlength: 'Mô tả về độ tuổi phải có ít nhất 4 kí tự',
				maxlength: 'Mô tả về độ tuổi không được vượt quá 255 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Loại dữ liệu*/
	//check đơn vị sai
	$("#frmLoaiDuLieu").validate({
		rules: {
			datatype_id: {
				required: true,
				minlength: 3,
				maxlength: 3,
			},
			datatype_name: {
				required: true,
				minlength: 3,
				maxlength: 50,
			},
			datatype_description: {
				maxlength: 1024,
			},
			datatype_unit: {
				required: true,
				maxlength: 20,
			},
		},
		messages: {
			datatype_id: {
				required: 'Mã loại dữ liệu không được rỗng.',
				minlength: "Mã loại dữ liệu phải có 3 kí tự",
				maxlength: 'Mã loại dữ liệu phải có 3 kí tự',
			},
			datatype_name: {
				required: 'Tên loại dữ liệu không được rỗng.',
				minlength: "Tên loại dữ liệu phải nhập ít nhất 3 ký tự",
				maxlength: 'Tên loại dữ liệu không được nhiều hơn 50 kí tự',
			},
			datatype_description: {
				maxlength: 'Mô tả về loại dữ liệu không được vượt quá 1024 kí tự',
			},
			datatype_unit: {
				required: 'Đơn vị của loại dữ liệu không được rỗng.',
				maxlength: 'Đơn vị không được vượt quá 20 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Looài thả nuôi*/
	$("#frmLoaiThaNuoi").validate({
		rules: {
			species_name: {
				required: true,
				minlength: 3,
				maxlength: 50,
			},
		},
		messages: {
			species_name: {
				required: 'Tên loài không được rỗng.',
				minlength: "Tên loài phải có ít nhất 3 kí tự",
				maxlength: 'Tên loài không được nhiều hơn 50 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Loại hoạt động*/
	$("#frmLoaiHoatDong").validate({
		rules: {
			actitype_name: {
				required: true,
				minlength: 3,
				maxlength: 50,
			},
		},
		messages: {
			actitype_name: {
				required: 'Tên loại hoạt động không được rỗng.',
				minlength: "Tên loại hoạt động phải có ít nhất 3 kí tự",
				maxlength: 'Tên loại hoạt động không được nhiều hơn 50 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	$("#frmVung").validate({
		rules: {
			region_name: {
				required: true,
				minlength: 5,
				maxlength: 255,
			},
			region_description: {
				maxlength: 1024,
			},
			ward_id: {
				valueNotEquals: "-1",
			},
		},
		messages: {
			region_name: {
				required: 'Tên vùng không được rỗng.',
				minlength: "Tên vùng phải có ít nhất 5 kí tự",
				maxlength: 'Tên vùng không được nhiều hơn 255 kí tự',
			},
			region_description: {
				maxlength: 'Tên vùng không được nhiều hơn 1024 kí tự',
			},
			ward_id: {
				valueNotEquals: 'Vui lòng chọn xã',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*form sensor*/
	$("#frmSensor").validate({
		rules: {
			sensor_name: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			datatype_id: {
				valueNotEquals: "-1",
			},
			station_id: {
				valueNotEquals: "-1",
			},
			sensor_serialNumber: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
		},
		messages: {
			sensor_name: {
				required: 'Tên sensor không được rỗng.',
				minlength: "Tên sensor phải có ít nhất 3 kí tự",
				maxlength: 'Tên sensor không được nhiều hơn 100 kí tự',
			},
			datatype_id: {
				valueNotEquals: 'Vui lòng chọn loại dữ liệu',
			},
			station_id: {
				valueNotEquals: 'Vui lòng chọn trạm',
			},
			sensor_serialNumber: {
				required: 'Số serial của sensor không được rỗng.',
				minlength: "Số serial của sensor phải có ít nhất 3 kí tự",
				maxlength: 'Số serial của sensor không được nhiều hơn 100 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Trạm*/
	$("#frmTram").validate({
		rules: {
			region_id: {
				valueNotEquals: "-1"
			},
			station_name: {
				required: true,
				minlength: 5,
				maxlength:100,
			},
			station_code: {
				required: true,
				minlength: 10,
				maxlength: 10,
			},
			station_secret: {
				required: true,
				minlength: 10,
				maxlength: 10,
			},
			station_address: {
				maxlength: 255,
			},
			station_duration: {
				required: true,
				number: true,
				range: [0,100],
			},
			station_location: {
				maxlength: 30,
			},
		},
		messages: {
			region_id: {
				valueNotEquals: "Vui lòng chọn vùng"
			},
			station_name: {
				required: 'Tên trạm không được rỗng.',
				minlength: "Tên trạm phải có ít nhất 5 kí tự",
				maxlength: "Tên trạm không được quá 100 kí tự",
			},
			station_code: {
				required: 'Mã xác định của trạm không được rỗng.',
				minlength: "Mã xác định của trạm phải là 10 kí tự",
				maxlength: 'Mã xác định của trạm phải là 10 kí tự',
			},
			station_secret: {
				required: 'Mã xác thực của trạm không được rỗng.',
				minlength: "'Mã xác thực của trạm phải là 10 kí tự",
				maxlength: 'Mã xác thực của trạm phải là 10 kí tự',
			},
			station_address: {
				maxlength: 'Địa chỉ của trạm không được nhiều hơn 255 kí tự',
			},
			station_duration: {
				required: 'Thời gian lấy dữ liệu của trạm không được rỗng.',
				number: "Thời gian lấy dữ liệu của trạm phải là số",
				range: 'Thời gian lấy dữ liệu của trạm không được quá lớn',
			},
			station_location: {
				maxlength: 'Tọa độ của trạm không được quá 30 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Ao*/
	$("#frmAo").validate({
		rules: {
			pond_width: {
				range: [1,5000],
				number:true,
			},
			pond_height: {
				range: [1,5000],
				number:true,
			},
			pond_depth: {
				range: [1,60],
				number:true,
			},
			pond_address: {
				minlength: 10,
				maxlength: 255,
			},
			pond_location: {
				minlength: 4,
				maxlength: 30,
			},
			region_id:{
				valueNotEquals: "-1",
			},
			user_id:{
				valueNotEquals: "-1",
			},
			pond_description: {
				required:true,
				minlength: 10,
				maxlength: 1024,
			},
		},
		messages: {
			pond_width: {
				range: "Dữ liệu không hợp lệ",
				number: "Vui lòng nhập số",
			},
			pond_height: {
				range: "Dữ liệu không hợp lệ",
				number: "Vui lòng nhập số",
			},
			pond_depth: {
				range: "Dữ liệu không hợp lệ",
				number: "Vui lòng nhập số",
			},
			pond_address: {
				minlength: "Mô tả về ao phải có ít nhất 10 kí tự",
				maxlength: 'Mô tả về ao không được nhiều hơn 255 kí tự',
			},
			pond_location: {
				minlength: "Vị trị của ao phải có ít nhất 5 kí tự",
				maxlength: "Vị trị của ao không được nhiều hơn 30 kí tự",
			},
			region_id:{
				valueNotEquals: "Vui lòng chọn vùng",
			},
			user_id:{
				valueNotEquals: "Vui lòng chọn chủ sở hữu",
			},
			pond_description: {
				required: "Mô tả về ao không được rỗng",
				minlength: "Mô tả về ao phải có ít nhất 10 kí tự",
				maxlength: "Mô tả về ao không được nhiều hơn 1024 kí tự",
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	/*Lời khuyên*/
	$("#frmTramDieuHanh").validate({
		rules: {
			sink_name: {
				required: true,
				minlength: 5,
				maxlength: 255,
			},
			sink_code: {
				required: true,
				minlength: 16,
				maxlength: 16,
			},
			sink_secret: {
				required: true,
				minlength: 16,
				maxlength: 16,
			},
			sink_address: {
				maxlength: 255,
			},
			sink_location: {
				maxlength: 30,
			},
			region_id: {
				valueNotEquals: "-1",
			},
		},
		messages: {
			sink_name: {
				required: 'Tên trạm điều hành không được rỗng.',
				minlength: 'Tên trạm điều hành phải có ít nhất 5 kí tự',
				maxlength: 'Lời khuyên không được vượt quá 255 kí tự',
			},
			sink_code: {
				required: 'Sink code không được rỗng',
				minlength: 'Sink code phải có 16 kí tự',
				maxlength: 'Sink code phải có 16 kí tự',
			},
			sink_secret: {
				required: 'Sink secret không được rỗng',
				minlength: 'Sink secret phải có 16 kí tự',
				maxlength: 'Sink secret phải có 16 kí tự',
			},
			sink_address: {
				maxlength: 'Địa chỉ trạm điều hành không được vượt quá 255 kí tự',
			},
			sink_location: {
				maxlength: 'Vị trí của trạm điều hành không được vượt quá 30 kí tự',
			},
			region_id: {
				valueNotEquals: 'Vui lòng chọn vùng',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
	//chua check email ngay sinh
	$("#frmTramSong").validate({
		/*Chưa check birthday*/
		rules: {
			river_name: {
				required: true,
				minlength: 4,
				maxlength: 255,
			},
			region_id: {
				valueNotEquals:"-1",
			},
			river_location: {
				maxlength: 30,
			},
			river_description: {
				maxlength: 1024,
			},
		},
		messages: {
			river_name: {
				required: 'Tên trạm sông không được rỗng',
				minlength: 'Tên trạm sông phải có ít nhất 4 kí tự',
				maxlength: 'Tên trạm sông không được vượt quá 255 kí tự',
			},
			region_id: {
				valueNotEquals: 'Vui lòng chọn vùng',
			},
			river_location: {
				maxlength: 'Vị trí của trạm sông không được vượt quá 30 kí tự',
			},
			river_description: {
				maxlength: 'Mô tả về trạm sông không được vượt quá 1024 kí tự',
			},
		},
		errorPlacement: function($error, $element) {
		    var name = $element.attr("name");
		    $("#error" + name).append($error);
		}
	});
}); // end document.ready
