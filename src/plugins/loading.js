/**
 * @file
 * Plugin: Loading.
 *
 * This plugin adds logic for a loading indicator.
 *
 * Options:
 *   - $el: string or Node. Default string.
 *   - showClass: classname for the show state. Default null.
 */

import Plugin from '../plugin';

class Loading extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $el: '.video__loading',
    showClass: 'is-shown',
  };

  /**
   * Init.
   */
  init() {
    // Set element.
    this.$el = this.options.$el;

    if (typeof this.$el === 'string') {
      this.$el = this.video.$el.querySelector(this.$el);
    }

    // Check if the element exists.
    if (!this.$el) {
      return;
    }

    this.hide();

    // Set events.
    this.on(this.video.$el, 'seeking.video', this.handleSeeking.bind(this));
    this.on(this.video.$el, 'seeked.video', this.handleSeeked.bind(this));
    this.on(this.video.$el, 'waiting.video', this.handleWaiting.bind(this));
    this.on(this.video.$el, 'play.video', this.handlePlay.bind(this));
    this.on(this.video.$el, 'pause.video', this.handlePause.bind(this));
  }

  /**
   * Handle seeking.
   */
  handleSeeking() {
    if (!this.video.$video.ended) {
      this.show();
    }
  }

  /**
   * Handle seeked.
   */
  handleSeeked() {
    this.hide();
  }

  /**
   * Handle waiting.
   */
  handleWaiting() {
    if (!this.video.$video.ended) {
      this.show();
    }
  }

  /**
   * Handle play.
   */
  handlePlay() {
    this.hide();
  }

  /**
   * Handle pause.
   */
  handlePause() {
    this.hide();
  }

  /**
   * Hide the $handler.
   */
  hide() {
    // Set class.
    if (this.options.showClass) {
      this.$el.classList.remove(this.options.showClass);
    }
  }

  /**
   * Show the $handler.
   */
  show() {
    // Set class.
    if (this.options.showClass) {
      this.$el.classList.add(this.options.showClass);
    }
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove events.
    this.off(this.video.$el, 'seeking.video');
    this.off(this.video.$el, 'seeked.video');
    this.off(this.video.$el, 'waiting.video');
    this.off(this.video.$el, 'play.video');
    this.off(this.video.$el, 'pause.video');

    this.$el = null;
  }
}

export default Loading;
