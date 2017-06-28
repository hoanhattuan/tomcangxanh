var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var service = require('../services/service');
var http = require ('http');
var request = require('request');
var config = require('../config/config.json');

//Lay duong dan cac router con
var farmer = require('./farmer');
var manager = require('./manager');
var admin = require('./admin');
var expert = require('./expert');
//Dan tới các thư mục khác
router.use('/nongdan', farmer);
router.use('/quanly',manager);
router.use('/nguoiquantri',admin);
router.use('/chuyengia',expert);
//Trang chu
router.get('/', service.ensureAuthenticated,function(req, res) {
  	if(req.session.role == 'farmers'){
		if(req.session.roleHistory){
  			if(req.session.roleHistory == 'nongdan'){
  				var urlTemp = req.session.pageHistory;
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  				res.redirect(urlTemp);	
  			}else{
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  			}	
  		}
  		res.redirect('/quantrac/nongdan/dulieu/xemsodo');
  	}else if(req.session.role == 'manager'){
		if(req.session.roleHistory){
  			if(req.session.roleHistory == 'quanly'){
  				var urlTemp = req.session.pageHistory;
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  				res.redirect(urlTemp);	
  			}else{
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  			}	
  		}
  		res.redirect('/quantrac/quanly');
  	}else if(req.session.role == 'admin'){
		if(req.session.roleHistory){
  			if(req.session.roleHistory == 'nguoiquantri'){
  				var urlTemp = req.session.pageHistory;
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  				res.redirect(urlTemp);	
  			}else{
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  			}	
  		}
  		res.redirect('/quantrac/nguoiquantri');
  	}else if(req.session.role == 'expert'){
		if(req.session.roleHistory){
  			if(req.session.roleHistory == 'chuyengia'){
  				var urlTemp = req.session.pageHistory;
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  				res.redirect(urlTemp);	
  			}else{
  				delete req.session.roleHistory;
  				delete req.session.pageHistory;
  			}	
  		}
  		res.redirect('/quantrac/chuyengia');
  	}
});
//Dang nhap
router.get('/dangnhap', function(req, res) {
  	res.render('login', { title: 'Đăng nhập'});
});
//Thiet lap phien lam viec 
passport.serializeUser(function(user, done) {
  	done(null, user.id);
});
//Thiet lap thong tin nguoi dung vao req
passport.deserializeUser(function(id, done){
	done(null,{id:id});
});


//Kich ban kiem tra dang nhap
passport.use(new LocalStrategy({passReqToCallback:true},
  	function(req,username, password, done) {
  		//Du lieu truyen vao lay token
		var data = {
			username:username,
			password:password,
			grant_type:'password'
		};
		//Option truy van token
		var options = service.setOption('POST', config.urladdress + '/api/auth/token',{
					  'Content-Type': 'application/x-www-form-urlencoded'
					  },data);
		service.post(options,function(error,body){
			if(error){
				req.flash('error_msg','Lỗi khi xác thực tài khoản');
				return done(null,false);
			}else{
				var userData = JSON.parse(body);
				if(userData.status){
					req.flash('error_msg',userData.message);
					return done(null,false);
				}else{
					if(req.session.userid){
						delete req.session.token;
					  	delete req.session.role;
					  	delete req.session.userid;
					  	delete req.session.username;
					  	delete req.session.fullName;
					}
					req.session.token = userData.accessToken;
					req.session.role = userData.role;
					req.session.userid = userData.user_id;
					req.session.username = userData.username;
					req.session.fullName = userData.fullName;
					return done(null,{id:userData.user_id,name:userData.username});
				}
			}
		});
  }));
//Xu li dang nhap
router.post('/dangnhap',
  	passport.authenticate('local',{successRedirect: '/quantrac', failureRedirect: '/quantrac/dangnhap', failureFlash:true}),
  	function(req, res) {
    	res.redirect('/quantrac');
  	});
//Dang xuat
router.get('/dangxuat',service.ensureAuthenticated, function(req, res) {
	//Xoa du lieu luu trong req
  	delete req.session.token;
  	delete req.session.role;
  	delete req.session.userid;
  	delete req.session.username;
	delete req.session.fullName;
  	req.flash('success_msg','Bạn đã đăng xuất');
  	req.logout();
  	res.redirect('/quantrac/dangnhap');
});

module.exports = router;
