var request = require('request');

module.exports.setPostHeader = function(address,header,data){
	var options = {
		url: address,
		headers: header,
		body: data
	}
	return options;
}

module.exports.setGetHeader = function(address,header){
	var options = {
		url: address,
		headers: header,
		method:'get'
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
	request.post(options,function(error,response,body){
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
