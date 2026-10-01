/**
 * @file
 * Plugin: Time.
 *
 * This plugin adds logic for displaying current time and duration.
 *
 * Options:
 *   - $currentTime: string or Node. Default string.
 *   - $duration: string or Node. Default string.
 */

import Plugin from '../plugin';

class Time extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $currentTime: '.video__current-time',
    $duration: '.video__duration',
  };

  /**
   * Init.
   */
  init() {
    // Set current time.
    this.$currentTime = this.options.$currentTime;

    if (typeof this.$currentTime === 'string') {
      this.$currentTime = this.video.$el.querySelector(this.$currentTime);
    }

    if (this.$currentTime) {
      this.$currentTime.setAttribute('aria-live', 'off');
      this.on(
        this.video.$el,
        'loadedmetadata.video',
        this.handleLoadedMetadata.bind(this),
      );
    }

    // Set duration.
    this.$duration = this.options.$duration;

    if (typeof this.$duration === 'string') {
      this.$duration = this.video.$el.querySelector(this.$duration);
    }

    if (this.$duration) {
      this.on(
        this.video.$el,
        'timeupdate.video',
        this.handleTimeUpdate.bind(this),
      );
    }
  }

  /**
   * Handle loaded meta data.
   */
  handleLoadedMetadata() {
    const time = this.video.formatTime(this.video.$video.duration);
    this.$duration.textContent = time;
  }

  /**
   * Handle time update.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleTimeUpdate(e) {
    const time = this.video.formatTime(e.detail.currentTime);
    this.$currentTime.textContent = time;
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    if (this.$currentTime) {
      this.off(this.video.$el, 'loadedmetadata.video');
      this.$currentTime = null;
    }

    if (this.$duration) {
      this.off(this.video.$el, 'timeupdate.video');
      this.$duration = null;
    }
  }
}

export default Time;
