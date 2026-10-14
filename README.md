# Draggable

Simple, lightweight pure JavaScript component that adds a draggable functionality.

## Demo

Open `demo.html` from this repo directly in your browser (no build step required) to see it in action.

## Installation

### As an npm module

~~~
npm install @jagermesh/js-draggable
~~~

~~~js
import Draggable from '@jagermesh/js-draggable';

const draggable = new Draggable(document.querySelector('.box'));
~~~

### As a plain `<script>` tag

~~~html
<script src="https://cdn.jsdelivr.net/npm/@jagermesh/js-draggable/dist/draggable.min.js"></script>
<script>
  const draggable = new window.Draggable(document.querySelector('.box'));
</script>
~~~

(or use your own copy of `dist/draggable.min.js`). Either way, the component is exposed as
`window.Draggable`.

## Usage

1) Create a `Draggable` instance:

~~~js
const draggable = new Draggable(document.querySelector('.box'));
~~~

The element is switched to `position: fixed` so it can be moved freely around the viewport.

2) Customize if needed:

~~~js
const draggable = new Draggable(document.querySelector('.box'), {
  handler: '.title-bar', // CSS selector (relative to the element) for the drag handle
  preserveSize: true, // Preserve viewport position and width when switching to fixed
  exclude: ['INPUT', 'TEXTAREA', 'SELECT', 'A', 'BUTTON'],
  ondrag: function() {}, // called on every drag move
});
~~~

3) Event listeners are cleaned up automatically when the element is removed from the document,
including removal of a parent container. Moving it within the document in the same DOM update
keeps dragging active. Hiding it with CSS does not destroy the instance.

You can also clean up explicitly when you no longer need it:

~~~js
draggable.destroy();
~~~

Calling `destroy()` more than once is safe. Once destroyed, create a new instance before
reusing the element. Instances created before insertion remain active until the element
has been connected and is subsequently removed. Explicitly destroy an instance if its
element will never be inserted. All instances share one removal observer, which disconnects
when the last instance is destroyed.

Available options:

- `handler` (string, default `null`) - CSS selector (relative to the element) for the element used
  to start dragging; when omitted, the whole element is draggable.
- `exclude` (array of tag names, default `['INPUT', 'TEXTAREA', 'SELECT', 'A', 'BUTTON']`) - clicks
  on these tags (or their parent) will not start a drag.
- `preserveSize` (boolean, default `false`) - preserve the element's viewport position and
  rendered width when switching to `position: fixed`; clear margins and minimum height.
  Useful for centered dialogs whose layout would otherwise change.
- `ondrag` (function) - called on every pointer move while dragging.

See `demo.html` for a runnable example.

If you also want resize handles on the same element, you can pair this with
[`@jagermesh/js-resizable`](https://cdn.jsdelivr.net/npm/@jagermesh/js-resizable/dist/resizable.min.js):

~~~html
<script src="https://cdn.jsdelivr.net/npm/@jagermesh/js-draggable/dist/draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@jagermesh/js-resizable/dist/resizable.min.js"></script>
<script>
  const box = document.querySelector('.box');
  new window.Draggable(box, { handler: '.title-bar' });
  new window.Resizable(box);
</script>
~~~
