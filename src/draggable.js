class Draggable {
  static #byElement = new WeakMap();

  static #instances = new Set();

  static #observer = null;

  #wasConnected = false;

  #destroyed = false;

  static #watch(instance) {
    instance.#wasConnected = instance.#ctrl.isConnected;
    Draggable.#instances.add(instance);
    if (!Draggable.#observer) {
      Draggable.#observer = new MutationObserver((records) => {
        for (const item of Draggable.#instances) {
          if (item.#ctrl.isConnected) {
            item.#wasConnected = true;
          } else if (item.#wasConnected || records.some((record) =>
            Array.from(record.removedNodes).some((node) => node.contains(item.#ctrl)))) {
            item.destroy();
          }
        }
      });
      Draggable.#observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  #dragObject = null;

  #startX;

  #startY;

  #startLeft;

  #startTop;

  #ctrl;

  #dragHandler;

  #options;

  constructor(ctrl, options) {
    const existing = Draggable.#byElement.get(ctrl);
    if (existing) {
      return existing;
    }
    this.#ctrl = ctrl;

    this.#options = Object.assign({
      exclude: [
        'INPUT',
        'TEXTAREA',
        'SELECT',
        'A',
        'BUTTON',
      ],
      handler: null,
      // Legacy: position:fixed + top/left. Default is transform so existing
      // layout (e.g. Bootstrap modal centered/scrollable) stays intact.
      useFixedPosition: false,
      preserveSize: false,
      ondrag: null,
    }, options);
    // Older callers passed preserveSize alone; it only applies in fixed mode.
    if (this.#options.preserveSize) {
      this.#options.useFixedPosition = true;
    }

    if (this.#options.handler) {
      this.#dragHandler = ctrl.querySelector(this.#options.handler);
    } else {
      this.#dragHandler = ctrl;
    }

    if (this.#dragHandler) {
      this.#dragHandler.style.cursor = 'move';
      this.#dragHandler.style.zIndex = 1;

      this.#prepareControl(ctrl);

      this.#dragHandler.addEventListener('mousedown', this.#onPointerDown);
      this.#dragHandler.addEventListener('touchstart', this.#onTouchStart, {
        passive: false,
      });

      window.addEventListener('mousemove', this.#onPointerMove);
      window.addEventListener('mouseup', this.#onPointerUp);
      window.addEventListener('touchmove', this.#onPointerMove, {
        passive: false,
      });
      window.addEventListener('touchend', this.#onPointerUp);
      Draggable.#byElement.set(ctrl, this);
      Draggable.#watch(this);
    }
  }

  destroy() {
    if (this.#destroyed) {
      return;
    }
    this.#destroyed = true;
    if (Draggable.#byElement.get(this.#ctrl) === this) {
      Draggable.#byElement.delete(this.#ctrl);
    }
    Draggable.#instances.delete(this);
    if (!Draggable.#instances.size && Draggable.#observer) {
      Draggable.#observer.disconnect();
      Draggable.#observer = null;
    }
    this.#upHandler();

    if (this.#dragHandler) {
      this.#dragHandler.removeEventListener('mousedown', this.#onPointerDown);
      this.#dragHandler.removeEventListener('touchstart', this.#onTouchStart);
    }

    window.removeEventListener('mousemove', this.#onPointerMove);
    window.removeEventListener('mouseup', this.#onPointerUp);
    window.removeEventListener('touchmove', this.#onPointerMove);
    window.removeEventListener('touchend', this.#onPointerUp);
  }

  #position(element) {
    let top = 0;
    let left = 0;

    do {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);

    return {
      top,
      left,
    };
  }

  #readTranslate(element) {
    const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
    return {
      x: matrix.m41,
      y: matrix.m42,
    };
  }

  #prepareControl(element) {
    // Avoid fighting CSS transitions (e.g. Bootstrap modal fade transform).
    element.style.transition = 'none';

    if (!this.#options.useFixedPosition) {
      return;
    }

    let position = this.#position(element);
    if (this.#options.preserveSize) {
      const rect = element.getBoundingClientRect();
      position = {
        left: rect.left,
        top: rect.top,
      };
      element.style.width = `${rect.width}px`;
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.margin = '0px';
      element.style.minHeight = '0px';
    }

    element.style.position = 'fixed';
    element.style.left = `${position.left}px`;
    element.style.top = `${position.top}px`;
    element.style.marginTop = '0px';
    element.style.marginLeft = '0px';
  }

  #setPosition(element, left, top) {
    if (this.#options.useFixedPosition) {
      element.style.marginTop = '0px';
      element.style.marginLeft = '0px';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.right = '';
      element.style.bottom = '';
      return;
    }
    element.style.transform = `translate(${left}px, ${top}px)`;
  }

  #clampTransform(left, top) {
    // Clamp by the handle so a full-height shell (Bootstrap centered modal)
    // can still move until the grab point hits the viewport edge.
    this.#setPosition(this.#ctrl, left, top);
    const box = (this.#dragHandler || this.#ctrl).getBoundingClientRect();
    if (box.top < 0) {
      top -= box.top;
    }
    if (box.left < 0) {
      left -= box.left;
    }
    if (box.top > window.innerHeight - 40) {
      top -= box.top - (window.innerHeight - 40);
    }
    return { left, top };
  }

  #eventPoint(e) {
    if (e.touches && e.touches.length) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }

  #onPointerDown = (event) => {
    this.#downHandler(event);
  };

  #onTouchStart = (event) => {
    this.#downHandler(event, true);
  };

  #onPointerMove = (event) => {
    this.#moveHandler(event);
  };

  #onPointerUp = () => {
    this.#upHandler();
  };

  #moveHandler(e) {
    if (this.#dragObject === null) {
      return;
    }

    const point = this.#eventPoint(e);
    let left = this.#startLeft + (point.x - this.#startX);
    let top = this.#startTop + (point.y - this.#startY);

    if (this.#options.useFixedPosition) {
      if (top < 0) {
        top = 0;
      }
      if (top > window.innerHeight) {
        top = window.innerHeight - 40;
      }
      if (left < 0) {
        left = 0;
      }
    } else {
      const clamped = this.#clampTransform(left, top);
      left = clamped.left;
      top = clamped.top;
    }

    this.#setPosition(this.#dragObject, left, top);

    if (typeof this.#options.ondrag === 'function') {
      this.#options.ondrag.call(e);
    }
  }

  #upHandler() {
    this.#dragObject = null;
  }

  #downHandler(e, touchEvent) {
    if ((e.button !== 0) && !touchEvent) {
      return;
    }

    const target = e.target || e.srcElement;
    const parent = target.parentNode;

    if (!target || (this.#options.exclude.indexOf(target.tagName.toUpperCase()) !== -1)) {
      return;
    }

    if (parent && (this.#options.exclude.indexOf(parent.tagName.toUpperCase()) !== -1)) {
      return;
    }

    this.#dragObject = this.#ctrl;

    const point = this.#eventPoint(e);
    this.#startX = point.x;
    this.#startY = point.y;

    if (this.#options.useFixedPosition) {
      const rect = this.#dragObject.getBoundingClientRect();
      this.#startLeft = rect.left;
      this.#startTop = rect.top;
    } else {
      const translate = this.#readTranslate(this.#dragObject);
      this.#startLeft = translate.x;
      this.#startTop = translate.y;
    }

    e.preventDefault();
  }
}

export default Draggable;
