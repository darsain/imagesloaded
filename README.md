# imagesLoaded

A small library for DOM images loading state notifications.

This library has no dependencies.

If you are looking for a jQuery plugin, head over to: [desandro/imagesloaded](https://github.com/desandro/imagesloaded).

## Calling

```js
var il = new ImagesLoaded( collection, [ options ] ); // new keyword is optional
```

### collection `Mixed`

Can be `Element`, or an `Array`/`NodeList` of images and elements. That means you can pass an element that contains
image elements, directly image elements, or combination of both.

### [ options ] `Object`

Object with ImagesLoaded options.

### Options

Default options are stored in the `ImagesLoaded.defaults` object.

### timeout

Type: `Integer`
Default: `10000`

Maximum time in milliseconds in which images have to load, otherwise ImagesLoaded will consider them as broken, and will
terminate the determination process.

Timer starts on ImagesLoaded object creation, i.e. when you call

```js
var il = new ImagesLoaded(collection);
```

## Methods

### done

```js
il.done( fn );
```

Adds a callback to the `done` event. This callback will be executed only when all images finished with loading
successfully. If there is one or more broken images (or if any image loading will take longer than `options.timeout`),
this callback will not fire.

Callback receives `ImagesLoading` instance object as its `this` value.

### fail

```js
il.fail( fn );
```

Adds a callback to the `fail` event. This callback will be executed only if there is at least one or more broken images,
or if any image loading took longer than `options.timeout`.

Callback receives `ImagesLoading` instance object as its `this` value.

### always

```js
il.always( fn );
```

Adds a callback to the `always` event. This callback will be executed when all images has finished with loading,
regardless of their state (properly loaded, or broken).

Callback receives `ImagesLoading` instance object as its `this` value.

### progress

```js
il.progress( fn );
```

Adds a callback to the `progress` event. This callback will be executed for each image when it finished with loading.

Callback receives `ImagesLoading` instance object as its `this` value.

Callback arguments:

- **image** - Image element that just finished with loading.
- **isBroken** - Boolean flag specifying whether the images is broken.

Example:

```js
il.progress(function (image, isBroken) {
	image.style.borderColor = isBroken ? 'red' : 'green';
})
```

## Properties

ImagesLoaded instance exposes some useful properties.

Assuming:

```js
var il = new ImagesLoaded(collection);
// Access property
var foo = il.propertyname;
```

### images

Array with all images extracted from collection.

### loaded

Array with all currently loaded images, regardless of their state.

### pending

Array with all yet to be loaded (pending) images.

### proper

Array with all properly loaded images.

### broken

Array with all broken images.

### isPending

Boolean flag which is `true` when there are still some images to load.

### isDone

Boolean flag which is `true` when loading is done with all images successfully loaded.

### isFailed

Boolean flag which is `true` when loading is done with some broken images.

## Usage

Using callback binding methods.

```js
var imgLoading = ImagesLoaded(document);

imgLoading.done(function () {
	console.log('All images loaded successfully');
	console.log('Images: ', this.images);
});

imgLoading.fail(function () {
	console.error('One or more images have failed to load');
	console.log('Proper images: ', this.proper);
	console.log('Broken images: ', this.broken);
});

imgLoading.always(function () {
	if (this.isDone) {
		console.log('All images loaded successfully');
	}
	if (this.isFailed) {
		console.error('One or more images have failed to load');
	}
	console.log('Proper images: ', this.proper);
	console.log('Broken images: ', this.broken);
});

imgLoading.progress(function (img, isBroken) {
	console.log('This image has finished with loading:', img);
	console.log('The image is ' + (isBroken ? 'broken' : 'properly loaded'));
	// Current state of loading
	console.log('Pending images:', this.pending);
	console.log('Loaded images:', this.loaded);
	console.log('Proper: ', this.proper);
	console.log('Broken: ', this.broken);
});
```

All methods return ImagesLoaded object, so you can chain them:

```js
ImagesLoaded(document).done(fn).fail(fn).fail(fn);
```