/**
 * @file
 * Plugin: Playpause.
 *
 * This plugin adds logic for a playpause handler.
 *
 * Options:
 *   - $handler: string or Node. Default string.
 *   - playClass: classname for the play state. Default 'is-playing'.
 */

import Plugin from '../plugin';

class PlayPause extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handler: '.video__playpause',
    playClass: 'is-playing',
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
    try {
      if (!this.$handler) {
        throw new DOMException('A handler element is required.');
      }
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(e);
    }

    // Set events.
    this.on(this.$handler, 'click', this.handleClick.bind(this));
    this.on(this.video.$el, 'play.video', this.handlePlay.bind(this));
    this.on(this.video.$el, 'pause.video', this.handlePause.bind(this));
  }

  /**
   * Handle click event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleClick(e) {
    const isPlaying = !this.video.$video.paused;

    if (isPlaying) {
      this.video.pause();
    } else {
      this.video.play();
    }

    if (this.options.playClass) {
      this.$handler.classList.toggle(this.options.playClass, !isPlaying);
    }

    e.preventDefault();
  }

  /**
   * Handle play event.
   */
  handlePlay() {
    if (this.options.playClass) {
      this.$handler.classList.add(this.options.playClass);
    }
  }

  /**
   * Handle pause event.
   */
  handlePause() {
    if (this.options.playClass) {
      this.$handler.classList.remove(this.options.playClass);
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

    this.$handler = null;
  }
}

export default PlayPause;
