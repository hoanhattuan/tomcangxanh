/*
    Ham khoi tao cac object lang nghe socket o cac tram
*/

function initSocket(){
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    //Duyet qua ds cac tram trong mang arrStation
    //Khoi tao Object Realtime, luu vao listOfStation
    arrStation.forEach(function(rs){
        listOfStation[rs] = new RealTime({ station_id: rs.station_id, socket: socket});
    });
    //Goi API lay ve danh sach ao cua user
    //Duyet va khoi tao object ReatimePondDynamic, luu vao listOfPondDyNamic 
    loadPondByUser(host,token,userId,function(ponds){
        ponds.forEach(function(rs){
            listOfPondDynamic[rs.pond_id] = new RealTimePondDynamic({ pond_id: rs.pond_id, socket: socket});
        });
    });
    //Goi API lay ve danh sach song
    //Duyet va khoi tao object ReatimeRiverDynamic, luu vao listOfRiverDyNamic 
    loadRiverByUser(host,token,userId,function(river){
        river.forEach(function(rs){
            listOfRiverDynamic[rs.river_id] = new RealTimeRiverDynamic({ river_id: rs.river_id, socket: socket});
        });   
    });
}

/*
    Ham hien thi loi
    errorMessage: Noi dung loi
    element: object DOM vi tri dac loi
*/

function showError(errorMessage,element){
    var contentError = 
        '<div class="alert alert-danger text-left">'+ errorMessage +
        '</div>';
    element.html(contentError);
}

/*
    Ham lay danh sach cac ao cua nguoi dung
    host: Dia chi may chu API
    token: Chung thuc cho API
    userID: ID dinh danh cho nguoi dung
    callback: Ham duoc goi sau khi co ket qua tra ve
*/

function loadPondByUser(host,token,userId,callback){
    var request = $.ajax({
        url : host + '/api/pond/getlistbyuser/' + userId ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin ao, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin ao, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach song
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham duoc goi sau khi co ket qua tra ve
*/

function loadRiverByUser(host,token,userID,callback){
    var request = $.ajax({
        url : host + '/api/river/getbyuser/' + userID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin sông, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin sông, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham khoi tao noi dung trang Xem Du Lieu Do
*/

function initViewDataPage(){
    setDefaultViewDataPage() // Set up cac thanh phan ban dau cua trang
    //Lay cac kieu du lieu tu DB
    loadDataType(host,token,function(result){
        //Mang dung de chua du lieu tam thoi cua DataType
        var tempArr = [];
        //Lap qua result dua cac dataType vao mang tam
        result.forEach(function(dtype){ 
            tempArr.push(dtype); 
        });
        //Tien hanh sap xep mang tam theo ID tang dan
        tempArr.sort(function(a,b){
            return parseInt(a.datatype_id) - parseInt(b.datatype_id);
        });
        //Dua du lieu cua mang tam sau khi da sap xep vao ArrayDataType
        tempArr.forEach(function(dtype){
            arrayDataType.push(dtype);
        });
        //Khoi tao cac object, tuong ung voi cac kieu du lieu duoc ho tro
        arrayDataType.forEach(function(dtype){
            /*
                present_value: gia tri moi nhat cua loai du lieu
                date_present_value: ngay cua du lieu moi nhat
                threshold_level: cap do canh bao moi nhat cua loai du lieu, mac dinh 0
                data: mang chua cac gia tri theo khoang thoi gian, dung cho chart
            */
            arrayData[dtype.datatype_id] = {
                present_value:null,
                date_present_value:null,
                threshold_level:0,
                data: []
            };
        });
        loadDataOfDefaultStation(); //Goi ham hien thi du lieu tram mac dinh
    });
}

/*
    Ham thiet lap cac thanh phan ban dau cua trang xem du lieu
*/

function setDefaultViewDataPage(){
    //Thiet lap datetimepicker cho 2 Select Input
    //Format hien thi DD/MM/YYYY HH:mm (21/11/1995 15:10)
    $("#start_date" ).datetimepicker({format: 'DD/MM/YYYY HH:mm',locale:'vi'});   
    $("#end_date" ).datetimepicker({format: 'DD/MM/YYYY HH:mm',locale:'vi'});
    hideMainChart(); //An di phan main chart
    setDefaultDate(); //Set ngay mac dinh cho chart
    hideSelectPondOrRiver(); //An di input select chon loai tram cam tay
    hideListPondRiver(); //An di select input dung chon ao hay song khi chon tram cam tay 
}

/*
    Ham set ngay mac dinh
    Ngay ket thuc: thoi diem hien tai
    Ngay bat dau : ngay ket thuc - 1
*/

function setDefaultDate(){
    var dateEnd = new Date();//Ngay ket thuc
    var dateStart = new Date(dateEnd.getTime() - (1*86400000)); //Ngay bat dau 
    $("#end_date" ).datetimepicker('defaultDate',dateEnd); 
    $("#start_date" ).datetimepicker('defaultDate',dateStart);
    //alert($("#start_date").data("DateTimePicker").date());
}

/*
    Ham lay ve cac kieu du lieu trong DB 
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham duoc goi sau khi co ket qua tra ve   
*/

function loadDataType(host,token,callback){
    var request = $.ajax({
            url : host + '/api/datatype/getall',
            method : 'GET',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization': token 
            }
        });
        request.done(function(result){
            if(result.Error){
                showError("Không lấy được loại dữ liệu, nhấn F5 để tải lại trang",$('#error'));
            }else{
                callback(result.data);
            }
        });
        request.fail(function(jqXHR, textStatus){
            showError("Không lấy được loại dữ liệu, nhấn F5 để tải lại trang",$('#error'));
        });
}

/*
    Ham lay du lieu cua tram theo khoang thoi gian, co 6 tham so
    host: Dia chi may chu API
    token: Chung thuc cho API
    station_id: ID cua tram can lay du lieu
    start_date: Ngay bat dau
    end_date: Ngay ket thuc
    callback: Ham goi lai sau khi lay xong du lieu
*/

function loadDataByStation(host,token,station_id,start_date,end_date,callback){
    var url = host + '/api/data/getbystation/' + station_id + '?dateStart='+ start_date + '&dateEnd=' + end_date; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không truy vấn được dữ liệu của trạm, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //stationData chua mang cac du lieu thu duoc
            arrayDataType.forEach(function(dtype){
                arrayData[dtype.datatype_id].data=[];//Reset mang du lieu cua tung dataType ve rong
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        //Day gia tri vao dau mang, do Data tra ve sap theo ID giam
                        arrayData[dtype.datatype_id].data.unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss"),data_value:dta.data_value});
                    }
                });          
            });
            callback();                    
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được dữ liệu của trạm, nhấn F5 để tải lại trang",$('#error'));
    });
}
/*
    Ham tra ve HTML cua mot loai du lieu, co 4 tham so
    threshold_level: Cap do canh bao cua loai du lieu
    dtype_name: Ten loai du lieu
    value: Gia tri
    dtype_unit: Don vi cua loai do
    date: ngay
*/
function valiThreshold(threshold_level,dtype_name,value,dtype_unit,date){
    var td = '';
    switch(threshold_level){
        case 0:
            td +=    '<tr class="text-center"><td><span style="color:black;">'+ 
                        dtype_name +'</span></td><td><span style="color:black;"><strong>'+ value +'</strong></span></td><td><span style="color:black;">'+ dtype_unit +'</span></td><td><span style="color:black;">'+ date +'</span></td></tr>'; 
            break;
        case 1:
            td +=    '<tr class="text-center"><td><span style="color:blue;">'+ 
                        dtype_name +'</span></td><td><span style="color:blue;"><strong>'+ value +'</strong></span></td><td><span style="color:blue;">'+ dtype_unit +'</span></td><td><span style="color:blue;">'+ date +'</span></td></tr>';  
            break;
        default:
            td +=    '<tr class="text-center"><td><span style="color:red;">'+ 
                        dtype_name +'</span></td><td><span style="color:red;"><strong>'+ value +'</strong></span></td><td><span style="color:red;">'+ dtype_unit +'</span></td><td><span style="color:red;">'+ date +'</span></td></tr>'; 
            break;
    }
    return td;
}

/*
    Ham hien thi bang du lieu cua cac so do o tram co dinh
*/

function showDataTableOfStation(maxDate){
    //Lay gia tri cua chuoi station_node tu mang arrStation, conver station_node ve chuoi
    var str = arrStation[$("#slect_station").val()].station_node;
    var dataTypeSuport = str.split("|");
    //Dinh nghia HTML cua datatable
    var html = 
        '<div class="col-md-12">'+
            '<table class="table table-bordered table-hover table-striped" id="dataTable">'+
                '<thead>'+
                    '<tr class="text-center bg-primary">'+     
                        '<th width = "25%" class="text-center">Thuộc tính</th>'+
                        '<th class="text-center" width = "10%">Giá trị</th>'+
                        '<th class="text-center" width = "10%">Đơn vị</th>'+  
                        '<th class="text-center">Thời gian</th>'+ 
                    '</tr>'+                
                '</thead>'+
                '<tbody id="dataRow">';
    //Lap qua mang arrayDataType de doc gia tri cua arrayData
    arrayDataType.forEach(function(dtype){
        if(dataTypeSuport.indexOf(dtype.datatype_id) != -1){//Kiem tra loai du lieu co duoc tram ho tro
            //Kiem tra gia tri cua tung loai du lieu
            if(arrayData[dtype.datatype_id].present_value != null){//Neu co gia tri
                //Kiem tra du lieu moi nhat
                if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
                    arrayData[dtype.datatype_id].present_value = '-';
                    arrayData[dtype.datatype_id].date_present_value = '-';
                }
                html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
            }else{//Neu khong co gia tri
                html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
            }
        }
    });
    //Ket thuc html cua bang du lieu
    html += '</tbody>'+
                '</table>'+
                '</div>';
    $('#mainContent').html(html); //Hien thi len man hinh
}

/*
    Ham hien du lieu cac so do o cac tram khong phai la tram co dinh
*/

function showDataTable(maxDate){
    //Dinh nghia HTML cua datatable
    var html = 
        '<div class="col-md-12">'+
            '<table class="table table-bordered table-hover table-striped" id="dataTable">'+
                '<thead>'+
                    '<tr class="text-center bg-primary">'+     
                        '<th width = "25%" class="text-center">Thuộc tính</th>'+
                        '<th class="text-center" width = "10%">Giá trị</th>'+
                        '<th class="text-center" width = "10%">Đơn vị</th>'+  
                        '<th class="text-center">Thời gian</th>'+ 
                    '</tr>'+                
                '</thead>'+
                '<tbody id="dataRow">';
    //Lap qua mang arrayDataType de doc gia tri cua arrayData
    arrayDataType.forEach(function(dtype){
        //Kiem tra gia tri cua tung loai du lieu
        if(arrayData[dtype.datatype_id].present_value != null){//Neu co gia tri
            //Kiem tra du lieu moi nhat
            if(maxDate!=arrayData[dtype.datatype_id].date_present_value){
                arrayData[dtype.datatype_id].present_value = '-';
                arrayData[dtype.datatype_id].date_present_value = '-';
            }
            html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,arrayData[dtype.datatype_id].present_value,dtype.datatype_unit,arrayData[dtype.datatype_id].date_present_value);
        }else{//Neu khong co gia tri
            html += valiThreshold(arrayData[dtype.datatype_id].threshold_level,dtype.datatype_name,'-',dtype.datatype_unit,'-');
        }
    });
    //Ket thuc html cua bang du lieu
    html += '</tbody>'+
                '</table>'+
                '</div>';
    $('#mainContent').html(html); //Hien thi len man hinh
}

/*
    Ham load du lieu cua tram mac dinh
*/

function loadDataOfDefaultStation(){
    if($("#slect_station").val() > 0){ //value > 0 mac dinh o tram co dinh
        dataState = true; //Bat flash dang load du lieu
        blockSelectInput(); //Khoa cac Select Input
        $('#titleOfDataTable').html('<b>' + arrStation[$("#slect_station").val()].station_name + '</b>');
        //Lay du lieu moi nhat cho datatable
        loadTopByStation(host,token,$("#slect_station").val(),function(maxDate){
            showDataTableOfStation(maxDate); // Hien thi datatable
            dataState = false; //Tat flash dang load du lieu
            unblockSelectInput();//Mo khoa cac Select Input
            initSocket();              
        });
    }else if($("#slect_station").val() == 0){// value < 0 tram cam tay
        hideBtnViewChart();
        showSelectPondOrRiver();// Hien select input chon loai tram cam tay
        $('#titleOfDataTable').html('');
        initSocket();
    }else{
        hideBtnViewChart();
        $('#titleOfDataTable').html('');
        initSocket();
    }
}

/*
    Ham lay du lieu moi nhat theo tram, danh sach kieu du lieu tra ve tuy vao station_node cua tram
    host: Dia chi may chu API
    token: Chung thuc cho API
    station_id: ID cua tram lay du lieu
    callback: Ham goi lai sau khi lay xong du lieu
*/

function loadTopByStation(host,token,station_id,callback){
    var url = host + '/api/data/gettopbystation/' + station_id; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được dữ liệu mới nhất của trạm, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //Mang chua du lieu API tra ve
            var maxDate = '';
            var maxDataValue = 0;
            //Duyet mang arraayDataType va arrayData
            //Kiem tra va cap nhat du lieu moi nhat
            arrayDataType.forEach(function(dtype){
                arrayData[dtype.datatype_id].present_value = null;// Reset du lieu moi nhat
                arrayData[dtype.datatype_id].date_present_value = null;//Reset ngay cua du lieu moi nhat
                arrayData[dtype.datatype_id].threshold_level = 0;//Reset cap do bao ve
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        //alert(moment(dta.data_createdDate).utc().valueOf());
                        if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                            maxDataValue = moment(dta.data_createdDate).utc().valueOf();
                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        }
                        arrayData[dtype.datatype_id].present_value = dta.data_value;
                        arrayData[dtype.datatype_id].date_present_value = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        arrayData[dtype.datatype_id].threshold_level = dta.threshold_level;
                    }
                });           
            });
            callback(maxDate);                         
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được dữ liệu mới nhất của trạm, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham hien thi cac radio button chon loai du lieu cua bieu do
    dataTypeSupport: Mang cac ID dataType ho tro neu la tram co dinh, neu tham so nay de null
*/

function showRadioDataType(){ 
    var count = 1 ; //Bien dem de xac dinh radio duoc active
    var html ="<label>Loại dữ liệu</label>"; //Khoi tao html
    $('#radio_datatype').html('');//Xoa cac radio cu
    //Kiem tra loai tram goi ham
    if($('#slect_station').val()>0){//Tram co dinh
        var str = arrStation[$("#slect_station").val()].station_node;//Lay gia tri cua chuoi station_node tu mang arrStation
        var dataTypeSuport = str.split("|");//conver station_node ve mang de lay danh sach ca dataType tram ho tro
        //Duyet qua tung loai du lieu va kiem tra xem station co ho tro khong
        arrayDataType.forEach(function(dtype){
            if(dataTypeSuport.indexOf(dtype.datatype_id) != -1 ){//Loai du lieu co ho tro, tien hanh tao html
                if(count == 1){//count == 1, vi tri dau tao html active radio
                    count++;
                    html+=
                        '<div class="radio">'+
                            '<label>'+
                                '<input type="radio" name="radioDataType" value="'+ dtype.datatype_id +'" checked onclick="initChart()">' +
                                dtype.datatype_name +
                            '</label>'+
                        '</div>';
                }else{//Vi tri thu 2 tro di khong can active
                    count++;
                    html+=
                        '<div class="radio">'+
                            '<label>'+
                                '<input type="radio" name="radioDataType" value="'+ dtype.datatype_id +'" onclick="initChart()">' +
                                dtype.datatype_name +
                            '</label>'+
                        '</div>';
                }
            }
        });        
    }else{//Cac loai tram con lai
        //Duyet qua tung loai du lieu, do ko phai tram bth nen ko can kiem tra dataType co ho tro khong
        arrayDataType.forEach(function(dtype){
            if(count == 1){//count = 1 vitri dau html co active
                count++;
                html+=
                    '<div class="radio">'+
                        '<label>'+
                            '<input type="radio" name="radioDataType" value="'+ dtype.datatype_id +'" checked onclick="initChart()">' +
                            dtype.datatype_name +
                        '</label>'+
                    '</div>';
            }else{//Vi tri thu 2 tro di ko tao active
                count++;
                html+=
                    '<div class="radio">'+
                        '<label>'+
                            '<input type="radio" name="radioDataType" value="'+ dtype.datatype_id +'" onclick="initChart()">' +
                            dtype.datatype_name +
                        '</label>'+
                    '</div>';
            }        
        });
    }  
    $('#radio_datatype').html(html);//Hien thi cac radio button len man hinh
}

/*
    Ham khoa cac Select Input, chong mat dong bo du lieu
*/

function blockSelectInput(){
    //Bat cac attribute disabled
    $('#slect_station').attr('disabled',true);// Select Input Chon tram 
    $('#slect_pond_or_river').attr('disabled',true);// Select Input Chon loai tram cam tay
    $('#list_pond_river').attr('disabled',true);// Select Input Chon ao hoac song cua tram cam tay
    $('#start_date').attr('disabled',true); // Select Input Chon ngay bat dau
    $('#end_date').attr('disabled',true);// Select Input Chon ngay ket thuc
    $('#btnViewCustom').attr('disabled',true);// Select Input Chon button xem bieu do
    $('#btnViewChart').bootstrapToggle('disable');
}

/*
    Ham mo khoa cac Select Input
*/

function unblockSelectInput(){
    //Tat cac attribute disabled
    $('#slect_station').attr('disabled',false);// Select Input Chon tram 
    $('#slect_pond_or_river').attr('disabled',false);// Select Input Chon loai tram cam tay
    $('#list_pond_river').attr('disabled',false);// Select Input Chon ao hoac song cua tram cam tay
    $('#start_date').attr('disabled',false);// Select Input Chon ngay bat dau
    $('#end_date').attr('disabled',false);// Select Input Chon ngay ket thuc
    $('#btnViewCustom').attr('disabled',false);// Select Input Chon button xem bieu do
    $('#btnViewChart').bootstrapToggle('enable');
}

/*
    Ham an Select Input chon loai tram cam tay   
*/

function hideSelectPondOrRiver(){
    $('#slect_pond_or_river').find('option').remove(); // Xoa het option trong Select Input
    $("#slect_pond_or_river").hide(); //An select input
}

/*
    Ham an Select Input chon ao hoac song cua tram cam tay
*/

function hideListPondRiver(){
    $('#list_pond_river').find('option').remove();// Xoa het option trong Select Input
    $("#list_pond_river").hide();//An select input
}

/*
    Ham hien select input chon loai tram cam tay
*/

function showSelectPondOrRiver(){
    //Thiet lap cac option: 0 la yeu cau chon, 1 tram cam tay ao, 2 tram cam tay song
    $("#slect_pond_or_river").append($("<option></option>").attr("value",0).text("Chọn vị trí cần xem"));
    $("#slect_pond_or_river").append($("<option></option>").attr("value",1).text("Dữ liệu cầm tay ở ao"));
    $("#slect_pond_or_river").append($("<option></option>").attr("value",2).text("Dữ liệu cầm tay ở sông"));
    $("#slect_pond_or_river").show(); //Hien select input
}

/*
    Ham hien thi select input danh sach ao cua nguoi khung khi chon tram cam tay
*/
function showListPond(){
    $("#list_pond_river").append($("<option></option>").attr("value",0).text("Chọn ao cần xem"));
    //Lay ve danh sach cac ao cua nguoi dung
    loadPondByUser(host,token,userId,function(ponds){
        //Lap qua mang cac ao, dua vao Select Input
        ponds.forEach(function(rs){
            $("#list_pond_river").append($("<option></option>").attr("value",rs.pond_id).text("Ao nuôi số " + rs.pond_id));
        });
        $("#list_pond_river").show();//Hien thi ra man hinh
    });
    
}

/*
    Ham hien Select Input danh sach song khi chon xem du lieu cam tay
*/

function showListRiver(){
    $("#list_pond_river").append($("<option></option>").attr("value",0).text("Chọn vị trí sông cần xem"));
    //Lay ve du lieu cac song
    loadRiverByUser(host,token,userId,function(river){
        //Lap qua kq va dua vao Select Input
        river.forEach(function(rs){
            $("#list_pond_river").append($("<option></option>").attr("value",rs.river_id).text(rs.river_name));
        });
        $("#list_pond_river").show();//Hien thi ra man hinh    
    });
}

/*
    Ham hien giao dien bieu do
*/

function showMainChart(){
    $('#mainChart').show();
}

/*
    Ham an giao dien bieu do
*/

function hideMainChart(){
    $("#radio_datatype").find('*').remove();
    $('#mainChart').hide();
} 

/*
    Ham reset mang chua du lieu arrayData
*/
function resetArrayData(){
    //Duyet qua tung loai du lieu
    arrayDataType.forEach(function(dtype){
        arrayData[dtype.datatype_id].present_value=null;//Gia tri moi nhat
        arrayData[dtype.datatype_id].date_present_value = null;//Ngay cua gia tri moi nhat
        arrayData[dtype.datatype_id].threshold_level=0;//Cap do canh bao
        arrayData[dtype.datatype_id].data=[];//Mang cac gia tri   
    });
}

/*
    Ham an datatable cac gia tri do
*/

function hideDataTable(){
    $('#dataRow').html('');
}

/*
    Ham thiet lap cac thong so cho bieu do
*/

function drawChart() {
    var radCheck ; //Bien giu gia tri radio
    var options; //Bien tuy chinh chart
    var dns = [];//Mang du lieu 
    var data = new google.visualization.DataTable();
    var strTitle = 'Biểu đồ theo dõi ';
    var strDataType;
    //Lay loai du lieu tu radio botton
    for(var i = 0 ; i < document.getElementsByName("radioDataType").length ; i++){
        if(document.getElementsByName("radioDataType")[i].checked){
            radCheck= document.getElementsByName("radioDataType")[i].value;
        }
    }
    arrayDataType.forEach(function(dtype){
        if(radCheck==dtype.datatype_id){
            strTitle+= dtype.datatype_name.toLowerCase();
            strDataType = dtype.datatype_name;
        }
    });
    //Dua vao ten hai truong du lieu
    dns.push([{label: 'Ngày', type: 'datetime'},{label: strDataType , type: 'number'}]);
    //Load du lieu trong bien dung chung cua loai du lieu radCheck vao dns
    arrayData[radCheck].data.forEach(function(rs){
        dns.push([new Date(rs.date_create),rs.data_value]);
    });
    if(dns.length==1){
        showError('Không có dữ liệu của '+ strDataType.toLowerCase(),$('#errorChart'));
    }else{
        $('#errorChart').find('*').remove();
    }
    //kiem tra du lieu hien co
    // if(dns.length == 1){//Khong co du lieu, chi co 1 dong ten hai truong
    //     dns.push([new Date(),parseFloat(0)]);
    //     options = {
    //         title: 'Biểu đồ theo dõi ' + radCheck,
    //         vAxis: {
    //             title: "Giá trị",
    //             minValue: 0,
    //             maxValue: 5
    //         },
    //         hAxis: {
    //             title: "Thời gian"   
    //         },
    //         series:{
    //             0: { lineWidth: 0 }
    //         }
    //     };
    // }
    options = {
        title: strTitle,
        vAxis: {
            title: "Giá trị"
        },
        hAxis: {
            title: "Thời gian" ,
            gridlines: {
                count: -1,
                units: {
                  days: {format: ['MMM dd']},
                  hours: {format: ['HH:mm', 'ha']},
                }
            },
            minorGridlines: {
                units: {
                  hours: {format: ['hh:mm:ss a', 'ha']},
                  minutes: {format: ['HH:mm a Z', ':mm']}
                }
            }  
        }
    };
    var data = google.visualization.arrayToDataTable(dns);
    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    chart.draw(data, options);
}

// function drawChart() {
//     var radCheck ;
//     for(var i = 0 ; i < document.getElementsByName("radioDataType").length ; i++){
//         if(document.getElementsByName("radioDataType")[i].checked){
//             radCheck= document.getElementsByName("radioDataType")[i].value;
//         }
//     }
//     var data = new google.visualization.DataTable();
//     var dns = [];
//     data.addColumn('date', 'Thời gian');
//     data.addColumn('number', 'DO');
//     arrayData[radCheck].data.forEach(function(rs){
//         dns.push([new Date(rs.date_create), rs.data_value]);
//     });
//     data.addRows(dns);
//     var options = {
//             title: 'Biểu đồ theo dõi ' + radCheck,
//             hAxis: {
//                 format: 'd/M/yyyy'
//             }
//         };
//     var chart = new google.visualization.LineChart(document.getElementById('chart'));
//     chart.draw(data, options);
// }

/*
    Ham ve bieu do
*/

function initChart(){
    google.charts.load('current', {'packages':['corechart'],'language': 'vi'});//Load thu vien
    google.charts.setOnLoadCallback(drawChart);//Goi ham ve
}

/*
    Ham lay du lieu moi nhat theo pondId cua tram cam tay
    host: Dia chi may chu API
    token: Chung thuc cho API
    pond_id: ID cua pond
    callback: Ham goi lai sau khi lay xong du lieu
*/

function loadTopByPondDynamic(host,token,pond_id,callback){
    var url = host + '/api/data/gettopbyponddynamic/' + pond_id; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được dữ liệu mới nhất của trạm cầm tay ở ao, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //Mang du lieu moi nhat cua tram
            var maxDate = '';
            var maxDataValue = 0;
            arrayDataType.forEach(function(dtype){ //Duyet qua mang datatype de lay tung phan tu cua arrayData
                arrayData[dtype.datatype_id].present_value = null;// Reset du lieu moi nhat
                arrayData[dtype.datatype_id].date_present_value = null;//Reset ngay cua du lieu moi nhat
                arrayData[dtype.datatype_id].threshold_level = 0;//Reset cap do canh bao
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                            maxDataValue = moment(dta.data_createdDate).utc().valueOf();
                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        }
                        arrayData[dtype.datatype_id].present_value = dta.data_value;
                        arrayData[dtype.datatype_id].date_present_value = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        arrayData[dtype.datatype_id].threshold_level = dta.threshold_level;
                    }
                });           
            });
            callback(maxDate);                         
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được dữ liệu mới nhất của trạm cầm tay ở ao, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay du lieu moi nhat theo riverId cua tram cam tay
    host: Dia chi may chu API
    token: Chung thuc cho API
    river_id: ID cua pond
    callback: Ham goi lai sau khi lay xong du lieu
*/

function loadTopByRiverDynamic(host,token,river_id,callback){
    var url = host + '/api/data/gettopbyriverdynamic/' + river_id; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được dữ liệu mới nhất của trạm cầm tay ở sông, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //Mang du lieu moi nhat cua tram
            var maxDate = '';
            var maxDataValue = 0;
            arrayDataType.forEach(function(dtype){//Duyet qua mang datatype de lay tung phan tu cua arrayData
                arrayData[dtype.datatype_id].present_value = null;// Reset du lieu moi nhat
                arrayData[dtype.datatype_id].date_present_value = null;//Reset ngay cua du lieu moi nhat
                arrayData[dtype.datatype_id].threshold_level = 0;//Reset cap do canh bao
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        if(maxDataValue < moment(dta.data_createdDate).utc().valueOf()){
                            maxDataValue = moment(dta.data_createdDate).utc().valueOf();
                            maxDate = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        }
                        arrayData[dtype.datatype_id].present_value = dta.data_value;
                        arrayData[dtype.datatype_id].date_present_value = moment(dta.data_createdDate).utc().format("DD-MM-YYYY, HH:mm");
                        arrayData[dtype.datatype_id].threshold_level = dta.threshold_level;
                    }
                });           
            });
            callback(maxDate);                         
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được dữ liệu mới nhất của trạm cầm tay ở sông, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay du lieu cua tram cam tay o ao theo thoi gian
    host: Dia chi may chu API
    token: Chung thuc cho API
    pond_id: ID cua ao can lay du lieu cam tay
    start_date: Ngay bat dau
    end_date: Ngay ket thuc
    callback: Ham goi lai khi lay xong du lieu
