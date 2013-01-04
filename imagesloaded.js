/*!
 * imagesLoaded v0.9.0
 * https://github.com/Darsain/imagesLoaded
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
/*jshint
	bitwise:false, camelcase:false, curly:true, eqeqeq:true, forin:false, immed:true, latedef:true, newcap:true,
	noarg:true, noempty:true, nonew:false, plusplus:false, quotmark:false, regexp:false, undef:true, unused:true,
	strict:true, trailing:true,

	asi:false, boss:false, debug:false, eqnull:true, es5:false, esnext:false, evil:false, expr:false, funcscope:false,
	iterator:false, lastsemic:false, laxbreak:false, laxcomma:true, loopfunc:false, multistr:false, onecase:true,
	proto:false, regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, supernew:false,

	browser:true
*/
;(function(w, undefined) {
	'use strict';

	// Blank image data-uri bypasses webkit log warning (thx doug jones)
	var BLANK  = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
		EVENTS = 'load error';

	/**
	 * Executes callback(s) when images have finished with loading.
	 *
	 * @param  {NodeList} container Container with images, or NodeList of images and/or containers.
	 * @param  {Function} callback  Called when all images are done loading, regardless of their state.
	 * @param  {Function} progress  Called on every image when it has finished with loading.
	 *
	 * @return {Void}
	 */
	w.imagesLoaded = function (container, callback, progress) {
		var images = [],
			loaded = [],
			proper = [],
			broken = [],
			collection;

		if (container) {
			collection = toArray(container);

			// Extract images
			for (var c = 0, cl = collection.length; c < cl; c++) {
				if (collection[c].nodeName === 'IMG') {
					images.push(collection[c]);
				} else if (collection[c].nodeType === Node.ELEMENT_NODE) {
					images = images.concat(toArray(collection[c].getElementsByTagName('img')));
				}
			}
		}

		/**
		 * Trigger callback with passed arguments.
		 *
		 * @param  {String} name    Callback name.
		 * @param  {Mixed}  context The value of `this` provided for callback.
		 *
		 * @return {Void}
		 */
		function trigger(callback, context) {
			if (typeof callback === 'function') {
				callback.apply(context, Array.prototype.slice.call(arguments, 2));
			}
		}

		/**
		 * Executes proper callbacks when all images has finished with loading.
		 *
		 * @return {Void}
		 */
		function doneLoading() {
			trigger(callback, container, images, proper, broken);
		}

		/**
		 * Image load event handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function imgLoadedHandler(event) {
			event = event || w.event;
			var img = event.target || event.srcElement;

			// Don't proceed if BLANK image, or image is already loaded
			if (img.src === BLANK || inArray(img, loaded)) {
				return;
			}

			imgLoaded(img, event.type === 'error');
		}

		/**
		 * Mark image as loaded.
		 *
		 * @param  {Node}    img      Image element.
		 * @param  {Boolean} isBroken Whether the image is broken.
		 *
		 * @return {Void}
		 */
		function imgLoaded(img, isBroken) {
			// Unbind loaded handler
			unbind(img, EVENTS, imgLoadedHandler);

			// Store element in loaded images array
			loaded.push(img);

			// Keep track of broken and properly loaded images
			if (isBroken) {
				broken.push(img);
			} else {
				proper.push(img);
			}

			// Cache image state for future calls
			img.imagesLoaded = {
				isBroken: isBroken,
				src: img.src
			};

			// Trigger progress callback
			trigger(progress, img, isBroken, images, loaded, proper, broken);

			// Call doneLoading
			if (images.length === loaded.length) {
				setTimeout(doneLoading);
			}
		}

		// If no images, trigger immediately
		if (!images.length) {
			doneLoading();
		} else {
			for (var i = 0, il = images.length; i < il; i++) {
				var img = images[i],
					src = img.src,
					cached = img.imagesLoaded;

				// Find out whether this image has been already checked for status.
				// If it was, and src has not changed, call imgLoaded.
				if (cached && cached.src === src) {
					imgLoaded(img, cached.isBroken);
					continue;
				}

				// If complete is true and browser supports natural sizes,
				// try to check for image status manually.
				if (img.complete && img.naturalWidth !== undefined) {
					imgLoaded(img, img.naturalWidth === 0);
					continue;
				}

				// If none of the checks above worked, attach events, and reset src if needed.
				bind(img, EVENTS, imgLoadedHandler);

				// `img.readyState` is basically an IE check.
				if (img.complete || img.readyState) {
					img.src = BLANK;
					img.src = src;
				}
			}
		}
	};

	/**
	 * Return type of the value.
	 *
	 * @param  {Mixed} value
	 *
	 * @return {String}
	 */
	function type(value) {
		return Object.prototype.toString.call(value).match(/^\[object ([a-z]+)\]$/i)[1].toLowerCase();
	}

	/**
	 * Convert array-like objects into an array.
	 *
	 * @param  {Mixed} collection
	 *
	 * @return {Array}
	 */
	function toArray(collection) {
		switch (type(collection)) {
			case 'array':
				return collection;
			case 'undefined':
				return [];
			case 'nodelist':
			case 'arguments':
				var arr = [];
				for (var i = 0, l = collection.length; i < l; i++) {
					if (collection.hasOwnProperty(i) || i in collection) {
						arr.push(collection[i]);
					}
				}
				return arr;
			default:
				return [collection];
		}
	}

	/**
	 * Check whether the value is in an array.
	 *
	 * @param  {Mixed} value
	 * @param  {Array} array
	 *
	 * @return {Boolean}
	 */
	function inArray(value, array) {
		if (type(value) !== 'array') {
			return false;
		}

		if (array.indexOf) {
			return array.indexOf(value) !== -1;
		}

		for (var i=0, l = array.length; i < l; i++) {
			if (array[i] === value) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Add event listeners to element.
	 *
	 * @param  {Node}     element
	 * @param  {Event}    eventName
	 * @param  {Function} handler
	 *
	 * @return {Void}
	 */
	function bind(element, eventName, handler) {
		listener(element, eventName, handler);
	}

	/**
	 * Remove event listeners from element.
	 *
	 * @param  {Node}     element
	 * @param  {Event}    eventName
	 * @param  {Function} handler
	 *
	 * @return {Void}
	 */
	function unbind(element, eventName, handler) {
		listener(element, eventName, handler, 1);
	}

	/**
	 * Manage element event listeners.
	 *
	 * @param  {Node}     element
	 * @param  {Event}    eventName
	 * @param  {Function} handler
	 * @param  {Bool}     remove
	 *
	 * @return {Void}
	 */
	function listener(element, eventName, handler, remove) {
		var events = eventName.split(' ');
		for (var i = 0, l = events.length; i < l; i++) {
			if (element.addEventListener) {
				element[remove ? 'removeEventListener' : 'addEventListener'](events[i], handler, false);
			} else if (element.attachEvent) {
				element[remove ? 'detachEvent' : 'attachEvent']('on' + events[i], handler);
			}
		}
	}
}(window));