class RealTime{
	constructor(input){
		//Gan gia tri cac tham so truyen vao
		this.station_id = input.station_id; //ID tram
		this.socket = input.socket;	//Ket noi socket
		// Khai bao phuong thuc
		this.realTime();
	}

	// Dinh nghia cho phuong thuc realTime
	realTime(){
		var _station_id= this.station_id; //Khai bao bien giu lai ID tram
		this.socket.on("station_data_1_" + _station_id, function(data){	
			var station_selected = document.getElementById("slect_station").value; //Lay ma tram tren Select Input, dung khi xet dk hien thi
			var str = arrStation[_station_id].station_node; //Lay danh sach cac chat ho tro duoi dang chuoi
			var dataTypeSuport = str.split("|"); //Chuyen chuoi ve mang
			var html = ''; // HTML datatable row
			var temp = []; //Bien dung luu tam gia tri socket tra ve
			var maxDate = '';
            var maxDataValue = 0;
			//Kiem tra xem tram dang mo co trung voi socket tra ve khong, neu trung moi tiep tuc
			if(station_selected == _station_id){
				//Lap qua toan bo DataType trong DB
	            arrayDataType.forEach(function(dtype){
	            	temp[dtype.datatype_id] = {//Khoi tao gia tri cho tung bien tam tuong ung moi dataType
						value: null,
						date: null,
						date_chart:null,
						threshold_level:0   		         		
	            	};
	            	//Lap qua danh sach du lieu tra ve, di qua tung phan tu de tim du lieu tuong ung cua dataType o tren
	                data.forEach(function(dta){
	                	//Neu dataType khop va  tram ho ho tro kieu du lieu nay
	                    if(dtype.datatype_id==dta.datatype_id && dataTypeSuport.indexOf(dtype.datatype_id) != -1 ){
                        	//Dua tung loai gia tri vao bien tam
                        	if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                        		maxDataValue = moment(dta.data_createdDate).utc().valueOf();
	                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
	                        }
                        	temp[dtype.datatype_id].value = dta.data_value;
                        	temp[dtype.datatype_id].date = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        	temp[dtype.datatype_id].date_chart = moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss");
	                        temp[dtype.datatype_id].threshold_level = dta.threshold_level;
	                    }
	                }); 
	            });
	            //Kiem tra lai lan 2 xem co con o tram tuong ung voi socket khong de cap nhat datatable va chart
	            if(document.getElementById("slect_station").value == _station_id){
	            	//Kiem tra dataState xem tram co phai dang load du lieu hay khong
	            	if(dataState){ //Neu dang load bat time out 0.5s de cho
	            		var timeOut = setInterval(function(){
	            			if(!dataState){
	            				clearInterval(timeOut); //Xoa bo timeout
	            				blockSelectInput();//Tien hanh khoa Select Input
	            				//Lap qua tung loai du lieu trong DB
				            	arrayDataType.forEach(function(dtype){
				            		//Gan gia tri trong bien tam cho cac bien dung chung
				            		arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
				                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
				                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
				                    if($('#btnViewChart').prop('checked')){
				                    	if(arrayData[dtype.datatype_id].data.length > 50){
					                    	arrayData[dtype.datatype_id].data.shift();
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }else{
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }
				                    }
				                    //Tao HTML hien du lieu
				                    //Neu loai du lieu duoc tram ho tro moi tao HTML
				            		if(dataTypeSuport.indexOf(dtype.datatype_id) != -1){
				            			//Kiem tra so lieu
				            			if(arrayData[dtype.datatype_id].present_value!= null){
				            				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
								                arrayData[dtype.datatype_id].present_value = '-';
								                arrayData[dtype.datatype_id].date_present_value = '-';
								            }
				            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
				            			}else{
				            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
				            			}	
				            		}
				            	});
				            	$('#dataRow').html(html); //Hien datatable           
				                if($('#btnViewChart').prop('checked')){
				                	initChart(); //Hien chart
				                }
				                unblockSelectInput(); //Mo khoa Select Input	                
	            			}
	            		}, 500);
	            	}else{//Neu khong phai dang load du lieu tien hanh cap nhat 
	            		//Lap qua tung loai du lieu trong DB
	            		blockSelectInput();
		            	arrayDataType.forEach(function(dtype){
		            		//Gan gia tri trong bien tam cho cac bien dung chung
		            		arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
		                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
		                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
		                    if($('#btnViewChart').prop('checked')){
		                    	if(arrayData[dtype.datatype_id].data.length > 50){
			                    	arrayData[dtype.datatype_id].data.shift();
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }else{
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }
		                    }
		                    //Tao HTML hien du lieu
		                    //Neu loai du lieu duoc tram ho tro moi tao HTML
		            		if(dataTypeSuport.indexOf(dtype.datatype_id) != -1){
		            			//Kiem tra so lieu
		            			if(arrayData[dtype.datatype_id].present_value!= null){
		            				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
						                arrayData[dtype.datatype_id].present_value = '-';
						                arrayData[dtype.datatype_id].date_present_value = '-';
						            }
		            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
		            			}else{
		            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
		            			}	
		            		}
		            	});
		            	$('#dataRow').html(html); //Hien datatable
		            	if($('#btnViewChart').prop('checked')){
		            		initChart(); //Hien chart
		            	}           
		                unblockSelectInput(); //Mo khpa Select Input
	            	}
	            }
			}
		});
	}
}

