/**
 * @file
 * Plugin: Fullscreen.
 *
 * This plugin adds logic for a full screen handler.
 *
 * Options:
 *   - $handler: string or Node. Default string.
 *   - fullscreenClass: classname for the fullscreen. Default is
 *     'is-fullscreen'.
 *   - activeClass: classname for the active state. Default 'is-fullscreen'.
 */

import Plugin from '../plugin';

class Fullscreen extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handler: '.video__fullscreen',
    fullscreenClass: 'is-fullscreen',
    activeClass: 'is-fullscreen',
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
    this.on(
      this.video.$el,
      'fullscreenchange',
      this.handleFullscreenChange.bind(this),
    );
    this.on(
      this.video.$el,
      'webkitfullscreenchange',
      this.handleFullscreenChange.bind(this),
    );
    this.on(
      this.video.$el,
      'msfullscreenchange',
      this.handleFullscreenChange.bind(this),
    );
  }

  /**
   * Check if fullscreen.
   *
   * @return {boolean}
   *   In fullscreen mode or not.
   */
  isFullscreen() {
    return !!(
      document.fullScreen ||
      document.mozFullScreen ||
      document.webkitIsFullScreen ||
      document.msFullscreenElement
    );
  }

  /**
   * Handle click event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleClick(e) {
    this.toggleFullscreen();
    e.preventDefault();
  }

  /**
   * Handle fullscreenchange event.
   */
  handleFullscreenChange() {
    const state = this.isFullscreen();

    // Add fullscreen class.
    if (state) {
      this.video.$el.classList.add(this.options.fullscreenClass);
    } else {
      this.video.$el.classList.remove(this.options.fullscreenClass);
    }
  }

  /**
   * Toggle fullscreen mode.
   */
  toggleFullscreen() {
    const state = this.isFullscreen();

    if (!state) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  /**
   * Enter fullscreen mode.
   */
  enterFullscreen() {
    if (this.video.$el.requestFullscreen) {
      this.video.$el.requestFullscreen();
    } else if (this.video.$el.webkitRequestFullScreen) {
      this.video.$el.webkitRequestFullScreen();
    } else if (this.video.$el.msRequestFullscreen) {
      this.video.$el.msRequestFullscreen();
    }

    // Set class when available.
    if (this.options.activeClass) {
      this.$handler.classList.add(this.options.activeClass);
    }

    // Trigger event.
    this.video.dispatchEvent('fullscreen', {
      fullscreen: true,
    });
  }

  /**
   * Exit fullscreen mode.
   */
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    // Remove class when available.
    if (this.options.activeClass) {
      this.$handler.classList.remove(this.options.activeClass);
    }

    // Trigger event.
    this.video.dispatchEvent('fullscreen', {
      fullscreen: false,
    });
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove events.
    this.off(this.$handler, 'click');
    this.off(this.video.$el, 'fullscreenchange');
    this.off(this.video.$el, 'webkitfullscreenchange');
    this.off(this.video.$el, 'msfullscreenchange');

    this.$handler = null;
  }
}

export default Fullscreen;