*/

function loadDataByPondDynamic(host,token,pond_id,start_date,end_date,callback){
    var url = host + '/api/data/getbyponddynamic/' + pond_id + '?dateStart='+ start_date + '&dateEnd=' + end_date; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không truy vấn được dữ liệu của trạm cầm tay ở ao, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //Mang cac du lieu thu duoc tu tram
            arrayDataType.forEach(function(dtype){
                arrayData[dtype.datatype_id].data=[];//Reset mang du lieu cua tung loai phan tu
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        //Cap nhat gia tri vao dau mang data, do du lieu tra ve co ID giam dan
                        arrayData[dtype.datatype_id].data.unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss"),data_value:dta.data_value});
                    }
                });          
            });
            callback();                             
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được dữ liệu của trạm cầm tay ở ao, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay du lieu cua tram cam tay o song theo thoi gian
    host: Dia chi may chu API
    token: Chung thuc cho API
    river_id: ID cua song can lay du lieu cam tay
    start_date: Ngay bat dau
    end_date: Ngay ket thuc
    callback: Ham goi lai sau khi lay xong du lieu
*/

function loadDataByRiverDynamic(host,token,river_id,start_date,end_date,callback){
    var url = host + '/api/data/getbyriverdynamic/' + river_id + '?dateStart='+ start_date + '&dateEnd=' + end_date; 
    var request = $.ajax({
        url : url ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không truy vấn được dữ liệu của trạm cầm tay ở sông, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var stationData = rs.data; //Mang cac du lieu thu duoc tu tram
            arrayDataType.forEach(function(dtype){
                arrayData[dtype.datatype_id].data=[];//Reset mang du lieu cua tung loai phan tu
                stationData.forEach(function(dta){
                    if(dtype.datatype_id==dta.datatype_id){
                        //Cap nhat gia tri vao dau mang data, do du lieu tra ve co ID giam dan
                        arrayData[dtype.datatype_id].data.unshift({date_create: moment(dta.data_createdDate).utc().format("MMMM D, YYYY HH:mm:ss"),data_value:dta.data_value});
                    }
                });          
            });
            callback();                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không truy vấn được dữ liệu của trạm cầm tay ở sông, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham ve bieu do theo ngay thang tuy chon
*/

function viewCustom(){
    dataState = true; //Dang load du lieu
    var start_date = $("#start_date").data("DateTimePicker").date(); //Lay ngay bat dau va ket thuc
    var end_date = $("#end_date").data("DateTimePicker").date();//Sau do chuyen dinh dang ngay
    blockSelectInput();
    if(start_date == null && end_date == null){//Truong hop ko nhap gi ca
        end_date = new Date();//Ngay hien tai
        start_date = new Date(end_date.getTime() - (1*86400000));//Ngay truoc ngay hien tai 1 ngay
        $("#end_date" ).datetimepicker('defaultDate',end_date); // Gan gia tri cho ngay ket thu la ngay hien tai
        $("#start_date" ).datetimepicker('defaultDate',start_date); //Gan gia tri ngay bat dau  
    }else if(start_date == null){
        end_date = new Date(end_date);
        start_date = new Date(end_date.getTime() - (1*86400000));
        $("#start_date" ).datetimepicker('defaultDate',start_date); //Gan gia tri ngay bat dau  
    }else if(end_date == null){
        end_date = new Date();//Ngay hien tai
        start_date = new Date(start_date);
        $("#end_date" ).datetimepicker('defaultDate',end_date); // Gan gia tri cho ngay ket thu la ngay hien tai
    }else{
        end_date = new Date(end_date);
        start_date = new Date(start_date);
    }
    //Conver ngay sang dinh dang yyyy-mm-dd hh:mm:ss dung cho API
    start_date = start_date.getFullYear() +"-"+ (start_date.getMonth()+1) + "-" + start_date.getDate() +" " + start_date.getHours() + ":" + start_date.getMinutes() + ":"+ start_date.getSeconds();
    end_date = end_date.getFullYear() +"-"+ (end_date.getMonth()+1) + "-" + end_date.getDate() +" " + end_date.getHours() + ":" + end_date.getMinutes() + ":"+ end_date.getSeconds();
    if($("#slect_station").val()> 0){
        loadDataByStation(host,token,$("#slect_station").val(),start_date,end_date,function(){
            //showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
            showMainChart();// Hien thi vung ve chart 
            initChart(); // Tien hanh ve chart
            dataState = false;//Load xong du lieu
            unblockSelectInput();
        }); 
    }else if($("#slect_station").val() == 0){
        if($("#slect_pond_or_river").val() == 1 && $("#list_pond_river").val() != 0){
            loadDataByPondDynamic(host,token,$("#list_pond_river").val(),start_date,end_date,function(){
                //showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
                showMainChart();// Hien thi vung ve chart 
                initChart(); // Tien hanh ve chart
                dataState = false;//Load xong du lieu
                unblockSelectInput();
            });
        }else if($("#slect_pond_or_river").val() == 2 && $("#list_pond_river").val() != 0){
            loadDataByRiverDynamic(host,token,$("#list_pond_river").val(),start_date,end_date,function(){
                //showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
                showMainChart();// Hien thi vung ve chart   
                initChart(); // Tien hanh ve chart
                dataState = false;//Load xong du lieu
                unblockSelectInput();
            });
        }
    }
}

/*
    Ham hien thi button chon hien bieu do
*/

function showBtnViewChart(){
    $('#btnViewChart').bootstrapToggle('off');
    $('#divBtnViewChart').show();  
}

/*
    Ham an button chon hien bieu do
*/

function hideBtnViewChart(){
    $('#divBtnViewChart').hide();
    $('#btnViewChart').bootstrapToggle('off');
}

/*
    Ham su dung kich hoat tat hoac mo bieu do
*/

function toggleChart(){
    if($('#btnViewChart').prop('checked')){        
        dataState = true; //Bat flash dang load du lieu len
        setDefaultDate(); //Set ngay mac dinh cho ngay bat dau va ket thuc
        //Lay ngay bat dau va ket thuc cho cac API get data 
        var start_date = $("#start_date").data("DateTimePicker").date();
        var end_date = $("#end_date").data("DateTimePicker").date();
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        blockSelectInput();//Khoa cac Select Input de chan Bat dong bo
        //Conver ngay sang dinh dang yyyy-mm-dd hh:mm:ss dung cho API
        start_date = start_date.getFullYear() +"-"+ (start_date.getMonth()+1) + "-" + start_date.getDate() +" " + start_date.getHours() + ":" + start_date.getMinutes() + ":"+ start_date.getSeconds();
        end_date = end_date.getFullYear() +"-"+ (end_date.getMonth()+1) + "-" + end_date.getDate() +" " + end_date.getHours() + ":" + end_date.getMinutes() + ":"+ end_date.getSeconds();
        if($("#slect_station").val()> 0){ //Dang o tram co dinh
            loadDataByStation(host,token,$("#slect_station").val(),start_date,end_date,function(){
                showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
                showMainChart();// Hien thi vung ve chart 
                initChart(); // Tien hanh ve chart
                dataState = false;//Tat flash khi load xong du lieu
                unblockSelectInput(); // Mo khoa cho cac Select Input
            }); 
        }else if($("#slect_station").val() == 0){//Dang o tram cam tay
            if($("#slect_pond_or_river").val() == 1 && $("#list_pond_river").val() != 0){//Tram cam tay ao
                loadDataByPondDynamic(host,token,$("#list_pond_river").val(),start_date,end_date,function(){
                    showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
                    showMainChart();// Hien thi vung ve chart 
                    initChart(); // Tien hanh ve chart
                    dataState = false;//Load xong du lieu
                    unblockSelectInput();// Mo khoa cho cac Select Input
                });
            }else if($("#slect_pond_or_river").val() == 2 && $("#list_pond_river").val() != 0){//Tram cam tay song
                loadDataByRiverDynamic(host,token,$("#list_pond_river").val(),start_date,end_date,function(){
                    showRadioDataType(); //Hien thi radio Datatype tuong ung voi tram
                    showMainChart();// Hien thi vung ve chart   
                    initChart(); // Tien hanh ve chart
                    dataState = false;//Load xong du lieu
                    unblockSelectInput();// Mo khoa cho cac Select Input
                });
            }
        }
    }else{
        $('#start_date').datetimepicker('clear');
        $('#end_date').datetimepicker('clear');
        hideMainChart();//An di chart
    }
}

/*
    Ham bat trang thai da doc cua notification
    host: Dia chi may chu API
    token: Chung thuc cho API
    userID: ID dinh danh nguoi dung
    notifiID: ID cua notification
    callback: Ham goi lai sau khi API goi xong 
*/

function checkNotifi(host,token,userID,nitifiID,callback){
    var request = $.ajax({
        url : host + '/api/notification/getbyid?user_id=' + userID +'&notif_id=' + nitifiID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            return;
        }else{
            callback();                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        return;
    });
}

/*
    Ham lay du lieu cua Threshold theo ID nguoi dung
    host: Dia chi may chu API
    token: Chung thuc cho API
    thresholdID: ID cua threshold
    callback: Ham goi lai sau khi API goi xong 
*/

function loadThresholdById(host,token,thresholdID,callback){
    var request = $.ajax({
        url : host + '/api/threshold/getbyid/' + thresholdID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            return;
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        return;
    });
}

/*
    Ham lay du lieu theo Id cua du lieu
    host: Dia chi may chu API
    token: Chung thuc cho API
    dataID: ID cua du lieu
    callback: Ham goi lai sau khi API goi xong 
*/

function loadDataById(host,token,dataID,callback){
    var request = $.ajax({
        url : host + '/api/data/getbyid/' + dataID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            return;
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        return;
    });
}
/*
    Ham hien thi noi dung cua Notification
    notifititle: Tieu de thong bao
    notifiId: ID cua thong bao
    readState: Trang thai cua thong bao
    thresholdId: ID cua muc do canh bao
    dataId: ID cua du lieu
    notifiDate: Ngay canh bao
*/
function showNotifi(notifiTitle,notifiId,readState,thresholdId,dataId,notifiDate){
    var html = '';
    var htmlAll = '';
    if(!readState){
        $('.numberOfNotification').text(parseInt($('.numberOfNotification').html())-1);
    }
    html += '<a href="#" onclick="showNotifi('+ "'" + notifiTitle + "'" + ',' + notifiId + ',' + 1 + ',' + thresholdId +','+ dataId + ',' + "'" + notifiDate + "'" +')">'+
                '<i class="text-aqua"></i>' + notifiTitle + 
                '<p>Thời gian: ' + moment(notifiDate).utc().format("DD-MM-YYYY, HH:mm") + '</p>' +
            '</a>';
    htmlAll+=
            '<td><input type="checkbox" name="selectNotifi" id="selectNotifi" value="' + notifiId +'"></td>' +
            '<td>'+ notifiTitle +'</td>' +
            '<td>'+ moment(notifiDate).utc().format("DD-MM-YYYY, HH:mm") +'</td>'+
            '<td><a href="#" title="Xem chi tiết thông báo" onclick="showNotifi(' + "'" + notifiTitle + "'" + ',' + notifiId + ',' + 1 + ',' + thresholdId + ',' + dataId + ',' + "'" + notifiDate + "'" + ');return false;"><i class="fa fa-eye"></i></a></td>';
    checkNotifi(host,token,userId,notifiId,function(){
        $('#notifi' + notifiId).removeClass('bg-info');
        $('#notifiAll' + notifiId).removeClass('bg-info');
        $('#notifi' + notifiId).html(html);
        $('#notifiAll' + notifiId).html(htmlAll);
    });
    var thState = false;
    var dtState = false;
    $('#modal_notif_title').html('<b>' + notifiTitle + '</b>');
    $('#modal_notif_time').text(moment(notifiDate).utc().format("DD-MM-YYYY, HH:mm"));
    if(thresholdId!=null){
        loadThresholdById(host,token,thresholdId,function(rs){
            $('#modal_notif_message').text(rs.threshold_name);
            $('#modal_notif_level').text(rs.threshold_level);
            loadAdviceByThreshold(host, token, rs.threshold_id, function(rs){
                var countAdvice = 0; //Bien dem so luong loi khuyen
                var maxDate = 0; //Bien chua gia tri ngay moi nhat
                var adviceText; //Bien chua noi dung cua loi khuyen
                rs.forEach(function(advice){
                    countAdvice++;
                    if(maxDate < moment(advice.advice_createdDate).utc().valueOf()){
                        maxDate = moment(advice.advice_createdDate).utc().valueOf();
                        adviceText = advice.advice_message;
                    }
                });

                //Kiem tra co loi khuyen hay khong
                if (countAdvice != 0){
                    $('#modal_notif_advice').text(adviceText);
                }else{
                    $('#modal_notif_advice').text('');
                }

                thState = true;
                if(dtState){
                    $('#myModal').modal();        
                }
            });
        });
    }else{
        $('#modal_notif_level').text('');
        $('#modal_notif_advice').text('');
        thState = true;
        if(dtState){
            $('#myModal').modal();        
        }
    }
    loadDataById(host,token,dataId,function(rs){
        $('#modal_notif_value').text(rs.data_value);
        // $('#modal_notif_station').text(arrStation[rs.station_id].station_name);
        if(thresholdId!=null){
            loadStationById(host,token,rs.station_id,function(rs){
                $('#modal_notif_station').text(rs.station_name);
                dtState = true;
                if(thState){
                    $('#myModal').modal();        
                }
            });
        }else{
            var flash1 = false;
            var flash2 = false;
            loadDataTypeById(host,token,rs.datatype_id,function(rs){
                $('#modal_notif_message').text(rs.datatype_name + ' có giá trị bất thường');
                flash1 = true;
                if(flash2){
                    dtState = true;
                    if(thState){
                        $('#myModal').modal();        
                    }
                }        
            });
            loadStationById(host,token,rs.station_id,function(rs){
                $('#modal_notif_station').text(rs.station_name);
                flash2 = true;
                if(flash1){
                    dtState = true;
                    if(thState){
                        $('#myModal').modal();        
                    }
                }
            });
        }
    });
}

/*
    Ham lay danh sach tram cua nguoi dung
    host: Dia chi may chu API
    token: Chung thuc cho API
    userID: ID cua nguoi dung
    callback: Ham goi lai sau khi API goi xong 
*/

function loadListStationByUser(host,token,userID,callback){
    var request = $.ajax({
        url : host + '/api/station/getbyuser/' + userID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách trạm của người dùng, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách trạm của người dùng, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach tram da chan thong bao theo nguoi dung
    host: Dia chi may chu API
    token: Chung thuc cho API
    userID: ID cua nguoi dung
    callback: Ham goi lai sau khi API goi xong 
*/

function loadListBlockStationByUser(host,token,userID,callback){
    var request = $.ajax({
        url : host + '/api/blocknotification/getlistbyuser/' + userID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách trạm đã chặn thông báo, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách trạm đã chặn thông báo, nhấn F5 để tải lại trang",$('#error'));
    });
}
/* Ham hien thi giao dien blocj nhan thong bao tu tram */
function showListBlockNotifi(){
    loadListStationByUser(host,token,userId,function(rs){
        var listStation = rs;
        loadListBlockStationByUser(host,token,userId,function(rs){
            var listStationBlock = rs;
            var check;
            var html = '';
            arrayListenNotifi = [];
            listStation.forEach(function(station){
                check = false;
                listStationBlock.forEach(function(stationBlock){
                    if(station.station_id == stationBlock.station_id){
                        check = true;
                    }
                });
                if(check){
                    html+=
                        '<div class="form-group custom-formgroup-sidebar">' +
                            '<label class="control-sidebar-subheading">'+
                                station.station_name +        
                                '<input type="checkbox" class="pull-right" checked onchange="toggleBlockNotifi(this,' + station.station_id + ')">'+
                            '</label>'+
                        '</div>';
                }else{
                    arrayListenNotifi.push(station.station_id);
                    html+=
                        '<div class="form-group custom-formgroup-sidebar">' +
                            '<label class="control-sidebar-subheading">'+
                                station.station_name +        
                                '<input type="checkbox" class="pull-right" onchange="toggleBlockNotifi(this,' + station.station_id + ')">'+
                            '</label>'+
                        '</div>';
                }
            });
            $('#listCheckBlockNotifi').html(html);
        });
    });
}

/*
    Ham bat tat block notification
    obj: Doi tuong HTML Element
    stationID: ID tram can thao tac
*/

function toggleBlockNotifi(obj,stationID){
    if(obj.checked){
        var request = $.ajax({
            url : host + '/api/blocknotification/create?user_id=' + userId + '&station_id=' + stationID,
            method : 'POST',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                showListBlockNotifi();
                eventClickFail('Khóa nhận thông báo từ trạm thất bại',$('#CheckBlockStationNotifi'));
            }else{
                showListBlockNotifi();
                eventClickSuccess('Khóa nhận thông báo từ trạm thành công',$('#CheckBlockStationNotifi'));                          
            }
        });
        request.fail(function(jqXHR, textStatus){
            showListBlockNotifi();
            eventClickFail('Khóa nhận thông báo từ trạm thất bại',$('#CheckBlockStationNotifi'));
        });
    }else{
        var request = $.ajax({
            url : host + '/api/blocknotification/delete?user_id=' + userId + '&station_id=' + stationID,
            method : 'DELETE',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                showListBlockNotifi();
                eventClickFail('Mở khóa nhận thông báo từ trạm thất bại',$('#CheckBlockStationNotifi'));
            }else{
                showListBlockNotifi();
                eventClickSuccess('Mở khóa nhận thông báo từ trạm thành công',$('#CheckBlockStationNotifi'));                           
            }
        });
        request.fail(function(jqXHR, textStatus){
            showListBlockNotifi();
            eventClickFail('Mở khóa nhận thông báo từ trạm thất bại',$('#CheckBlockStationNotifi'));
        });
    }
}

/*
    Ham lay danh sach hinh thuc tha nuoi
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadStockingType(host,token,callback){
    var request = $.ajax({
        url : host + '/api/stockingtype/getall/',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách hình thức thả nuôi, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách hình thức thả nuôi, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach cac loai tha nuoi
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadSpecies(host,token,callback){
    var request = $.ajax({
        url : host + '/api/species/getall',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách loài thả nuôi, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách loài thả nuôi, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach tuổi thả nuôi
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadAge(host,token,callback){
    var request = $.ajax({
        url : host + '/api/age/getall',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách tuổi thả nuôi, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách loài tuổi thả nuôi, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham khoi tao noi dung trang Thêm vụ nuôi
*/

function initCreateStockingPage(){
    //Goi ham load loai hinh tha nuoi
    loadStockingType(host,token,function(rs){
        rs.forEach(function(stkType){
            $("#stockingtype_id").append($("<option></option>").attr("value",stkType.stockingtype_id).text(stkType.stockingtype_name));
        });
        $('#stockingtype_id').selectpicker('refresh');
    });
    //Goi ham load loai nuoi
    loadSpecies(host,token,function(rs){
        rs.forEach(function(specie){
            $("#species_id").append($("<option></option>").attr("value",specie.species_id).text(specie.species_name));
        });
        $('#species_id').selectpicker('refresh');
    });
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham khoi tao cho trang cap nhat dot tha nuoi */
function initEditStockingPage(){
    //Goi ham load loai hinh tha nuoi
    loadStockingType(host,token,function(rs){
        rs.forEach(function(stkType){
            if(stockingObj.stockingtype_id == stkType.stockingtype_id){
                $("#stockingtype_id").append($("<option selected></option>").attr("value",stkType.stockingtype_id).text(stkType.stockingtype_name));
            }else{
                $("#stockingtype_id").append($("<option></option>").attr("value",stkType.stockingtype_id).text(stkType.stockingtype_name));
            }
        });
        $('#stockingtype_id').selectpicker('refresh');
    });
    //Goi ham load loai nuoi
    loadSpecies(host,token,function(rs){
        rs.forEach(function(specie){
            if(stockingObj.species_id == specie.species_id){
                $("#species_id").append($("<option selected></option>").attr("value",specie.species_id).text(specie.species_name));
            }else{
                $("#species_id").append($("<option></option>").attr("value",specie.species_id).text(specie.species_name));
            }
        });
        $('#species_id').selectpicker('refresh');
    });
    //Goi ham load tuoi tha nuoi
    loadAge(host,token,function(rs){
        rs.forEach(function(age){
            if(stockingObj.age_id == age.age_id){
                $("#age_id").append($("<option selected></option>").attr("value",age.age_id).text(age.age_description));
            }else{
                $("#age_id").append($("<option></option>").attr("value",age.age_id).text(age.age_description));
            }
        });
        $('#age_id').selectpicker('refresh');
    });
    $('#stocking_quantity').val(stockingObj.stocking_quantity);
    $('#stocking_note').val(stockingObj.stocking_note);
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}
/*
    Ham lay thông tin trạm theo ID
    host: Dia chi may chu API
    token: Chung thuc cho API
    stationID: ID cua tram
    callback: Ham goi lai sau khi API goi xong 
*/

function loadStationById(host,token,stationID,callback){
    var request = $.ajax({
        url : host + '/api/station/getbyid/' + stationID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin trạm theo ID, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin trạm theo ID, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach loi khuyen theo nguong canh bao
    host: Dia chi may chu API
    token: Chung thuc cho API
    thresldID: ID cua nguong canh bao
    callback: Ham goi lai sau khi API goi xong 
*/

function loadAdviceByThreshold(host,token,thresldID,callback){
    var request = $.ajax({
        url : host + '/api/advice/getbythreshold/' + thresldID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin lời khuyên, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin lời khuyên, nhấn F5 để tải lại trang",$('#error'));
    });
}

function loadDataTypeById(host,token,dataTypeID,callback){
    var request = $.ajax({
        url : host + '/api/datatype/getbyid/' + dataTypeID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được loại dữ liệu theo ID, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được loại dữ liệu theo ID, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*Ham lay ve danh sach Notification theo userId*/
function loadNotifi(host,token,userId,index,callback){
    var request = $.ajax({
        url : host + '/api/notification/getbyuser/' + userId + '?index=' + index,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách thông báo, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách thông báo, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach hinh thuc tha nuoi theo id
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadStockingTypeById(host,token,stockingTypeID,callback){
    var request = $.ajax({
        url : host + '/api/stockingtype/getbyid/' + stockingTypeID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được hình thức thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được hình thức thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach cac loai tha nuoi theo ID
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadSpeciesById(host,token,speciesID,callback){
    var request = $.ajax({
        url : host + '/api/species/getbyid/' + speciesID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin loài thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin loài thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
    });
}

/*
    Ham lay danh sach tuổi thả nuôi
    host: Dia chi may chu API
    token: Chung thuc cho API
    callback: Ham goi lai sau khi API goi xong 
*/

function loadAgeById(host,token,ageID,callback){
    var request = $.ajax({
        url : host + '/api/age/getbyid/' + ageID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được tuổi thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được tuổi thả nuôi theo ID, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao cho trang cap nhat chi tiet tha nuoi */
function initAddStockingPondPage(){
    loadStockingTypeById(host,token,stockingTypeId,function(rs){
        $("#stockingtype_id").attr("value",rs.stockingtype_name);
    });
    loadSpeciesById(host,token,speciesId,function(rs){
        $("#species_id").attr("value",rs.species_name);
    });
    loadAgeById(host,token,ageId,function(rs){
        $("#age_id").attr("value",rs.age_description);
    });
    //khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    $("#stockpond_date").datetimepicker({format: 'DD/MM/YYYY HH:mm',locale:'vi'});
    $("#stockpond_date" ).datetimepicker('defaultDate',new Date());   
}

/*
    Ham lay thong tin tram hien thi mac dinh
    host: Dia chi may chu API
    token: Chung thuc cho API
    userID: ID cua nguoi dung
    callback: Ham goi lai sau khi API goi xong 
*/

function loadStationDefaultByUser(host,token,userID,callback){
    var request = $.ajax({
        url : host + '/api/stationdefault/getbyuser/' + userID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được trạm hiện mặc định, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được trạm hiện mặc định, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham hien thi giao dien chon tram hien thi mac dinh */
function showDefaultStation(){
    loadListStationByUser(host,token,userId,function(rs){
        var listStation = rs;
        loadStationDefaultByUser(host,token,userId,function(rs){
            var defaultStationId = null;
            var html = '';
            if(rs!=null){
                defaultStationId = rs.station_id;
            }
            listStation.forEach(function(station){
                if(station.station_id == defaultStationId){
                    html+=
                        '<div class="form-group custom-formgroup-sidebar">' +
                            '<label class="control-sidebar-subheading">'+
                                station.station_name +        
                                '<input type="radio" name="raDefaultStation" class="pull-right" checked onchange="selectDefautStation(this,' + station.station_id + ')">'+
                            '</label>'+
                        '</div>';
                }else{
                    arrayListenNotifi.push(station.station_id);
                    html+=
                        '<div class="form-group custom-formgroup-sidebar">' +
                            '<label class="control-sidebar-subheading">'+
                                station.station_name +        
                                '<input type="radio" name="raDefaultStation" class="pull-right" onchange="selectDefautStation(this,' + station.station_id + ')">'+
                            '</label>'+
                        '</div>';
                }
            });
            $('#defaultStation').html(html);
        });
    });
}

/*
    Ham chon tram hien thi mac dinh
    obj: Doi tuong HTML Element
    stationID: ID tram can thao tac
*/

function selectDefautStation(obj,stationID){
    var selectedDefaultStation = false;
    for(var i = 0 ; i < document.getElementsByName("raDefaultStation").length ; i++){
        if(document.getElementsByName("raDefaultStation")[i].checked){
            selectedDefaultStation = true;
        }
    }

    if(selectedDefaultStation){
        var request = $.ajax({
            url : host + '/api/stationdefault//update?user_id=' + userId + '&station_id=' + stationID,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                showDefaultStation();
                eventClickFail('Chọn trạm mặc định thất bại',$('#defaultStationNotifi'));
            }else{
                showDefaultStation();  
                eventClickSuccess('Chọn trạm mặc định thành công',$('#defaultStationNotifi'));                          
            }
        });
        request.fail(function(jqXHR, textStatus){
            showDefaultStation();
            eventClickFail('Chọn trạm mặc định thất bại',$('#defaultStationNotifi'));
        });
    }else{
        var request = $.ajax({
            url : host + '/api/stationdefault/create?user_id=' + userId + '&station_id=' + stationID,
            method : 'POST',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                showDefaultStation();
                eventClickFail('Chọn trạm mặc định thất bại',$('#defaultStationNotifi'));
            }else{
                showDefaultStation();
                eventClickSuccess('Chọn trạm mặc định thành công',$('#defaultStationNotifi'));                          
            }
        });
        request.fail(function(jqXHR, textStatus){
            showDefaultStation();
            eventClickFail('Chọn trạm mặc định thất bại',$('#defaultStationNotifi'));
        });
    }
}

/* Ham thong bao thanh cong */
function eventClickSuccess(message,element){
    var html = 
        '<div class="alert alert-success text-left">'+ message +
        '</div>';
    element.html(html);
    setTimeout(function(){
        element.html('');
    },1000);
}

/* Ham thong bao that bai */
function eventClickFail(message,element){
    var html = 
        '<div class="alert alert-danger text-left">'+ message +
        '</div>';
    element.html(html);
    setTimeout(function(){
        element.html('');
    },1000);
}

/* Ham khoi tao trang nhap lo giong */
function initAddSeedPage(){
    //khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadSeedQuality(host,token,function(rs){
        rs.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
            $('#seedquality_id').append($("<option></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));
        });
    });
    loadStockingByUser(host,token,userId,function(rs){
        rs.forEach(function(stocking){
            $('#stocking_id').append($("<option></option>").attr("value",stocking.stocking_id).text('Vụ nuôi số ' + stocking.stocking_id));
        });
    });
    $("#bill_dateInBill").datetimepicker({format: 'DD/MM/YYYY HH:mm',locale:'vi'});
    $("#bill_dateInBill" ).datetimepicker('defaultDate',new Date());   
}

/* Ham lay danh sach vu nuoi theo user */
function loadStockingByUser(host,token,userID,callback){
    var request = $.ajax({
        url : host + '/api/stocking/getbyuser/' + userID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách vụ nuôi theo người dùng, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách vụ nuôi theo người dùng, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay danh sach chat luong cua giong */
function loadSeedQuality(host,token,callback){
    var request = $.ajax({
        url : host + '/api/seedquality/getpagination?page=0&pageSize=10',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách chất lượng giống, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách chất lượng giống, nhấn F5 để tải lại trang",$('#error'));
    });
}
/* Ham xoa bill detail */
function deleteBillDetail(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    billDetail.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    total-=billDetail[index].seed_price;
    $('#bill_total').attr('value',total);
    billDetail.splice(index,1);
    stt--;
    billDetail.forEach(function(temp){
        html += '<tr>' +
                    '<td class="text-center">' + sttTemp + '</td>' +
                    '<td class="text-center">' + temp.seed_numberOfLot + '</td>' +
                    '<td class="text-center">' + seedQuanlity[temp.seedquality_id] + '</td>' +
                    '<td class="text-center">' + temp.seed_size + '</td>' +
                    '<td class="text-center">' + temp.seed_quantity + '</td>' +
                    '<td class="text-center">' + temp.seed_price + '</td>' +
                    '<td class="text-center"><a onclick="deleteBillDetail('+ temp.detailt_stt +')">Xóa</a></td>' +
                '</tr>';
        sttTemp++;
    });
    $('#billDetailContent').html(html);
}

/* Ham tao bill */
function createBill(host,token,data,callback){
    var request = $.ajax({
        url : host + '/api/bill/create',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo hóa đơn thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo hóa đơn thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham cap nhat thong tin bill */
function updateBill(host,token,billID,data,callback){
    var request = $.ajax({
        url : host + '/api/bill/update/' + billID,
        method : 'PUT',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Cập nhật hóa đơn thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        console.log(jqXHR);
        showError("Cập nhật hóa đơn thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham tao seed */
function createSeed(host,token,billID,data,callback){
    var request = $.ajax({
        url : host + '/api/seed/create',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: {
            bill_id: billID,
            seedquality_id: data.seedquality_id,
            seed_numberOfLot: data.seed_numberOfLot,
            seed_quantity: data.seed_quantity,
            seed_existence: data.seed_quantity,
            seed_price: data.seed_price,
            seed_source: data.seed_source,
            seed_size: data.seed_size
        },
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo lô giống thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo lô giống thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

function initBillListPage(){
    var seedQuanlityState = false;
    var unitState = false;

    loadSeedQuality(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
        });
        seedQuanlityState = true;
        if(unitState){
            var index = 0;
            var pageSize = 10;
            loadBillPagination(host,token,userId,index,pageSize);
        }
    });

    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
        });
        $('#unit_id').selectpicker('refresh');
        unitState = true;
        if(seedQuanlityState){
            var index = 0;
            var pageSize = 10;
            loadBillPagination(host,token,userId,index,pageSize);
        }
    });

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

function initStockingListPage(){
    var html = '';
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadSpecies(host,token,function(rs){
        rs.forEach(function(species){
            arraySpecies[species.species_id] = species.species_name;
        });
        loadStockingType(host,token,function(rs){
            rs.forEach(function(stockingType){
                arrayStockingType[stockingType.stockingtype_id] = stockingType.stockingtype_name;
            });
            loadAge(host,token,function(rs){
                var index = 0;
                var pageSize = 10;
                rs.forEach(function(age){
                    arrayAge[age.age_id] = age.age_description;
                });
                loadStockingPagination(host,token,userId,index,pageSize);
            })
        }); 
    });
}

/* Ham load stocking co phan trang*/
function loadStockingPagination(host,token,userID,page,size){
    var keyword = "";
    if($("#txtTimKiem").val() != ""){
        keyword = $("#txtTimKiem").val();
    }
    var request = $.ajax({
        url : host + '/api/stocking/getpagination/' + userID + '?page=' + page +'&pageSize='+ size +'&keyword='+keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách vụ nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var html = '';
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(stocking){
                    var stateStocking;
                    if(stocking.stocking_status){
                        stateStocking = 'Thả nuôi';
                    }else{
                        stateStocking = 'Thu hoạch';
                    }
                    html += 
                        '<tr>' +
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + stt + '</div></a></td>' +
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + stocking.stocking_id + '</div></a></td>' +
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + arraySpecies[stocking.species_id] + '</div></a></td>' +
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + arrayStockingType[stocking.stockingtype_id] + '</div></a></td>' + 
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + stocking.stocking_quantity + '</div></a></td>' +  
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + moment(stocking.stocking_date).format('DD-MM-YYYY') + '</div></a></td>' + 
                            '<td><a title = "Nhấp chọn đợt thả nuôi cần quản lý" href="/quantrac/nongdan/dotnuoi/chitiet/' + stocking.stocking_id + '" class = "lineInTable"><div>' + stateStocking + '</div></a></td>' +
                        '</tr>' ;
                    stt++;
                });
            }else{
                html += 
                        '<tr>' +
                            '<td colspan="7">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
            }   
            $('#listStocking').html(html);
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadStockingPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadStockingPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiStockingList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách vụ nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham load stocking co phan trang */
function loadBillPagination(host,token,userID,page,size){
    var keyword = "";
    var stocking_id = $('#stocking_id').val();
    // if($("#txtTimKiem").val() != ""){
    //     keyword = $("#txtTimKiem").val();
    // }
    var request = $.ajax({
        url : host + '/api/bill/getpagination/' + userID + '?stocking_id=' + stocking_id + '&page=' + page +'&pageSize='+ size +'&keyword='+keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách hóa đơn chi thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            $('#listBill').find('*').remove();
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(bill){
                    var html = 
                        '<tr>' +
                            '<td>' + stt + '</td>' +
                            '<td>' + bill.bill_id + '</td>' +
                            '<td>' + moment(bill.bill_dateInBill).format('DD-MM-YYYY') + '</td>' + 
                            '<td><p id="billContent' + bill.bill_id + '"></p><b>&nbsp;&nbsp;Tổng tiền:  </b>' + bill.bill_total + '<b> VNĐ</b></td>' +
                            '<td><a title="Cập nhật hóa đơn" href="/quantrac/nongdan/hoadon/capnhat/' + bill.bill_id + '"><i class="fa fa-edit"></i></td>' + 
                        '</tr>' ;
                    $('#listBill').append(html);
                    loadSeedByBill(host,token,bill.bill_id,function(rs){
                        var htmlSeed = '' ;
                        var bill_id;
                        rs.forEach(function(temp){
                            bill_id = temp.bill_id
                            htmlSeed+= '&nbsp;&nbsp;' + seedQuanlity[temp.seedquality_id] + '&nbsp;('+ temp.seed_numberOfLot + '):&nbsp;&nbsp;' + temp.seed_price + '&nbsp;VNĐ&nbsp;X&nbsp;&nbsp;' + temp.seed_quantity  + '&nbsp;=&nbsp;' + (temp.seed_price * temp.seed_quantity) +'&nbsp;VNĐ</br>';
                        });
                        if(html != ''){
                            $('#billContent' + bill_id).html($('#billContent' + bill_id).html() + htmlSeed);
                        }
                    });
                    loadMaterialByBill(host,token,bill.bill_id,function(rs){
                        var htmlMaterial = '' ;
                        var bill_id;
                        rs.forEach(function(temp){
                            bill_id = temp.bill_id
                            htmlMaterial+= '&nbsp;&nbsp;' + temp.material_name + '&nbsp;('+ temp.material_numberOfLot + '):&nbsp;&nbsp;' + temp.material_price + '&nbsp;VNĐ&nbsp;X&nbsp;&nbsp;' +  temp.material_quantity + '&nbsp;' + arrayUnit[temp.unit_id] + '&nbsp;=&nbsp;' + (temp.material_price * temp.material_quantity) + '&nbsp;VNĐ</br>';
                        });
                        if(html != ''){
                            $('#billContent' + bill_id).html($('#billContent' + bill_id).html() + htmlMaterial);
                        }
                    });
                    loadOtherByBill(host,token,bill.bill_id,function(rs){
                        var htmlOther = '' ;
                        var bill_id;
                        rs.forEach(function(temp){
                            bill_id = temp.bill_id
                            htmlOther+= '&nbsp;&nbsp;' + temp.other_name +  '&nbsp;:&nbsp;&nbsp;' + temp.other_price + '&nbsp;VNĐ&nbsp;X&nbsp;&nbsp;' + temp.other_quantity + '&nbsp;=&nbsp;' + (temp.other_price*temp.other_quantity) +'&nbsp;VNĐ</br>';
                        });
                        if(html != ''){
                            $('#billContent' + bill_id).html($('#billContent' + bill_id).html() +htmlOther);
                        }
                    });
                    stt++;
                });
            }else{
                var html = 
                        '<tr>' +
                            '<td colspan="5">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
                $('#listBill').html(html);
            }   
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadBillPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadBillPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiBillList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách hóa đơn chi thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* ------------------------------------------------------------------------*/

/* Ham khoi tao cho trang nhap hang */
function initAddBillPage(){
    var seedQuanlityState = false;
    var materialTypeState = false;
    var unitState = false;

    //khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadSeedQuality(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
            $('#seedquality_id').append($("<option></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));
        });
        $('#seedquality_id').selectpicker('refresh');
        seedQuanlityState = true;
        if(materialTypeState && unitState){
            usingSessionStorageForBill();
        }
    });

    loadMaterialType(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(materialtype){
            materialType[materialtype.materialtype_id] = materialtype.materialtype_name;  
            $('#materialtype_id').append($("<option></option>").attr("value",materialtype.materialtype_id).text(materialtype.materialtype_name));
        });
        $('#materialtype_id').selectpicker('refresh');
        materialTypeState = true;
        if(seedQuanlityState && unitState){
            usingSessionStorageForBill();
        }
    });
    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
            $('#unit_id').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));
        });
        $('#unit_id').selectpicker('refresh');
        unitState = true;
        if(seedQuanlityState && materialTypeState){
            usingSessionStorageForBill();
        }
    });
}

/* Ham su dung session Storage for bill */
function usingSessionStorageForBill(){
    if(typeof(Storage) !== "undefined"){
        if(sessionStorage.bill){
            var temp = JSON.parse(sessionStorage.bill);
            if(temp.stocking_id != stocking_id){
                sessionStorage.clear();
            }
        }
        if(sessionStorage.bill){
            var sttSeedTemp = 1;
            var sttMaterialTemp = 1;
            var sttOtherTemp = 1;
            var seedHtml = '';
            var materialHtml = '';
            var otherHtml = '';
            bill = JSON.parse(sessionStorage.bill);
            $("#bill_dateInBill" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
            $("#bill_dateInBill" ).datepicker('setDate',new Date(bill.dateInBill.substr(0,10)));
            console.log(bill.dateInBill);
            bill.seed.data.forEach(function(temp){
                var tempSource;
                if(temp.seed_source.length > 50){
                    tempSource = temp.seed_source.substr(0,47) + "..."; 
                }else{
                    tempSource = temp.seed_source;
                }
                seedHtml += 
                        '<tr id="seed' + temp.detailt_stt  +  '">' +
                            '<td>' + sttSeedTemp + '</td>' +
                            '<td>' + temp.seed_numberOfLot + '</td>' +
                            '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                            '<td>' + temp.seed_size + '</td>' +
                            '<td>' + tempSource + '</td>' +
                            '<td>' + temp.seed_quantity + '</td>' +
                            '<td>' + temp.seed_price + '</td>' +
                            '<td>' + temp.real_price + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeSeedDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>';   
                sttSeedTemp++;
                total += temp.real_price;
            });
            bill.material.data.forEach(function(temp){
                var tempSource;
                var tempDescript;
                if(temp.material_source.length > 35){
                    tempSource = temp.material_source.substr(0,30) + "..."; 
                }else{
                    tempSource = temp.material_source;
                }

                if(temp.material_description.length > 35){
                    tempDescript = temp.material_description.substr(0,30) + "..."; 
                }else{
                    tempDescript = temp.material_description;
                }

                materialHtml += 
                        '<tr id="material' + temp.detailt_stt  +  '">' +
                            '<td>' + sttMaterialTemp + '</td>' +
                            '<td>' + materialType[temp.materialtype_id] + '</td>' +
                            '<td>' + temp.material_name + '</td>' +
                            '<td>' + temp.material_numberOfLot + '</td>' +
                            '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                            '<td>' + tempSource + '</td>' +
                            '<td>' + tempDescript + '</td>' +
                            '<td>' + temp.material_quantity + '</td>' +
                            '<td>' + temp.material_price + '</td>' +
                            '<td>' + temp.real_price + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>';    
                sttMaterialTemp++;
                total += temp.real_price;
            });
            bill.other.data.forEach(function(temp){
                var tempNote;
                if(temp.other_note.length > 50){
                    tempNote = temp.other_note.substr(0,47) + "..."; 
                }else{
                    tempNote = temp.other_note;
                }
                otherHtml += 
                        '<tr id="other' + temp.detailt_stt  +  '">' +
                            '<td>' + sttOtherTemp + '</td>' +
                            '<td>' + temp.other_name + '</td>' +
                            '<td>' + tempNote + '</td>' +
                            '<td>' + temp.other_quantity + '</td>' +
                            '<td>' + temp.other_price + '</td>' +
                            '<td>' + temp.real_price + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeOtherDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>';      
                sttOtherTemp++;
                total += temp.real_price;
            });
            $('#bill_total').attr('value',total);

            if(seedHtml != ''){
                $('#divBillSeedDetail').show();
                $('#listBillSeedDetail').html(seedHtml);
            }
            if(materialHtml != ''){
                $('#divBillMaterialDetail').show();
                $('#listBillMaterialDetail').html(materialHtml);
            }
            if(otherHtml != ''){
                $('#divBillOtherDetail').show();
                $('#listBillOtherDetail').html(otherHtml);
            }
        }else{
            bill = {    
                        stocking_id: stocking_id,
                        dateInBill: null,
                        seed:{
                            stt: 0,
                            detaltSTT:0,
                            data:[]
                        },
                        material:{
                            stt: 0,
                            detaltSTT:0,
                            data:[]  
                        },
                        other:{
                            stt: 0,
                            detaltSTT:0,
                            data:[]
                        },
                        totalElement: 0
                    };
            sessionStorage.bill = JSON.stringify(bill);
            console.log(sessionStorage.bill);
            $("#bill_dateInBill" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
            $("#bill_dateInBill" ).datepicker('setDate',new Date());
        }
    }else{
        alert('Xin vui lòng sử dụng Chrome 4.0, IE 8.0, FireFox 3.5, Safari 4.0 hoặc Opera 11.5 trở lên để dùng chức năng này');
    }
}

/* Ham xu ly chon stocking tren bill */
// function slectStockingForBill(obj){
//     bill.stocking_id = parseInt(obj.value);
//     sessionStorage.bill = JSON.stringify(bill);
// }

/* Ham xu ly chon ngay tren bill */
function enterDateInBill(){
    var dateTemp = $("#bill_dateInBill" ).datepicker('getDate');
    dateTemp = new Date(dateTemp.getTime() - (dateTemp.getTimezoneOffset()*60000)).toISOString();
    bill.dateInBill = dateTemp;
    sessionStorage.bill = JSON.stringify(bill);
    console.log(sessionStorage.bill);
}

/* Ham goi khi them môt seed vao bill */
function addSeedDetailForBill(){
    if($("#frmAddSeed").valid()){
        $('#divBillSeedDetail').show();
        var html = '';
        var tempSource;
        var temp;
        bill.seed.stt++;
        bill.seed.detaltSTT++;
        bill.totalElement++;
        temp = {
            detailt_stt:bill.seed.detaltSTT,
            seed_source:$('#seed_source').val(),
            seed_numberOfLot:$('#seed_numberOfLot').val(),
            seedquality_id:parseInt($('#seedquality_id').val()),
            seed_size:parseFloat($('#seed_size').val()),
            seed_quantity:parseInt($('#seed_quantity').val()),
            seed_price:parseInt($('#seed_price').val()),
            real_price:parseInt($('#seed_price').val()) * parseInt($('#seed_quantity').val())
        }
        bill.seed.data.push(temp);
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        if(temp.seed_source.length > 50){
            tempSource = temp.seed_source.substr(0,47) + "..."; 
        }else{
            tempSource = temp.seed_source;
        }
        html +=
                '<tr id="seed' + temp.detailt_stt  +  '">' +
                    '<td>' + bill.seed.stt + '</td>' +
                    '<td>' + temp.seed_numberOfLot + '</td>' +
                    '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                    '<td>' + temp.seed_size + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + temp.seed_quantity + '</td>' +
                    '<td>' + temp.seed_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeSeedDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        $('#listBillSeedDetail').html($('#listBillSeedDetail').html() + html); 
        total += temp.real_price;
        $('#bill_total').attr('value',total);
        resetFormAddSeed();          
    }
}

/* Ham xoa mot chi tiet giong ra khoi hoa don */
function deleteSeedDetailForBill(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    bill.seed.data.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    total-=bill.seed.data[index].real_price;
    $('#bill_total').attr('value',total);
    bill.seed.data.splice(index,1);
    bill.seed.stt--;
    bill.totalElement--;
    sessionStorage.bill = JSON.stringify(bill);
    console.log(sessionStorage.bill);
    bill.seed.data.forEach(function(temp){
        var tempSource;
        if(temp.seed_source.length > 50){
            tempSource = temp.seed_source.substr(0,47) + "..."; 
        }else{
            tempSource = temp.seed_source;
        }
        html += 
                '<tr id="seed' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + temp.seed_numberOfLot + '</td>' +
                    '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                    '<td>' + temp.seed_size + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + temp.seed_quantity + '</td>' +
                    '<td>' + temp.seed_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeSeedDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        sttTemp++;
    });
    $('#listBillSeedDetail').html(html);
    stateEditSeed = false;
    if(html==''){
        $('#divBillSeedDetail').hide();
    }
}

/* Ham thay doi seed detail */
function changeSeedDetail(detailSTT){
    if(!stateEditSeed){
        var index;
        var count = -1;
        var dataTemp;
        var quanlityID;
        var html = ''

        stateEditSeed = true;
        bill.seed.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == detailSTT){
                index = count;
            }
        });
        dataTemp = bill.seed.data[index];

        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="detailt_stt_Edit" id="detailt_stt_Edit">' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="seed_numberOfLot_Edit" id="seed_numberOfLot_Edit"/>' +
                        '<span id="errorseed_numberOfLot_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "seedquality_id_Edit" name = "seedquality_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorseedquality_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="seed_size_Edit" id="seed_size_Edit"/>' +
                        '<span id="errorseed_size_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="seed_source_Edit" id="seed_source_Edit"/>' +
                        '<span id="errorseed_source_Edit"></span>' +
                    '</div>'+
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<input class = "form-control" type="text" name="seed_quantity_Edit" id="seed_quantity_Edit" onkeyup = "changeSeedQuantity()" />' +
                        '<span id="errorseed_quantity_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="seed_price_Edit" id="seed_price_Edit" onkeyup = "changeSeedQuantity()" />' +
                        '<span id="errorseed_price_Edit"></span>' +
                    '</div>' +
                '</td>' +
                '<td><span id = "tempRealPriceEditSeed">' + dataTemp.real_price + '</span></td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditSeedDetail();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeSeedDetail();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
        console.log(html);
        $('#seed' + dataTemp.detailt_stt).html(html);
        $('#detailt_stt_Edit').val(dataTemp.detailt_stt);
        $('#seed_numberOfLot_Edit').val(dataTemp.seed_numberOfLot);
        $('#seed_size_Edit').val(dataTemp.seed_size);
        $('#seed_quantity_Edit').val(dataTemp.seed_quantity);
        $('#seed_price_Edit').val(dataTemp.seed_price);
        $('#seed_source_Edit').val(dataTemp.seed_source);

        quanlityID = dataTemp.seedquality_id;
        loadSeedQuality(host,token,function(rs){
            var data = rs.Items;
            $('#seedquality_id_Edit').find('*').remove();
            data.forEach(function(seed_quality){
                if(seed_quality.seedquality_id == quanlityID){
                    $('#seedquality_id_Edit').append($("<option selected></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));
                }else{
                    $('#seedquality_id_Edit').append($("<option></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));      
                }    
            });
        });
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham xu ly khi thay doi seed quantity */
function changeSeedQuantity(){
    if($.isNumeric($('#seed_quantity_Edit').val()) && $.isNumeric($('#seed_price_Edit').val())){
        $('#tempRealPriceEditSeed').text(parseInt($('#seed_quantity_Edit').val()) * parseInt($('#seed_price_Edit').val()));
    }else{
        $('#tempRealPriceEditSeed').text("");
    }
}

/* Ham xu ly khi thay doi material quantity */
function changeMaterialQuantity(){
    if($.isNumeric($('#material_quantity_Edit').val()) && $.isNumeric($('#material_price_Edit').val())){
        $('#tempRealPriceEditMaterial').text(parseFloat($('#material_quantity_Edit').val()) * parseInt($('#material_price_Edit').val()));
    }else{
        $('#tempRealPriceEditMaterial').text("");
    }
}

/* Ham xu ly khi thay doi other quantity */
function changeOtherQuantity(){
    if($.isNumeric($('#other_quantity_Edit').val()) && $.isNumeric($('#other_price_Edit').val())){
        $('#tempRealPriceEditOther').text(parseFloat($('#other_quantity_Edit').val()) * parseInt($('#other_price_Edit').val()));
    }else{
        $('#tempRealPriceEditOther').text("");
    }
}

/* Ham luu chinh sua cho seed bill detail */
function saveEditSeedDetail(){
    if($('#frmEditSeedDetail').valid()){
        var html = '';
        var sttTemp = 1;
        var dataTempEdit;
        var index;
        var count = -1;
        bill.seed.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == $('#detailt_stt_Edit').val()){
                index = count;
            }
        });
        total-= bill.seed.data[index].real_price;
        dataTempEdit = {
            detailt_stt:parseInt($('#detailt_stt_Edit').val()),
            seed_source:$('#seed_source_Edit').val(),
            seed_numberOfLot:$('#seed_numberOfLot_Edit').val(),
            seedquality_id:parseInt($('#seedquality_id_Edit').val()),
            seed_size:parseFloat($('#seed_size_Edit').val()),
            seed_quantity:parseInt($('#seed_quantity_Edit').val()),
            seed_price:parseInt($('#seed_price_Edit').val()),
            real_price:parseInt($('#seed_quantity_Edit').val()) * parseInt($('#seed_price_Edit').val())
        }
        bill.seed.data[index] = dataTempEdit ;
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        total+=dataTempEdit.real_price;
        $('#bill_total').attr('value',total);
        bill.seed.data.forEach(function(temp){
            var tempSource;
            if(temp.seed_source.length > 50){
                tempSource = temp.seed_source.substr(0,47) + "..."; 
            }else{
                tempSource = temp.seed_source;
            }
            html += 
                    '<tr id="seed' + temp.detailt_stt  +  '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + temp.seed_numberOfLot + '</td>' +
                        '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                        '<td>' + temp.seed_size + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + temp.seed_quantity + '</td>' +
                        '<td>' + temp.seed_price + '</td>' +
                        '<td>' + temp.real_price + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeSeedDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';   
            sttTemp++;
        });
        $('#listBillSeedDetail').html(html);
        stateEditSeed = false;
    }
}

/* Ham tro lai khi dang change seed detail */
function backFromChangeSeedDetail(){
    var sttTemp = 1;
    var html = '';
    bill.seed.data.forEach(function(temp){
        var tempSource;
        if(temp.seed_source.length > 50){
            tempSource = temp.seed_source.substr(0,47) + "..."; 
        }else{
            tempSource = temp.seed_source;
        }
        html += 
                '<tr id="seed' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + temp.seed_numberOfLot + '</td>' +
                    '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                    '<td>' + temp.seed_size + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + temp.seed_quantity + '</td>' +
                    '<td>' + temp.seed_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeSeedDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        sttTemp++;
    });
    $('#listBillSeedDetail').html(html);
    stateEditSeed = false;
}


/* Ham goi khi them môt material vao bill */
function addMaterialDetailForBill(){
    if($("#frmAddMaterial").valid()){
        $('#divBillMaterialDetail').show();
        var html = '';
        var tempSource;
        var tempDescript;
        var temp;
        bill.material.stt++;
        bill.material.detaltSTT++;
        bill.totalElement++;
        temp = {
            detailt_stt:bill.material.detaltSTT,
            materialtype_id:parseInt($('#materialtype_id').val()),
            material_name:$('#material_name').val(),
            material_numberOfLot:$('#material_numberOfLot').val(),
            unit_id:parseInt($('#unit_id').val()),
            material_quantity:parseFloat($('#material_quantity').val()),
            material_price:parseInt($('#material_price').val()),
            material_source:$('#material_source').val(),
            material_description:$('#material_description').val(),
            real_price:parseFloat($('#material_quantity').val()) * parseInt($('#material_price').val())
        }
        bill.material.data.push(temp);
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        if(temp.material_source.length > 35){
            tempSource = temp.material_source.substr(0,30) + "..."; 
        }else{
            tempSource = temp.material_source;
        }

        if(temp.material_description.length > 35){
            tempDescript = temp.material_description.substr(0,30) + "..."; 
        }else{
            tempDescript = temp.material_description;
        }
        html +=
                '<tr id="material' + temp.detailt_stt  +  '">' +
                    '<td>' + bill.material.stt + '</td>' +
                    '<td>' + materialType[temp.materialtype_id] + '</td>' +
                    '<td>' + temp.material_name + '</td>' +
                    '<td>' + temp.material_numberOfLot + '</td>' +
                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + tempDescript + '</td>' +
                    '<td>' + temp.material_quantity + '</td>' +
                    '<td>' + temp.material_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        $('#listBillMaterialDetail').html($('#listBillMaterialDetail').html() + html); 
        total += temp.real_price;
        $('#bill_total').attr('value',total);
        resetFormAddMaterial();          
    }
}

/* Ham xoa mot chi tiet vat tu ra khoi hoa don */
function deleteMaterialDetailForBill(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    bill.material.data.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    total-=bill.material.data[index].real_price;
    $('#bill_total').attr('value',total);
    bill.material.data.splice(index,1);
    bill.material.stt--;
    bill.totalElement--;
    sessionStorage.bill = JSON.stringify(bill);
    console.log(sessionStorage.bill);
    bill.material.data.forEach(function(temp){
        var tempSource;
        var tempDescript;
        if(temp.material_source.length > 35){
            tempSource = temp.material_source.substr(0,30) + "..."; 
        }else{
            tempSource = temp.material_source;
        }

        if(temp.material_description.length > 35){
            tempDescript = temp.material_description.substr(0,30) + "..."; 
        }else{
            tempDescript = temp.material_description;
        }

        html += 
                '<tr id="material' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + materialType[temp.materialtype_id] + '</td>' +
                    '<td>' + temp.material_name + '</td>' +
                    '<td>' + temp.material_numberOfLot + '</td>' +
                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + tempDescript + '</td>' +
                    '<td>' + temp.material_quantity + '</td>' +
                    '<td>' + temp.material_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';    
        sttTemp++;
    });
    $('#listBillMaterialDetail').html(html);
    stateEditMaterial = false;
    if(html==''){
        $('#divBillMaterialDetail').hide();
    }
}

/* Ham thay doi seed detail */
function changeMaterialDetail(detailSTT){
    if(!stateEditMaterial){
        var index;
        var count = -1;
        var dataTemp;
        var materialTypeID;
        var unitID;
        var html = '';

        stateEditMaterial = true;
        bill.material.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == detailSTT){
                index = count;
            }
        });
        dataTemp = bill.material.data[index];
        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="detailt_stt_MEdit" id="detailt_stt_MEdit">' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<select id = "materialtype_id_Edit" name = "materialtype_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errormaterialtype_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="material_name_Edit" id="material_name_Edit"/>' +
                        '<span id="errormaterial_name_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<input class = "form-control" type="text" name="material_numberOfLot_Edit" id="material_numberOfLot_Edit"/>' +
                        '<span id="errormaterial_numberOfLot_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<select id = "unit_id_Edit" name = "unit_id_Edit" class="form-control">' +
                        '</select>' +
                        '<span id="errorunit_id_Edit"></span>' +
                    '</div>' +
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="material_source_Edit" id="material_source_Edit"/>' +
                        '<span id="errormaterial_source_Edit"></span>' +
                    '</div>'+
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="material_description_Edit" id="material_description_Edit"/>' +
                    '</div>'+
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="material_quantity_Edit" id="material_quantity_Edit" onkeyup="changeMaterialQuantity()" />' +
                        '<span id="errormaterial_quantity_Edit"></span>' +
                    '</div>'+
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="material_price_Edit" id="material_price_Edit" onkeyup="changeMaterialQuantity()" />' +
                        '<span id="errormaterial_price_Edit"></span>' +
                    '</div>'+
                '</td>' +
                '<td><span id = "tempRealPriceEditMaterial">' + dataTemp.real_price + '</span></td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditMaterialDetail();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeMaterialDetail();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
        $('#material' + dataTemp.detailt_stt).html(html);     
        $('#detailt_stt_MEdit').val(dataTemp.detailt_stt);
        $('#material_name_Edit').val(dataTemp.material_name);
        $('#material_numberOfLot_Edit').val(dataTemp.material_numberOfLot);
        $('#material_quantity_Edit').val(dataTemp.material_quantity);
        $('#material_price_Edit').val(dataTemp.material_price);
        $('#material_source_Edit').val(dataTemp.material_source);
        $('#material_description_Edit').val(dataTemp.material_description);

        materialTypeID = dataTemp.materialtype_id;
        unitID = dataTemp.unit_id;
        loadMaterialType(host,token,function(rs){
            var data = rs.Items;
            $('#materialtype_id_Edit').find('*').remove();
            data.forEach(function(materialtype){
                if(materialtype.materialtype_id == materialTypeID){
                    $('#materialtype_id_Edit').append($("<option selected></option>").attr("value",materialtype.materialtype_id).text(materialtype.materialtype_name));
                }else{
                    $('#materialtype_id_Edit').append($("<option></option>").attr("value",materialtype.materialtype_id).text(materialtype.materialtype_name));      
                }
            });
        });
        loadUnit(host,token,function(rs){
            $('#unit_id_Edit').find('*').remove();
            rs.forEach(function(unit){
                if(unit.unit_id == unitID){
                    $('#unit_id_Edit').append($("<option selected></option>").attr("value",unit.unit_id).text(unit.unit_name));
                }else{
                    $('#unit_id_Edit').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));      
                }
            });
        });                            
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham luu chinh sua cho seed bill detail */
function saveEditMaterialDetail(){
    if($('#frmEditMaterialDetail').valid()){
        var html = '';
        var sttTemp = 1;
        var dataTempEdit;
        var index;
        var count = -1;
        bill.material.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == $('#detailt_stt_MEdit').val()){
                index = count;
            }
        });
        total-= bill.material.data[index].real_price;
        dataTempEdit = {
            detailt_stt:parseInt($('#detailt_stt_MEdit').val()),
            materialtype_id:parseInt($('#materialtype_id_Edit').val()),
            material_name:$('#material_name_Edit').val(),
            material_numberOfLot:$('#material_numberOfLot_Edit').val(),
            unit_id:parseInt($('#unit_id_Edit').val()),
            material_quantity:parseFloat($('#material_quantity_Edit').val()),
            material_price:parseInt($('#material_price_Edit').val()),
            material_source:$('#material_source_Edit').val(),
            material_description:$('#material_description_Edit').val(),
            real_price:parseFloat($('#material_quantity_Edit').val()) * parseInt($('#material_price_Edit').val())
        }
        bill.material.data[index] = dataTempEdit ;
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        total+=dataTempEdit.real_price;
        $('#bill_total').attr('value',total);
        bill.material.data.forEach(function(temp){
            var tempSource;
            var tempDescript;
            if(temp.material_source.length > 35){
                tempSource = temp.material_source.substr(0,30) + "..."; 
            }else{
                tempSource = temp.material_source;
            }

            if(temp.material_description.length > 35){
                tempDescript = temp.material_description.substr(0,30) + "..."; 
            }else{
                tempDescript = temp.material_description;
            }

            html += 
                    '<tr id="material' + temp.detailt_stt  +  '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + materialType[temp.materialtype_id] + '</td>' +
                        '<td>' + temp.material_name + '</td>' +
                        '<td>' + temp.material_numberOfLot + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + tempDescript + '</td>' +
                        '<td>' + temp.material_quantity + '</td>' +
                        '<td>' + temp.material_price + '</td>' +
                        '<td>' + temp.real_price + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';    
            sttTemp++;
        });
        $('#listBillMaterialDetail').html(html);
        stateEditMaterial = false;
    }
}

/* Ham tro lai khi dang change seed detail */
function backFromChangeMaterialDetail(){
    var sttTemp = 1;
    var html = '';
    bill.material.data.forEach(function(temp){
        var tempSource;
        var tempDescript;
        if(temp.material_source.length > 35){
            tempSource = temp.material_source.substr(0,30) + "..."; 
        }else{
            tempSource = temp.material_source;
        }

        if(temp.material_description.length > 35){
            tempDescript = temp.material_description.substr(0,30) + "..."; 
        }else{
            tempDescript = temp.material_description;
        }

        html += 
                '<tr id="material' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + materialType[temp.materialtype_id] + '</td>' +
                    '<td>' + temp.material_name + '</td>' +
                    '<td>' + temp.material_numberOfLot + '</td>' +
                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                    '<td>' + tempSource + '</td>' +
                    '<td>' + tempDescript + '</td>' +
                    '<td>' + temp.material_quantity + '</td>' +
                    '<td>' + temp.material_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';     
        sttTemp++;
    });
    $('#listBillMaterialDetail').html(html);
    stateEditMaterial = false;
}

/* Ham goi khi them môt seed vao bill */
function addOtherDetailForBill(){
    if($("#frmAddOther").valid()){
        $('#divBillOtherDetail').show();
        var html = '';
        var tempNote;
        var temp;
        bill.other.stt++;
        bill.other.detaltSTT++;
        bill.totalElement++;
        temp = {
            detailt_stt:bill.other.detaltSTT,
            other_name:$('#other_name').val(),
            other_quantity:parseFloat($('#other_quantity').val()),
            other_price:parseInt($('#other_price').val()),
            other_note:$('#other_note').val(),
            real_price: parseFloat($('#other_quantity').val()) * parseInt($('#other_price').val())
        }
        bill.other.data.push(temp);
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        if(temp.other_note.length > 50){
            tempNote = temp.other_note.substr(0,47) + "..."; 
        }else{
            tempNote = temp.other_note;
        }
        html +=
                '<tr id="other' + temp.detailt_stt  +  '">' +
                    '<td>' + bill.other.stt + '</td>' +
                    '<td>' + temp.other_name + '</td>' +
                    '<td>' + tempNote + '</td>' +
                    '<td>' + temp.other_quantity + '</td>' +
                    '<td>' + temp.other_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeOtherDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        $('#listBillOtherDetail').html($('#listBillOtherDetail').html() + html); 
        total += temp.real_price;
        $('#bill_total').attr('value',total);
        resetFormAddOther();          
    }
}

/* Ham xoa mot chi tiet other ra khoi hoa don */
function deleteOtherDetailForBill(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    bill.other.data.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    total-=bill.other.data[index].real_price;
    $('#bill_total').attr('value',total);
    bill.other.data.splice(index,1);
    bill.other.stt--;
    bill.totalElement--;
    sessionStorage.bill = JSON.stringify(bill);
    console.log(sessionStorage.bill);
    bill.other.data.forEach(function(temp){
        var tempNote;
        if(temp.other_note.length > 50){
            tempNote = temp.other_note.substr(0,47) + "..."; 
        }else{
            tempNote = temp.other_note;
        }
        html += 
                '<tr id="other' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + temp.other_name + '</td>' +
                    '<td>' + tempNote + '</td>' +
                    '<td>' + temp.other_quantity + '</td>' +
                    '<td>' + temp.other_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeOtherDetail('+ temp.detailt_stt +')"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForBill('+ temp.detailt_stt +')"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';      
        sttTemp++;
    });
    $('#listBillOtherDetail').html(html);
    stateEditOther = false;
    if(html==''){
        $('#divBillOtherDetail').hide();
    }
}

/* Ham thay doi other detail */
function changeOtherDetail(detailSTT){
    if(!stateEditOther){
        var index;
        var count = -1;
        var dataTemp;
        var html = ''; 

        stateEditOther = true;
        bill.other.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == detailSTT){
                index = count;
            }
        });
        dataTemp = bill.other.data[index];

        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="detailt_stt_OEdit" id="detailt_stt_OEdit">' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="other_name_Edit" id="other_name_Edit"/>' +
                        '<span id="errorother_name_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' +  
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="other_note_Edit" id="other_note_Edit"/>' +
                    '</div>'+
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="other_quantity_Edit" id="other_quantity_Edit" onkeyup="changeOtherQuantity()" />' +
                        '<span id="errorother_quantity_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="other_price_Edit" id="other_price_Edit" onkeyup="changeOtherQuantity()" />' +
                        '<span id="errorother_price_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td><span id = "tempRealPriceEditOther">' + dataTemp.real_price + '</span></td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditOtherDetail();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeOtherDetail();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';

        $('#other' + dataTemp.detailt_stt).html(html);
        $('#detailt_stt_OEdit').val(dataTemp.detailt_stt);
        $('#other_name_Edit').val(dataTemp.other_name);
        $('#other_quantity_Edit').val(dataTemp.other_quantity);
        $('#other_price_Edit').val(dataTemp.other_price);
        $('#other_note_Edit').val(dataTemp.other_note);
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham luu chinh sua cho Other bill detail */
function saveEditOtherDetail(){
    if($('#frmEditOtherDetail').valid()){
        var html = '';
        var sttTemp = 1;
        var dataTempEdit;
        var index;
        var count = -1;
        bill.other.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == $('#detailt_stt_OEdit').val()){
                index = count;
            }
        });
        console.log(bill.other.data[index]);
        total-= bill.other.data[index].real_price;
        dataTempEdit = {
            detailt_stt:parseInt($('#detailt_stt_OEdit').val()),
            other_name:$('#other_name_Edit').val(),
            other_quantity:parseFloat($('#other_quantity_Edit').val()),
            other_price:parseInt($('#other_price_Edit').val()),
            other_note:$('#other_note_Edit').val(),
            real_price: parseFloat($('#other_quantity_Edit').val()) * parseInt($('#other_price_Edit').val())
        }
        bill.other.data[index] = dataTempEdit ;
        sessionStorage.bill = JSON.stringify(bill);
        console.log(sessionStorage.bill);
        total+=dataTempEdit.real_price;
        $('#bill_total').attr('value',total);
        bill.other.data.forEach(function(temp){
            var tempNote;
            if(temp.other_note.length > 50){
                tempNote = temp.other_note.substr(0,47) + "..."; 
            }else{
                tempNote = temp.other_note;
            }
            html += 
                    '<tr id="other' + temp.detailt_stt  +  '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + temp.other_name + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td>' + temp.other_quantity + '</td>' +
                        '<td>' + temp.other_price + '</td>' +
                        '<td>' + temp.real_price + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeOtherDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>'; 
                sttTemp++;
            });
        $('#listBillOtherDetail').html(html);
        stateEditOther = false;
    }
}

/* Ham tro lai khi dang change seed detail */
function backFromChangeOtherDetail(){
    var sttTemp = 1;
    var html = '';
    bill.other.data.forEach(function(temp){
        var tempNote;
        if(temp.other_note.length > 50){
            tempNote = temp.other_note.substr(0,47) + "..."; 
        }else{
            tempNote = temp.other_note;
        }
        html += 
                '<tr id="other' + temp.detailt_stt  +  '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + temp.other_name + '</td>' +
                    '<td>' + tempNote + '</td>' +
                    '<td>' + temp.other_quantity + '</td>' +
                    '<td>' + temp.other_price + '</td>' +
                    '<td>' + temp.real_price + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeOtherDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForBill('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>'; 
            sttTemp++;
        });
    $('#listBillOtherDetail').html(html);
    stateEditOther = false;
}

/* Ham chon khung nhap hang cho bill */
function selectProductTypeForBill(obj){
    if(obj.value == 'seed'){
        $('#other').removeClass('active');
        $('#material').removeClass('active');
        $('#seed').addClass('active');
    }else if(obj.value == 'material'){
        $('#seed').removeClass('active');
        $('#other').removeClass('active');
        $('#material').addClass('active');
    }else{
        $('#seed').removeClass('active');
        $('#material').removeClass('active');
        $('#other').addClass('active');
    }
}

/* Ham reset from frmAddSeed */
function resetFormAddSeed(){
    $('#seed_source').val('');
    $('#seed_numberOfLot').val('');
    $('#seed_size').val('');
    $('#seed_quantity').val('');
    $('#seed_price').val('');
    $('#seedquality_id').prop('selectedIndex',0);
    $('#seedquality_id').selectpicker('refresh');
}

/* Ham load don vi cua cac loai vat tu */
function loadUnit(host,token,callback){
    var request = $.ajax({
        url : host + '/api/unit/getall',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách đơn vị của vật tư, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách đơn vị của vật tư, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay danh sach loai cua vat tu */
function loadMaterialType(host,token,callback){
    var request = $.ajax({
        url : host + '/api/materialtype/getpagination?page=0&pageSize=20',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách đơn vị của vật tư, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách đơn vị của vật tư, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham reset from frmAddmaterial */
function resetFormAddMaterial(){
    $('#material_name').val('');
    $('#material_numberOfLot').val('');
    $('#material_quantity').val('');
    $('#material_price').val('');
    $('#material_source').val('');
    $('#material_description').val('');
    $('#materialtype_id').prop('selectedIndex',0);
    $('#materialtype_id').selectpicker('refresh');
    $('#unit_id').prop('selectedIndex',0);
    $('#unit_id').selectpicker('refresh');
}

/* Ham reset from frmAddOther */
function resetFormAddOther(){
    $('#other_name').val('');
    $('#other_quantity').val('');
    $('#other_price').val('');
    $('#other_note').val('');
}

/* Ham luu hoa don vao CSDL */
function saveAddBill(){
    if($("#frmAddBill").valid()){
        if(bill.totalElement > 0 ){
            var data = {
                user_id: userId,
                stocking_id: $('#stocking_id').val(),
                bill_total: 0,
                bill_dateInBill: bill.dateInBill
            };
            createBill(host,token,data,function(rs){
                var billId = rs.bill_id;
                var billDetail = rs;
                var seedObject = {
                    state:true,
                    total:0,
                    error:true
                };
                var materialObject = {
                    state:true,
                    total:0,
                    error:true
                };
                var otherObject = {
                    state:true,
                    total:0,
                    error:true
                };

                if(bill.seed.stt > 0){
                    seedObject.state = false;
                }
                if(bill.material.stt > 0){
                    materialObject.state = false;
                }
                if(bill.other.stt > 0 ){
                    otherObject.state = false;
                }

                if(bill.seed.stt > 0){
                    var dataSEED = {
                        bill_id:billId,
                        seeds:[]
                    };
                    bill.seed.data.forEach(function(rs){
                        var temp = {
                            seedquality_id:rs.seedquality_id,
                            seed_numberOfLot:rs.seed_numberOfLot,
                            seed_quantity:rs.seed_quantity,
                            seed_existence:rs.seed_quantity,
                            seed_price:rs.seed_price,
                            seed_source:rs.seed_source,
                            seed_size:rs.seed_size
                        };
                        dataSEED.seeds.push(temp);
                    });
                    createMultiSeed(host,token,billId,dataSEED,function(error,data){
                        seedObject.error = error;
                        if(!seedObject.error){
                            bill.totalElement-= bill.seed.stt;
                            bill.seed.stt = 0;
                            bill.seed.data = [];
                            data.forEach(function(rs){
                                seedObject.total+= (parseInt(rs.seed_price) * parseInt(rs.seed_quantity));
                            });
                        }
                        seedObject.state = true;
                        console.log(error);
                        if(materialObject.state && otherObject.state){
                            var totalUpdate = seedObject.total + materialObject.total + otherObject.total;
                            var dataUpdate = {
                                user_id: billDetail.user_id,
                                stocking_id: billDetail.stocking_id,
                                bill_total: totalUpdate,
                                bill_dateInBill: billDetail.bill_dateInBill,
                                bill_createDate: billDetail.bill_createDate
                            };
                            sessionStorage.bill = JSON.stringify(bill);
                            if(bill.totalElement == 0){
                                sessionStorage.clear();
                            }
                            updateBill(host,token,billId,dataUpdate,function(rs){
                                window.location.href= '/quantrac/nongdan/hoadon/danhsach?stocking_id=' + stocking_id;
                            }); 
                        }
                    });
                }
                if(bill.material.stt > 0){
                    var dataMaterial = {
                        bill_id:billId,
                        materials:[]
                    };
                    bill.material.data.forEach(function(rs){
                        var temp = {
                            materialtype_id:rs.materialtype_id,
                            unit_id:rs.unit_id,
                            material_name:rs.material_name,
                            material_numberOfLot:rs.material_numberOfLot,
                            material_source:rs.material_source,
                            material_quantity:rs.material_quantity,
                            material_existence:rs.material_quantity,
                            material_price: rs.material_price,
                            material_description: rs.material_description,
                            material_state:true
                        };
                        dataMaterial.materials.push(temp);
                    });
                    createMultiMaterial(host,token,billId,dataMaterial,function(error,data){
                        materialObject.error = error;
                        if(!materialObject.error){
                            bill.totalElement-= bill.material.stt;
                            bill.material.stt = 0;
                            bill.material.data = [];
                            data.forEach(function(rs){
                                materialObject.total += (parseFloat(rs.material_quantity) * parseInt(rs.material_price));
                            });
                        }
                        materialObject.state = true;
                        console.log(error);
                        if(seedObject.state && otherObject.state){
                            var totalUpdate = seedObject.total + materialObject.total + otherObject.total;
                            var dataUpdate = {
                                user_id: billDetail.user_id,
                                stocking_id: billDetail.stocking_id,
                                bill_total: totalUpdate,
                                bill_dateInBill: billDetail.bill_dateInBill,
                                bill_createDate: billDetail.bill_createDate
                            };
                            sessionStorage.bill = JSON.stringify(bill);
                            if(bill.totalElement == 0){
                                sessionStorage.clear();
                            }
                            updateBill(host,token,billId,dataUpdate,function(rs){
                                window.location.href= '/quantrac/nongdan/hoadon/danhsach?stocking_id=' + stocking_id; 
                            });      
                        }
                    });
                }
                if(bill.other.stt > 0){
                    var dataOther = {
                        bill_id:billId,
                        others:[]
                    };
                    bill.other.data.forEach(function(rs){
                        var temp = {
                            other_name:rs.other_name,
                            other_price:rs.other_price,
                            other_quantity:rs.other_quantity,
                            other_note:rs.other_note
                        };
                        dataOther.others.push(temp);
                    });
                    createMultiOther(host,token,billId,dataOther,function(error,data){
                        otherObject.error = error;
                        if(!otherObject.error){
                            bill.totalElement-= bill.other.stt;
                            bill.other.stt = 0;
                            bill.other.data = [];
                            data.forEach(function(rs){
                                otherObject.total += (parseFloat(rs.other_quantity) * parseInt(rs.other_price));
                            });
                        }
                        otherObject.state = true;
                        console.log(error);
                        if(materialObject.state && seedObject.state){
                            var totalUpdate = seedObject.total + materialObject.total + otherObject.total;
                            var dataUpdate = {
                                user_id: billDetail.user_id,
                                stocking_id: billDetail.stocking_id,
                                bill_total: totalUpdate,
                                bill_dateInBill: billDetail.bill_dateInBill,
                                bill_createDate: billDetail.bill_createDate
                            };
                            console.log(dataUpdate);
                            sessionStorage.bill = JSON.stringify(bill);
                            if(bill.totalElement == 0){
                                sessionStorage.clear();
                            }
                            updateBill(host,token,billId,dataUpdate,function(rs){
                                window.location.href= '/quantrac/nongdan/hoadon/danhsach?stocking_id=' + stocking_id;   
                            });
                        }
                    });
                }
            });
        }else{
            alert('Hóa đơn trống, vui lòng thêm ít nhất một chi tiết vào hóa đơn');
        }
    }
}

/* Ham insert multi seed */
function createMultiSeed(host,token,bill_id,data,callback){
    var request = $.ajax({
        url : host + '/api/seed/createmulti/' + bill_id,
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết hóa đơn giống thất bại, nhấn F5 để tải lại trang",$('#error'));
            callback(true,null);
        }else{
            callback(false,rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo chi tiết hóa đơn giống thất bại, nhấn F5 để tải lại trang",$('#error'));
        callback(true,null);
    });
}

/* Ham insert multi material */
function createMultiMaterial(host,token,bill_id,data,callback){
    var request = $.ajax({
        url : host + '/api/material/createmulti/' + bill_id,
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết hóa đơn vật tư thất bại, nhấn F5 để tải lại trang",$('#error'));
            callback(true,null);   
        }else{
            callback(false,rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo chi tiết hóa đơn vật tư thất bại, nhấn F5 để tải lại trang",$('#error'));
        callback(true,null);
    });
}

/* Ham insert multi other */
function createMultiOther(host,token,bill_id,data,callback){
    var request = $.ajax({
        url : host + '/api/other/createmulti/' + bill_id,
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết hóa đơn khác thất bại, nhấn F5 để tải lại trang",$('#error'));
            callback(true,null);
        }else{
            callback(false,rs.data);                            
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo chi tiết hóa đơn khác thất bại, nhấn F5 để tải lại trang",$('#error'));
        callback(true,null);
    });
}

/* Ham khoi tao cho trang xem chi tiet hoa don*/
function initUpdateBillPage(){
    var seedQuanlityState = false;
    var materialTypeState = false;
    var unitState = false;

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadSeedQuality(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
        });
        seedQuanlityState = true;
        if(materialTypeState && unitState){
            loadDataForUpdateBill();
        }
    });
    loadMaterialType(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(materialtype){
            materialType[materialtype.materialtype_id] = materialtype.materialtype_name;  
        });
        materialTypeState = true;
        if(seedQuanlityState && unitState){
            loadDataForUpdateBill();
        }
    });
    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
        });
        unitState = true;
        if(seedQuanlityState && materialTypeState){
            loadDataForUpdateBill();
        }
    });
}

/* Ham load data for bill detail*/
function loadDataForUpdateBill(){
    $('#bill_dateInBill').text(moment(billObj.bill_dateInBill).format('DD-MM-YYYY'));
    loadSeedByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        rs.forEach(function(temp){
            var tempSource;
            var tempSeed = {
                seed_id:temp.seed_id,
                seed_source:temp.seed_source,
                seed_numberOfLot:temp.seed_numberOfLot,
                seedquality_id:temp.seedquality_id,
                seed_size:temp.seed_size,
                seed_quantity:temp.seed_quantity,
                seed_existence:temp.seed_existence,
                seed_price:temp.seed_price
            }
            billObj.seed.push(tempSeed);
            if(temp.seed_source.length > 50){
                tempSource = temp.seed_source.substr(0,47) + "..."; 
            }else{
                tempSource = temp.seed_source;
            }
            html+=
                    '<tr id="seed' + temp.seed_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + temp.seed_numberOfLot + '</td>' +
                        '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                        '<td>' + temp.seed_size + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + temp.seed_quantity + '</td>' +
                        '<td>' + temp.seed_price + '</td>' +
                        '<td>' + (temp.seed_price * temp.seed_quantity) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>'; 
            stt++;
        });
        if(html != ''){
            $('#divBillSeedDetail').show();
            $('#listBillSeedDetail').html(html);
        }
    });
    loadMaterialByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        rs.forEach(function(temp){
            var tempSource;
            var tempDescript;
            var tempMaterial = {
                material_id:temp.material_id,
                materialtype_id:temp.materialtype_id,
                material_name:temp.material_name,
                material_numberOfLot:temp.material_numberOfLot,
                unit_id:temp.unit_id,
                material_quantity:temp.material_quantity,
                material_price:temp.material_price,
                material_source:temp.material_source,
                material_description:temp.material_description
            }
            billObj.material.push(tempMaterial);
            if(temp.material_source.length > 35){
                tempSource = temp.material_source.substr(0,30) + "..."; 
            }else{
                tempSource = temp.material_source;
            }

            if(temp.material_description.length > 35){
                tempDescript = temp.material_description.substr(0,30) + "..."; 
            }else{
                tempDescript = temp.material_description;
            }
            html+=
                    '<tr id="material' + temp.material_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + materialType[temp.materialtype_id] + '</td>' +
                        '<td>' + temp.material_name + '</td>' +
                        '<td>' + temp.material_numberOfLot + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + tempDescript + '</td>' +
                        '<td>' + temp.material_quantity + '</td>' +
                        '<td>' + temp.material_price + '</td>' +
                        '<td>' + (temp.material_quantity * temp.material_price) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';  
            stt++;
        });
        if(html != ''){
            $('#divBillMaterialDetail').show();
            $('#listBillMaterialDetail').html(html);
        }
    });
    loadOtherByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        rs.forEach(function(temp){
            var tempNote;
            tempOther = {
                other_id:temp.other_id,
                other_name:temp.other_name,
                other_quantity:temp.other_quantity,
                other_price:temp.other_price,
                other_note:temp.other_note,
            }
            billObj.other.push(tempOther);
            if(temp.other_note.length > 50){
                tempNote = temp.other_note.substr(0,47) + "..."; 
            }else{
                tempNote = temp.other_note;
            }
            html+=
                    '<tr id="other' + temp.other_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + temp.other_name + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td>' + temp.other_quantity + '</td>' +
                        '<td>' + temp.other_price + '</td>' +
                        '<td>' + (temp.other_quantity * temp.other_price) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeOtherDetailForUpdateBill('+ temp.other_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForUpdateBill('+ temp.other_id+');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>'; 
            stt++;
        });
        if(html != ''){
            $('#divBillOtherDetail').show();
            $('#listBillOtherDetail').html(html);
        }
    });
}

/* Ham xoa mot chi tiet giong khi cap nhat hoa don */
function deleteSeedDetailForUpdateBill(seedID){
    loadSeedById(host,token,seedID,function(rs){
        if(rs.seed_quantity == rs.seed_existence){
            var request = $.ajax({
                url : host + '/api/seed/delete/' + rs.seed_id,
                method : 'DELETE',
                contentType: 'application/json; charset=utf-8',
                headers:{
                    'Authorization':token
                }
            });
            request.done(function(rs){
                if(rs.Error){
                    showError("Xóa giống nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
                }else{
                    billObj.bill_total-=(rs.data.seed_price * rs.data.seed_quantity);
                    console.log(rs);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadSeedByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.seed = [];
                            console.log(rs);
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempSeed = {
                                    seed_id:temp.seed_id,
                                    seed_source:temp.seed_source,
                                    seed_numberOfLot:temp.seed_numberOfLot,
                                    seedquality_id:temp.seedquality_id,
                                    seed_size:temp.seed_size,
                                    seed_quantity:temp.seed_quantity,
                                    seed_existence:temp.seed_existence,
                                    seed_price:temp.seed_price
                                }
                                billObj.seed.push(tempSeed);
                                if(temp.seed_source.length > 50){
                                    tempSource = temp.seed_source.substr(0,47) + "..."; 
                                }else{
                                    tempSource = temp.seed_source;
                                }
                                html+=
                                        '<tr id="seed' + temp.seed_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + temp.seed_numberOfLot + '</td>' +
                                            '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                                            '<td>' + temp.seed_size + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + temp.seed_quantity + '</td>' +
                                            '<td>' + temp.seed_price + '</td>' +
                                            '<td>' + (temp.seed_price * temp.seed_quantity) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>'; 
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillSeedDetail').show();
                                $('#listBillSeedDetail').html(html);
                            }else{
                                $('#listBillSeedDetail').html(html);
                                $('#divBillSeedDetail').hide();
                            }
                            stateEditSeed = false;
                        });
                    });
                }
            });
            request.fail(function(jqXHR, textStatus){
                showError("Xóa giống nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
            });
        }else{
            alert('Tài nguyên này đã được sử dụng, bạn phải cập nhật hoặc xóa những phần đã sử dụng nó trước');
        }
    });
}

/* Ham xoa mot chi tiet vat tu khi cap nhat hoa don */
function deleteMaterialDetailForUpdateBill(materialID){
    console.log(materialID);
    loadMaterialById(host,token,materialID,function(rs){
        if(rs.material_quantity == rs.material_existence){
            var request = $.ajax({
                url : host + '/api/material/delete/' + rs.material_id,
                method : 'DELETE',
                contentType: 'application/json; charset=utf-8',
                headers:{
                    'Authorization':token
                }
            });
            request.done(function(rs){
                if(rs.Error){
                    showError("Xóa vật tư thất bại, nhấn F5 để tải lại trang",$('#error'));
                }else{
                    billObj.bill_total-=(rs.data.material_price * rs.data.material_quantity);
                    console.log(rs);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadMaterialByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.material = [];
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempDescript;
                                var tempMaterial = {
                                    material_id:temp.material_id,
                                    materialtype_id:temp.materialtype_id,
                                    material_name:temp.material_name,
                                    material_numberOfLot:temp.material_numberOfLot,
                                    unit_id:temp.unit_id,
                                    material_quantity:temp.material_quantity,
                                    material_price:temp.material_price,
                                    material_source:temp.material_source,
                                    material_description:temp.material_description
                                }
                                billObj.material.push(tempMaterial);
                                if(temp.material_source.length > 35){
                                    tempSource = temp.material_source.substr(0,30) + "..."; 
                                }else{
                                    tempSource = temp.material_source;
                                }

                                if(temp.material_description.length > 35){
                                    tempDescript = temp.material_description.substr(0,30) + "..."; 
                                }else{
                                    tempDescript = temp.material_description;
                                }
                                html+=
                                        '<tr id="material' + temp.material_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + materialType[temp.materialtype_id] + '</td>' +
                                            '<td>' + temp.material_name + '</td>' +
                                            '<td>' + temp.material_numberOfLot + '</td>' +
                                            '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + tempDescript + '</td>' +
                                            '<td>' + temp.material_quantity + '</td>' +
                                            '<td>' + temp.material_price + '</td>' +
                                            '<td>' + (temp.material_quantity * temp.material_price) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>';  
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillMaterialDetail').show();
                                $('#listBillMaterialDetail').html(html);
                            }else{
                                $('#listBillMaterialDetail').html(html);
                                $('#divBillMaterialDetail').hide();
                            }
                            stateEditMaterial = false;
                        });
                    });
                }
            });
            request.fail(function(jqXHR, textStatus){
                console.log(jqXHR);
                showError("Xóa vật tư thất bại, nhấn F5 để tải lại trang",$('#error'));
            });
        }else{
            alert('Tài nguyên này đã được sử dụng, bạn phải cập nhật hoặc xóa những phần đã sử dụng nó trước');
        }
    });
}

