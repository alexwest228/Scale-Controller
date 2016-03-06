(function(window, $){
	'use strict';
	
	if (!$)
		throw new Error('Scale controller requires jQuery.');
	
	window.scale = 1;
	var re = /^([0-9]+|=)x([0-9]+|=)$/;
	
	$(function(){
		var $window	= $( window ),
			$body	= $( window.document.body ),
			$element= $( '[data-scale]', $body ),
			config	= $element.attr('data-scale').match(re) || false;
		
		var width 	= $element.width(),
			height	= $element.height();
		
		if ($element.length == 1)
		{
			if (config)
			{
				width	= (config[1] != '=') ? parseInt(config[1]) : width ;
				height	= (config[2] != '=') ? parseInt(config[2]) : height ;
			}
			
			$element.css({
				"width": width+'px',
				"height": height+'px'
			});
			
			var controller = function(){
				var scaleWidth	= $window.width() / width,
					scaleHeight = $window.height() / height;
				
				var scale = window.scale = (scaleHeight > scaleWidth) ? scaleWidth : scaleHeight,
					offset = $body.width() - (width * scale);
				
				$element.css({
					"transform": 'scale('+scale+', '+scale+ ')',
					"margin-left": (offset > 0) ? (offset / 2) : 0
				});
			};
			
			$window.on('resize', controller) && controller();
		}
	});
	
})(window, window.jQuery);