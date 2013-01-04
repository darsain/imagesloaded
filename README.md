# imagesLoaded

A small library that triggers a callback after all the selected/child images have been loaded. Because you can't do
`addEventListener` on cached and already loaded images.

This library has no dependencies.

If you are looking for a jQuery plugin, head over to: [desandro/imagesloaded](https://github.com/desandro/imagesloaded).

## Calling

```js
imagesLoaded( container, callback, [ progress ] );
```

### container

Can be null, or NodeList/Array of images/elements. That means that you can pass an element that contains images,
directly images, or combination of both.

### callback

Callback function is executed when all images has finished with loading, regardless of their final state (properly loaded, or broken).

**this** (callback function scope) is a `container` passed as a first argument.

Receives 3 arguments:

+ **images:** `Array` with all images in `container`.
+ **proper:** `Array` with properly loaded images.
+ **broken:** `Array` with broken images.

### progress

Progress function is executed for every image that finished with loading.

*this* (progress function scope) is an image node that has just finished with loading.

Receives 5 arguments:

+ **isBroken:** `Boolean` state of an image. It is true when image has failed to load.
+ **images:** `Array` with all images in `container`.
+ **loaded:** `Array` with all currently loaded images.
+ **proper:** `Array` with all currently loaded proper images.
+ **broken:** `Array` with all currently loaded broken images.

## *Example*

```js
var container = document.getElementById('container');

function callback(images, proper, broken) { }
function progress(isBroken, images, loaded, proper, broken) { }

imagesLoaded(container, callback, progress);
```
