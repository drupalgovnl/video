/**
 * @file
 * Plugin: Progress.
 *
 * This plugin adds logic for a progress bar.
 *
 * Options:
 *   - $el: string or Node. Default string.
 *   - $bar: string or Node. Default string.
 *   - $loaded: string or Node. Default string.
 */

import Plugin from '../plugin';

class Progress extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $el: '.video__progress',
    $bar: '.video__progress-bar',
    $loaded: '.video__progress-loaded',
  };

  /**
   * Init.
   */
  init() {
    // Set props.
    this.props = {
      pos: null,
      time: null,
      isPlaying: false,
    };

    // Set element.
    this.$el = this.options.$el;

    if (typeof this.$el === 'string') {
      this.$el = this.video.$el.querySelector(this.$el);
    }

    // Check if the element exists.
    try {
      if (!this.$el) {
        throw new DOMException('A progress element is required.');
      }
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(e);
    }

    // Set bar element.
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

    // Set loaded element.
    this.$loaded = this.options.$loaded;

    if (typeof this.$loaded === 'string') {
      this.$loaded = this.$el.querySelector(this.$loaded);
    }

    // Set default aria attributes.
    this.$el.setAttribute('aria-valuemin', 0);
    this.$el.setAttribute('aria-valuenow', this.video.$video.currentTime);
    this.$el.setAttribute(
      'aria-valuetext',
      this.video.formatTime(this.video.$video.currentTime),
    );

    // Set events.
    this.on(this.$el, 'touchstart', this.handleDragStart.bind(this));
    this.on(this.$el, 'mousedown', this.handleDragStart.bind(this));
    this.on(document, 'keydown', this.handleKeyDown.bind(this));
    this.on(
      this.video.$el,
      'loadedmetadata.video',
      this.handleLoadedMetadata.bind(this),
    );
    this.on(
      this.video.$el,
      'timeupdate.video',
      this.handleTimeUpdate.bind(this),
    );
    this.on(this.video.$el, 'progress.video', this.handleProgress.bind(this));
  }

  /**
   * Handle loaded meta data.
   */
  handleLoadedMetadata() {
    this.$el.setAttribute('aria-valuemax', this.video.$video.duration);
  }

  /**
   * Handle time update.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleTimeUpdate(e) {
    this.$el.setAttribute('aria-valuenow', e.detail.currentTime);
    this.$el.setAttribute(
      'aria-valuetext',
      this.video.formatTime(e.detail.currentTime),
    );
    this.$bar.style.transform = `scaleX(${
      e.detail.currentTime / this.video.$video.duration
    }`;
  }

  /**
   * Handle progress.
   */
  handleProgress() {
    const { buffered } = this.video.$video;

    if (
      this.$loaded &&
      buffered &&
      buffered.length > 0 &&
      buffered.end &&
      this.video.$video.duration
    ) {
      this.$loaded.style.transform = `scaleX(${
        buffered.end(buffered.length - 1) / this.video.$video.duration
      }`;
    }
  }

  /**
   * Handle key down event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleKeyDown(e) {
    if (!this.$el.contains(e.target) || !this.video.$video.duration || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) {
      return;
    }

    const isSeeking = !!this.props.time;
    this.props.time = isSeeking
      ? this.props.time
      : this.video.$video.currentTime;

    // Check left arrow key.
    if (e.key === 'ArrowLeft') {
      this.props.time = Math.max(0, this.props.time - 5);
    }

    // Check right arrow key.
    if (e.key === 'ArrowRight') {
      this.props.time = Math.min(
        this.props.time + 5,
        this.video.$video.duration,
      );
    }

    this.props.pos = this.props.time / this.video.$video.duration;
    this.$bar.style.transform = `scaleX(${this.props.pos})`;

    // Pause video when playing.
    if (!isSeeking) {
      this.props.isPlaying = !(
        this.video.$video.paused || this.video.$video.ended
      );

      if (this.props.isPlaying) {
        this.video.pause();
      }

      this.on(document, 'keyup', this.handleKeyUp.bind(this));
    }
  }

  /**
   * Handle key up event.
   */
  handleKeyUp() {
    // Check if new time is known.
    if (this.props.time) {
      this.video.$video.currentTime = this.props.time;
      this.props.time = null;
    }

    // Play video when playing.
    if (this.props.isPlaying) {
      this.video.play();
    }

    this.off(document, 'keyup');
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

    this.props.pos = x / rect.width;
    this.props.isPlaying = !(
      this.video.$video.paused || this.video.$video.ended
    );
    this.$bar.style.transform = `scaleX(${this.props.pos})`;

    // Pause video when playing.
    if (this.props.isPlaying) {
      this.video.pause();
    }

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

    this.props.pos = x / rect.width;
    this.$bar.style.transform = `scaleX(${this.props.pos})`;
  }

  /**
   * Handle drag end event.
   */
  handleDragEnd() {
    const { duration } = this.video.$video;

    // Check if duration is known.
    if (duration) {
      this.video.$video.currentTime = this.props.pos * duration;
    }

    this.$bar.style.transform = `scaleX(${this.props.pos})`;

    // Play video when playing.
    if (this.props.isPlaying) {
      this.video.play();
    }

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
    this.on(this.$el, 'touchstart');
    this.on(this.$el, 'mousedown');
    this.on(document, 'keydown');
    this.on(this.video.$el, 'loadedmetadata.video');
    this.on(this.video.$el, 'timeupdate.video');
    this.on(this.video.$el, 'progress.video');

    this.$el.removeAttribute('aria-valuemin');
    this.$el.removeAttribute('aria-valuenow');
    this.$el.removeAttribute('aria-valuetext');

    this.$el = null;
    this.$bar = null;

    if (this.$loaded) {
      this.$loaded = null;
    }
  }
}

export default Progress;