/* Ham xoa mot chi tiet khac khi cap nhat hoa don */
function deleteOtherDetailForUpdateBill(otherID){
    console.log(otherID);
    loadOtherById(host,token,otherID,function(rs){
        var request = $.ajax({
                url : host + '/api/other/delete/' + rs.other_id,
                method : 'DELETE',
                contentType: 'application/json; charset=utf-8',
                headers:{
                    'Authorization':token
                }
            });
            request.done(function(rs){
                if(rs.Error){
                    showError("Xóa chi tiết khác thất bại, nhấn F5 để tải lại trang",$('#error'));
                }else{
                    billObj.bill_total-=(rs.data.other_price * rs.data.other_quantity);
                    console.log(rs);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadOtherByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.other = [];
                            rs.forEach(function(temp){
                                var tempNote;
                                tempOther = {
                                    other_id:temp.other_id,
                                    other_name:temp.other_name,
                                    other_quantity:temp.other_quantity,
                                    other_price:temp.other_price,
                                    other_note:temp.other_note,
                                }
                                billObj.other.push(tempOther);
                                if(temp.other_note.length > 50){
                                    tempNote = temp.other_note.substr(0,47) + "..."; 
                                }else{
                                    tempNote = temp.other_note;
                                }
                                html+=
                                        '<tr id="material' + temp.material_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + temp.other_name + '</td>' +
                                            '<td>' + tempNote + '</td>' +
                                            '<td>' + temp.other_quantity + '</td>' +
                                            '<td>' + temp.other_price + '</td>' +
                                            '<td>' + (temp.other_quantity * temp.other_price) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeOtherDetailForUpdateBill('+ temp.other_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForUpdateBill('+ temp.other_id+');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>'; 
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillOtherDetail').show();
                                $('#listBillOtherDetail').html(html);
                            }else{
                                $('#listBillOtherDetail').html(html);
                                $('#divBillOtherDetail').hide();
                            }
                            stateEditOther = false;
                        });
                    });
                }
            });
            request.fail(function(jqXHR, textStatus){
                console.log(jqXHR);
                showError("Xóa chi tiết khác thất bại, nhấn F5 để tải lại trang",$('#error'));
            });
    });
}

