/**
 * @file
 * Setup a event helper.
 */
const EventHelper = {
  _events: [],

  /**
   * Add an event to an element.
   *
   * @param {HTMLElement} $el
   *   A HTMLElement to attach the event to it.
   * @param {string} type
   *   Name of the event type.
   * @param {Function} callback
   *   The event handler.
   */
  on($el, type, callback) {
    const event = this._events.find((e) => {
      return e.$el === $el && e.type === type && e.callback === callback;
    });

    // If the event already exists, remove it first.
    if (event) {
      this.off($el, type, callback);
    }

    // Add the event to the storage.
    this._events.push({
      $el,
      type,
      callback,
    });

    // Attach an event listener to the element.
    $el.addEventListener(type, callback);
  },

  /**
   * Remove an event from a element.
   *
   * @param {HTMLElement} $el
   *   A HTMLElement to remove the event from it.
   * @param {string} type
   *   Name of the event type.
   * @param {Function} [callback]
   *   The event handler.
   */
  off($el, type, callback = null) {
    const events = this._events.filter((e) => {
      if (e.$el === $el && e.type === type) {
        // If handler is known, check for it.
        if (callback) {
          return e.callback === callback;
        }

        return true;
      }

      return false;
    });

    events.forEach((e) => {
      const index = this._events.indexOf(e);

      // Remove the event listener from the element and remove it from the
      // storage.
      $el.removeEventListener(type, e.callback);
      this._events.splice(index, 1);
    });
  },
};

export default EventHelper;
