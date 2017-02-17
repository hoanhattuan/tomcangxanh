var map;
      function initMap() {
		var nhatao = {lat: 10.026006, lng: 105.762692};
        map = new google.maps.Map(document.getElementById('map'), {
          center: nhatao,
          zoom: 14,
		  ScaleOptions: true,
        });
		var vitri = [
			{'lat': 10.026006, 'lng': 105.762692},
			{'lat': 10.030288, 'lng': 105.771739},
			{'lat': 10.027558, 'lng': 105.770620},
			{'lat': 10.030072, 'lng': 105.772626}
		];
		var secretMessages = [
			'<b>Gia sư Kiều Yến<b/><br/>Điện thoại: 0989022302<br/>Môn dạy: Toán, Tiếng Anh, Vật lý<br/>Đối tượng: 6,7,8,9<br/>Địa chỉ: Hẻm 132, Đường 3/2 Cần Thơ',
			'<b>Gia sư Hoàng Duy<b/><br/>Điện thoại: 0915039223<br/>Môn dạy: Tiếng Anh<br/>Đối tượng: 6,7,8,9,Bằng A tiếng anh<br/>Địa chỉ: Hẻm 124, Đường 3/2 Cần Thơ',
			'<b>Gia sư Lê Khang<b/><br/>Điện thoại: 0938203233<br/>Môn dạy: Toán<br/>Đối tượng: 10,11,12<br/>Địa chỉ: Đường Lê Lai, Cần Thơ',
			'<b>Gia sư Anh Duy<b/><br/>Điện thoại: 0967238232<br/>Môn dạy: Tiếng Nhật<br/>Đối tượng: Tất cả độ tuổi<br/>Địa chỉ: Hẻm 51, Cần Thơ'
		];
		/*Hiện thông tin */
		for (var i = 0; i < secretMessages.length; ++i) {
			var marker = new google.maps.Marker({
				position: vitri[i],
				map: map,
				icon: 'images/School-20.png',
			});
			ShowMessage(marker, secretMessages[i]);
		}

      }
	  function ShowMessage(marker, secretMessage) {
		var infowindow = new google.maps.InfoWindow({
          		content: secretMessage
          });

        marker.addListener('click', function() {
          	infowindow.open(marker.get('map'), marker);
        });
	  }
	  