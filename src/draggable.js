(function(window, $) {

  class Draggable {
    constructor(ctrl, options) {
      this.dragObject = null;
      this.dragHandler = null;
      this.pos_y;
      this.pos_x;
      this.ofs_x;
      this.ofs_y;
      this.ctrl = ctrl;

      this.options = Object.assign({
        exclude: [
          'INPUT',
          'TEXTAREA',
          'SELECT',
          'A',
          'BUTTON'
        ]
      }, options);

      if (this.options.handler) {
        this.dragHandler = ctrl.querySelector(this.options.handler);
      } else {
        this.dragHandler = ctrl;
      }

      if (this.dragHandler) {
        this.dragHandler.style.cursor = 'move';
        ctrl.style.position = 'fixed';

        this.dragHandler.addEventListener('mousedown', (event) => {
          this.downHandler(event);
        });

        window.addEventListener('mousemove', (event) => {
          this.moveHandler(event);
        });

        window.addEventListener('mouseup', () => {
          this.upHandler();
        });

        this.dragHandler.addEventListener('touchstart', (event) => {
          this.downHandler(event);
        });

        window.addEventListener('touchmove', (event) => {
          this.moveHandler(event);
        });

        window.addEventListener('touchend', () => {
          this.upHandler();
        });
      }
    }

    setPosition(element, left, top) {
      element.style.marginTop = '0px';
      element.style.marginLeft = '0px';
      element.style.left = left + 'px';
      element.style.top = top + 'px';
      element.style.right = '';
      element.style.bottom = '';
    }

    moveHandler(e) {
      if (this.dragObject !== null) {
        let pageX = e.pageX ?? e.touches[0].pageX;
        let pageY = e.pageY ?? e.touches[0].pageY;
        let left = pageX - this.pos_x - this.ofs_x - document.body.scrollLeft;
        let top = pageY - this.pos_y - this.ofs_y - document.body.scrollTop;
        if (top < 0) {
          top = 0;
        }
        if (top > window.innerHeight) {
          top = window.innerHeight - 40;
        }
        if (left < 0) {
          left = 0;
        }

        this.setPosition(this.dragObject, left, top);
        if (this.options.ondrag) {
          this.options.ondrag.call(e);
        }
      }
    }

    upHandler() {
      if (this.dragObject !== null) {
        this.dragObject = null;
      }
    }

    downHandler(e) {
      if (e.button === 0) {
        let target = e.target || e.srcElement;
        let parent = target.parentNode;

        if (target && (this.options.exclude.indexOf(target.tagName.toUpperCase()) == -1)) {
          if (!parent || (this.options.exclude.indexOf(parent.tagName.toUpperCase()) == -1)) { // img in a
            this.dragObject = this.ctrl;

            let pageX = e.pageX || e.touches[0].pageX;
            let pageY = e.pageY || e.touches[0].pageY;

            this.ofs_x = this.dragObject.getBoundingClientRect().left - this.dragObject.offsetLeft;
            this.ofs_y = this.dragObject.getBoundingClientRect().top - this.dragObject.offsetTop;

            this.pos_x = pageX - (this.dragObject.getBoundingClientRect().left + document.body.scrollLeft);
            this.pos_y = pageY - (this.dragObject.getBoundingClientRect().top + document.body.scrollTop);

            e.preventDefault();
          }
        }
      }
    }
  }

  function makeDraggable(ctrl, options) {
    if (!ctrl.__draggable) {
      ctrl.__draggable = new Draggable(this, options);
    }
    return ctrl.__draggable;
  }

  if ($) {
    $.fn.makeDraggable = function(options) {
      this.each(function() {
        new Draggable(this, options);
      });
      return this;
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = makeDraggable; else window.makeDraggable = makeDraggable;

})(window, jQuery);