/* Ham thay doi seed detail */
function changeSeedDetailForUpdateBill(seedID){
    if(!stateEditSeed){
        loadSeedById(host,token,seedID,function(rs){
            var index;
            var count = -1;
            var dataTemp;
            var html = ''
            var quanlityID;

            stateEditSeed = true;
            billObj.seed.forEach(function(detail){
                count++;
                if(detail.seed_id == rs.seed_id){
                    index = count;
                }
            });
            dataTemp = rs;

            html += '<td>' + (index + 1) + 
                        '<input type="hidden" name="seed_id_Edit" id="seed_id_Edit">' +  
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="seed_numberOfLot_Edit" id="seed_numberOfLot_Edit"/>' +
                            '<span id="errorseed_numberOfLot_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' + 
                            '<select id = "seedquality_id_Edit" name = "seedquality_id_Edit" class="form-control">' + 
                            '</select>' +
                            '<span id="errorseedquality_id_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="seed_size_Edit" id="seed_size_Edit"/>' +
                            '<span id="errorseed_size_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="seed_source_Edit" id="seed_source_Edit"/>' +
                            '<span id="errorseed_source_Edit"></span>' +
                        '</div>'+
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' + 
                            '<input class = "form-control" type="text" name="seed_quantity_Edit" id="seed_quantity_Edit" onkeyup = "changeSeedQuantity()" />' +
                            '<span id="errorseed_quantity_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="seed_price_Edit" id="seed_price_Edit" onkeyup = "changeSeedQuantity()" />' +
                            '<span id="errorseed_price_Edit"></span>' +
                        '</div>' +
                    '</td>' +
                    '<td><span id = "tempRealPriceEditSeed">' + (dataTemp.seed_price * dataTemp.seed_quantity) + '</span></td>' +
                    '<td><a title="Lưu cập nhật" href="#" onclick="saveEditSeedDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeSeedDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
            console.log(html);
            $('#seed' + dataTemp.seed_id).html(html);
            $('#seed_id_Edit').val(dataTemp.seed_id);
            $('#seed_numberOfLot_Edit').val(dataTemp.seed_numberOfLot);
            $('#seed_size_Edit').val(dataTemp.seed_size);
            $('#seed_quantity_Edit').val(dataTemp.seed_quantity);
            $('#seed_price_Edit').val(dataTemp.seed_price);
            $('#seed_source_Edit').val(dataTemp.seed_source);

            quanlityID = dataTemp.seedquality_id;
            loadSeedQuality(host,token,function(rs){
                var data = rs.Items;
                $('#seedquality_id_Edit').find('*').remove();
                data.forEach(function(seed_quality){
                    if(seed_quality.seedquality_id == quanlityID){
                        $('#seedquality_id_Edit').append($("<option selected></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));
                    }else{
                        $('#seedquality_id_Edit').append($("<option></option>").attr("value",seed_quality.seedquality_id).text(seed_quality.seedquality_name));      
                    }    
                });
            });
        });
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham thay doi material detail */
function changeMaterialDetailForUpdateBill(materialID){
    if(!stateEditMaterial){
        loadMaterialById(host,token,materialID,function(rs){
            var index;
            var count = -1;
            var dataTemp;
            var materialTypeID;
            var unitID;
            var html = '';

            stateEditMaterial = true;
            billObj.material.forEach(function(detail){
                count++;
                if(detail.material_id == rs.material_id){
                    index = count;
                }
            });
            dataTemp = rs;
            html += '<td>' + (index + 1) + 
                        '<input type="hidden" name="material_id_Edit" id="material_id_Edit">' +  
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<select id = "materialtype_id_Edit" name = "materialtype_id_Edit" class="form-control">' + 
                            '</select>' +
                            '<span id="errormaterialtype_id_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="material_name_Edit" id="material_name_Edit"/>' +
                            '<span id="errormaterial_name_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' + 
                            '<input class = "form-control" type="text" name="material_numberOfLot_Edit" id="material_numberOfLot_Edit"/>' +
                            '<span id="errormaterial_numberOfLot_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<select id = "unit_id_Edit" name = "unit_id_Edit" class="form-control">' +
                            '</select>' +
                            '<span id="errorunit_id_Edit"></span>' +
                        '</div>' +
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="material_source_Edit" id="material_source_Edit"/>' +
                            '<span id="errormaterial_source_Edit"></span>' +
                        '</div>'+
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="material_description_Edit" id="material_description_Edit"/>' +
                        '</div>'+
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="material_quantity_Edit" id="material_quantity_Edit" onkeyup="changeMaterialQuantity()" />' +
                            '<span id="errormaterial_quantity_Edit"></span>' +
                        '</div>'+
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="material_price_Edit" id="material_price_Edit" onkeyup="changeMaterialQuantity()" />' +
                            '<span id="errormaterial_price_Edit"></span>' +
                        '</div>'+
                    '</td>' +
                    '<td><span id = "tempRealPriceEditMaterial">' + (dataTemp.material_price * dataTemp.material_quantity) + '</span></td>' +
                    '<td><a title="Lưu cập nhật" href="#" onclick="saveEditMaterialDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeMaterialDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
            $('#material' + dataTemp.material_id).html(html);     
            $('#material_id_Edit').val(dataTemp.material_id);
            $('#material_name_Edit').val(dataTemp.material_name);
            $('#material_numberOfLot_Edit').val(dataTemp.material_numberOfLot);
            $('#material_quantity_Edit').val(dataTemp.material_quantity);
            $('#material_price_Edit').val(dataTemp.material_price);
            $('#material_source_Edit').val(dataTemp.material_source);
            $('#material_description_Edit').val(dataTemp.material_description);

            materialTypeID = dataTemp.materialtype_id;
            unitID = dataTemp.unit_id;
            loadMaterialType(host,token,function(rs){
                var data = rs.Items;
                $('#materialtype_id_Edit').find('*').remove();
                data.forEach(function(materialtype){
                    if(materialtype.materialtype_id == materialTypeID){
                        $('#materialtype_id_Edit').append($("<option selected></option>").attr("value",materialtype.materialtype_id).text(materialtype.materialtype_name));
                    }else{
                        $('#materialtype_id_Edit').append($("<option></option>").attr("value",materialtype.materialtype_id).text(materialtype.materialtype_name));      
                    }
                });
            });
            loadUnit(host,token,function(rs){
                $('#unit_id_Edit').find('*').remove();
                rs.forEach(function(unit){
                    if(unit.unit_id == unitID){
                        $('#unit_id_Edit').append($("<option selected></option>").attr("value",unit.unit_id).text(unit.unit_name));
                    }else{
                        $('#unit_id_Edit').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));      
                    }
                });
            });
        });                            
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham thay doi other detail */
function changeOtherDetailForUpdateBill(otherID){
    if(!stateEditOther){
        loadOtherById(host,token,otherID,function(rs){
            var index;
            var count = -1;
            var dataTemp;
            var html = ''; 
            console.log(rs);
            stateEditOther = true;
            billObj.other.forEach(function(detail){
                count++;
                if(detail.other_id == rs.other_id){
                    index = count;
                }
            });
            dataTemp = rs;

            html += '<td>' + (index + 1) + 
                        '<input type="hidden" name="other_id_Edit" id="other_id_Edit">' +  
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="other_name_Edit" id="other_name_Edit"/>' +
                            '<span id="errorother_name_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' +  
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="other_note_Edit" id="other_note_Edit"/>' +
                        '</div>'+
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="other_quantity_Edit" id="other_quantity_Edit" onkeyup="changeOtherQuantity()" />' +
                            '<span id="errorother_quantity_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td>' + 
                        '<div class="form-group">' +
                            '<input class = "form-control" type="text" name="other_price_Edit" id="other_price_Edit" onkeyup="changeOtherQuantity()" />' +
                            '<span id="errorother_price_Edit"></span>' + 
                        '</div>' +
                    '</td>' +
                    '<td><span id = "tempRealPriceEditOther">' + (dataTemp.other_quantity * dataTemp.other_price) + '</span></td>' +
                    '<td><a title="Lưu cập nhật" href="#" onclick="saveEditOtherDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backFromChangeOtherDetailForUpdateBill();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';

            $('#other' + dataTemp.other_id).html(html);
            $('#other_id_Edit').val(dataTemp.other_id);
            $('#other_name_Edit').val(dataTemp.other_name);
            $('#other_quantity_Edit').val(dataTemp.other_quantity);
            $('#other_price_Edit').val(dataTemp.other_price);
            $('#other_note_Edit').val(dataTemp.other_note);
        });
    }else{
        alert('Xin vui lòng hoàn tất cập nhật hiện tại trước khi tiếp tục chỉnh sửa');
    }
}

/* Ham tro lai khi dang change seed detail */
function backFromChangeSeedDetailForUpdateBill(){
    loadSeedByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        billObj.seed = [];
        rs.forEach(function(temp){
            var tempSource;
            var tempSeed = {
                seed_id:temp.seed_id,
                seed_source:temp.seed_source,
                seed_numberOfLot:temp.seed_numberOfLot,
                seedquality_id:temp.seedquality_id,
                seed_size:temp.seed_size,
                seed_quantity:temp.seed_quantity,
                seed_existence:temp.seed_existence,
                seed_price:temp.seed_price
            }
            billObj.seed.push(tempSeed);
            if(temp.seed_source.length > 50){
                tempSource = temp.seed_source.substr(0,47) + "..."; 
            }else{
                tempSource = temp.seed_source;
            }
            html+=
                    '<tr id="seed' + temp.seed_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + temp.seed_numberOfLot + '</td>' +
                        '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                        '<td>' + temp.seed_size + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + temp.seed_quantity + '</td>' +
                        '<td>' + temp.seed_price + '</td>' +
                        '<td>' + (temp.seed_price * temp.seed_quantity) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>'; 
            stt++;
        });
        if(html != ''){
            $('#divBillSeedDetail').show();
            $('#listBillSeedDetail').html(html);
        }
        stateEditSeed = false;
    });
}

/* Ham tro lai khi dang change material detail */
function backFromChangeMaterialDetailForUpdateBill(){
    loadMaterialByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        billObj.material = [];
        rs.forEach(function(temp){
            var tempSource;
            var tempDescript;
            var tempMaterial = {
                material_id:temp.material_id,
                materialtype_id:temp.materialtype_id,
                material_name:temp.material_name,
                material_numberOfLot:temp.material_numberOfLot,
                unit_id:temp.unit_id,
                material_quantity:temp.material_quantity,
                material_price:temp.material_price,
                material_source:temp.material_source,
                material_description:temp.material_description
            }
            billObj.material.push(tempMaterial);
            if(temp.material_source.length > 35){
                tempSource = temp.material_source.substr(0,30) + "..."; 
            }else{
                tempSource = temp.material_source;
            }

            if(temp.material_description.length > 35){
                tempDescript = temp.material_description.substr(0,30) + "..."; 
            }else{
                tempDescript = temp.material_description;
            }
            html+=
                    '<tr id="material' + temp.material_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + materialType[temp.materialtype_id] + '</td>' +
                        '<td>' + temp.material_name + '</td>' +
                        '<td>' + temp.material_numberOfLot + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + tempSource + '</td>' +
                        '<td>' + tempDescript + '</td>' +
                        '<td>' + temp.material_quantity + '</td>' +
                        '<td>' + temp.material_price + '</td>' +
                        '<td>' + (temp.material_quantity * temp.material_price) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';  
            stt++;
        });
        if(html != ''){
            $('#divBillMaterialDetail').show();
            $('#listBillMaterialDetail').html(html);
        }
        stateEditMaterial = false;
    });
}

