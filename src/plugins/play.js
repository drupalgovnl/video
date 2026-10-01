/**
 * @file
 * Plugin: Play.
 *
 * This plugin adds logic for a play handler.
 *
 * Options:
 *   - $handler: string or Node. Default string.
 *   - showClass: classname to show the handler. Default null.
 */

import Plugin from '../plugin';

class Play extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handler: '.video__play',
    showClass: 'is-shown',
  };

  /**
   * Init.
   */
  init() {
    // Set handler.
    this.$handler = this.options.$handler;

    if (typeof this.$handler === 'string') {
      this.$handler = this.video.$el.querySelector(this.$handler);
    }

    // Check if the handler element exists.
    if (!this.$handler) {
      return;
    }

    this.show();

    // Set events.
    this.on(this.$handler, 'click', this.handleClick.bind(this));
    this.on(this.video.$el, 'play.video', this.handlePlay.bind(this));
    this.on(this.video.$el, 'pause.video', this.handlePause.bind(this));
    this.on(this.video.$el, 'waiting.video', this.handleWaiting.bind(this));
  }

  /**
   * Handle click event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleClick(e) {
    if (this.video.$video.paused || this.video.$video.ended) {
      this.video.play();
    }

    // Focus on videoplayer, playbutton is now hidden.
    this.video.$video.focus({ preventScroll: true });

    e.preventDefault();
  }

  /**
   * Handle play event.
   */
  handlePlay() {
    this.hide();
  }

  /**
   * Handle pause event.
   */
  handlePause() {
    this.show();
  }

  /**
   * Handle waiting event.
   */
  handleWaiting() {
    this.hide();
  }

  /**
   * Hide the $handler.
   */
  hide() {
    // Set class.
    if (this.options.showClass) {
      this.$handler.classList.remove(this.options.showClass);
    }
  }

  /**
   * Show the $handler.
   */
  show() {
    // Set class.
    if (this.options.showClass) {
      this.$handler.classList.add(this.options.showClass);
    }
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove events.
    this.off(this.$handler, 'click');
    this.off(this.video.$el, 'play.video');
    this.off(this.video.$el, 'pause.video');
    this.off(this.video.$el, 'waiting.video');

    this.$handler = null;
  }
}

export default Play;