class RealTimePondDynamic{
	constructor(input){
		//Gan gia tri cac tham so truyen vao
		this.pond_id = input.pond_id; //ID pond
		this.socket = input.socket;	// Ket noi socket
		// Khai bao phuong thuc
		this.realTime();
	}

	// Dinh nghia cho phuong thuc realTime
	realTime(){
		var _pond_id = this.pond_id; // Khai bao bien giu lai ID pond
		this.socket.on("station_data_0_" + _pond_id, function(data){	
			var pond_selected = document.getElementById("list_pond_river").value; //Lay ID pond tu select input
            var type_selected = document.getElementById("slect_pond_or_river").value; //Lay loai tram cam tay tu Select Input
            var html = '';// HTML datatable row
            var temp = []; //Bien dung luu tam gia tri socket tra ve
            var maxDate = '';
            var maxDataValue = 0;
            //Kiem tra xem tram dang mo co trung voi socket tra ve khong, neu trung moi tiep tuc
            if(pond_selected == _pond_id && type_selected ==1){
            	//Lap qua toan bo DataType trong DB
	            arrayDataType.forEach(function(dtype){
	            	temp[dtype.datatype_id] = {//Khoi tao gia tri cho tung bien tam tuong ung moi dataType
						value: null,
						date: null,
						date_chart: null,
						threshold_level:0   		         		
	            	};
	            	//Lap qua danh sach du lieu tra ve, di qua tung phan tu de tim du lieu tuong ung cua dataType o tren
	                data.forEach(function(dta){
	                	//Neu dataType khop 
	                    if(dtype.datatype_id==dta.datatype_id){
                        	//Dua tung loai gia tri vao bien tam
                        	if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                        		maxDataValue = moment(dta.data_createdDate).utc().valueOf();
	                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
	                        }
                        	temp[dtype.datatype_id].value = dta.data_value;
                        	temp[dtype.datatype_id].date = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        	temp[dtype.datatype_id].date_chart = moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss");
	                        temp[dtype.datatype_id].threshold_level = dta.threshold_level;
	                    }
	                }); 
	            });
	            //Kiem tra lai lan 2 xem co con o tram tuong ung voi socket khong de cap nhat datatable va chart
	            if(document.getElementById("list_pond_river").value == _pond_id && document.getElementById("slect_pond_or_river").value ==1){
	            	//Kiem tra dataState xem tram co phai dang load du lieu hay khong               
	                if(dataState){//Neu dang load bat time out 0.5s de cho
	                	var timeOut = setInterval(function(){
	            			if(!dataState){
	            				clearInterval(timeOut); //Xoa bo timeout
	            				blockSelectInput();//Tien hanh khoa Select Input
	            				//Lap qua tung loai du lieu trong DB
				            	arrayDataType.forEach(function(dtype){
				            		//Gan gia tri trong bien tam cho cac bien dung chung
				            		arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
				                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
				                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
				                    if($('#btnViewChart').prop('checked')){
				                    	if(arrayData[dtype.datatype_id].data.length > 50){
					                    	arrayData[dtype.datatype_id].data.shift();
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }else{
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }
				                    }
				                    //Tao HTML hien du lieu
			            			//Kiem tra so lieu
			            			if(arrayData[dtype.datatype_id].present_value!= null){
			            				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
							                arrayData[dtype.datatype_id].present_value = '-';
							                arrayData[dtype.datatype_id].date_present_value = '-';
							            }
			            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
			            			}else{
			            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
			            			}	
				            	});
				            	$('#dataRow').html(html); //Hien datatable
				            	if($('#btnViewChart').prop('checked')){
				            		initChart(); //Hien chart
				            	}           
				                unblockSelectInput(); //Mo khoa Select Input            
	            			}
	            		}, 500);
	                }else{//Neu khong phai dang load du lieu tien hanh cap nhat 
	            		//Lap qua tung loai du lieu trong DB
	            		blockSelectInput();
	                	arrayDataType.forEach(function(dtype){
		                	//Gan gia tri trong bien tam cho cac bien dung chung
		                	arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
		                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
		                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
		                    if($('#btnViewChart').prop('checked')){
		                    	if(arrayData[dtype.datatype_id].data.length > 50){
			                    	arrayData[dtype.datatype_id].data.shift();
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }else{
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }
		                    }
		                    //Tao HTML hien du lieu
		            		//Kiem tra so lieu
		        			if(arrayData[dtype.datatype_id].present_value!= null){
		        				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
					                arrayData[dtype.datatype_id].present_value = '-';
					                arrayData[dtype.datatype_id].date_present_value = '-';
					            }
		        				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
		        			}else{
		        				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
		        			}
		            	});
		            	$('#dataRow').html(html); //Hien datatable          
		                if($('#btnViewChart').prop('checked')){
		                	initChart(); //Hien chart
		                }
		                unblockSelectInput(); //Mo khpa Select Input
	                }
	            }
            }
		});
	}
}