/* Ham tro lai khi dang change other detail */
function backFromChangeOtherDetailForUpdateBill(){
    loadOtherByBill(host,token,billObj.bill_id,function(rs){
        var html = '' ;
        var stt = 1;
        billObj.other = [];
        rs.forEach(function(temp){
            var tempNote;
            tempOther = {
                other_id:temp.other_id,
                other_name:temp.other_name,
                other_quantity:temp.other_quantity,
                other_price:temp.other_price,
                other_note:temp.other_note,
            }
            billObj.other.push(tempOther);
            if(temp.other_note.length > 50){
                tempNote = temp.other_note.substr(0,47) + "..."; 
            }else{
                tempNote = temp.other_note;
            }
            html+=
                    '<tr id="other' + temp.other_id +'">' +
                        '<td>' + stt + '</td>' +
                        '<td>' + temp.other_name + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td>' + temp.other_quantity + '</td>' +
                        '<td>' + temp.other_price + '</td>' +
                        '<td>' + (temp.other_quantity * temp.other_price) + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeOtherDetailForUpdateBill('+ temp.other_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForUpdateBill('+ temp.other_id+');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>'; 
            stt++;
        });
        if(html != ''){
            $('#divBillOtherDetail').show();
            $('#listBillOtherDetail').html(html);
        }
        stateEditOther = false;
    });
}

/* Ham luu chinh sua cho seed bill detail */
function saveEditSeedDetailForUpdateBill(){
    if($('#frmEditSeedDetail').valid()){
        loadSeedById(host,token,parseInt($('#seed_id_Edit').val()),function(rs){
            console.log((rs.seed_quantity - rs.seed_existence)<= parseInt($('#seed_quantity_Edit').val()));
            if(rs.seed_quantity == rs.seed_existence){
                var dataSeed = {
                    seed_id:rs.seed_id,
                    bill_id:rs.bill_id,
                    seedquality_id:parseInt($("#seedquality_id_Edit").val()),
                    seed_numberOfLot:$("#seed_numberOfLot_Edit").val(),
                    seed_quantity:parseInt($("#seed_quantity_Edit").val()),
                    seed_existence:parseInt($("#seed_quantity_Edit").val()),
                    seed_price:parseInt($("#seed_price_Edit").val()),
                    seed_source:$("#seed_source_Edit").val(),
                    seed_size:parseFloat($("#seed_size_Edit").val())
                };
                updateSeed(host,token,$('#seed_id_Edit').val(),dataSeed,function(rs){
                    var index;
                    var count = -1;

                    billObj.seed.forEach(function(detail){
                        count++;
                        if(detail.seed_id == $('#seed_id_Edit').val()){
                            index = count;
                        }
                    });

                    billObj.bill_total-=(billObj.seed[index].seed_price * billObj.seed[index].seed_quantity);
                    billObj.bill_total+=(rs.data.seed_price * rs.data.seed_quantity);
                    console.log(billObj.bill_total);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadSeedByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.seed = [];
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempSeed = {
                                    seed_id:temp.seed_id,
                                    seed_source:temp.seed_source,
                                    seed_numberOfLot:temp.seed_numberOfLot,
                                    seedquality_id:temp.seedquality_id,
                                    seed_size:temp.seed_size,
                                    seed_quantity:temp.seed_quantity,
                                    seed_existence:temp.seed_existence,
                                    seed_price:temp.seed_price
                                }
                                billObj.seed.push(tempSeed);
                                if(temp.seed_source.length > 50){
                                    tempSource = temp.seed_source.substr(0,47) + "..."; 
                                }else{
                                    tempSource = temp.seed_source;
                                }
                                html+=
                                        '<tr id="seed' + temp.seed_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + temp.seed_numberOfLot + '</td>' +
                                            '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                                            '<td>' + temp.seed_size + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + temp.seed_quantity + '</td>' +
                                            '<td>' + temp.seed_price + '</td>' +
                                            '<td>' + (temp.seed_price * temp.seed_quantity) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>'; 
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillSeedDetail').show();
                                $('#listBillSeedDetail').html(html);
                            }
                            stateEditSeed = false;
                        });
                    });
                });
            }else if((rs.seed_quantity - rs.seed_existence) <= parseInt($("#seed_quantity_Edit").val())){
                var dataSeed = {
                    seed_id:rs.seed_id,
                    bill_id:rs.bill_id,
                    seedquality_id:parseInt($("#seedquality_id_Edit").val()),
                    seed_numberOfLot:$("#seed_numberOfLot_Edit").val(),
                    seed_quantity:parseInt($("#seed_quantity_Edit").val()),
                    seed_existence:(parseInt($("#seed_quantity_Edit").val()) - (rs.seed_quantity - rs.seed_existence)),
                    seed_price:parseInt($("#seed_price_Edit").val()),
                    seed_source:$("#seed_source_Edit").val(),
                    seed_size:parseFloat($("#seed_size_Edit").val())
                };
                updateSeed(host,token,$('#seed_id_Edit').val(),dataSeed,function(rs){
                    var index;
                    var count = -1;

                    billObj.seed.forEach(function(detail){
                        count++;
                        if(detail.seed_id == $('#seed_id_Edit').val()){
                            index = count;
                        }
                    });
                    console.log(rs);
                    billObj.bill_total-=(billObj.seed[index].seed_price * billObj.seed[index].seed_quantity);
                    console.log(billObj.bill_total);
                    billObj.bill_total+=(rs.data.seed_price * rs.data.seed_quantity);
                    console.log(billObj.bill_total);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadSeedByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.seed = [];
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempSeed = {
                                    seed_id:temp.seed_id,
                                    seed_source:temp.seed_source,
                                    seed_numberOfLot:temp.seed_numberOfLot,
                                    seedquality_id:temp.seedquality_id,
                                    seed_size:temp.seed_size,
                                    seed_quantity:temp.seed_quantity,
                                    seed_existence:temp.seed_existence,
                                    seed_price:temp.seed_price
                                }
                                billObj.seed.push(tempSeed);
                                if(temp.seed_source.length > 50){
                                    tempSource = temp.seed_source.substr(0,47) + "..."; 
                                }else{
                                    tempSource = temp.seed_source;
                                }
                                html+=
                                        '<tr id="seed' + temp.seed_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + temp.seed_numberOfLot + '</td>' +
                                            '<td>' + seedQuanlity[temp.seedquality_id] + '</td>' +
                                            '<td>' + temp.seed_size + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + temp.seed_quantity + '</td>' +
                                            '<td>' + temp.seed_price + '</td>' +
                                            '<td>' + (temp.seed_price * temp.seed_quantity) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteSeedDetailForUpdateBill('+ temp.seed_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>'; 
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillSeedDetail').show();
                                $('#listBillSeedDetail').html(html);
                            }
                            stateEditSeed = false;
                        });
                    });
                });
            }else{
                alert('Không thể tiến hành cập nhật do số lượng giống nhỏ hơn số lượng đã sữ dụng khi thả nuôi');
            }
        });
    }
}

/* Ham luu chinh sua cho material bill detail */
function saveEditMaterialDetailForUpdateBill(){
    if($('#frmEditMaterialDetail').valid()){
        loadMaterialById(host,token,parseInt($('#material_id_Edit').val()),function(rs){
            console.log(parseFloat($("#material_quantity_Edit").val()));
            console.log((rs.material_quantity - rs.material_existence));
            if(rs.material_quantity == rs.material_existence){
                var dataMaterial = {
                    material_id:rs.material_id,
                    bill_id:rs.bill_id,
                    materialtype_id:parseInt($('#materialtype_id_Edit').val()),
                    unit_id:parseInt($('#unit_id_Edit').val()),
                    material_name:$('#material_name_Edit').val(),
                    material_numberOfLot:$('#material_numberOfLot_Edit').val(),
                    material_source:$('#material_source_Edit').val(),
                    material_quantity:parseFloat($('#material_quantity_Edit').val()),
                    material_existence:parseFloat($('#material_quantity_Edit').val()),
                    material_price: parseInt($('#material_price_Edit').val()),
                    material_description: $('#material_description_Edit').val(),
                    material_state:true
                };

                updateMaterial(host,token,$('#material_id_Edit').val(),dataMaterial,function(rs){
                    var index;
                    var count = -1;

                    billObj.material.forEach(function(detail){
                        count++;
                        if(detail.material_id == $('#material_id_Edit').val()){
                            index = count;
                        }
                    });

                    billObj.bill_total-=(billObj.material[index].material_price * billObj.material[index].material_quantity);
                    billObj.bill_total+=(rs.material_price * rs.material_quantity);
                    console.log(billObj.bill_total);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadMaterialByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.material = [];
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempDescript;
                                var tempMaterial = {
                                    material_id:temp.material_id,
                                    materialtype_id:temp.materialtype_id,
                                    material_name:temp.material_name,
                                    material_numberOfLot:temp.material_numberOfLot,
                                    unit_id:temp.unit_id,
                                    material_quantity:temp.material_quantity,
                                    material_price:temp.material_price,
                                    material_source:temp.material_source,
                                    material_description:temp.material_description
                                }
                                billObj.material.push(tempMaterial);
                                if(temp.material_source.length > 35){
                                    tempSource = temp.material_source.substr(0,30) + "..."; 
                                }else{
                                    tempSource = temp.material_source;
                                }

                                if(temp.material_description.length > 35){
                                    tempDescript = temp.material_description.substr(0,30) + "..."; 
                                }else{
                                    tempDescript = temp.material_description;
                                }
                                html+=
                                        '<tr id="material' + temp.material_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + materialType[temp.materialtype_id] + '</td>' +
                                            '<td>' + temp.material_name + '</td>' +
                                            '<td>' + temp.material_numberOfLot + '</td>' +
                                            '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + tempDescript + '</td>' +
                                            '<td>' + temp.material_quantity + '</td>' +
                                            '<td>' + temp.material_price + '</td>' +
                                            '<td>' + (temp.material_quantity * temp.material_price) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>';  
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillMaterialDetail').show();
                                $('#listBillMaterialDetail').html(html);
                            }
                            stateEditMaterial = false;
                        });
                    });
                });
            }else if((rs.material_quantity - rs.material_existence) <= parseFloat($("#material_quantity_Edit").val())){
                var dataMaterial = {
                    material_id:rs.material_id,
                    bill_id:rs.bill_id,
                    materialtype_id:parseInt($('#materialtype_id_Edit').val()),
                    unit_id:parseInt($('#unit_id_Edit').val()),
                    material_name:$('#material_name_Edit').val(),
                    material_numberOfLot:$('#material_numberOfLot_Edit').val(),
                    material_source:$('#material_source_Edit').val(),
                    material_quantity:parseFloat($('#material_quantity_Edit').val()),
                    material_existence:parseFloat($("#material_quantity_Edit").val() - (rs.material_quantity - rs.material_existence)),
                    material_price: parseInt($('#material_price_Edit').val()),
                    material_description: $('#material_description_Edit').val(),
                    material_state:true
                };
                updateMaterial(host,token,$('#material_id_Edit').val(),dataMaterial,function(rs){
                    var index;
                    var count = -1;

                    billObj.material.forEach(function(detail){
                        count++;
                        if(detail.material_id == $('#material_id_Edit').val()){
                            index = count;
                        }
                    });
                    console.log(rs);
                    console.log(billObj.bill_total);
                    billObj.bill_total-=(billObj.material[index].material_price * billObj.material[index].material_quantity);
                    console.log(billObj.bill_total);
                    billObj.bill_total+=(rs.material_price * rs.material_quantity);
                    console.log(billObj.bill_total);
                    $("#bill_total").text(billObj.bill_total);
                    var dataUpdate = {
                        user_id: userId,
                        stocking_id: billObj.stocking_id,
                        bill_total: billObj.bill_total,
                        bill_dateInBill: billObj.bill_dateInBill,
                        bill_createDate: billObj.bill_createDate
                    };
                    updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                        loadMaterialByBill(host,token,billObj.bill_id,function(rs){
                            var html = '' ;
                            var stt = 1;
                            billObj.material = [];
                            rs.forEach(function(temp){
                                var tempSource;
                                var tempDescript;
                                var tempMaterial = {
                                    material_id:temp.material_id,
                                    materialtype_id:temp.materialtype_id,
                                    material_name:temp.material_name,
                                    material_numberOfLot:temp.material_numberOfLot,
                                    unit_id:temp.unit_id,
                                    material_quantity:temp.material_quantity,
                                    material_price:temp.material_price,
                                    material_source:temp.material_source,
                                    material_description:temp.material_description
                                }
                                billObj.material.push(tempMaterial);
                                if(temp.material_source.length > 35){
                                    tempSource = temp.material_source.substr(0,30) + "..."; 
                                }else{
                                    tempSource = temp.material_source;
                                }

                                if(temp.material_description.length > 35){
                                    tempDescript = temp.material_description.substr(0,30) + "..."; 
                                }else{
                                    tempDescript = temp.material_description;
                                }
                                html+=
                                        '<tr id="material' + temp.material_id +'">' +
                                            '<td>' + stt + '</td>' +
                                            '<td>' + materialType[temp.materialtype_id] + '</td>' +
                                            '<td>' + temp.material_name + '</td>' +
                                            '<td>' + temp.material_numberOfLot + '</td>' +
                                            '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                                            '<td>' + tempSource + '</td>' +
                                            '<td>' + tempDescript + '</td>' +
                                            '<td>' + temp.material_quantity + '</td>' +
                                            '<td>' + temp.material_price + '</td>' +
                                            '<td>' + (temp.material_quantity * temp.material_price) + '</td>' +
                                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMaterialDetailForUpdateBill('+ temp.material_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                        '</tr>';  
                                stt++;
                            });
                            if(html != ''){
                                $('#divBillMaterialDetail').show();
                                $('#listBillMaterialDetail').html(html);
                            }
                            stateEditMaterial = false;
                        });
                    });
                });
            }else{
                alert('Không thể tiến hành cập nhật do số lượng giống nhỏ hơn số lượng đã sữ dụng khi thả nuôi');
            }
        });
    }
}

