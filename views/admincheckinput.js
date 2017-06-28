$(document).ready(function(){
	/*ĐỊNH NGHĨA ĐỂ XÉT TRƯỜNG HỢP CHƯA CHỌN SELECT*/
	$.validator.addMethod("valueNotEquals", function(value, element, arg){
  		return arg != value;
 	}, "Value must not equal arg.");

/*Người dùng*/
	// $("#frmNguoidung").validate({
	// 	rules: {
	// 		role_id:{
	// 			valueNotEquals: "-1",
	// 		},
	// 		user_fullName: {
	// 			required: true,
	// 			minlength: 3,
	// 			maxlength: 100,
	// 		},
	// 		user_userName: {
	// 			required: true,
	// 			minlength: 3,
	// 			maxlength: 100,
	// 		},
	// 		user_password: {
	// 			required: true,
	// 			minlength: ,
	// 			maxlength: 100,
	// 		},
	// 		re_user_password: {
	// 			required: true,
	// 			//equalTo: "#user_password",
	// 		},
	// 		user_birthday: {
	// 			required: true,
	// 		},
	// 		user_phone: {
	// 			required: true,
	// 			minlength: 9,
	// 			maxlength: 11,
	// 		},
	// 		user_email: {
	// 			required: true,
	// 			minlength: 3,
	// 			maxlength: 100,
	// 		},
	// 		user_address: {
	// 			required: true,
	// 			minlength: 3,
	// 			maxlength: 100,
	// 		},
			
	// 	},
	// 	messages: {
	// 		role_id: {
	// 			valueNotEquals: "Vui lòng chọn quyền",
	// 		},
	// 		user_fullName: {
	// 			required: 'Tên người dùng không được rỗng',
	// 			minlength: 'Tên người dùng phải có ít nhất 4 kí tự',
	// 			maxlength: 'Tên người dùng không được vượt quá 100 kí tự',
	// 		},
	// 		user_userName: {
	// 			required: 'Tài khoản người dùng không được rỗng',
	// 			minlength: 'Tài khoản người dùng phải có ít nhất 4 kí tự',
	// 			maxlength: 'Tài khoản người dùng không được vượt quá 100 kí tự',
	// 		},
	// 		user_password: {
	// 			required: 'Mật khẩu người dùng không được rỗng',
	// 			minlength: 'Mật khẩu người dùng phải có ít nhất 6 kí tự',
	// 			maxlength: 'Mật khẩu người dùng không được vượt quá 100 kí tự',
	// 		},
	// 		re_user_password: {
	// 			required: 'Nhập lại mật khẩu người dùng không được rỗng',
	// 			//equalTo: 'Không trùng khớp với mật khẩu',
	// 		},
	// 		user_birthday: {
	// 			required: 'Ngày sinh người dùng không được rỗng',
	// 		},
	// 		user_phone: {
	// 			required: 'Số điện thoại người dùng không được rỗng',
	// 			minlength: 'Số điện thoại người dùng phải có ít nhất 10 kí tự',
	// 			maxlength: 'Số điện thoại người dùng không được vượt quá 11 kí tự',
	// 		},
	// 		user_email: {
	// 			required: 'Email người dùng không được rỗng',
	// 			minlength: 'Email người dùng phải có ít nhất 4 kí tự',
	// 			maxlength: 'Email người dùng không được vượt quá 100 kí tự',
	// 		},
	// 		user_address: {
	// 			required: 'Địa chỉ người dùng không được rỗng',
	// 			minlength: 'Địa chỉ người dùng phải có ít nhất 4 kí tự',
	// 			maxlength: 'Địa chỉ người dùng không được vượt quá 100 kí tự',
	// 		},
			
	// 	},
	// 	//in loi ra giao dien
	// 	errorPlacement: function($error, $element) {
	// 		var name = $element.attr("name");
	// 		$("#error" + name).append($error);
	// 	}
	// });
$("#frmnguoidung").validate({
		rules: {
			
			role_id: {
				valueNotEquals: "-1",
			},
		},
		messages: {
			
			role_id: {
				valueNotEquals: "Vui lòng chọn danh mục sản phẩm",
			},
			
		},
		//in loi ra giao dien
		errorPlacement: function($error, $element) {
			var name = $element.attr("name");
			$("#error" + name).append($error);
		}
	});

/*Danh mục Bài viết*/
	$("#frmDanhmucaiviet").validate({
		rules: {
			
			postcate_name: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			postcate_picture: {
				required: true,
				maxlength: 500,
			},
			postcate_description: {
				maxlength: 500,
			},
			
		},
		messages: {
			
			postcate_name: {
				required: 'Tên danh mục bài viết không được rỗng',
				minlength: 'Tên danh mục bài viết phải có ít nhất 4 kí tự',
				maxlength: 'Tên danh mục bài viết không được vượt quá 100 kí tự',
			},
			
			postcate_picture: {
				required: 'Hình ảnh danh mục bài viết không được rỗng',
				maxlength: 'Hình ảnh danh mục bài viết không được vượt quá 100 kí tự',
			},
			postcate_description: {
				maxlength: 'Mô tả danh mục bài viết không được vượt quá 500 kí tự',
			},
			
		},
		//in loi ra giao dien
		errorPlacement: function($error, $element) {
			var name = $element.attr("name");
			$("#error" + name).append($error);
		}
	});


/*Bài viết*/
	$("#frmBaiviet").validate({
		rules: {
			postcate_id:{
				valueNotEquals: "-1",
			},
			post_title: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			post_smallPicture: {
				required: true,
				maxlength: 500,
			},
			post_description: {
				maxlength: 500,
			},
			post_content: {
				required: true,
				minlength: 9,
				
			},
			
		},
		messages: {
			postcate_id: {
				valueNotEquals: "Vui lòng chọn danh mục bài viết",
			},
			post_title: {
				required: 'Tiêu đề bài viết không được rỗng',
				minlength: 'Tiêu đề bài viết phải có ít nhất 4 kí tự',
				maxlength: 'Tiêu đề bài viết không được vượt quá 100 kí tự',
			},
			
			post_smallPicture: {
				required: 'Hình ảnh bài viết không được rỗng',
				maxlength: 'Hình ảnh bài viết không được vượt quá 100 kí tự',
			},
			post_description: {
				maxlength: 'Mô tả danh mục sản phẩm không được vượt quá 500 kí tự',
			},
			post_content: {
				required: 'Nội dung bài viết không được rỗng',
				minlength: 'Nội dung bài viết phải có ít nhất 10 kí tự',
				
			},
		},
		//in loi ra giao dien
		errorPlacement: function($error, $element) {
			var name = $element.attr("name");
			$("#error" + name).append($error);
		}
	});

	/*Danh mục sản phẩm*/
	$("#frmDanhmucsanpham").validate({
		rules: {
			prodcate_name: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			prodcate_image: {
				required: true,
				maxlength: 500,
			},
			prodcate_description: {
				maxlength: 500,
			},
			
		},
		messages: {
			prodcate_name: {
				required: 'Tên danh mục sản phẩm không được rỗng',
				minlength: 'Tên danh mục sản phẩm phải có ít nhất 4 kí tự',
				maxlength: 'Tên danh mục sản phẩm không được vượt quá 100 kí tự',
			},
			
			prodcate_image: {
				required: 'Hình ảnh danh mục sản phẩm không được rỗng',
				maxlength: 'Hình ảnh danh mục sản phẩm không được vượt quá 100 kí tự',
			},
			prodcate_description: {
				maxlength: 'Mô tả danh mục sản phẩm không được vượt quá 500 kí tự',
			},
			
		},
		//in loi ra giao dien
		errorPlacement: function($error, $element) {
			var name = $element.attr("name");
			$("#error" + name).append($error);
		}
	});

/*Loại sản phẩm*/
	$("#frmLoaisanpham").validate({
		rules: {
			prodtype_typeName: {
				required: true,
				minlength: 3,
				maxlength: 100,
			},
			prodcate_id: {
				valueNotEquals: "-1",
			},
		},
		messages: {
			prodtype_typeName: {
				required: 'Tên loại sản phẩm không được rỗng',
				minlength: 'Tên loại sản phẩm phải có ít nhất 4 kí tự',
				maxlength: 'Tên loại sản phẩm không được vượt quá 100 kí tự',
			},
			prodcate_id: {
				valueNotEquals: "Vui lòng chọn danh mục sản phẩm",
			},
			
		},
		//in loi ra giao dien
		errorPlacement: function($error, $element) {
			var name = $element.attr("name");
			$("#error" + name).append($error);
		}
	});

});//end