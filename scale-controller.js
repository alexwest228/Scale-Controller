(function () {
	'use strict';
	
	if (!jQuery)
		throw new Error('Scale controller requires jQuery.');
	
	var re = /^([0-9]+)x([0-9]+)$/;
	
	$(function(){
		var element	= $('[data-scale]')[0],
			strict	= element.attr('data-scale').match(re) || false,
			size	= [element.width(),element.height()];
		
		if (strict !== false) {
			size[0] = parseInt(strict[1]);
			size[1] = parseInt(strict[2]);
		}
		
		element.css({
			"width": size[0],
			"height": size[1]
		});
		
		var calcScale = function () {
			var ws = [$(window).width(),$(window).height()];
			
			var widthScale	= ws[0] / size[0],
				heightScale = ws[1] / size[1];
			
			var scale = (heightScale > widthScale) ? widthScale : heightScale,
				offset = ws[0] - (size[0] * scale);
			
			return {
				"scale": scale,
				"offset": offset
			}
		};
		
		var handler = function () {
			var scale = calcScale();
			
			element.css({
				"transform": 'scale('+scale.scale+','+scale.scale+')',
				"margin-left": (scale.offset > 0) ? (scale.offset / 2) : 0
			});
		};
		
		Object.defineProperty(window, 'scale', {
			"get": function () {
				return calcScale().scale;
			},
			"set": function (value) {},
			"configurable": false,
			"enumerable": true,
		});
		
		$(window).on('resize', handler);
		handler();
	});
	
})();