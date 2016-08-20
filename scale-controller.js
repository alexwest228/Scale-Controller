(function () {
	'use strict';
	
	var re = /^([0-9]+)x([0-9]+)$/;
	
	function camelCase (text) {
		return text.replace(/\-(\w)/g, function (all, letter) {
			return letter.toUpperCase();
		});
	}
	
	function each (obj, callback) {
		if ( (Object.prototype.toString.call(obj) !== '[object Object]') && (typeof obj.length !== 'undefined') ) {
			var i = 0,
				length = obj.length,
				value;
				
			for ( ; i < length; i++ ) {
				value = obj[i];
				if (callback.call(value, i, value) === false) {
					break;
				}
			}
		} else {
			for (var name in obj) {
				if ( !Object.prototype.hasOwnProperty.call(obj, name) ) {
					continue;
				}
				
				if (callback.call(name, obj[name], name) === false) {
					break;
				}
			}
		}
		
		return obj;
	}
	
	function isVisible (elem) {
		return (!elem || !elem.style) ? false : (getStyle(elem, 'display') != 'none');
	}
	
	function getStyle (elem, name, force) {
		if (!elem) return '';
		
		if (force === undefined) {
			force = true;
		}
		
		if ( !force && elem.style && (elem.style[name] || name == 'height') ) {
			return elem.style[name];
		}

		var defaultView = document.defaultView || window,
			ret, computedStyle;
		
		if (defaultView.getComputedStyle) {
			name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
			computedStyle = defaultView.getComputedStyle(elem, null);
			
			if (computedStyle) {
				ret = computedStyle.getPropertyValue(name);
			}
		} else if (elem.currentStyle) {
			ret = elem.currentStyle[name] || elem.currentStyle[ camelCase(name) ];
			
			if (ret == 'auto') {
				ret = 0;
			}
			
			ret = (ret + '').split(' ');
			
			each(ret, function (i, v) {
				if ( !/^\d+(px)?$/i.test(v) && /^\d/.test(v) ) {
					var style = elem.style,
						left = style.left,
						rsLeft = elem.runtimeStyle.left;
					
					elem.runtimeStyle.left = elem.currentStyle.left;
					style.left = v || 0;
					ret[i] = style.pixelLeft + 'px';
					style.left = left;
					elem.runtimeStyle.left = rsLeft;
				}
			});
			ret = ret.join(' ');
		}

		if ( force && (name == 'width' || name == 'height') ) {
			var ret2 = getSize(elem, true)[({'width': 0, 'height': 1})[name]];
			ret = (intval(ret) ? Math.max(floatval(ret), ret2) : ret2) + 'px';
		}
		
		return ret;
	}
	
	function setStyle (elem, name, value) {
		if (!elem) return;
		
		if (typeof name == 'object') {
			each(name, function (v,k) {
				setStyle(elem, k, v);
			});
			return;
		}
		
		if (name == 'opacity') {
			elem.style.opacity = value;
		} else {
			try {
				var isN = typeof value == 'number';
				
				if ( isN && (/height|width/i).test(name) ) {
					value = Math.abs(value);
				}
				elem.style[name] = (isN && !(/z-?index|font-?weight|opacity|zoom|line-?height/i).test(name)) ? value+'px' : value;
			} catch (e) {}
		}
	}
	
	function boundingRectEnabled (elem) {
		return (typeof elem.getBoundingClientRect !== 'undefined');
	}
	
	function getXYRect (elem, notBounding) {
		var rect;
		
		if (notBounding && getStyle(elem, 'display') == 'inline') {
			var rects = elem.getClientRects();
			rect = rects && rects[0] || elem.getBoundingClientRect();
		} else {
			rect = elem.getBoundingClientRect();
		}
		
		return rect;
	}
	
	function getSize (elem, withoutBounds, notBounding) {
		var s = [0, 0],
			de = document.documentElement,
			rect;
		
		if (withoutBounds && getStyle(elem, 'boxSizing') === 'border-box') {
			withoutBounds = false;
		}
		
		if (elem == document) {
			s = [
				Math.max(
					de.clientWidth,
					document.body.scrollWidth, de.scrollWidth,
					document.body.offsetWidth, de.offsetWidth
				), Math.max(
					de.clientHeight,
					document.body.scrollHeight, de.scrollHeight,
					document.body.offsetHeight, de.offsetHeight
				)
			];
		} else if (elem == window) {
			s = [
				elem.innerWidth || de.clientWidth || document.body.clientWidth,
				elem.innerHeight || de.clientHeight || document.body.clientHeight
			];
		} else if (elem) {
			function getWH() {
				if ( boundingRectEnabled(elem) && (rect = getXYRect(elem, notBounding)) && rect.width !== undefined ) {
					s = [rect.width, rect.height];
				} else {
					s = [elem.offsetWidth, elem.offsetHeight];
				}
				
				if (!withoutBounds) {
					return;
				}
				
				var padding = 0,
					border = 0;
				
				each(s, function (i, v) {
					var which = i ? ['Top', 'Bottom'] : ['Left', 'Right'];
					
					each(which, function () {
						s[i] -= parseFloat(getStyle(elem, 'padding' + this)) || 0;
						s[i] -= parseFloat(getStyle(elem, 'border' + this + 'Width')) || 0;
					});
				});
			}
		
			if ( !isVisible(elem) ) {
				var props = {
						"position": 'absolute',
						"visibility": 'hidden',
						"display": 'block'
					},
					old = {},
					old_cssText = false;
				
				if (elem.style.cssText.indexOf('!important') > -1) {
					old_cssText = elem.style.cssText;
				}
		  
				each(props, function (i, v) {
					old[i] = elem.style[i];
					elem.style[i] = v;
				});
				
				getWH();
				
				each(props, function (i, v) {
					elem.style[i] = old[i];
				});
				
				if (old_cssText) {
					elem.style.cssText = old_cssText;
				}
			} else {
				getWH();
			}
		}
		
		return s;
	}
	
	function domQuery (selectors) {
		return document.querySelectorAll(selectors);
	}
	
	function domData (el, name, value) {
		if (!el) {
			return null;
		}
		
		if (typeof value != 'undefined') {
			el.setAttribute('data-' + name, value);
			return value;
		} else {
			return el.getAttribute('data-' + name);
		}
	}
	
	function addEvent (elem, type, handle) {
		// 3 - Node.TEXT_NODE, 8 - Node.COMMENT_NODE
		if (!elem || elem.nodeType == 3 || elem.nodeType == 8) {
			return;
		}
		
		// For IE
		(elem.setInterval && elem != window) && (elem = window);
		
		if (elem.addEventListener) {
			elem.addEventListener(type, handle);
		} else {
			elem.attachEvent('on' + type, handle);
		}
	}
	
	function removeEvent(elem, type, handler) {
		// 3 - Node.TEXT_NODE, 8 - Node.COMMENT_NODE
		if (!elem || elem.nodeType == 3 || elem.nodeType == 8) {
			return;
		}
		
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handler);
		} else {
			elem.detachEvent('on' + type, handler);
		}
    }
	
	function onDocLoaded (callback) {
		function done () {
			removeEvent(document, 'DOMContentLoaded', done);
			removeEvent(window, 'load', done);
			callback();
		}
		
		if ( document.readyState === 'complete' ) {
			callback();
		} else {
			addEvent(document, 'DOMContentLoaded', done);
			addEvent(window, 'load', done);
		}
	}
	
	onDocLoaded(function () {
		var element	= domQuery('[data-scale]')[0],
			strict	= domData(element, 'scale').match(re) || false,
			size	= getSize(element);
		
		if (strict !== false) {
			size[0] = parseInt(strict[1]);
			size[1] = parseInt(strict[2]);
		}
		
		setStyle(element, {
			"width": size[0],
			"height": size[1]
		});
		
		var calcScale = function () {
			var ws = getSize(window);
			
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
			
			setStyle(element, {
				"transform": 'scale('+scale.scale+','+scale.scale+')',
				"margin-left": (scale.offset > 0) ? (scale.offset / 2) : 0
			});
		};
		
		addEvent(window, 'resize', handler);
		handler();
	});
	
})();