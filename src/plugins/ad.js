/**
 * @file
 * Plugin: Audio description.
 *
 * This plugin adds logic for a audio description handler. The source of the
 * audio description is set via a 'data-video-ad' attribute on the video
 * element.
 *
 * Options:
 *   - $handler: string or Node. Default string.
 *   - activeClass: classname for the active state. Default 'is-active'.
 */

import Plugin from '../plugin';

class Ad extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handler: '.video__play',
    showClass: null,
  };

  /**
   * Init.
   */
  init() {
    const src = this.video.$video.dataset.videoAd;

    // Check if an audio description file is set.
    if (!src) {
      return;
    }

    // Set props.
    this.props = {
      state: false,
    };

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

    // Setup audio element.
    this.$audio = document.createElement('audio');
    this.$audio.setAttribute('preload', 'auto');
    this.$audio.setAttribute('src', src);
    this.$audio.style.display = 'none';

    this.video.$video.insertAdjacentElement('afterend', this.$audio);

    // Set events.
    this.on(this.$handler, 'click', this.handleClick.bind(this));
    this.on(this.video.$el, 'play.video', this.handlePlay.bind(this));
    this.on(this.video.$el, 'pause.video', this.handlePause.bind(this));
    this.on(
      this.video.$el,
      'volumechange.video',
      this.handleVolumeChange.bind(this),
    );
  }

  /**
   * Handle click event.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleClick(e) {
    this.toggle();
    e.preventDefault();
  }

  /**
   * Handle play.
   */
  handlePlay() {
    if (this.$audio && this.props.state) {
      this.$audio.currentTime = this.video.$video.currentTime;
      this.$audio.play();
    }
  }

  /**
   * Handle pause.
   */
  handlePause() {
    if (this.$audio && this.props.state) {
      this.$audio.pause();
    }
  }

  /**
   * Handle volume change.
   *
   * @param {Event} e
   *   The triggered event.
   */
  handleVolumeChange(e) {
    if (this.$audio && this.props.state) {
      this.$audio.volume = e.detail.volume;
      this.$audio.muted = e.detail.muted;
    }
  }

  /**
   * Toggle audio description.
   */
  toggle() {
    if (!this.props.state) {
      this.$audio.currentTime = this.video.$video.currentTime;

      // If the video is playing, set audio.
      if (!this.video.$video.paused) {
        this.$audio.volume = this.video.getVolume();
        this.$audio.muted = this.video.$video.muted;
        this.$audio.play();
      }

      // Set class when available.
      if (this.options.activeClass) {
        this.$handler.classList.add(this.options.activeClass);
      }

      // Trigger event.
      this.video.dispatchEvent('ad', {
        state: 'on',
      });
    } else {
      this.$audio.pause();

      // Remove class when available.
      if (this.options.activeClass) {
        this.$handler.classList.remove(this.options.activeClass);
      }

      // Trigger event.
      this.video.dispatchEvent('ad', {
        state: 'off',
      });
    }

    // Save new state.
    this.props.state = !this.props.state;
  }

  /**
   * Destroy the Plugin.
   */
  destroy() {
    // Remove events.
    this.off(this.$handler, 'click');
    this.off(this.video.$el, 'play.video');
    this.off(this.video.$el, 'pause.video');
    this.off(this.video.$el, 'volumechange.video');

    this.$handler = null;
  }
}

export default Ad;
