function loadPRO(){
			$('#selectPRO').find('option').remove();
			$('#selectPRO').append($("<option></option>").attr("value",-1).text("Chọn tỉnh/TP"));
			jQuery.ajax({
				url: '<%=conf%>/api/location/getallprovince/',
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				success: function(resultdata) {
					for(i in resultdata.data){
						//alert(resultdata.data[i].province_id);
						$('#selectPRO').append($("<option></option>").attr("value",resultdata.data[i].province_id).text(resultdata.data[i].province_name));
					}
				},
				error: function(jqXHR,textStatus,errorThrown) {
					//called when there is an error
					//console.log(e.message);
				},
				timeout: 120000
			});
		}
//load quận/huyện theo id của tỉnh/tp

		function loadDIS(){
			var idPRO  = -1;
			$('#selectDIS').find('option').remove();
			$('#selectWARD').find('option').remove();
			$('#selectDIS').append($("<option></option>").attr("value",-1).text("Chọn quận/huyện"));
			idPRO = document.getElementById("selectPRO").value;
			jQuery.ajax({	
				url: '<%=conf%>/api/location/getdistrictbyprovince/'+idPRO,
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				success: function(resultdata){
					for(i in resultdata.data){
						$('#selectDIS').append($("<option></option>").attr("value",resultdata.data[i].district_id).text(resultdata.data[i].district_name));
					}
				},
				error: function(jqXHR,textStatus,errorThrown){
				},
				timeout: 120000
			});
		}
		//load xã/phường theo id của huyện
		function loadWARD(){
			var idDIS = -1;
			$('#selectWARD').find('option').remove();
			$('#selectWARD').append($("<option></option>").attr("value",-1).text("Chọn xã/phường"));
			idDIS = document.getElementById("selectDIS").value;
			jQuery.ajax({
				url: '<%=conf%>/api/location/getwardbydistrict/'+idDIS,
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				success: function(resultdata){
					for(i in resultdata.data){
						$('#selectWARD').append($("<option></option>").attr("value",resultdata.data[i].ward_id).text(resultdata.data[i].ward_name));
					}
				},
				error: function(jqXHR,textStatus,errorThrown){
					//show error
				},
				timeout: 120000
			});
			
		}