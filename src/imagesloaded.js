;(function(w, undefined) {
	'use strict';

	var ILID = ('il' + Math.random()).replace(/0\./g, '');
	var EVENTS = 'load error';
	var ALLOWED_NODE_TYPES = [
		1, // ELEMENT_NODE
		9, // DOCUMENT_NODE
		11 // DOCUMENT_FRAGMENT_NODE
	];

	/**
	 * Return type of the value.
	 *
	 * @param  {Mixed} value
	 *
	 * @return {String}
	 */
	function type(value) {
		if (value == null) {
			return String(value);
		}
		if (typeof value === 'object' || typeof value === 'function') {
			return (value instanceof w.NodeList && 'nodelist') ||
				(value instanceof w.HTMLCollection && 'htmlcollection') ||
				Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase();
		}
		return typeof value;
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
			case 'htmlcollection':
			case 'arguments':
				var arr = [];
				for (var i = 0, l = collection.length; i < l; i++) {
					if (i in collection) {
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
		if (type(array) !== 'array') {
			return -1;
		}
		if (array.indexOf) {
			return array.indexOf(value);
		}
		for (var i=0, l = array.length; i < l; i++) {
			if (array[i] === value) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Callback proxy.
	 *
	 * Ensures that callback will receive a specific context.
	 *
	 * @param {Mixed}    context
	 * @param {Function} callback
	 */
	function proxy(context, callback) {
		return function () {
			return callback.apply(context, arguments);
		};
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

	/**
	 * Callbacks handler.
	 */
	function Callbacks() {
		var self = this;
		var callbacks = {};
		var i, l;

		/**
		 * Registers callbacks.
		 *
		 * @param  {Mixed} name
		 * @param  {Mixed} fn
		 *
		 * @return {Void}
		 */
		self.on = function (name, fn) {
			callbacks[name] = callbacks[name] || [];
			if (type(fn) === 'function' && inArray(fn, callbacks[name]) === -1) {
				callbacks[name].push(fn);
			}
		};

		/**
		 * Remove one or all callbacks.
		 *
		 * @param  {String} name
		 * @param  {Mixed}  fn
		 *
		 * @return {Void}
		 */
		self.off = function (name, fn) {
			callbacks[name] = callbacks[name] || [];
			if (fn === undefined) {
				callbacks[name].length = 0;
			} else {
				var index = inArray(fn, callbacks[name]);
				if (index !== -1) {
					callbacks[name].splice(index, 1);
				}
			}
		};

		/**
		 * Trigger callbacks for event.
		 *
		 * @param  {String} name
		 * @param  {Mixed}  context
		 * @param  {Mixed}  argN
		 *
		 * @return {Void}
		 */
		self.trigger = function (name, context) {
			if (callbacks[name]) {
				for (i = 0, l = callbacks[name].length; i < l; i++) {
					callbacks[name][i].apply(context, Array.prototype.slice.call(arguments, 2));
				}
			}
		};
	}

	/**
	 * Executes callback(s) when images have finished with loading.
	 *
	 * @param  {NodeList} collection Collection of containers, images, or both.
	 * @param  {Function} options    ImagesLoaded options.
	 *
	 * @return {Void}
	 */
	function ImagesLoaded(collection, options) {
		// Fill unassigned options with defaults
		options = options || {};
		for (var key in ImagesLoaded.defaults) {
			if (!options.hasOwnProperty(key)) {
				options[key] = ImagesLoaded.defaults[key];
			}
		}

		var callbacks = new Callbacks();
		var tIndex;

		var instance = {
			images: [],
			loaded: [],
			pending: [],
			proper: [],
			broken: [],

			isPending: true,
			isDone: false,
			isFailed: false,

			/**
			 * Registers or executes callback for done state.
			 *
			 * @param  {Function} callback
			 *
			 * @return {ImagesLoaded}
			 */
			done: function (callback) {
				if (instance.isPending) {
					callbacks.on('done', callback);
				} else if (instance.isDone && type(callback) === 'function') {
					callback.call(instance);
				}
				return instance;
			},

			/**
			 * Registers or executes callback for fail state.
			 *
			 * @param  {Function} callback
			 *
			 * @return {ImagesLoaded}
			 */
			fail: function (callback) {
				if (instance.isPending) {
					callbacks.on('fail', callback);
				} else if (instance.isFailed && type(callback) === 'function') {
					callback.call(instance);
				}
				return instance;
			},

			/**
			 * Registers or executes callback for done state.
			 *
			 * @param  {Function} callback
			 *
			 * @return {ImagesLoaded}
			 */
			always: function (callback) {
				if (instance.isPending) {
					callbacks.on('always', callback);
				} else if (type(callback) === 'function') {
					callback.call(instance);
				}
				return instance;
			},

			/**
			 * Registers or executes callback for done state.
			 *
			 * @param  {Function} callback
			 *
			 * @return {ImagesLoaded}
			 */
			progress: function (callback) {
				if (instance.isPending) {
					callbacks.on('progress', callback);
				}
				// Retroactivity
				for (var i = 0, l = instance.loaded.length; i < l; i++) {
					callback.call(instance, instance.loaded[i], instance.loaded[i][ILID].isBroken);
				}
				return instance;
			}
		};

		// Extract images
		collection = toArray(collection);
		for (var c = 0, cl = collection.length; c < cl; c++) {
			if (collection[c].nodeName === 'IMG') {
				instance.images.push(collection[c]);
			} else if (inArray(collection[c].nodeType, ALLOWED_NODE_TYPES) !== -1) {
				instance.images = instance.images.concat(toArray(collection[c].getElementsByTagName('img')));
			}
		}

		/**
		 * Executes proper callbacks when all images has finished with loading.
		 *
		 * @return {Void}
		 */
		function doneLoading() {
			if (!instance.isPending) {
				return;
			}
			// Clear timeout
			clearTimeout(tIndex);
			// Mark states
			instance.isPending = false;
			instance.isDone = instance.images.length === instance.proper.length;
			instance.isFailed = !instance.isDone;
			// Trigger callbacks
			callbacks.trigger(instance.isDone ? 'done' : 'fail', instance);
			callbacks.trigger('always', instance);
		}

		/**
		 * Terminates the determination process prematurely.
		 *
		 * @return {Void}
		 */
		function terminate() {
			// Mark still pending images as broken
			while (instance.pending.length) {
				imgLoaded(instance.pending[0], 1);
			}
		}

		/**
		 * Image load event handler.
		 *
		 * @param  {Event} event
		 *
		 * @return {Void}
		 */
		function imgLoadedHandler(event) {
			/*jshint validthis:true */
			event = event || w.event;
			// Unbind loaded handler from temporary image
			unbind(this[ILID].tmpImg, EVENTS, imgLoadedHandler);
			// Leave the temporary image for garbage collection
			this[ILID].tmpImg = null;
			// Don't proceed if image is already loaded
			if (inArray(this, instance.loaded) === -1) {
				imgLoaded(this, event.type !== 'load');
			}
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
			var pendingIndex = inArray(img, instance.pending);
			if (pendingIndex === -1) {
				return;
			} else {
				instance.pending.splice(pendingIndex, 1);
			}
			// Store element in loaded images array
			instance.loaded.push(img);
			// Keep track of broken and properly loaded images
			instance[isBroken ? 'broken' : 'proper'].push(img);
			// Cache image state for future calls
			img[ILID].isBroken = isBroken;
			img[ILID].src = img.src;
			// Trigger progress callback
			callbacks.trigger('progress', instance, img, isBroken);
			// Call doneLoading
			if (instance.images.length === instance.loaded.length) {
				setTimeout(doneLoading);
			}
		}

		/**
		 * Checks the status of all images.
		 *
		 * @return {Void}
		 */
		function check() {
			// If no images, trigger immediately
			if (!instance.images.length) {
				doneLoading();
				return;
			}
			// Actually check the images
			var img;
			for (var i = 0, il = instance.images.length; i < il; i++) {
				img = instance.images[i];
				img[ILID] = img[ILID] || {};
				// Add image to pending array
				instance.pending.push(img);
				// Find out whether this image has been already checked for status.
				// If it was, and src has not changed, call imgLoaded.
				if (img[ILID].isBroken !== undefined && img[ILID].src === img.src) {
					imgLoaded(img, img[ILID].isBroken);
					continue;
				}
				// If complete is true and browser supports natural sizes,
				// try to check for image status manually.
				if (img.complete && img.naturalWidth !== undefined) {
					imgLoaded(img, img.naturalWidth === 0);
					continue;
				}
				// If none of the checks above matched, simulate loading on detached element.
				img[ILID].tmpImg = document.createElement('img');
				bind(img[ILID].tmpImg, EVENTS, proxy(img, imgLoadedHandler));
				img[ILID].tmpImg.src = img.src;
			}
		}

		// Defer the images check to next process tick to give people time to bind progress callbacks.
		setTimeout(check);
		// Set the timeout
		setTimeout(terminate, options.timeout);
		// Return the instance
		return instance;
	}

	// Default options
	ImagesLoaded.defaults = {
		timeout: 10000 // Automatically fail images loading when this time has passed.
	};

	// Expose globally
	w.ImagesLoaded = ImagesLoaded;
}(window));