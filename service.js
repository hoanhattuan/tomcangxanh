var request = require('request');

module.exports.setPostHeader = function(address,header,data){
	var options = {
		url: address,
		headers: header,
		form: data
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
		console.log(req.session.role);
		if(req.session.role == 'farmers'){
			if(req.session.roleHistory != 'nongdan'){
				delete req.session.roleHistory;
  				delete req.session.pageHistory;
			}
			var regexString = /quantrac\/(quanly|chuyengia|nguoiquantri)/i ;
			if(regexString.test(req.originalUrl)){
				var temp = req.originalUrl.substr(1,req.originalUrl.length);
				temp = temp.split("/");
				req.session.pageHistory = req.originalUrl;
				req.session.roleHistory = temp[1];
				req.flash('error_msg','Bạn không có quyền đăng nhập trang này, xin đăng nhập bằng tài khoản thích hợp');
				return res.redirect('/quantrac/dangnhap');
			}
		}
		if(req.session.role == 'manager'){
			if(req.session.roleHistory != 'quanly'){
				delete req.session.roleHistory;
  				delete req.session.pageHistory;
			}
			var regexString = /quantrac\/(nongdan|chuyengia|nguoiquantri)/i ;
			if(regexString.test(req.originalUrl)){
				var temp = req.originalUrl.substr(1,req.originalUrl.length);
				temp = temp.split("/");
				req.session.pageHistory = req.originalUrl;
				req.session.roleHistory = temp[1];
				req.flash('error_msg','Bạn không có quyền đăng nhập trang này, xin đăng nhập bằng tài khoản thích hợp');
				return res.redirect('/quantrac/dangnhap');
			}
		}
		if(req.session.role == 'expert'){
			if(req.session.roleHistory != 'chuyengia'){
				delete req.session.roleHistory;
  				delete req.session.pageHistory;
			}
			var regexString = /quantrac\/(quanly|nongdan|nguoiquantri)/i ;
			if(regexString.test(req.originalUrl)){
				var temp = req.originalUrl.substr(1,req.originalUrl.length);
				temp = temp.split("/");
				req.session.pageHistory = req.originalUrl;
				req.session.roleHistory = temp[1];
				req.flash('error_msg','Bạn không có quyền đăng nhập trang này, xin đăng nhập bằng tài khoản thích hợp');
				return res.redirect('/quantrac/dangnhap');
			}
		}
		if(req.session.role == 'admin'){
			if(req.session.roleHistory != 'nguoiquantri'){
				delete req.session.roleHistory;
  				delete req.session.pageHistory;
			}
			var regexString = /quantrac\/(quanly|chuyengia|nongdan)/i ;
			if(regexString.test(req.originalUrl)){
				var temp = req.originalUrl.substr(1,req.originalUrl.length);
				temp = temp.split("/");
				req.session.pageHistory = req.originalUrl;
				req.session.roleHistory = temp[1];
				req.flash('error_msg','Bạn không có quyền đăng nhập trang này, xin đăng nhập bằng tài khoản thích hợp');
				res.redirect('/quantrac/dangnhap');
			}
		}
		return next();
	}else{
		res.redirect('/quantrac/dangnhap');
	}
}