/* Ham luu chinh sua cho material bill detail */
function saveEditOtherDetailForUpdateBill(){
    if($('#frmEditOtherDetail').valid()){
        var dataOther = {
            other_id:parseInt($('#other_id_Edit').val()),
            bill_id:billObj.bill_id,
            other_name:$('#other_name_Edit').val(),
            other_quantity:parseFloat($('#other_quantity_Edit').val()),
            other_price:$('#other_price_Edit').val(),
            other_note:$('#other_note_Edit').val(),
        };
        updateOther(host,token,$('#other_id_Edit').val(),dataOther,function(rs){
            var index;
            var count = -1;

            billObj.other.forEach(function(detail){
                count++;
                if(detail.other_id == $('#other_id_Edit').val()){
                    index = count;
                }
            });

            billObj.bill_total-=(billObj.other[index].other_price * billObj.other[index].other_quantity);
            billObj.bill_total+=(rs.data.other_price * rs.data.other_quantity);
            console.log(billObj.bill_total);
            $("#bill_total").text(billObj.bill_total);
            var dataUpdate = {
                user_id: userId,
                stocking_id: billObj.stocking_id,
                bill_total: billObj.bill_total,
                bill_dateInBill: billObj.bill_dateInBill,
                bill_createDate: billObj.bill_createDate
            };
            updateBill(host,token,billObj.bill_id,dataUpdate,function(rs){
                loadOtherByBill(host,token,billObj.bill_id,function(rs){
                    var html = '' ;
                    var stt = 1;
                    billObj.other = [];
                    rs.forEach(function(temp){
                        var tempNote;
                        tempOther = {
                            other_id:temp.other_id,
                            other_name:temp.other_name,
                            other_quantity:temp.other_quantity,
                            other_price:temp.other_price,
                            other_note:temp.other_note,
                        }
                        billObj.other.push(tempOther);
                        if(temp.other_note.length > 50){
                            tempNote = temp.other_note.substr(0,47) + "..."; 
                        }else{
                            tempNote = temp.other_note;
                        }
                        html+=
                                '<tr id="other' + temp.other_id +'">' +
                                    '<td>' + stt + '</td>' +
                                    '<td>' + temp.other_name + '</td>' +
                                    '<td>' + tempNote + '</td>' +
                                    '<td>' + temp.other_quantity + '</td>' +
                                    '<td>' + temp.other_price + '</td>' +
                                    '<td>' + (temp.other_quantity * temp.other_price) + '</td>' +
                                    '<td><a title="Cập nhật" href="#" onclick="changeOtherDetailForUpdateBill('+ temp.other_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteOtherDetailForUpdateBill('+ temp.other_id+');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                '</tr>'; 
                        stt++;
                    });
                    if(html != ''){
                        $('#divBillOtherDetail').show();
                        $('#listBillOtherDetail').html(html);
                    }
                    stateEditOther = false;
                });
            });
        });        
    }
}

