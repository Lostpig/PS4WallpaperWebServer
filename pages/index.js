'use strict'

var createImg = function (url) {
	return '<a href="./' + url + '" target="_blank" class="box">' +
		'<img src="./' + url + '" alt="">' +
	'</a>'
}

window.onload = function () {	
	//can't use WebSocket on PS4
	/* 
		var client = new WebSocket('ws://127.0.0.1:8082')
		client.onopen = function () {
			client.send('start')
		} 
		client.onerror = function (err)  {
			console.log(err)
		}
		client.onmessage = function (msg) {
			var mark = $.map(JSON.parse(msg.data), function (file, index) {
					return createImg(file)
				}).join('')
			$('#pics').html(mark)
		}
	*/
	
	$.getJSON('./piclist').success(function (res) {
		var mark = $.map(res, function (file, index) {
				return createImg(file)
			}).join('')
		$('#pics').html(mark)
	})    
}