class RealTimeRiverDynamic{
	constructor(input){
		//Gan gia tri cac tham so truyen vao
		this.river_id = input.river_id;//ID river
		this.socket = input.socket;	
		// Khai bao phuong thuc
		this.realTime();
	}

	// Dinh nghia cho phuong thuc
	realTime(){
		var _river_id= this.river_id;
		this.socket.on("station_data_2_" + _river_id, function(data){	
			var river_selected = document.getElementById("list_pond_river").value;
            var type_selected = document.getElementById("slect_pond_or_river").value;
            var html = '';//HTML datatable row
            var temp = []; //Bien dung luu tam gia tri socket tra ve
            var maxDate = '';
            var maxDataValue = 0;
            //Kiem tra xem tram dang mo co trung voi socket tra ve khong, neu trung moi tiep tuc
            if(river_selected == _river_id && type_selected ==2){
            	//Lap qua toan bo DataType trong DB
	            arrayDataType.forEach(function(dtype){
	            	temp[dtype.datatype_id] = {//Khoi tao gia tri cho tung bien tam tuong ung moi dataType
						value: null,
						date: null,
						date_chart: null,
						threshold_level:0   		         		
	            	};
	            	//Lap qua danh sach du lieu tra ve, di qua tung phan tu de tim du lieu tuong ung cua dataType o tren
	                data.forEach(function(dta){
	                	//Neu dataType khop 
	                    if(dtype.datatype_id==dta.datatype_id){
                        	//Dua tung loai gia tri vao bien tam
                        	if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                        		maxDataValue = moment(dta.data_createdDate).utc().valueOf();
	                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
	                        }
                        	temp[dtype.datatype_id].value = dta.data_value;
                        	temp[dtype.datatype_id].date = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        	temp[dtype.datatype_id].date_chart = moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss");
	                        temp[dtype.datatype_id].threshold_level = dta.threshold_level;
	                    }
	                }); 
	            });
	            //Kiem tra lai lan 2 xem co con o tram tuong ung voi socket khong de cap nhat datatable va chart
	            if(document.getElementById("list_pond_river").value == _river_id && document.getElementById("slect_pond_or_river").value ==2){
	            	//Kiem tra dataState xem tram co phai dang load du lieu hay khong               
	                if(dataState){//Neu dang load bat time out 0.5s de cho
	                	var timeOut = setInterval(function(){
	            			if(!dataState){
	            				clearInterval(timeOut); //Xoa bo timeout
	            				blockSelectInput();//Tien hanh khoa Select Input
	            				//Lap qua tung loai du lieu trong DB
				            	arrayDataType.forEach(function(dtype){
				            		//Gan gia tri trong bien tam cho cac bien dung chung
				            		arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
				                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
				                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
				                    if($('#btnViewChart').prop('checked')){
				                    	if(arrayData[dtype.datatype_id].data.length > 50){
					                    	arrayData[dtype.datatype_id].data.shift();
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }else{
					                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
					                    }
				                    }
				                    //Tao HTML hien du lieu
			            			//Kiem tra so lieu
			            			if(arrayData[dtype.datatype_id].present_value!= null){
			            				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
							                arrayData[dtype.datatype_id].present_value = '-';
							                arrayData[dtype.datatype_id].date_present_value = '-';
							            }
			            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
			            			}else{
			            				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
			            			}	
				            	});
				            	$('#dataRow').html(html); //Hien datatable
				            	if($('#btnViewChart').prop('checked')){
				            		initChart(); //Hien chart
				            	}         
				                unblockSelectInput(); //Mo khoa Select Input            
	            			}
	            		}, 500);
	                }else{//Neu khong phai dang load du lieu tien hanh cap nhat 
	            		//Lap qua tung loai du lieu trong DB
	            		blockSelectInput();
	                	arrayDataType.forEach(function(dtype){
		                	//Gan gia tri trong bien tam cho cac bien dung chung
		                	arrayData[dtype.datatype_id].present_value = temp[dtype.datatype_id].value;
		                	arrayData[dtype.datatype_id].date_present_value = temp[dtype.datatype_id].date;
		                    arrayData[dtype.datatype_id].threshold_level = temp[dtype.datatype_id].threshold_level;
		                    if($('#btnViewChart').prop('checked')){
		                    	if(arrayData[dtype.datatype_id].data.length > 50){
			                    	arrayData[dtype.datatype_id].data.shift();
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }else{
			                    	arrayData[dtype.datatype_id].data.push({date_create: temp[dtype.datatype_id].date_chart,data_value: temp[dtype.datatype_id].value});
			                    }
		                    }
		                    //Tao HTML hien du lieu
		            		//Kiem tra so lieu
		        			if(arrayData[dtype.datatype_id].present_value!= null){
		        				if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
					                arrayData[dtype.datatype_id].present_value = '-';
					                arrayData[dtype.datatype_id].date_present_value = '-';
					            }
		        				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
		        			}else{
		        				html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
		        			}
		            	});
		            	$('#dataRow').html(html); //Hien datatable          
		                if($('#btnViewChart').prop('checked')){
		                	initChart(); //Hien chart
		                }
		                unblockSelectInput(); //Mo khpa Select Input
	                }
	            }
            }
		});
	}
}

