# Draggable

Simple, lightweight pure JavaScript component that adds a draggable functionality.

## Usage:

1) Include the script:

~~~
<script type="text/javascript" src="draggable.js"></script>
~~~

2) Setup

~~~
makeDraggable(ctrl, options);
~~~

or if you have jQuery on the page you can use following

~~~
$(ctrl).makeDraggable(options);
~~~

That's all.

There are also some settings which you can pass to constructor

~~~
{
    handler: selector,
    ondrag: function
}
~~~

Have fun. Send PR if you find any glitches or want to make improvements.

:)
