/*Hàm kiểm tra thêm vùng mới*/
function checkData_Region(){
	var region_name,
		selectWARD;
	region_name = $("#region_name").val();
	selectWARD = $("#selectWARD").val();
	var test_region_name = /(\w\d)|(\w)/; /*Cho phép nhập chuỗi và số hoặc chuỗi. Chưa test kĩ*/
	if(region_name == ""){
		$("#ErrorRegionName").text("Bạn chưa nhập tên vùng");
		$("#ErrorRegionName").css("display","block");
	}
	else if(!test_region_name.test(region_name)){
		$("#ErrorRegionName").text("Tên vùng không hợp lệ");
		$("#ErrorRegionName").css("display","block");
	}
	else if(region_name.length >= 55){
		$("#ErrorRegionName").text("Tên vùng quá dài");
		$("#ErrorRegionName").css("display","block");
		console.log(region_name.length);
	}
	else if(selectWARD == -1){
		$("#ErrorWardId").text("Bạn chưa chọn xã");
		$("#ErrorWardId").css("display","block");
	}
	else{
		return true;
	}
	return false;
}