class NotifiDataUser{
	constructor(input){
		//Gan gia tri cac tham so truyen vao
		this.station_id = input.station_id;//ID user
		this.socket = input.socket;	
		// Khai bao phuong thuc
		this.realTime();
	}
	// Dinh nghia cho phuong thuc
	realTime(){
		var _station_id = this.station_id; //Khai bao bien giu lai ID user
		this.socket.on("notifi_data_" + _station_id, function(dta){
			if(a){
				var timeOut = setInterval(function(){
					if(!a){
						a = true;
						clearInterval(timeOut);
						var html = '<li class="bg-info" id="notifi'+ dta.notif_id +'">'+
                                '<a href="#" onclick="showNotifi('+ "'" + dta.notif_title + "'" + ',' + dta.notif_id + ',' + 0 + ',' + dta.threshold_id +','+ dta.data_id + ',' + "'" +dta.notif_createdDate + "'" +')">'+
                                    '<i class="fa fa-star-o text-aqua"></i>' + dta.notif_title + 
                                    '<p>Thời gian: ' + moment(dta.notif_createdDate).utc().format("DD-MM-YYYY, HH:mm") + '</p>' +
                                '</a>'+
                            '</li> ';

						$('.numberOfNotification').text(parseInt($('.numberOfNotification').html())+1);
						$("#listNotification li").last().remove();
						$('#listNotification').html(html + $('#listNotification').html());
						loadDataById(host,token,dta.data_id,function(rs){
							var station_id = rs.station_id;
							var value = rs.data_value;
							loadDataTypeById(host,token,rs.datatype_id,function(rs){
								if(arrayListenNotifi.indexOf(station_id) != -1){
									var audio = new Audio('/javascripts/farmer/alarm-frenzy.mp3');
					            	audio.play();
					        		Push.create(dta.notif_title , {
					                    body: "Độ đo "+ rs.datatype_name +" có giá trị " + value +". Nhấn để xem chi tiết",
					                    icon:"/dist/img/canhbao.jpg",
					                    timeout:10000,
					                    onClick: function () {
					                        window.focus();
					                        this.close();
					                        showNotifi(dta.notif_title,dta.notif_id,0,dta.threshold_id,dta.data_id,dta.notif_createdDate);
					                    }
					                });
								}
							});
						});
						a = false;
					}
				},1000);
			}else{
				a = true;
				var html = '<li class="bg-info" id="notifi'+ dta.notif_id +'">'+
                                '<a href="#" onclick="showNotifi('+ "'" + dta.notif_title + "'" + ',' + dta.notif_id + ',' + 0 + ',' + dta.threshold_id +','+ dta.data_id + ',' + "'" +dta.notif_createdDate + "'" +')">'+
                                    '<i class="text-aqua"></i>' + dta.notif_title + 
                                    '<p>Thời gian: ' + moment(dta.notif_createdDate).utc().format("DD-MM-YYYY, HH:mm") + '</p>' +
                                '</a>'+
                            '</li> ';

				$('.numberOfNotification').text(parseInt($('.numberOfNotification').html())+1);
				$("#listNotification li").last().remove();
				$('#listNotification').html(html + $('#listNotification').html());
				loadDataById(host,token,dta.data_id,function(rs){
					var station_id = rs.station_id;
					var value = rs.data_value;
					loadDataTypeById(host,token,rs.datatype_id,function(rs){
						if(arrayListenNotifi.indexOf(station_id) != -1){
							var audio = new Audio('/javascripts/farmer/alarm-frenzy.mp3');
			            	audio.play();
			        		Push.create(dta.notif_title , {
			                    body: "Độ đo "+ rs.datatype_name +" có giá trị " + value +".Nhấn để xem chi tiết",
			                    icon:"/dist/img/canhbao.jpg",
			                    timeout:10000,
			                    onClick: function () {
			                        window.focus();
			                        this.close();
			                        showNotifi(dta.notif_title,dta.notif_id,0,dta.threshold_id,dta.data_id,dta.notif_createdDate);
			                    }
			                });
						}
					});
				});
				a = false;
			}
		});
	}
}