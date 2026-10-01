/**
 * @file
 * Plugin: Volume.
 *
 * This plugin adds logic for a volume handler.
 *
 * Options:
 *   - $el: string or Node. Default string.
 *   - $bar: string or Node. Default string.
 */

import Plugin from '../plugin';

class Volume extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $el: '.video__volume',
    $bar: '.video__volume-bar',
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
    try {
      if (!this.$el) {
        throw new DOMException('A element is required.');
      }
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(e);
    }

    // Set bar.
    this.$bar = this.options.$bar;

    if (typeof this.$bar === 'string') {
      this.$bar = this.$el.querySelector(this.$bar);
    }

    // Check if the bar element exists.
    try {
      if (!this.$bar) {
        throw new DOMException('A bar element is required.');
      }
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(e);
    }

    // Set default.
    const isMuted = this.video.$video.muted;
    const volume = this.video.getVolume();
    const pos = isMuted ? 0 : volume;

    this.$el.setAttribute('aria-valuemin', 0);
    this.$el.setAttribute('aria-valuemax', 100);
    this.$el.setAttribute('aria-valuenow', volume * 100);
    this.$el.setAttribute('aria-valuetext', `${volume * 100}%`);
    this.$bar.style.transform = `scaleX(${pos})`;

    // Set events.
    this.on(this.$el, 'touchstart', this.handleDragStart.bind(this));
    this.on(this.$el, 'mousedown', this.handleDragStart.bind(this));
    this.on(document, 'keydown', this.handleKeyDown.bind(this));
    this.on(
      this.video.$el,
      'volumechange.video',
      this.handleVolumeChange.bind(this),
    );
  }

  /**
   * Handle volume change.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleVolumeChange(e) {
    this.$el.setAttribute('aria-valuenow', e.detail.volume * 100);
    this.$el.setAttribute('aria-valuetext', `${e.detail.volume * 100}%`);
    this.$bar.style.transform = `scaleX(${
      e.detail.muted ? 0 : e.detail.volume
    })`;
  }

  /**
   * Handle key down event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleKeyDown(e) {
    if (!this.$el.contains(e.target)) {
      return;
    }

    let volume = this.video.getVolume();

    // Check left arrow key.
    if (e.key === 'ArrowLeft') {
      volume = Math.max(0, volume - 0.1);
    }

    // Check right arrow key.
    if (e.key === 'ArrowRight') {
      volume = Math.min(volume + 0.1, 1);
    }

    this.video.setVolume(volume);
  }

  /**
   * Handle drag start event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleDragStart(e) {
    const touches = e.touches ? e.touches[0] : e;
    const rect = this.$el.getBoundingClientRect();
    const x = touches.clientX - rect.left;

    this.video.setVolume(x / rect.width);
    this.video.mute(false);

    this.on(document, 'touchmove', this.handleDragMove.bind(this));
    this.on(document, 'touchend', this.handleDragEnd.bind(this));
    this.on(document, 'mousemove', this.handleDragMove.bind(this));
    this.on(document, 'mouseup', this.handleDragEnd.bind(this));

    e.preventDefault();
  }

  /**
   * Handle drag move event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleDragMove(e) {
    const touches = e.touches ? e.touches[0] : e;
    const rect = this.$el.getBoundingClientRect();
    let x = touches.clientX - rect.left;

    // Check if position is out of boundaries.
    if (x < 0) {
      x = 0;
    }

    if (x > rect.width) {
      x = rect.width;
    }

    this.video.setVolume(x / rect.width);
    this.video.mute(false);
  }

  /**
   * Handle drag end event.
   */
  handleDragEnd() {
    this.off(document, 'touchmove');
    this.off(document, 'touchend');
    this.off(document, 'mousemove');
    this.off(document, 'mouseup');
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove events.
    this.off(this.$el, 'touchstart');
    this.off(this.$el, 'mousedown');
    this.off(document, 'keydown');
    this.off(this.video.$el, 'volumechange.video');

    this.$el.removeAttribute('aria-valuemin');
    this.$el.removeAttribute('aria-valuemax');
    this.$el.removeAttribute('aria-valuenow');
    this.$el.removeAttribute('aria-valuetext');

    this.$el = null;
    this.$bar = null;
  }
}

export default Volume;
