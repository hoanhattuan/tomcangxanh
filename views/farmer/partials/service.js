var request = require('request');

module.exports.setOption = function(type,address,header,data){
	var options;
	type = type.toLowerCase();
	switch(type){
		case 'get':
			if (header) {
				options = {
					url:address,
					method:type,
					headers:header 
				};
			}else{
				options = {
					url:address,
					method:type,
				};
			}
			break;
		case 'delete':
			options = {
				url:address,
				method:type,
				headers:header 
			};
			break;
		case 'post':
		case 'put' :
			options = {
				url:address,
				method:type,
				headers:header,
				form:data 
			};
			break;
	}
	return options;
}

module.exports.get = function(options,done){
	request(options,function(error,response,body){
		if(!error && response.statusCode == 200){
			done(null,body);
		}else{
			done(error,body);
		}
	});
}

module.exports.post = function(options,done){
	request(options,function(error,response,body){
		if(!error && response.statusCode == 200){
			done(null,body);
		}else{
			done(error,body);
		}
	});
}

module.exports.put = function(options,done){
	request(options,function(error,response,body){
		if(!error && response.statusCode == 200){
			done(null,body);
		}else{
			done(error,body);
		}
	});
}


module.exports.ensureAuthenticated = function(req,res,next){	
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/dangnhap');
	}
}
