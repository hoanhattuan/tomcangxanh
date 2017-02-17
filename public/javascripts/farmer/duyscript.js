//Ham hien thi bang du lieu
function showDataView(dataTypes,elementID){
    body="";
    dataTypes.forEach(function(rs){
        body+='<tr class="text-center"><td><h4><span>'+ rs.datatype_name +'</span></h4></td><td><h4><span id="'+ rs.datatype_name+'"></span></h4></td></tr>';
        dataValues[rs.datatype_name]="";
    });
    elementID.html(body);
}

//Ham lay ve danh sach data type
function loadDataType(address,token,callback){
    var request = $.ajax({
            url : address + '/api/datatype/getall',
            method : 'GET',
            dataType : 'json',
            data:{
                
            },
            headers:{
                'Authorization': token
            }
        });
        request.done(function(rs){
            if(rs.Error){
                alert('Loi lay dataType');
            }else{
                callback(rs)
            }
        });
        request.fail(function(jqXHR, textStatus){
            alert('Lay datatype khong thanh cong');
        });
}

$(document).ready(function(){
    /* socket.emit('login',4); */
    $('#station_id').change(function(){
        if($(this).val()>0){
            var link = address + '/api/data/getbystation/' + $(this).val();
            var request = $.ajax({
                url : link,
                method : 'GET',
                dataType : 'json',
                data:{
                    
                },
                headers:{
                    'Authorization':token
                }
            });
            request.done(function(rs){
                if(rs.Error){
                    alert('Loi lay so lieu do');
                }else{
                    var data = rs.data;
                    var data_id;
                    var max_value;
                    dataTypes.forEach(function(dtype){
                        data_id="";
                        max_value="";
                        data.forEach(function(dta){
                            if(dtype.datatype_id==dta.datatype_id){
                                if(max_value==""){
                                    max_value=dta.data_value;
                                    data_id = dta.data_id; 
                                }else{
                                    if(dta.data_id>data_id){
                                        max_value=dta.data_value;
                                        data_id = dta.data_id;
                                    }
                                }
                            }
                        });
                        dataValues[dtype.datatype_name]= max_value;
                        document.getElementById(dtype.datatype_name).innerHTML = dataValues[dtype.datatype_name]; 
                    });                            
                }
            });
            request.fail(function(jqXHR, textStatus){
                alert('Lay du lieu khong thanh cong');
            });
        }else{
            dataTypes.forEach(function(dtype){
                dataValues[dtype.datatype_name]="";
                document.getElementById(dtype.datatype_name).innerHTML = dataValues[dtype.datatype_name];
            });
        }
    });     
});