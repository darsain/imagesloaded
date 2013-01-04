/*global $:false, chai:false, describe:false, it:false, before:false, imagesLoaded:false*/
'use strict';

var expect = chai.expect;

describe('imagesLoaded', function () {
	this.timeout(10000);

	var container = document.getElementById('origins'),
		$container = $(container),
		$images = $container.find('img'),
		images = $images.get(),
		totalImages = images.length,
		properImages = $images.filter('.proper').length,
		brokenImages = $images.filter('.broken').length,
		callbackSpy, progressSpy,
		cbContext, cbArgs, prgContext, prgArgs,
		progressedThrough = [];

	before(function (done) {
		callbackSpy = chai.spy(function () {
			cbContext = this;
			cbArgs = arguments;
			done();
		});
		progressSpy = chai.spy(function () {
			if (arguments[1].length === arguments[2].length) {
				prgContext = this;
				prgArgs = arguments;
			}

			progressedThrough.push({
				img: this,
				args: $.extend(true, [], Array.prototype.slice.call(arguments))
			});
		});

		imagesLoaded(container, callbackSpy, progressSpy);
	});

	it('should accept a container as its 1st argument', function () {
		expect(cbContext).to.equal(container);
	});

	it('should accept a callback function as its 2nd argument', function () {
		expect(callbackSpy).to.be.called();
		expect(cbContext).to.equal(container);
	});

	it('should accept a progress function as its 3rd argument', function () {
		expect(progressSpy).to.be.called();
		expect(prgContext.nodeName).to.equal('IMG');
	});

	describe('container argument', function () {
		it('should accept null values', function (done) {
			imagesLoaded(document.getElementById('non-existent-id'), function () {
				done();
			});
		});

		it('should accept empty element nodes', function (done) {
			imagesLoaded(document.getElementById('empty'), function () {
				done();
			});
		});

		it('should accept mixed NodeList of images and elements', function (done) {
			var container = document.getElementById('chaos').childNodes,
				expectedImages = $(container).filter('img').add($(container).find('img')).length;

			imagesLoaded(container, function (images) {
				expect(images).to.be.a('array');
				expect(images).to.have.length(expectedImages);
				done();
			});
		});

		it('should accept mixed Array of images and elements', function (done) {
			var $container = $('#chaos').children(),
				container = $container.get(),
				expectedImages = $container.filter('img').add($container.find('img')).length;

			imagesLoaded(container, function (images) {
				expect(images).to.be.a('array');
				expect(images).to.have.length(expectedImages);
				done();
			});
		});
	});

	describe('callback function', function () {
		it('should be called exactly once', function () {
			expect(callbackSpy).to.be.called.exactly(1);
		});

		it('should be executed immediately when there are no images in container', function () {
			var spy = chai.spy();
			imagesLoaded(document.getElementById('empty'), spy);
			expect(spy).to.be.called();
		});

		it('should have a container as its context (`this`)', function () {
			expect(cbContext).to.equal(container);
		});

		it('should have an array of all images from container as its 1st argument', function () {
			expect(cbArgs[0]).to.have.length(totalImages);

			for (var i = 0; i < totalImages; i++) {
				expect($(cbArgs[0][i]).is('img')).to.equal(true);
			}
		});

		it('should have an array of properly loaded images as its 2nd argument', function () {
			expect(cbArgs[1]).to.have.length(properImages);

			for (var i = 0; i < properImages; i++) {
				expect($(cbArgs[1][i]).is('img.proper')).to.equal(true);
			}
		});

		it('should have an array of broken images as its 3rd argument', function () {
			expect(cbArgs[2]).to.have.length(brokenImages);

			for (var i = 0; i < brokenImages; i++) {
				expect($(cbArgs[2][i]).is('img.broken')).to.equal(true);
			}
		});
	});

	describe('progress function', function () {
		it('should be called for each image in container', function () {
			var $images = $(cbArgs[0]);

			expect(progressSpy).to.be.called.exactly(totalImages);

			for (var i = 0; i < totalImages; i++) {
				expect($images.index(progressedThrough[i].img)).to.not.equal(-1);
			}
		});

		it('shouldn\'t be called at all when there are no images in container', function () {
			var spy = chai.spy();
			imagesLoaded(document.getElementById('empty'), null, spy);
			expect(spy).to.not.be.called();
		});

		it('should have a concerned image as its context (`this`)', function () {
			expect($(prgContext).is('img')).to.equal(true);
		});

		it('should have a correct isBroken boolean state of a concerned image as its 1st argument', function () {
			for (var i = 0, l = progressedThrough.length; i < l; i++) {
				expect($(progressedThrough[i].img).is(progressedThrough[i].args[0] ? 'img.broken' : 'img.proper')).to.equal(true);
			}
		});

		it('should have an array of all images from container as its 2nd argument', function () {
			for (var i = 0, l = progressedThrough.length; i < l; i++) {
				expect(progressedThrough[i].args[1]).to.deep.equal(images);
			}
		});

		it('should have an array of currently loaded images as its 3rd argument', function () {
			for (var i = 0, l = progressedThrough.length; i < l; i++) {
				expect(progressedThrough[i].args[2]).to.have.length(i+1);
				expect(progressedThrough[i].args[2]).to.include(progressedThrough[i].img);
			}
		});

		it('should have an array of currently loaded proper images as its 4th argument', function () {
			for (var i = 0, l = progressedThrough.length; i < l; i++) {
				expect(progressedThrough[i].args[3]).to.have.length.at.most(progressedThrough[i].args[2].length);
				if (!progressedThrough[i].args[0]) {
					expect(progressedThrough[i].args[3]).to.include(progressedThrough[i].img);
				}
			}
		});

		it('should have an array of currently loaded broken images as its 5th argument', function () {
			for (var i = 0, l = progressedThrough.length; i < l; i++) {
				expect(progressedThrough[i].args[4]).to.have.length.at.most(progressedThrough[i].args[2].length);
				if (progressedThrough[i].args[0]) {
					expect(progressedThrough[i].args[4]).to.include(progressedThrough[i].img);
				}
			}
		});
	});
});