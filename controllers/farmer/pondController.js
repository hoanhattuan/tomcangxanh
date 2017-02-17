var express = require('express');
var pondController = express.Router();

//Tao moi ao nuoi
pondController.get('/taoaonuoi', function(req, res) {
	console.log(req.session);
  res.render("farmer/testView");
});

module.exports = pondController;