/* Ham lay danh sach seed theo bill ID */
function loadSeedByBill(host,token,billID,callback){
    var request = $.ajax({
        url : host + '/api/seed/getbybill/' + billID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách giống nuôi theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách giống nuôi theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay danh sach Material theo bill ID */
function loadMaterialByBill(host,token,billID,callback){
    var request = $.ajax({
        url : host + '/api/material/getbybill/' + billID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách vật tư theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách vật tư theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay danh sach other theo bill ID */
function loadOtherByBill(host,token,billID,callback){
    var request = $.ajax({
        url : host + '/api/other/getbybill/' + billID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách vật tư theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách vật tư theo hóa đơn, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao cho trang stocking pond */
function initCreateStockingPondPage(){
    $("#stockpond_date" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#stockpond_date" ).datepicker('setDate',new Date());
    arraySeed[0] = 0;
    loadSeedQuality(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
        });
    });
    
    loadPondByUser(host,token,userId,function(rs){
        rs.forEach(function(pond){
            arrayPond.push(pond.pond_id);
            $('#pond_id').append($("<option></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
        });
        $('#pond_id').selectpicker('refresh');
        loadStockingByUser(host,token,userId,function(rs){
            rs.forEach(function(stocking){
                if(stocking.stocking_id == stocking_id){
                    $('#stocking_id').append($("<option selected></option>").attr("value",stocking.stocking_id).text('Đợt thả nuôi số ' + stocking.stocking_id));
                }else{
                    $('#stocking_id').append($("<option></option>").attr("value",stocking.stocking_id).text('Đợt thả nuôi số ' + stocking.stocking_id));
                }        
            });
            $('#stocking_id').selectpicker('refresh');
            changeStockingForStockingPond();
        });
    });
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham change stocking for createStockingpond */
function changeStockingForStockingPond(){
    $('#pond_id').find('*').remove();
    $('#pond_id').append($("<option></option>").attr("value",0).text('Chọn ao nuôi'));
    loadStockingPondByStocking(host,token,$('#stocking_id').val(),function(rs){
        rs.forEach(function(pond){
            arrayPondUsing.push(pond.pond_id);
        });
        arrayPond.forEach(function(pondFree){          
            if(arrayPondUsing.indexOf(pondFree) == -1){
                $('#pond_id').append($("<option></option>").attr("value",pondFree).text('Ao số ' + pondFree));
            }
        });
        $('#pond_id').selectpicker('refresh');
    });
    $('#seed_id').find('*').remove();
    $('#seed_id').append($("<option></option>").attr("value",0).text('Chọn lô giống'));
    arraySeed = [];
    arraySeed[0] = 0;
    loadSeedByUserAndStocking(host,token,userId,$('#stocking_id').val(),function(rs){
        rs.forEach(function(seed){
            arraySeed[seed.seed_id] = seed.seed_existence;
            $('#seed_id').append($("<option></option>").attr("value",seed.seed_id).text('Lô số ' + seed.seed_numberOfLot + ' - ' + seedQuanlity[seed.seedquality_id] + '- Còn ' + seed.seed_existence));
        });
        $('#seed_id').selectpicker('refresh');
    });
}

/* Ham load stocking pond by stocking_id */
function loadStockingPondByStocking(host,token,stockingID,callback){
    var request = $.ajax({
        url : host + '/api/stockingPond/getbystocking/' + stockingID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được chi tiết thả nuôi theo đợt nuôi, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được chi tiết thả nuôi theo đợt nuôi, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay seed theo User and Stocking */
function loadSeedByUserAndStocking(host,token,userID,stockingID,callback){
    var request = $.ajax({
        url : host + '/api/seed/getlistbyuserandstocking?user_id='+ userID + '&stocking_id=' + stockingID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách giống theo đợt nuôi, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách giống theo đợt nuôi, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay seed theo id*/
function loadSeedById(host,token,seedID,callback){
    var request = $.ajax({
        url : host + '/api/seed/getbyid/' + seedID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được chi tiết lo giống theo Id, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được chi tiết lo giống theo Id, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay seed theo id*/
function loadOtherById(host,token,otherID,callback){
    var request = $.ajax({
        url : host + '/api/other/getbyid/' + otherID,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được chi tiết khác, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được chi tiết khác, nhấn F5 để tải lại trang",$('#error'));
    });
}
/* Ham change PCR */
function changePCR(obj){
    if(obj.value == 'co'){
        $('#divPCR').show();
    }else{
        $('#divPCR').hide();
    }
}

/* Ham khoi tao cho trang chi tiet dot nuoi */
function initDetailStockingPage(){
    var index = 0;
    var pageSize = 10;
    //Goi ham load loai hinh tha nuoi
    loadStockingType(host,token,function(rs){
        rs.forEach(function(stkType){
            if(stockingObj.stockingtype_id == stkType.stockingtype_id){
                $("#stockingtype_id").append($("<option selected></option>").attr("value",stkType.stockingtype_id).text(stkType.stockingtype_name));
            }else{
                $("#stockingtype_id").append($("<option></option>").attr("value",stkType.stockingtype_id).text(stkType.stockingtype_name));
            }
        });
        $('#stockingtype_id').selectpicker('refresh');
    });
    //Goi ham load loai nuoi
    loadSpecies(host,token,function(rs){
        rs.forEach(function(specie){
            if(stockingObj.species_id == specie.species_id){
                $("#species_id").append($("<option selected></option>").attr("value",specie.species_id).text(specie.species_name));
            }else{
                $("#species_id").append($("<option></option>").attr("value",specie.species_id).text(specie.species_name));
            }
        });
        $('#species_id').selectpicker('refresh');
    });

    $('#stocking_quantity').val(stockingObj.stocking_quantity);
    console.log(stockingObj.stocking_node);
    $('#stocking_note').val(stockingObj.stocking_note);
    
    loadStockingPondPagination(host,token,userId,index,pageSize);
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham luu thay doi tren dot tha nuoi */
function saveChangeStocking(){
    if($('#editStockingFrm').valid()){
        var stockingtype_id = $('#stockingtype_id').val() ;
        var species_id = $('#species_id').val();
        var stocking_quantity = $('#stocking_quantity').val();
        var stocking_note = ($('#stocking_note').val().length == 0)?"":$('#stocking_note').val();
        var stocking_date = $('#stocking_date').val() ;
        var stocking_status = false;
        if($('#stocking_status').prop("checked")){
            stocking_status = true;
        }
        //Dong goi data cho vao req
        var data = {
            user_id: userId,
            stockingtype_id: parseInt(stockingtype_id),
            species_id: parseInt(species_id),
            stocking_quantity: parseInt(stocking_quantity),
            stocking_note: stocking_note,
            stocking_date:stocking_date,
            stocking_status:stocking_status
        };
        var request = $.ajax({
            url : host + '/api/stocking/update/' + stockingObj.stocking_id,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                eventClickSuccess('Cập nhật thành công',$('#error'));                         
            }
        });
        request.fail(function(jqXHR, textStatus){
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
    }
}

/* Ham load stocking co phan trang */
function loadStockingPondPagination(host,token,userID,page,size){
    var keyword = "";
    var request = $.ajax({
        url : host + '/api/stockingPond/getpagination/' +  stockingObj.stocking_id + '?page=' + page +'&pageSize='+ size +'&keyword='+keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách ao thả nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var html = '';
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(stkPond){
                    html += 
                        '<tr>' +
                            '<td>' + stt + '</td>' +
                            '<td>' + 'Ao nuôi số ' + stkPond.pond_id + '</td>' +
                            '<td>' + stkPond.stockpond_quantityStock + '</td>' + 
                            '<td>' + moment(stkPond.stockpond_date).format('DD-MM-YYYY') + '</td>' +
                            '<td><a title= "Xem đầy đủ chi tiết thả nuôi của ao" href="/quantrac/nongdan/chitietthanuoi/chitiet?stocking_id='+ stkPond.stocking_id +'&pond_id=' + stkPond.pond_id + '"><button class="btn btn-primary">Chi tiết</button></a>&nbsp;&nbsp;<a title = "Quản lý hoạt động chăm sóc" href="/quantrac/nongdan/hoatdong/danhsach?stocking_id='+ stkPond.stocking_id +'&pond_id=' + stkPond.pond_id + '"><button class="btn btn-primary">Chăm sóc</button></a>&nbsp;&nbsp;<a title = "Quản lý theo dõi tăng trưởng" href="/quantrac/nongdan/tangtruong/danhsach?stocking_id='+ stkPond.stocking_id +'&pond_id=' + stkPond.pond_id + '"><button class="btn btn-primary">Tăng trưởng</button></a></td>' + 
                        '</tr>' ;
                    stt++;
                });
            }else{
                html += 
                        '<tr>' +
                            '<td colspan="5">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
            }   
            $('#listPond').html(html);
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadStockingPondPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadStockingPondPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiPondList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách ao thả nuôi thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao cho trang detail stocking pond */
function initDetailStockingPondPage(){
    $("#stockpond_date" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#stockpond_date" ).datepicker('setDate',new Date(stkPondObj.stockpond_date.substr(0,10)));
    arraySeed[0] = 0;
    loadSeedQuality(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(seed_quality){
            seedQuanlity[seed_quality.seedquality_id] = seed_quality.seedquality_name;  
        });
        loadSeedByUserAndStocking(host,token,userId,stkPondObj.stocking_id,function(rs){
            rs.forEach(function(seed){
                if(seed.seed_id == stkPondObj.seed_id){
                    arraySeed[seed.seed_id] = {
                        seed_id:seed.seed_id,
                        bill_id:seed.bill_id,
                        seedquality_id:seed.seedquality_id,
                        seed_numberOfLot:seed.seed_numberOfLot,
                        seed_quantity:seed.seed_quantity,
                        seed_existence:(seed.seed_existence + stkPondObj.stockpond_quantityStock),
                        seed_price:seed.seed_price,
                        seed_source:seed.seed_source,
                        seed_size:seed.seed_size
                    };
                    $('#seed_id').append($("<option selected></option>").attr("value",seed.seed_id).text('Lô số ' + seed.seed_numberOfLot + ' - ' + seedQuanlity[seed.seedquality_id]));
                }else{
                    arraySeed[seed.seed_id] = {
                        seed_id:seed.seed_id,
                        bill_id:seed.bill_id,
                        seedquality_id:seed.seedquality_id,
                        seed_numberOfLot:seed.seed_numberOfLot,
                        seed_quantity:seed.seed_quantity,
                        seed_existence:seed.seed_existence,
                        seed_price:seed.seed_price,
                        seed_source:seed.seed_source,
                        seed_size:seed.seed_size
                    };
                    $('#seed_id').append($("<option></option>").attr("value",seed.seed_id).text('Lô số ' + seed.seed_numberOfLot + ' - ' + seedQuanlity[seed.seedquality_id]));
                }
            });
            $('#seed_id').selectpicker('refresh');
            $('#stockpond_quantityStock').val(stkPondObj.stockpond_quantityStock);
        });
    });
    
    loadStockingByUser(host,token,userId,function(rs){
        rs.forEach(function(stocking){
            if(stocking.stocking_id == stkPondObj.stocking_id){
                $('#stocking_id').append($("<option selected></option>").attr("value",stocking.stocking_id).text('Đợt thả nuôi số ' + stocking.stocking_id));
            }else{
                $('#stocking_id').append($("<option></option>").attr("value",stocking.stocking_id).text('Đợt thả nuôi số ' + stocking.stocking_id));
            }        
        });
        $('#stocking_id').selectpicker('refresh');
    });

    loadPondByUser(host,token,userId,function(rs){
        rs.forEach(function(pond){
            if(pond.pond_id == stkPondObj.pond_id){
                $('#pond_id').append($("<option selected></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
            }else{
                $('#pond_id').append($("<option></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
            }
        });
        $('#pond_id').selectpicker('refresh');
    });

    if(stkPondObj.stockpond_PCR){
        $('#divPCR').show();
    }
    $('#stockpond_PCR').val();
    $('#stockpond_PCRresult').val(stkPondObj.stockpond_PCRresult);
    $('#stockpond_density').val(stkPondObj.stockpond_density);
    $('#stockpond_method').val(stkPondObj.stockpond_method);
    $('#stockpond_depth').val(stkPondObj.stockpond_depth);
    $('#stockpond_salinity').val(stkPondObj.stockpond_salinity);
    $('#stockpond_clarity').val(stkPondObj.stockpond_clarity);
    $('#stockpond_DO').val(stkPondObj.stockpond_DO);
    $('#stockpond_PHwater').val(stkPondObj.stockpond_PHwater);
    $('#stockpond_tempAir').val(stkPondObj.stockpond_tempAir);
    $('#stockpond_tempWater').val(stkPondObj.stockpond_tempWater);
    $('#stockpond_age').val(stkPondObj.stockpond_age);
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham luu thay doi tren stocking Pond */
function saveChangeStockingPond(){
    if($('#editStockingPondFrm').valid()){
        var stocking_id = parseInt($('#stocking_id').val());
        var pond_id = parseInt($('#pond_id').val()); 
        var seed_id = parseInt($('#seed_id').val());
        var temp = $("#stockpond_date" ).val().split("/");
        var stockpond_date = new Date(temp[2],temp[1] - 1,temp[0]);
        var stockpond_PCR;
        var stockpond_PCRresult = $('#stockpond_PCRresult').val();
        var stockpond_quantityStock = parseInt($('#stockpond_quantityStock').val());
        var stockpond_age = parseInt($('#stockpond_age').val());
        var stockpond_statusOfSeed = true;
        var stockpond_density = parseInt($('#stockpond_density').val());
        var stockpond_method = $('#stockpond_method').val();
        var stockpond_depth = parseFloat($('#stockpond_depth').val());
        var stockpond_salinity = parseFloat($('#stockpond_salinity').val());
        var stockpond_clarity = parseFloat($('#stockpond_clarity').val());
        var stockpond_DO = parseFloat($('#stockpond_DO').val());
        var stockpond_PHwater = parseFloat($('#stockpond_PHwater').val());
        var stockpond_tempAir = parseFloat($('#stockpond_tempAir').val());
        var stockpond_tempWater = parseFloat($('#stockpond_tempWater').val());
        var stockpond_state = true;
        //Lay PCR
        for(var i = 0 ; i < document.getElementsByName("stockpond_PCR").length ; i++){
            if(document.getElementsByName("stockpond_PCR")[i].checked){
                stockpond_PCR= document.getElementsByName("stockpond_PCR")[i].value;
            }
        }
        if(stockpond_PCR == 'co'){
            stockpond_PCR = true;
        }else{
            stockpond_PCR = false;
        }
        
        var dataSeed1 = {
                            seed_id:arraySeed[stkPondObj.seed_id].seed_id,
                            bill_id:arraySeed[stkPondObj.seed_id].bill_id,
                            seedquality_id:arraySeed[stkPondObj.seed_id].seedquality_id,
                            seed_numberOfLot:arraySeed[stkPondObj.seed_id].seed_numberOfLot,
                            seed_quantity:arraySeed[stkPondObj.seed_id].seed_quantity,
                            seed_existence:arraySeed[stkPondObj.seed_id].seed_existence,
                            seed_price:arraySeed[stkPondObj.seed_id].seed_price,
                            seed_source:arraySeed[stkPondObj.seed_id].seed_source,
                            seed_size:arraySeed[stkPondObj.seed_id].seed_size
                        };
        updateSeed(host,token,stkPondObj.seed_id,dataSeed1,function(rs){
            var dataSeed2 = {
                seed_id:arraySeed[$('#seed_id').val()].seed_id,
                bill_id:arraySeed[$('#seed_id').val()].bill_id,
                seedquality_id:arraySeed[$('#seed_id').val()].seedquality_id,
                seed_numberOfLot:arraySeed[$('#seed_id').val()].seed_numberOfLot,
                seed_quantity:arraySeed[$('#seed_id').val()].seed_quantity,
                seed_existence:(arraySeed[$('#seed_id').val()].seed_existence - parseInt($('#stockpond_quantityStock').val())),
                seed_price:arraySeed[$('#seed_id').val()].seed_price,
                seed_source:arraySeed[$('#seed_id').val()].seed_source,
                seed_size:arraySeed[$('#seed_id').val()].seed_size
            };
            updateSeed(host,token,$('#seed_id').val(),dataSeed2,function(rs){
                stkPondObj.seed_id = parseInt($('#seed_id').val());
                stkPondObj.stockpond_quantityStock = parseInt($('#stockpond_quantityStock').val());

                //Dong goi data cho vao req
                var data = {
                    stocking_id: stocking_id,
                    pond_id: pond_id,
                    stockpond_date: stockpond_date,
                    seed_id: seed_id,
                    stockpond_age:stockpond_age,
                    stockpond_PCR: stockpond_PCR,
                    stockpond_PCRresult: stockpond_PCRresult,
                    stockpond_quantityStock:stockpond_quantityStock,
                    stockpond_density:stockpond_density,
                    stockpond_statusOfSeed:stockpond_statusOfSeed,
                    stockpond_method:stockpond_method,
                    stockpond_depth:stockpond_depth,
                    stockpond_salinity:stockpond_salinity,
                    stockpond_clarity:stockpond_clarity,
                    stockpond_DO:stockpond_DO,
                    stockpond_PHwater:stockpond_PHwater,
                    stockpond_tempAir:stockpond_tempAir,
                    stockpond_tempWater:stockpond_tempWater,
                    stockpond_state:stockpond_state
                };

                var request = $.ajax({
                    url : host + '/api/stockingPond/update?stocking_id=' + stocking_id + '&pond_id=' + pond_id,
                    method : 'PUT',
                    contentType: 'application/json; charset=utf-8',
                    data: data,
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded',
                        'Authorization':token
                    }
                });
                request.done(function(rs){
                    if(rs.Error){
                        eventClickFail('Cập nhật thất bại',$('#error'));
                    }else{
                        eventClickSuccess('Cập nhật thành công',$('#error'));                         
                    }
                });
                request.fail(function(jqXHR, textStatus){
                    eventClickFail('Cập nhật thất bại',$('#error')); 
                });
            });
        });
    }
}

/* Ham cap nhat seed */
function updateSeed(host,token,seedID,data,callback){
    var request = $.ajax({
            url : host + '/api/seed/update/' + seedID,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                callback(rs);                        
            }
        });
        request.fail(function(jqXHR, textStatus){
            console.log(jqXHR);
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
}

/* Ham cap nhat seed */
function updateOther(host,token,otherID,data,callback){
    var request = $.ajax({
            url : host + '/api/other/update/' + otherID,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                callback(rs);                        
            }
        });
        request.fail(function(jqXHR, textStatus){
            console.log(jqXHR);
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
}

/* Ham khoi tao trang them hoat dong */
function initAddActivityPage(){
    $("#activity_date" ).datetimepicker({format: 'DD/MM/YYYY HH:mm',locale:'vi'}); 
    $("#activity_date" ).datetimepicker('defaultDate',new Date());
    loadActiType(host,token,function(rs){
        rs.forEach(function(actiType){
            $('#actitype_id').append($("<option></option>").attr("value",actiType.actitype_id).text(actiType.actitype_name));
        });
        $('#actitype_id').selectpicker('refresh');
    });
    loadMaterialByStocking(host,token,stocking_id,function(rs){
        arrayMaterial[0]={
            material_id:0,
            materialtype_id: 0,
            unit_id:0,
            bill_id:0,
            material_numberOfLot:'',
            material_source:'',
            material_quantity:0,
            material_price:0,
            material_description:'',
            material_state:true,
            material_name: '',
            material_existence: ''
        };
        rs.forEach(function(material){
            arrayMaterial[material.material_id] = {
                material_id:material.material_id,
                materialtype_id: material.materialtype_id,
                unit_id:material.unit_id,
                bill_id:material.bill_id,
                material_numberOfLot:material.material_numberOfLot,
                material_source:material.material_source,
                material_quantity:material.material_quantity,
                material_price:material.material_price,
                material_description:material.material_description,
                material_state:material.material_state,
                material_name: material.material_name,
                material_existence: material.material_existence
            };
            if(material.material_existence > 0){
                $('#material_id').append($("<option></option>").attr("value",material.material_id).text(material.material_name + " - Còn lại " + material.material_existence));
            }
        });
        $('#material_id').selectpicker('refresh');
    });   
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

function loadActiType(host,token,callback){
    var request = $.ajax({
            url : host + '/api/activitytype/getpagination?page=0&pageSize=10&keyword=',
            method : 'GET',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization': token 
            }
        });
        request.done(function(result){
            if(result.Error){
                showError("Không lấy được loại hoạt động, nhấn F5 để tải lại trang",$('#error'));
            }else{
                callback(result.data.Items);
            }
        });
        request.fail(function(jqXHR, textStatus){
            showError("Không lấy được loại hoạt động, nhấn F5 để tải lại trang",$('#error'));
        });
}

function loadMaterialByStocking(host,token,stockingID,callback){
    var request = $.ajax({
            url : host + '/api/material/getbystocking/' + stockingID ,
            method : 'GET',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Authorization': token 
            }
        });
        request.done(function(result){
            if(result.Error){
                showError("Không lấy được danh sách vật tư, nhấn F5 để tải lại trang",$('#error'));
            }else{
                callback(result.data);
            }
        });
        request.fail(function(jqXHR, textStatus){
            showError("Không lấy được danh sách vật tư, nhấn F5 để tải lại trang",$('#error'));
        });
}

//Ham add chi tiet vat lieu su dung cho hoat dong
function addMaterialDetailForActivity(){
    if($("#frmAddMaterialUsing").valid()){
        $('#divMaterialDetail').show();
        var index = -1;
        var count = -1;
        material_activity.data.forEach(function(detail){
            count++;
            if(detail.material_id == parseInt($('#material_id').val())){
                index = count;
            }
        });
        if(index == -1){
            var html = '';
            var temp;
            material_activity.stt++;
            material_activity.detaltSTT++;
            temp = {
                detailt_stt:material_activity.detaltSTT,
                material_id: parseInt($('#material_id').val()),
                actimaterial_amount: parseFloat($('#actimaterial_amount').val()),
            }
            arrayMaterial[temp.material_id].material_existence = arrayMaterial[temp.material_id].material_existence - temp.actimaterial_amount; 
            material_activity.data.push(temp);
            console.log(arrayMaterial);
            html +=
                    '<tr id="am' + temp.detailt_stt + '">' +
                        '<td>' + material_activity.stt + '</td>' +
                        '<td>' + arrayMaterial[temp.material_id].material_name + '</td>' +
                        '<td>' + temp.actimaterial_amount + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';   
            $('#listActivityMaterialDetail').html($('#listActivityMaterialDetail').html() + html);   
            resetFormAddMaterialForActivity();
        }else{
            var html = '';
            var sttTemp = 1;
            material_activity.data[index].actimaterial_amount += parseFloat($('#actimaterial_amount').val());
            arrayMaterial[parseInt($('#material_id').val())].material_existence = arrayMaterial[parseInt($('#material_id').val())].material_existence - parseFloat($('#actimaterial_amount').val()); 
            material_activity.data.forEach(function(temp){
                html += 
                        '<tr id="am' + temp.detailt_stt + '">' +
                            '<td>' + sttTemp + '</td>' +
                            '<td>' + arrayMaterial[temp.material_id].material_name + '</td>' +
                            '<td>' + temp.actimaterial_amount + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>';   
                sttTemp++;
            });
            $('#listActivityMaterialDetail').html(html);
            resetFormAddMaterialForActivity();    
        }     
    }
}

//Ham xoa material_activity
function deleteMateriaDetailForActivity(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    material_activity.data.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    arrayMaterial[material_activity.data[index].material_id].material_existence = arrayMaterial[material_activity.data[index].material_id].material_existence + material_activity.data[index].actimaterial_amount; 
    material_activity.data.splice(index,1);
    material_activity.stt--;
    material_activity.data.forEach(function(temp){
        html += 
                '<tr id="am' + temp.detailt_stt + '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + arrayMaterial[temp.material_id].material_name + '</td>' +
                    '<td>' + temp.actimaterial_amount + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForActivity('+ temp.detailt_stt +'); return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';   
        sttTemp++;
    });
    $('#listActivityMaterialDetail').html(html);
    flashStateEdit = false;
    if(html==''){
        $('#divMaterialDetail').hide();
    }
    resetFormAddMaterialForActivity();  
}

/* Ham changeMaterialDetailForActivity */
function changeMaterialDetailForActivity(detailSTT){
    if(!flashStateEdit){
        var index;
        var count = -1;
        var dataTemp; 
        var html = '';

        flashStateEdit = true;
        material_activity.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == detailSTT){
                index = count;
            }
        });
        dataTemp = material_activity.data[index];

        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="detailt_stt_Edit" id="detailt_stt_Edit">' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "material_id_Edit" name = "material_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errormaterial_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="actimaterial_amount_Edit" id="actimaterial_amount_Edit"/>' +
                        '<span id="erroractimaterial_amount_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditMaterialDetailForActivity();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backEditMaterialDetailForActivity();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
        $('#am' + dataTemp.detailt_stt).html(html);
        $('#detailt_stt_Edit').val(dataTemp.detailt_stt);
        $('#actimaterial_amount_Edit').val(dataTemp.actimaterial_amount);
        loadMaterialByStocking(host,token,stocking_id,function(rs){
            $('#material_id_Edit').find('*').remove();
            arrayMaterial[0].material_existence = 0;
            rs.forEach(function(material){
                if(material.material_id == dataTemp.material_id){
                    arrayMaterial[material.material_id].material_existence = arrayMaterial[material.material_id].material_existence + dataTemp.actimaterial_amount;
                    $('#material_id_Edit').append($("<option selected></option>").attr("value",material.material_id).text(material.material_name));
                }else{
                    $('#material_id_Edit').append($("<option></option>").attr("value",material.material_id).text(material.material_name));
                }     
            });
            material_id_temp = dataTemp.material_id;
            actimaterial_amount_temp = dataTemp.actimaterial_amount;
            stateEdit = false;
            console.log(material_id_temp);
            console.log(actimaterial_amount_temp);
        });
    }else{
        alert('Xin vui lòng hoàn tất các chỉnh sửa hiện tại trước khi tiếp tục');
    }
}

/* Ham huy cap nhat vat tu dung cho activiti */
function backEditMaterialDetailForActivity(){
    if(!stateEdit){
        var html='';
        var sttTemp = 1;
        console.log(material_id_temp);
        console.log(actimaterial_amount_temp);
        arrayMaterial[material_id_temp].material_existence -= actimaterial_amount_temp;
        console.log(arrayMaterial);
        material_activity.data.forEach(function(temp){
            html += 
                    '<tr id="am' + temp.detailt_stt + '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + arrayMaterial[temp.material_id].material_name + '</td>' +
                        '<td>' + temp.actimaterial_amount + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';   
            sttTemp++;
        });
        $('#listActivityMaterialDetail').html(html);
        flashStateEdit = false;
        resetFormAddMaterialForActivity();   
    } 
}

function saveEditMaterialDetailForActivity(){
    if($('#frmEditMaterialUsing').valid()){
        var html = '';
        var sttTemp = 1;
        var dataTempEdit;
        var index;
        var count = -1;
        material_activity.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == $('#detailt_stt_Edit').val()){
                index = count;
            }
        });
        dataTempEdit = {
            detailt_stt:parseInt($('#detailt_stt_Edit').val()),
            material_id: parseInt($('#material_id_Edit').val()),
            actimaterial_amount: parseFloat($('#actimaterial_amount_Edit').val())
        }
        material_activity.data[index] = dataTempEdit ;  
        arrayMaterial[$('#material_id_Edit').val()].material_existence = arrayMaterial[$('#material_id_Edit').val()].material_existence - parseFloat($('#actimaterial_amount_Edit').val());
        console.log(arrayMaterial);  
        stateEdit = true;
        material_activity.data.forEach(function(temp){
        html += 
                '<tr id="am' + temp.detailt_stt + '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + arrayMaterial[temp.material_id].material_name + '</td>' +
                    '<td>' + temp.actimaterial_amount + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForActivity('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>'; 
            sttTemp++;
        });
        $('#listActivityMaterialDetail').html(html);
        flashStateEdit = false;
        resetFormAddMaterialForActivity();  
    }
}

function resetFormAddMaterialForActivity(){
    $('#actimaterial_amount').val('');
    $('#material_id').find('*').remove();
    $('#material_id').append($("<option></option>").attr("value",0).text("Chọn vật tư dùng"));
    arrayMaterial.forEach(function(material){
        if(material.material_existence > 0){
            $('#material_id').append($("<option></option>").attr("value",material.material_id).text(material.material_name + " - Còn lại " + material.material_existence));
        }
    });
    $('#material_id').selectpicker('refresh');
}

/* Ham luu hoa don vao CSDL */
function saveAddActivity(){
    if($("#frmAddActivity").valid()){
        if(material_activity.data.length > 0 ){
            var count = 0;
            var noteTemp = ($('#activity_note').val() == "")?"":$('#activity_note').val();
            var temp_date = $("#activity_date").data("DateTimePicker").date();
            var activity_date = new Date(temp_date);
            //var activity_date = new Date(temp_date.getTime() - (temp_date.getTimezoneOffset()*60000)).toISOString();
            var data = {
                pond_id: pond_id,
                stocking_id: stocking_id,
                actitype_id: parseInt($('#actitype_id').val()),
                activity_date: activity_date,
                activity_note: noteTemp
            };
            createActivity(host,token,data,function(rs){
                var activityId = rs.activity_id;
                var dataActivityMaterial = [];
                material_activity.data.forEach(function(ma){
                    var temp = {
                            material_id: ma.material_id,
                            activity_id: activityId,
                            actimaterial_amount: ma.actimaterial_amount
                        };
                    dataActivityMaterial.push(temp);
                    count++;
                });
                createMultiActivityMaterial(host,token,{data: dataActivityMaterial},function(rs){
                    rs.forEach(function(am){
                        if(arrayMaterial[am.material_id].material_existence == 0){
                            arrayMaterial[am.material_id].material_state = false;
                        }
                        updateMaterial(host,token,am.material_id, arrayMaterial[am.material_id],function(material){
                            --count;
                        });
                    });
                    var timeDelay = setInterval(function(){
                        console.log(count);
                        if(count == 0){
                            clearInterval(timeDelay);
                            window.location.href="/quantrac/nongdan/hoatdong/danhsach?stocking_id="+ stocking_id +"&pond_id=" + pond_id;
                        }
                    }, 2000);
                });
            });
        }
    }
}

/* Ham tao activity */
function createActivity(host,token,data,callback){
    var request = $.ajax({
        url : host + '/api/activity/create',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham init activity list */
function initActivityListPage(){
    loadActiType(host,token,function(rs){
        var index = 0;
        var pageSize = 10;
        rs.forEach(function(actiType){
            arrayActiType[actiType.actitype_id] = actiType.actitype_name;
            $('#actitype_id').append($("<option></option>").attr("value",actiType.actitype_id).text(actiType.actitype_name));
        });
        loadActivityPagination(host,token,userId,index,pageSize);
    });
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham load stocking co phan trang */
function loadActivityPagination(host,token,userID,page,size){
    var keyword = "";
    var actitype_id = $('#actitype_id').val();
    // if($("#txtTimKiem").val() != ""){
    //     keyword = $("#txtTimKiem").val();
    // }
    var request = $.ajax({
        url : host + '/api/activity/getpagination/' + userID + '?actitype_id=' + actitype_id + '&stocking_id=' + stocking_id + '&pond_id=' + pond_id + '&page=' + page +'&pageSize='+ size +'&keyword='+keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var html = '';
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            $('#listActivity').find('*').remove();
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(activity){
                    html = 
                        '<tr>' +
                            '<td>' + stt + '</td>' +
                            '<td>' + arrayActiType[activity.actitype_id] + '</td>' +
                            '<td>' + moment(activity.activity_date).format('DD/MM/YYYY HH:mm') + '</td>' +
                            '<td><p id="contentActivityMaterial' + activity.activity_id + '"></p></td>' +
                            '<td>' + activity.activity_note + '</td>' +
                            '<td><a title = "Cập nhật hoạt động chăm sóc" href="#"><span class="glyphicon glyphicon-edit"></span></a></td>' + 
                        '</tr>' ;
                    $('#listActivity').append(html);
                    loadActivityMaterialByActivity(host,token,activity.activity_id,function(rs){
                        var activity_id;
                        var arrMater = []; 
                        rs.forEach(function(am){
                            activity_id = am.activity_id;
                            arrMater[am.material_id] = am.actimaterial_amount;
                        });
                        rs.forEach(function(am){
                            loadMaterialById(host,token,am.material_id,function(rs){
                                var htmlTemp = '-&nbsp;&nbsp;' + rs.material_name + ":&nbsp;&nbsp;" + arrMater[rs.material_id] + ' <br/>';
                                $('#contentActivityMaterial' + activity_id).append(htmlTemp);
                            });
                        });
                    });
                    stt++;
                });
            }else{
                html += 
                        '<tr>' +
                            '<td colspan="6">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
                $('#listActivity').html(html);
            }   
            
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadActivityPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadActivityPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiActivityList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay danh sach activity material theo activity_id*/
function loadActivityMaterialByActivity(host,token,activityID,callback){
    var request = $.ajax({
        url : host + '/api/activityMaterial/getbyactivity/' + activityID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy danh sách tài nguyên dùng cho hoạt động, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy danh sách tài nguyên dùng cho hoạt động, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham load material theo id */
function loadMaterialById(host,token,materialID,callback){
    var request = $.ajax({
        url : host + '/api/material/getbyid/' + materialID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được thông tin vật tư theo định danh, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được thông tin vật tư theo định danh, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham insert multi activiti material */
function createMultiActivityMaterial(host,token,data,callback){
    var request = $.ajax({
        url : host + '/api/activityMaterial/createmulti',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo chi tiết hoạt động thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham cap nhat material */
function updateMaterial(host,token,materialID,data,callback){
    var request = $.ajax({
            url : host + '/api/material/update/' + materialID,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                callback(rs.data);                        
            }
        });
        request.fail(function(jqXHR, textStatus){
            console.log(jqXHR);
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
}

/* Ham khoi tao trang them thu hoach */
function initAddHavestPage(){
    $("#harvest_harvestDate" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#harvest_harvestDate" ).datepicker('setDate',new Date());

    loadStockingPondByStocking(host,token,stocking_id,function(rs){
        rs.forEach(function(pond){
            $('#pond_id').append($("<option></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
        });
        $('#pond_id').selectpicker('refresh');
    });

    loadProductType(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(prodtype){
            numberSTT[prodtype.prodtype_id] = 0;
            arrayProductType[prodtype.prodtype_id] = prodtype.prodtype_typeName ;
            $('#prodtype_id').append($("<option></option>").attr("value",prodtype.prodtype_id).text(prodtype.prodtype_typeName));
        });
        $('#prodtype_id').selectpicker('refresh'); 
    });

    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
            $('#unit_id').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));
        });
        $('#unit_id').selectpicker('refresh');
    });

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham lay danh sach loai cua vat tu */
function loadProductType(host,token,callback){
    var request = $.ajax({
        url : host + '/api/productType/getpagination?page=0&pageSize=20',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách loại sản phẩm, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách loại sản phẩm, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham add chi tiet thu hoach */
function addHavestDetail(){
    if($("#frmAddHavestDetail").valid()){
        $('#divHavestDetail').show();
        var index = -1;
        var count = -1;
        havest_detail.data.forEach(function(detail){
            count++;
            if(detail.pond_id == parseInt($('#pond_id').val()) && detail.prodtype_id == parseInt($('#prodtype_id').val()) && detail.unit_id == parseInt($('#unit_id').val()) && detail.harvedeta_price == parseInt($('#harvedeta_price').val())){
                index = count;
            }
        });
        if(index == -1){
            var html = '';
            var temp;
            var tempNote;

            numberSTT[$('#prodtype_id').val()] += 1;

            havest_detail.stt++;
            havest_detail.detaltSTT++;
            temp = {
                detailt_stt:havest_detail.detaltSTT,
                pond_id: parseInt($('#pond_id').val()),
                prodtype_id: parseInt($('#prodtype_id').val()),
                harvedeta_weight: parseFloat($('#harvedeta_weight').val()),
                unit_id: parseInt($('#unit_id').val()),
                harvedeta_price: parseInt($('#harvedeta_price').val()),
                harvedeta_note: $('#harvedeta_note').val(),
                harvedeta_number: numberSTT[$('#prodtype_id').val()]
            }
            havest_detail.data.push(temp);
            console.log(havest_detail);
            if(temp.harvedeta_note.length > 40){
                tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
            }else{
                tempNote = temp.harvedeta_note;
            }
            html +=
                    '<tr id="hd' + temp.detailt_stt + '">' +
                        '<td>' + havest_detail.stt + '</td>' +
                        '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                        '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                        '<td>' + temp.harvedeta_weight + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + temp.harvedeta_price + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';   
            $('#listHavestDetail').html($('#listHavestDetail').html() + html);   
            resetFormAddHavestDetail();
        }else{
            var html = '';
            var sttTemp = 1;
            havest_detail.data[index].harvedeta_weight += parseFloat($('#harvedeta_weight').val());
            havest_detail.data.forEach(function(temp){
                var tempNote;
                if(temp.harvedeta_note.length > 40){
                    tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
                }else{
                    tempNote = temp.harvedeta_note;
                }
                html +=
                        '<tr id="hd' + temp.detailt_stt + '">' +
                            '<td>' + sttTemp + '</td>' +
                            '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                            '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                            '<td>' + temp.harvedeta_weight + '</td>' +
                            '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                            '<td>' + temp.harvedeta_price + '</td>' +
                            '<td>' + tempNote + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>';    
                sttTemp++;
            });
            $('#listHavestDetail').html(html);
            resetFormAddHavestDetail();    
        }     
    }
}

//Ham xoa material_activity
function deleteHavestDetail(detailSTT){
    var index;
    var sttTemp = 1;
    var count = -1;
    var html = '';
    havest_detail.data.forEach(function(detail){
        count++;
        if(detail.detailt_stt == detailSTT){
            index = count;
        }
    });
    havest_detail.data.splice(index,1);
    havest_detail.stt--;
    havest_detail.data.forEach(function(temp){
        var tempNote;
        if(temp.harvedeta_note.length > 40){
            tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
        }else{
            tempNote = temp.harvedeta_note;
        }
        html +=
                '<tr id="hd' + temp.detailt_stt + '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                    '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                    '<td>' + temp.harvedeta_weight + '</td>' +
                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                    '<td>' + temp.harvedeta_price + '</td>' +
                    '<td>' + tempNote + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';    
        sttTemp++;
    });
    $('#listHavestDetail').html(html);
    stateEdit = false;
    if(html==''){
        $('#divHavestDetail').hide();
    }
}

/* Ham changeHavestDetail */
function changeHavestDetail(detailSTT){
    if(!stateEdit){
        var index;
        var count = -1;
        var dataTemp; 
        var html = '';

        stateEdit = true;
        havest_detail.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == detailSTT){
                index = count;
            }
        });
        dataTemp = havest_detail.data[index];

        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="detailt_stt_Edit" id="detailt_stt_Edit"/>' +  
                    '<input type="hidden" name="harvedeta_number_Edit" id="harvedeta_number_Edit"/>' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "pond_id_Edit" name = "pond_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorpond_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "prodtype_id_Edit" name = "prodtype_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorprodtype_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_weight_Edit" id="harvedeta_weight_Edit"/>' +
                        '<span id="errorharvedeta_weight_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "unit_id_Edit" name = "unit_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorunit_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_price_Edit" id="harvedeta_price_Edit"/>' +
                        '<span id="errorharvedeta_price_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_note_Edit" id="harvedeta_note_Edit"/>' +
                    '</div>' +
                '</td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditHavestDetail();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backEditHavestDetail();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
        $('#hd' + dataTemp.detailt_stt).html(html);
        $('#detailt_stt_Edit').val(dataTemp.detailt_stt);
        $('#harvedeta_weight_Edit').val(dataTemp.harvedeta_weight);
        $('#harvedeta_price_Edit').val(dataTemp.harvedeta_price);
        $('#harvedeta_note_Edit').val(dataTemp.harvedeta_note);
        $('#harvedeta_number_Edit').val(dataTemp.harvedeta_number);
        loadStockingPondByStocking(host,token,stocking_id,function(rs){
            $('#pond_id_Edit').find('*').remove();
            rs.forEach(function(pond){
                if(pond.pond_id == dataTemp.pond_id){
                    $('#pond_id_Edit').append($("<option selected></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
                }else{
                    $('#pond_id_Edit').append($("<option></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
                }     
            });
        });

        loadProductType(host,token,function(rs){
            var data = rs.Items;
            $('#prodtype_id_Edit').find('*').remove();
            data.forEach(function(prodtype){
                if(prodtype.prodtype_id == dataTemp.prodtype_id){
                    $('#prodtype_id_Edit').append($("<option selected></option>").attr("value",prodtype.prodtype_id).text(prodtype.prodtype_typeName));
                }else{
                    $('#prodtype_id_Edit').append($("<option></option>").attr("value",prodtype.prodtype_id).text(prodtype.prodtype_typeName));
                }
            });
        });

        loadUnit(host,token,function(rs){
            $('#unit_id_Edit').find('*').remove();
            rs.forEach(function(unit){
                if(unit.unit_id == dataTemp.unit_id){
                    $('#unit_id_Edit').append($("<option selected></option>").attr("value",unit.unit_id).text(unit.unit_name));
                }else{
                    $('#unit_id_Edit').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));      
                }
            });
        }); 
    }else{
        alert('Xin vui lòng hoàn tất các chỉnh sửa hiện tại trước khi tiếp tục');
    }
}

/* Ham luu thay doi tren Havest Detail */
function saveEditHavestDetail(){
    if($('#frmEditHavestDetail').valid()){
        var html = '';
        var sttTemp = 1;
        var dataTempEdit;
        var index;
        var count = -1;
        havest_detail.data.forEach(function(detail){
            count++;
            if(detail.detailt_stt == $('#detailt_stt_Edit').val()){
                index = count;
            }
        });

        dataTempEdit =  {
            detailt_stt:parseInt($('#detailt_stt_Edit').val()),
            pond_id: parseInt($('#pond_id_Edit').val()),
            prodtype_id: parseInt($('#prodtype_id_Edit').val()),
            harvedeta_weight: parseFloat($('#harvedeta_weight_Edit').val()),
            unit_id: parseInt($('#unit_id_Edit').val()),
            harvedeta_price: parseInt($('#harvedeta_price_Edit').val()),
            harvedeta_note: $('#harvedeta_note_Edit').val(),
            harvedeta_number: parseInt($('#harvedeta_number_Edit').val())
        }
        havest_detail.data[index] = dataTempEdit ;  
        console.log(havest_detail);  
        havest_detail.data.forEach(function(temp){
            var tempNote;
            if(temp.harvedeta_note.length > 40){
                tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
            }else{
                tempNote = temp.harvedeta_note;
            }
            html +=
                    '<tr id="hd' + temp.detailt_stt + '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                        '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                        '<td>' + temp.harvedeta_weight + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + temp.harvedeta_price + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';    
            sttTemp++;
        });
        $('#listHavestDetail').html(html);
        stateEdit = false; 
    }
}

/* Ham tro lai khi dang change seed detail */
function backEditHavestDetail(){
    var sttTemp = 1;
    var html = '';
    havest_detail.data.forEach(function(temp){
        var tempNote;
        if(temp.harvedeta_note.length > 40){
            tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
        }else{
            tempNote = temp.harvedeta_note;
        }
        html +=
                '<tr id="hd' + temp.detailt_stt + '">' +
                    '<td>' + sttTemp + '</td>' +
                    '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                    '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                    '<td>' + temp.harvedeta_weight + '</td>' +
                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                    '<td>' + temp.harvedeta_price + '</td>' +
                    '<td>' + tempNote + '</td>' +
                    '<td><a title="Cập nhật" href="#" onclick="changeHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHavestDetail('+ temp.detailt_stt +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                '</tr>';    
        sttTemp++;
    });
    $('#listHavestDetail').html(html);
    stateEdit = false;
}

/* Ham reset form them havest detail */
function resetFormAddHavestDetail(){
    $('#harvedeta_weight').val('');
    $('#harvedeta_price').val('');
    $('#harvedeta_note').val('');
    $('#pond_id').prop('selectedIndex',0);
    $('#pond_id').selectpicker('refresh');
    $('#prodtype_id').prop('selectedIndex',0);
    $('#prodtype_id').selectpicker('refresh');
    $('#unit_id').prop('selectedIndex',0);
    $('#unit_id').selectpicker('refresh');
}
/* Ham lay danh sach chi tiet thu hoach theo stocking and pond */
function loadListHavestDetailByStockingAndPond(host,token,stockingID,pondID,callback){
    var request = $.ajax({
        url : host + '/api/harvestDetail/getlistbystockingandpond?stocking_id=' + stockingID + '&pond_id=' + pondID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách chi tiết thu hoạch, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách chi tiết thu hoạch, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham save thu hoach */
function saveAddHavest(){
    if($("#frmAddHavest").valid()){
        if(havest_detail.data.length > 0 ){
            var dateTemp = $("#harvest_harvestDate" ).datepicker('getDate');
            var harvest_harvestDate = new Date(dateTemp.getTime() - (dateTemp.getTimezoneOffset()*60000)).toISOString();
            var data = {
                user_id: userId,
                stocking_id: stocking_id,
                harvest_harvestDate: harvest_harvestDate
            };
            createHavest(host,token,data,function(rs){
                var harvestId = rs.harvest_id;
                var dataHarvestDetail = [];
                havest_detail.data.forEach(function(hd){
                    var temp = {
                            harvest_id:harvestId,
                            pond_id: hd.pond_id,
                            prodtype_id: hd.prodtype_id,
                            harvedeta_weight: hd.harvedeta_weight,
                            unit_id: hd.unit_id,
                            harvedeta_price: hd.harvedeta_price,
                            harvedeta_note: hd.harvedeta_note,
                            harvedeta_number: hd.harvedeta_number
                        };
                    dataHarvestDetail.push(temp);
                });
                createMultiHarvestDetail(host,token,harvestId,{data: dataHarvestDetail},function(rs){
                    window.location.href="/quantrac/nongdan/thuhoach/danhsach?stocking_id=" + stocking_id;
                });
            });
        }
    }
}

/* Ham tao havest */
function createHavest(host,token,data,callback){
    var request = $.ajax({
        url : host + '/api/harvest/create',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham insert multi harvest detail */
function createMultiHarvestDetail(host,token,harvestID,data,callback){
    var request = $.ajax({
        url : host + '/api/harvestDetail/createmulti/' + harvestID,
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Tạo chi tiết thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao trang list havest */
function initHavestListPage(){
    var index = 0;
    var pageSize = 10;
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
        });
        loadProductType(host,token,function(rs){
            var data = rs.Items;
            data.forEach(function(prodtype){
                arrayProductType[prodtype.prodtype_id] = prodtype.prodtype_typeName ;
            });
            loadHavestPagination(host,token,userId,stocking_id,index,pageSize); 
        });
    });
}

/* Ham load havest co phan trang */
function loadHavestPagination(host,token,userID,stockingID,page,size){
    var keyword = "";
    // if($("#txtTimKiem").val() != ""){
    //     keyword = $("#txtTimKiem").val();
    // }
    var request = $.ajax({
        url : host + '/api/harvest/getpagination/' + userID +'?stocking_id='+ stockingID + '&page=' + page + '&pageSize='+ size + '&keyword=' + keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var html = '';
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            $('#listHavest').find('*').remove();
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(havest){
                    html = 
                        '<tr>' +
                            '<td>' + stt + '</td>' +
                            '<td>' + moment(havest.harvest_harvestDate).format('DD-MM-YYYY') + '</td>' +
                            '<td><p id="havestContent' + havest.harvest_id + '"></p></td>' + 
                            '<td><a title="Cập nhật thu hoach" href="/quantrac/nongdan/thuhoach/capnhat/' + havest.harvest_id + '"><i class="fa fa-edit"></i></td>' + 
                        '</tr>' ;
                    $('#listHavest').append(html);
                    loadHavestDetailByHavest(host,token,havest.harvest_id,function(rs){
                        var contentHtml = '';
                        var havest_id;
                        var totalPrice = 0;
                        rs.forEach(function(hd){
                            havest_id = hd.harvest_id;
                            totalPrice += (hd.harvedeta_weight * hd.harvedeta_price);
                            contentHtml += 'Ao số ' + hd.pond_id + ':&nbsp;&nbsp;' + arrayProductType[hd.prodtype_id] + '&nbsp;&nbsp;-&nbsp;&nbsp;' + hd.harvedeta_weight + '&nbsp;&nbsp;' + arrayUnit[hd.unit_id] + '&nbsp;&nbsp;-&nbsp;&nbsp;Giá ' + hd.harvedeta_price + '&nbsp;&nbsp;VNĐ'  + ' <br/>';
                        });
                        console.log(contentHtml);
                        $('#havestContent' + havest_id).html(contentHtml + '<b>Tổng tiền:</b>&nbsp;&nbsp;' + totalPrice + '&nbsp;&nbsp;VNĐ');
                    });    
                    stt++;
                });
            }else{
                html += 
                        '<tr>' +
                            '<td colspan="4">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
                $('#listHavest').html(html);
            }   
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadHavestPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + stockingID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadHavestPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ',' + userID + ',' + stockingID + ',' + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiHavestList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách thu hoạch thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham lay havest detail theo havest_id */
function loadHavestDetailByHavest(host,token,havestID,callback){
    var request = $.ajax({
        url : host + '/api/harvestDetail/getbyharvest/' + havestID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được chi tiết thu hoạch theo thu hoạch, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được chi tiết thu hoạch theo thu hoạch, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao trang them theo doi tang truong */
function initAddTrackerAugmented(){
    $("#trackeraugmented_date" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#trackeraugmented_date" ).datepicker('setDate',new Date());

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham khoi tao trang danh sach tang truong */
function initTrackerAugmentedListPage(){
    var index = 0;
    var pageSize = 10;
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
    loadTrackerAugmentedPagination(host,token,index,pageSize);
}

/* Ham load hoat dong theo doi tang truong co phan trang */
function loadTrackerAugmentedPagination(host,token,page,size){
    var keyword = "";
    // if($("#txtTimKiem").val() != ""){
    //     keyword = $("#txtTimKiem").val();
    // }
    var request = $.ajax({
        url : host + '/api/trackerAugmented/getpagination?stocking_id=' + stocking_id + '&pond_id=' + pond_id + '&page=' + page +'&pageSize='+ size +'&keyword='+keyword,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Lấy danh sách theo dõi tăng trưởng thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            var html = '';
            var htmlPagi = '';
            var pagePresent = parseInt(rs.data.Page);
            var pageTotal = rs.data.TotalPages;
            var stt = (page * size) + 1;
            $('#listTrackerAugmented').find('*').remove();
            if(rs.data.Items.length > 0){
                rs.data.Items.forEach(function(ta){
                    html += 
                        '<tr>' +
                            '<td>' + ta.trackeraugmented_number + '</td>' +
                            '<td>' + moment(ta.trackeraugmented_date).format('DD/MM/YYYY') + '</td>' +
                            '<td>' + ta.trackeraugmented_age + '</td>' +
                            '<td>' + ta.trackeraugmented_densityAvg + '</td>' +
                            '<td>' + ta.trackeraugmented_weightAvg + '</td>' +
                            '<td>' + ta.trackeraugmented_speedOfGrowth + '</td>' +
                            '<td>' + ta.tracker_augmented_survival + '</td>' +
                            '<td>' + ta.trackeraugmented_biomass + '</td>' +
                            '<td>' + ta.trackeraugmented_note + '</td>' +
                            '<td><a title="Cập nhật tăng trưởng" href="#"><span class="glyphicon glyphicon-edit"></span></a></td>' + 
                        '</tr>' ;
                    stt++;
                });
            }else{
                html += 
                        '<tr>' +
                            '<td colspan="10">' +
                                '<h3>Không có dữ liệu</h3>' +
                            '</td>' +  
                        '</tr>' ;
            }   
            $('#listTrackerAugmented').html(html);
            if(pageTotal > 1){
                for(i = 0; i< pageTotal; i++){
                    if(pagePresent == i){
                        htmlPagi += '<li class="active"><a href="#" onclick="loadTrackerAugmentedPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ','  + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }else{
                        htmlPagi += '<li><a href="#" onclick="loadTrackerAugmentedPagination('+ "'" + host + "'" + ',' + "'" + token + "'" +  ','  + i + ',' +  size + ');return false;">'+ (i + 1) +'</a></li>';
                    }
                }
            }
            $('#pagiTrackerAugmentedList').html(htmlPagi);                
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Lấy danh sách theo dõi tăng trưởng thất bại",$('#error'));
    });
}

/* Ham khoi tao trang chuan bi ao nuoi */
function initAddPondPreparationPage(){
    $("#pondpreparation_dateStart" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#pondpreparation_dateStart" ).datepicker('setDate',new Date());

    loadLandBackround(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(landBg){
            $('#landbg_id').append($("<option></option>").attr("value",landBg.landbg_id).text(landBg.landbg_name));
        });
        $('#landbg_id').selectpicker('refresh');
    });

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham load loai dat nen */
function loadLandBackround(host,token,callback){
    var request = $.ajax({
        url : host + '/api/landBackground/getpagination?page=0&pageSize=20&keyword=',
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách đất nền ao, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách đất nền ao, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham khoi tao trang chuan bi ao nuoi */
function initDetailPondPreparationPage(){
    $("#pondpreparation_dateStart" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#pondpreparation_dateStart" ).datepicker('setDate',new Date(pondpreparation_dateStart.substr(0,10)));
    $("#matepredetail_date" ).datepicker({format: 'dd/mm/yyyy',locale:'vi'});
    $("#matepredetail_date" ).datepicker('setDate',new Date());
    loadLandBackround(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(landBg){
            if(landBg.landbg_id == landbg_id){
                console.log(landBg.landbg_id );
                $('#landbg_id').append($("<option selected></option>").attr("value",landBg.landbg_id).text(landBg.landbg_name));
            }else{
                $('#landbg_id').append($("<option></option>").attr("value",landBg.landbg_id).text(landBg.landbg_name));
            }
        });
        $('#landbg_id').selectpicker('refresh');
    });

    $('#pondpreparation_soilPH').val(pondpreparation_soilPH);
    $('#pondpreparation_capacityOfFan').val(pondpreparation_capacityOfFan);
    $('#pondpreparation_quantityOfFan').val(pondpreparation_quantityOfFan);

    loadMaterialByStocking(host,token,stocking_id,function(rs){
        arrayMaterial[0]={
            material_id:0,
            materialtype_id: 0,
            unit_id:0,
            bill_id:0,
            material_numberOfLot:'',
            material_source:'',
            material_quantity:0,
            material_price:0,
            material_description:'',
            material_state:true,
            material_name: '',
            material_existence: ''
        };
        rs.forEach(function(material){
            arrayMaterial[material.material_id] = {
                material_id:material.material_id,
                materialtype_id: material.materialtype_id,
                unit_id:material.unit_id,
                bill_id:material.bill_id,
                material_numberOfLot:material.material_numberOfLot,
                material_source:material.material_source,
                material_quantity:material.material_quantity,
                material_price:material.material_price,
                material_description:material.material_description,
                material_state:material.material_state,
                material_name: material.material_name,
                material_existence: material.material_existence
            };
            if(material.material_existence > 0){
                $('#material_id').append($("<option></option>").attr("value",material.material_id).text(material.material_name + " - Còn lại " + material.material_existence));
            }
        });
        $('#material_id').selectpicker('refresh');
        loadMaterialPreparationDetailByPondPreparation(host,token,pondpreparation_id,function(rs){
            var html = '';
            rs.forEach(function(mpp){
                var noteTemp = (!mpp.matepredetail_note)?"":mpp.matepredetail_note;
                material_preparation_pond.push({
                    pondpreparation_id:mpp.pondpreparation_id,
                    material_id:mpp.material_id ,
                    matepredetail_quantity: mpp.matepredetail_quantity,
                    matepredetail_date:mpp.matepredetail_date,
                    matepredetail_note: noteTemp
                });
                html += 
                        '<tr id="mpp' + mpp.pondpreparation_id + '">' +
                            '<td>' + moment(mpp.matepredetail_date).format('DD-MM-YYYY') + '</td>' +
                            '<td>' + arrayMaterial[mpp.material_id].material_name + '</td>' +
                            '<td>' + mpp.matepredetail_quantity + '</td>' +
                            '<td>' + noteTemp + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForPondPreparation('+ mpp.pondpreparation_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForPondPreparation('+ mpp.pondpreparation_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>'; 
            });
            console.log(material_preparation_pond);
            $(listMaterialPreparationDetail).html(html);
        });
    });
    
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

/* Ham luu thay doi tren chuan bi ao nuoi */
function saveChangePondPreparation(){
    if($('#frmEditPondPreparation').valid()){
        var dateTemp = $("#pondpreparation_dateStart" ).datepicker('getDate');
        var pondpreparation_dateStart = new Date(dateTemp.getTime() - (dateTemp.getTimezoneOffset()*60000)).toISOString();
        var landbg_id = parseInt($('#landbg_id').val());
        var pondpreparation_soilPH = parseFloat($('#pondpreparation_soilPH').val()) ;
        var pondpreparation_capacityOfFan = parseFloat($('#pondpreparation_capacityOfFan').val()) ;
        var pondpreparation_quantityOfFan = parseInt($('#pondpreparation_quantityOfFan').val()) ;

        //Dong goi data cho vao req
        var data = {
            pondpreparation_id:pondpreparation_id,
            stocking_id:stocking_id,
            pond_id:pond_id,
            landbg_id:landbg_id,
            pondpreparation_dateStart:pondpreparation_dateStart,
            pondpreparation_soilPH:pondpreparation_soilPH,
            pondpreparation_capacityOfFan:pondpreparation_capacityOfFan,
            pondpreparation_quantityOfFan:pondpreparation_quantityOfFan
        };
        var request = $.ajax({
            url : host + '/api/pondPreparation/update/' + pondpreparation_id,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                eventClickSuccess('Cập nhật thành công',$('#error'));                         
            }
        });
        request.fail(function(jqXHR, textStatus){
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
    }
}

//Ham them tài nguyên cho hoạt động chuẩn bị ao
function addMaterialDetailForPondPreparation(){
    if($("#frmAddMaterialUsingPrepare").valid()){
        var noteTemp = ($('#matepredetail_note').val() == "")?"":$('#matepredetail_note').val();
        var dateTemp = $("#matepredetail_date" ).datepicker('getDate');
        var matepredetail_date = new Date(dateTemp.getTime() - (dateTemp.getTimezoneOffset()*60000)).toISOString();
        var dataInsert = {
            pondpreparation_id:pondpreparation_id,
            material_id: parseInt($('#material_id').val()),
            matepredetail_quantity: parseFloat($('#matepredetail_quantity').val()),
            matepredetail_date:matepredetail_date,
            matepredetail_note: noteTemp
        };

        createMaterialPreparationDetail(host,token,dataInsert,function(rs){
            var noteTemp = (!rs.matepredetail_note)?"":rs.matepredetail_note;
            var html = '';
            material_preparation_pond.push({
                pondpreparation_id:rs.pondpreparation_id,
                material_id:rs.material_id ,
                matepredetail_quantity: rs.matepredetail_quantity,
                matepredetail_date:rs.matepredetail_date,
                matepredetail_note: noteTemp
            });
            arrayMaterial[rs.material_id].material_existence-= rs.matepredetail_quantity;
            material_preparation_pond.forEach(function(mpp){
                html += 
                        '<tr id="mpp' + mpp.pondpreparation_id + '">' +
                            '<td>' + moment(mpp.matepredetail_date).format('DD-MM-YYYY') + '</td>' +
                            '<td>' + arrayMaterial[mpp.material_id].material_name + '</td>' +
                            '<td>' + mpp.matepredetail_quantity + '</td>' +
                            '<td>' + noteTemp + '</td>' +
                            '<td><a title="Cập nhật" href="#" onclick="changeMaterialDetailForPondPreparation('+ mpp.pondpreparation_id +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteMateriaDetailForPondPreparation('+ mpp.pondpreparation_id +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                        '</tr>'; 
            });
            console.log(material_preparation_pond);
            $(listMaterialPreparationDetail).html(html);
            updateMaterial(host,token,rs.material_id, arrayMaterial[rs.material_id],function(material){
                loadMaterialByStocking(host,token,stocking_id,function(rs){
                    $('#material_id').find('*').remove();
                    arrayMaterial[0]={
                        material_id:0,
                        materialtype_id: 0,
                        unit_id:0,
                        bill_id:0,
                        material_numberOfLot:'',
                        material_source:'',
                        material_quantity:0,
                        material_price:0,
                        material_description:'',
                        material_state:true,
                        material_name: '',
                        material_existence: ''
                    };
                    rs.forEach(function(material){
                        arrayMaterial[material.material_id] = {
                            material_id:material.material_id,
                            materialtype_id: material.materialtype_id,
                            unit_id:material.unit_id,
                            bill_id:material.bill_id,
                            material_numberOfLot:material.material_numberOfLot,
                            material_source:material.material_source,
                            material_quantity:material.material_quantity,
                            material_price:material.material_price,
                            material_description:material.material_description,
                            material_state:material.material_state,
                            material_name: material.material_name,
                            material_existence: material.material_existence
                        };
                        if(material.material_existence > 0){
                            $('#material_id').append($("<option></option>").attr("value",material.material_id).text(material.material_name + " - Còn lại " + material.material_existence));
                        }
                    });
                    $('#material_id').selectpicker('refresh');
                });
            });
        });    
    }
}

/* Ham tao material_preparation_detail */
function createMaterialPreparationDetail(host,token,data,callback){
    var request = $.ajax({
        url : host + '/api/materialPreparationDetail/create',
        method : 'POST',
        contentType: 'application/json; charset=utf-8',
        data: data,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Tạo chi tiết xử lý ao thất bại, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        console.log(jqXHR);
        showError("Tạo chi tiết xử lý ao thất bại, nhấn F5 để tải lại trang",$('#error'));
    });
}

/* Ham loadMaterialPreparationPondById */
function loadMaterialPreparationDetailByPondPreparation(host,token,pondpreparationID,callback){
    var request = $.ajax({
        url : host + '/api/materialPreparationDetail/getbypondpreparation/' + pondpreparationID ,
        method : 'GET',
        contentType: 'application/json; charset=utf-8',
        headers:{
            'Authorization':token
        }
    });
    request.done(function(rs){
        if(rs.Error){
            showError("Không lấy được danh sách chi tiết cải tạo, nhấn F5 để tải lại trang",$('#error'));
        }else{
            callback(rs.data);                           
        }
    });
    request.fail(function(jqXHR, textStatus){
        showError("Không lấy được danh sách chi tiết cải tạo, nhấn F5 để tải lại trang",$('#error'));
    });
}

function initUpdateHavestPage(){
    var pondState = false;
    var productTypeState = false;
    var unitState = false;

    loadStockingPondByStocking(host,token,harvestObj.stocking_id,function(rs){
        rs.forEach(function(pond){
            arrayPond[pond.pond_id] = pond.pond_id;
        });
        pondState = true;
        if(productTypeState && unitState){
            loadDataForUpdateHavest();
        }
    });

    loadProductType(host,token,function(rs){
        var data = rs.Items;
        data.forEach(function(prodtype){
            arrayProductType[prodtype.prodtype_id] = prodtype.prodtype_typeName ;
        });
        productTypeState = true;
        if(pondState && unitState){
            loadDataForUpdateHavest();
        }
    });

    loadUnit(host,token,function(rs){
        rs.forEach(function(unit){
            arrayUnit[unit.unit_id] = unit.unit_name;
        });
        unitState = true;
        if(productTypeState && pondState){
            loadDataForUpdateHavest();
        }
    });

    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}

function loadDataForUpdateHavest(){
    $('#harvest_harvestDate').text(moment(harvestObj.harvest_harvestDate).format('DD-MM-YYYY'));
    loadHavestDetailByHavest(host,token,harvestObj.harvest_id,function(rs){
        var sttTemp = 1;
        var html = '';
        rs.forEach(function(temp){
            var tempNote;
            console.log(temp);
            var tempData =  {
                harvest_id:temp.harvest_id,
                pond_id: temp.pond_id,
                prodtype_id: temp.prodtype_id,
                harvedeta_weight: temp.harvedeta_weight,
                unit_id: temp.unit_id,
                harvedeta_price: temp.harvedeta_price,
                harvedeta_note: temp.harvedeta_note,
                harvedeta_number: temp.harvedeta_number
            }
            harvestObj.data.push(tempData);
            if(temp.harvedeta_note.length > 40){
                tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
            }else{
                tempNote = temp.harvedeta_note;
            }
            html +=
                    '<tr id="hd' + temp.harvest_id + temp.prodtype_id + temp.harvedeta_number + '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                        '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                        '<td>' + temp.harvedeta_weight + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + temp.harvedeta_price + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeHavestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHarvestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';    
            sttTemp++;
        });
        $('#listHavestDetail').html(html);
    });  
}

function changeHavestDetailForUpdateHavest(harvest_id, prodtype_id,harvedeta_number){
    if(!stateEdit){
        var index;
        var count = -1;
        var dataTemp; 
        var html = '';
        console.log(stateEdit);
        stateEdit = true;
        harvestObj.data.forEach(function(detail){
            count++;
            if(detail.harvest_id == harvest_id && detail.prodtype_id == prodtype_id && detail.harvedeta_number == harvedeta_number){
                index = count;
            }
        });
        dataTemp = harvestObj.data[index];

        html += '<td>' + (index + 1) + 
                    '<input type="hidden" name="harvest_id_Edit" id="harvest_id_Edit"/>' +  
                    '<input type="hidden" name="harvedeta_number_Edit" id="harvedeta_number_Edit"/>' +  
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "pond_id_Edit" name = "pond_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorpond_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "prodtype_id_Edit" name = "prodtype_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorprodtype_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_weight_Edit" id="harvedeta_weight_Edit"/>' +
                        '<span id="errorharvedeta_weight_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' + 
                        '<select id = "unit_id_Edit" name = "unit_id_Edit" class="form-control">' + 
                        '</select>' +
                        '<span id="errorunit_id_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_price_Edit" id="harvedeta_price_Edit"/>' +
                        '<span id="errorharvedeta_price_Edit"></span>' + 
                    '</div>' +
                '</td>' +
                '<td>' + 
                    '<div class="form-group">' +
                        '<input class = "form-control" type="text" name="harvedeta_note_Edit" id="harvedeta_note_Edit"/>' +
                    '</div>' +
                '</td>' +
                '<td><a title="Lưu cập nhật" href="#" onclick="saveEditHavestDetailForUpdateHarvest();return false;"><span class="glyphicon glyphicon-floppy-disk"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Hủy cập nhật" href="#"  onclick="backEditHavestDetailForUpdateHavest();return false;"><span class="glyphicon glyphicon-repeat"></span></a></td>';
        $('#hd' + dataTemp.harvest_id + dataTemp.prodtype_id + dataTemp.harvedeta_number).html(html);
        $('#harvest_id_Edit').val(dataTemp.harvest_id);
        $('#harvedeta_weight_Edit').val(dataTemp.harvedeta_weight);
        $('#harvedeta_price_Edit').val(dataTemp.harvedeta_price);
        $('#harvedeta_note_Edit').val(dataTemp.harvedeta_note);
        $('#harvedeta_number_Edit').val(dataTemp.harvedeta_number);
        loadStockingPondByStocking(host,token,harvestObj.stocking_id,function(rs){
            $('#pond_id_Edit').find('*').remove();
            rs.forEach(function(pond){
                if(pond.pond_id == dataTemp.pond_id){
                    $('#pond_id_Edit').append($("<option selected></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
                }else{
                    $('#pond_id_Edit').append($("<option></option>").attr("value",pond.pond_id).text('Ao số ' + pond.pond_id));
                }     
            });
        });

        loadProductType(host,token,function(rs){
            var data = rs.Items;
            $('#prodtype_id_Edit').find('*').remove();
            data.forEach(function(prodtype){
                if(prodtype.prodtype_id == dataTemp.prodtype_id){
                    $('#prodtype_id_Edit').append($("<option selected></option>").attr("value",prodtype.prodtype_id).text(prodtype.prodtype_typeName));
                }else{
                    $('#prodtype_id_Edit').append($("<option></option>").attr("value",prodtype.prodtype_id).text(prodtype.prodtype_typeName));
                }
            });
        });

        loadUnit(host,token,function(rs){
            $('#unit_id_Edit').find('*').remove();
            rs.forEach(function(unit){
                if(unit.unit_id == dataTemp.unit_id){
                    $('#unit_id_Edit').append($("<option selected></option>").attr("value",unit.unit_id).text(unit.unit_name));
                }else{
                    $('#unit_id_Edit').append($("<option></option>").attr("value",unit.unit_id).text(unit.unit_name));      
                }
            });
        }); 
    }else{
        alert('Xin vui lòng hoàn tất các chỉnh sửa hiện tại trước khi tiếp tục');
    }   
}

function deleteHarvestDetailForUpdateHavest(harvest_id, prodtype_id,harvedeta_number){
    var request = $.ajax({
            url : host + '/api/harvestDetail/delete?harvest_id=' + harvest_id + '&prodtype_id=' + prodtype_id + '&harvedeta_number=' + harvedeta_number,
            method : 'DELETE',
            contentType: 'application/json; charset=utf-8',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                loadHavestDetailByHavest(host,token,harvestObj.harvest_id,function(rs){
                    var sttTemp = 1;
                    var html = '';
                    harvestObj.data = [];
                    rs.forEach(function(temp){
                        var tempNote;
                        console.log(temp);
                        var tempData =  {
                            harvest_id:temp.harvest_id,
                            pond_id: temp.pond_id,
                            prodtype_id: temp.prodtype_id,
                            harvedeta_weight: temp.harvedeta_weight,
                            unit_id: temp.unit_id,
                            harvedeta_price: temp.harvedeta_price,
                            harvedeta_note: temp.harvedeta_note,
                            harvedeta_number: temp.harvedeta_number
                        }
                        harvestObj.data.push(tempData);
                        if(temp.harvedeta_note.length > 40){
                            tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
                        }else{
                            tempNote = temp.harvedeta_note;
                        }
                        html +=
                                '<tr id="hd' + temp.harvest_id  + temp.prodtype_id + temp.harvedeta_number + '">' +
                                    '<td>' + sttTemp + '</td>' +
                                    '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                                    '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                                    '<td>' + temp.harvedeta_weight + '</td>' +
                                    '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                                    '<td>' + temp.harvedeta_price + '</td>' +
                                    '<td>' + tempNote + '</td>' +
                                    '<td><a title="Cập nhật" href="#" onclick="changeHavestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHarvestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                                '</tr>';    
                        sttTemp++;
                    });
                    $('#listHavestDetail').html(html);
                    stateEdit = false;
                    console.log(stateEdit);
                });                        
            }
        });
        request.fail(function(jqXHR, textStatus){
            console.log(jqXHR);
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
}

function backEditHavestDetailForUpdateHavest(){
    loadHavestDetailByHavest(host,token,harvestObj.harvest_id,function(rs){
        var sttTemp = 1;
        var html = '';
        harvestObj.data = [];
        rs.forEach(function(temp){
            var tempNote;
            console.log(temp);
            var tempData =  {
                harvest_id:temp.harvest_id,
                pond_id: temp.pond_id,
                prodtype_id: temp.prodtype_id,
                harvedeta_weight: temp.harvedeta_weight,
                unit_id: temp.unit_id,
                harvedeta_price: temp.harvedeta_price,
                harvedeta_note: temp.harvedeta_note,
                harvedeta_number: temp.harvedeta_number
            }
            harvestObj.data.push(tempData);
            if(temp.harvedeta_note.length > 40){
                tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
            }else{
                tempNote = temp.harvedeta_note;
            }
            html +=
                    '<tr id="hd' + temp.harvest_id  + temp.prodtype_id + temp.harvedeta_number + '">' +
                        '<td>' + sttTemp + '</td>' +
                        '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                        '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                        '<td>' + temp.harvedeta_weight + '</td>' +
                        '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                        '<td>' + temp.harvedeta_price + '</td>' +
                        '<td>' + tempNote + '</td>' +
                        '<td><a title="Cập nhật" href="#" onclick="changeHavestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHarvestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                    '</tr>';    
            sttTemp++;
        });
        $('#listHavestDetail').html(html);
        stateEdit = false;
        console.log(stateEdit);
    });
}

function saveEditHavestDetailForUpdateHarvest(){
    if($('#frmEditHavestDetail').valid()){
        var html = '';
        var sttTemp = 1;
        var dataEdit;

        dataEdit =  {
            harvest_id:parseInt($('#harvest_id_Edit').val()),
            harvedeta_number:parseInt($('#harvedeta_number_Edit').val()),
            pond_id: parseInt($('#pond_id_Edit').val()),
            prodtype_id: parseInt($('#prodtype_id_Edit').val()),
            harvedeta_weight: parseFloat($('#harvedeta_weight_Edit').val()),
            unit_id: parseInt($('#unit_id_Edit').val()),
            harvedeta_price: parseInt($('#harvedeta_price_Edit').val()),
            harvedeta_note: $('#harvedeta_note_Edit').val(),
            harvedeta_number: parseInt($('#harvedeta_number_Edit').val())
        }
        console.log(parseInt($('#harvest_id_Edit').val()));
        console.log(parseInt($('#prodtype_id_Edit').val()));
        console.log(parseInt($('#harvedeta_number_Edit').val()));
        updateHarvestDetail(host, token, parseInt($('#harvest_id_Edit').val()), parseInt($('#prodtype_id_Edit').val()), parseInt($('#harvedeta_number_Edit').val()), dataEdit, function(rs){
            loadHavestDetailByHavest(host,token,harvestObj.harvest_id,function(rs){
                var sttTemp = 1;
                var html = '';
                harvestObj.data = [];
                rs.forEach(function(temp){
                    var tempNote;
                    console.log(temp);
                    var tempData =  {
                        harvest_id:temp.harvest_id,
                        pond_id: temp.pond_id,
                        prodtype_id: temp.prodtype_id,
                        harvedeta_weight: temp.harvedeta_weight,
                        unit_id: temp.unit_id,
                        harvedeta_price: temp.harvedeta_price,
                        harvedeta_note: temp.harvedeta_note,
                        harvedeta_number: temp.harvedeta_number
                    }
                    harvestObj.data.push(tempData);
                    if(temp.harvedeta_note.length > 40){
                        tempNote = temp.harvedeta_note.substr(0,37) + "..."; 
                    }else{
                        tempNote = temp.harvedeta_note;
                    }
                    html +=
                            '<tr id="hd' + temp.harvest_id + temp.prodtype_id  + temp.harvedeta_number + '">' +
                                '<td>' + sttTemp + '</td>' +
                                '<td>' + 'Ao số '+ temp.pond_id + '</td>' +
                                '<td>' + arrayProductType[temp.prodtype_id] + '</td>' +
                                '<td>' + temp.harvedeta_weight + '</td>' +
                                '<td>' + arrayUnit[temp.unit_id] + '</td>' +
                                '<td>' + temp.harvedeta_price + '</td>' +
                                '<td>' + tempNote + '</td>' +
                                '<td><a title="Cập nhật" href="#" onclick="changeHavestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-pencil"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;<a title="Xóa" href="#"  onclick="deleteHarvestDetailForUpdateHavest('+ temp.harvest_id +','+temp.prodtype_id+','+ temp.harvedeta_number +');return false;"><span class="glyphicon glyphicon-remove"></span></a></td>' +
                            '</tr>';    
                    sttTemp++;
                });
                $('#listHavestDetail').html(html);
                stateEdit = false;
            });
        }); 
    }   
}

function updateHarvestDetail(host, token, harvestID, productID, haveDetaNumberID, data,  callback){
    var request = $.ajax({
            url : host + '/api/harvestDetail/update?harvest_id=' + harvestID + '&prodtype_id=' + productID + '&harvedeta_number=' + haveDetaNumberID,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            data: data,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                eventClickFail('Cập nhật thất bại',$('#error'));
            }else{
                callback(rs);                        
            }
        });
        request.fail(function(jqXHR, textStatus){
            console.log(jqXHR);
            eventClickFail('Cập nhật thất bại',$('#error')); 
        });
}

function initAllNotificationPage(){
    //Khoi tao cho socket nhan thong bao
    loadListStationByUser(host,token,userId,function(rs){
        rs.forEach(function(station){
            stationNotifi[station.station_id] = new NotifiDataUser({ station_id: station.station_id, socket: socket});
        });
    });
}


/*Hàm kiem tra mật khẩu mới có giống mật khẩu cũ hay không. Nếu giống thì báo 1. Ngược lại null*/
function checkPass(conf,token,userid,callback){
    console.log(token);
    var request = $.ajax({
            url: conf + '/api/user/checkpass/' + userid,
            method : 'POST',
            contentType: 'application/json; charset=utf-8',
            headers:{
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Authorization': token
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
function changePassWord(conf,token,userid,callback){
    var request = $.ajax({
            url: conf + '/api/user/changepassword/' + userid,
            method : 'PUT',
            contentType: 'application/json; charset=utf-8',
            headers:{
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Authorization': token
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
function changeUserPassword(conf,token,userid,roleText){
    if($("#frmCNMatKhau").valid()){
        checkPass(conf,token,userid,function(error,data){
            if(data != 1){
                changePassWord(conf,token,userid,function(error,items){
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