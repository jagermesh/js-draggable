# Draggable

Simple, lightweight pure JavaScript component that adds a draggable functionality.

## Installation

### npm / bundler

~~~
npm install js-draggable
~~~

~~~js
import makeDraggable from 'js-draggable';

makeDraggable(document.getElementById('box'), options);
~~~

### Plain `<script>` tag

~~~html
<script src="https://unpkg.com/js-draggable/dist/draggable.min.js"></script>
<script>
  makeDraggable(document.getElementById('box'), options);
</script>
~~~

Loading the script this way sets up a global `makeDraggable(ctrl, options)` function, just like before.

See [demo.html](./demo.html) for a full working example with two draggable boxes (one plain, one with a drag `handler`) that you can open directly in a browser with no build step.

## Usage

~~~js
makeDraggable(ctrl, options);
~~~

or if you have jQuery on the page you can use following

~~~js
$(ctrl).makeDraggable(options);
~~~

That's all.

There are also some settings which you can pass as `options`

~~~js
{
    handler: selector, // CSS selector (relative to ctrl) for the element used to start dragging
    ondrag: function   // called on every drag move
}
~~~

Have fun. Send PR if you find any glitches or want to make improvements.

:)
