/**
 * @file
 * Plugin: Mute.
 *
 * This plugin adds logic for a mute handler.
 *
 * Options:
 *   - $handler: string or Node. Default string.
 *   - muteClass: classname for the mute state. Default 'is-muted'.
 */

import Plugin from '../plugin';

class Mute extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handler: '.video__mute',
    muteClass: 'is-muted',
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

    // Set event.
    this.on(this.$handler, 'click', this.handleClick.bind(this));
  }

  /**
   * Handle click event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleClick(e) {
    this.video.mute();

    // Set class if exists.
    if (this.options.muteClass) {
      this.$handler.classList.toggle(
        this.options.muteClass,
        this.video.$video.muted,
      );
    }

    e.preventDefault();
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove event.
    this.off(this.$handler, 'click');

    this.$handler = null;
  }
}

export default Mute;
