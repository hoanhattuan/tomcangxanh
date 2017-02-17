var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var service = require('../services/service');
var http = require ('http');
var request = require('request');
var config = require('../config/config.json');

//Trang chu
router.get('/', service.ensureAuthenticated,function(req, res) {
  	if(req.session.role == 'famer'){
  		res.redirect('/nongdan');
  	}else if(req.session.role == 'manager'){
  		res.redirect('/quanly');
  	}else if(req.session.role == 'admin'){
  		res.redirect('/nguoiquantri');
  	}else{
  		res.redirect('/nongdan');
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
					req.session.token = userData.accessToken;
					req.session.role = userData.role;
					return done(null,{id:userData.user_id,name:userData.username});
				}
			}
		});
  }));
//Xu li dang nhap
router.post('/dangnhap',
  	passport.authenticate('local',{successRedirect: '/', failureRedirect: '/dangnhap', failureFlash:true}),
  	function(req, res) {
    	res.redirect('/');
  	});
//Dang xuat
router.get('/dangxuat',service.ensureAuthenticated, function(req, res) {
	//Xoa du lieu luu trong req
  	delete req.session.token;
  	delete req.session.role;
  	req.flash('success_msg','Bạn đã đăng xuất');
  	req.logout();
  	res.redirect('/dangnhap');
});

module.exports = router;
