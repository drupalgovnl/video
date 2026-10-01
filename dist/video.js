(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Video = factory());
})(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

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
      const event = this._events.find(e => {
        return e.$el === $el && e.type === type && e.callback === callback;
      }); // If the event already exists, remove it first.


      if (event) {
        this.off($el, type, callback);
      } // Add the event to the storage.


      this._events.push({
        $el,
        type,
        callback
      }); // Attach an event listener to the element.


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
    off($el, type) {
      let callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      const events = this._events.filter(e => {
        if (e.$el === $el && e.type === type) {
          // If handler is known, check for it.
          if (callback) {
            return e.callback === callback;
          }

          return true;
        }

        return false;
      });

      events.forEach(e => {
        const index = this._events.indexOf(e); // Remove the event listener from the element and remove it from the
        // storage.


        $el.removeEventListener(type, e.callback);

        this._events.splice(index, 1);
      });
    }

  };

  class Plugin {
    /**
     * Default options.
     */

    /**
     * Constructs a Video Plugin.
     *
     * @param {Video} video
     *   The Video instance.
     * @param {Array} [options]
     *   Different options.
     */
    constructor(video, options) {
      // Set Video instance.
      this.video = video; // Set options.

      this.options = { ...this.constructor.defaultOptions,
        ...options
      };
    }
    /**
     * Deconstructs the Plugin.
     */


    deconstructor() {
      this.video = null;
      this._events = null;
    }

  } // Add an EventHelper mixin to the class.


  _defineProperty(Plugin, "defaultOptions", {});

  Object.assign(Plugin.prototype, EventHelper);

  class Ad extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      const src = this.video.$video.dataset.videoAd; // Check if an audio description file is set.

      if (!src) {
        return;
      } // Set props.


      this.props = {
        state: false
      }; // Set handler.

      this.$handler = this.options.$handler;

      if (typeof this.$handler === 'string') {
        this.$handler = this.video.$el.querySelector(this.$handler);
      } // Check if the handler element exists.


      try {
        if (!this.$handler) {
          throw new DOMException('A handler element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Setup audio element.


      this.$audio = document.createElement('audio');
      this.$audio.setAttribute('preload', 'auto');
      this.$audio.setAttribute('src', src);
      this.$audio.style.display = 'none';
      this.video.$video.insertAdjacentElement('afterend', this.$audio); // Set events.

      this.on(this.$handler, 'click', this.handleClick.bind(this));
      this.on(this.video.$el, 'play.video', this.handlePlay.bind(this));
      this.on(this.video.$el, 'pause.video', this.handlePause.bind(this));
      this.on(this.video.$el, 'volumechange.video', this.handleVolumeChange.bind(this));
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
        this.$audio.currentTime = this.video.$video.currentTime; // If the video is playing, set audio.

        if (!this.video.$video.paused) {
          this.$audio.volume = this.video.getVolume();
          this.$audio.muted = this.video.$video.muted;
          this.$audio.play();
        } // Set class when available.


        if (this.options.activeClass) {
          this.$handler.classList.add(this.options.activeClass);
        } // Trigger event.


        this.video.dispatchEvent('ad', {
          state: 'on'
        });
      } else {
        this.$audio.pause(); // Remove class when available.

        if (this.options.activeClass) {
          this.$handler.classList.remove(this.options.activeClass);
        } // Trigger event.


        this.video.dispatchEvent('ad', {
          state: 'off'
        });
      } // Save new state.


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

  _defineProperty(Ad, "defaultOptions", {
    $handler: '.video__play',
    showClass: null
  });

  class Fullscreen extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set handler.
      this.$handler = this.options.$handler;

      if (typeof this.$handler === 'string') {
        this.$handler = this.video.$el.querySelector(this.$handler);
      } // Check if the handler element exists.


      try {
        if (!this.$handler) {
          throw new DOMException('A handler element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set events.


      this.on(this.$handler, 'click', this.handleClick.bind(this));
      this.on(this.video.$el, 'fullscreenchange', this.handleFullscreenChange.bind(this));
      this.on(this.video.$el, 'webkitfullscreenchange', this.handleFullscreenChange.bind(this));
      this.on(this.video.$el, 'msfullscreenchange', this.handleFullscreenChange.bind(this));
    }
    /**
     * Check if fullscreen.
     *
     * @return {boolean}
     *   In fullscreen mode or not.
     */


    isFullscreen() {
      return !!(document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement);
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
      const state = this.isFullscreen(); // Add fullscreen class.

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
      } // Set class when available.


      if (this.options.activeClass) {
        this.$handler.classList.add(this.options.activeClass);
      } // Trigger event.


      this.video.dispatchEvent('fullscreen', {
        fullscreen: true
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
      } // Remove class when available.


      if (this.options.activeClass) {
        this.$handler.classList.remove(this.options.activeClass);
      } // Trigger event.


      this.video.dispatchEvent('fullscreen', {
        fullscreen: false
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

  _defineProperty(Fullscreen, "defaultOptions", {
    $handler: '.video__fullscreen',
    fullscreenClass: 'is-fullscreen',
    activeClass: 'is-fullscreen'
  });

  class Loading extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set element.
      this.$el = this.options.$el;

      if (typeof this.$el === 'string') {
        this.$el = this.video.$el.querySelector(this.$el);
      } // Check if the element exists.


      if (!this.$el) {
        return;
      }

      this.hide(); // Set events.

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

  _defineProperty(Loading, "defaultOptions", {
    $el: '.video__loading',
    showClass: 'is-shown'
  });

  class Mute extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set handler.
      this.$handler = this.options.$handler;

      if (typeof this.$handler === 'string') {
        this.$handler = this.video.$el.querySelector(this.$handler);
      } // Check if the handler element exists.


      try {
        if (!this.$handler) {
          throw new DOMException('A handler element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set event.


      this.on(this.$handler, 'click', this.handleClick.bind(this));
    }
    /**
     * Handle click event.
     *
     * @param {Event} e
     *   The triggered event.
     */


    handleClick(e) {
      this.video.mute(); // Set class if exists.

      if (this.options.muteClass) {
        this.$handler.classList.toggle(this.options.muteClass, this.video.$video.muted);
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

  _defineProperty(Mute, "defaultOptions", {
    $handler: '.video__mute',
    muteClass: 'is-muted'
  });

  class Play extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set handler.
      this.$handler = this.options.$handler;

      if (typeof this.$handler === 'string') {
        this.$handler = this.video.$el.querySelector(this.$handler);
      } // Check if the handler element exists.


      if (!this.$handler) {
        return;
      }

      this.show(); // Set events.

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
      } // Focus on videoplayer, playbutton is now hidden.


      this.video.$video.focus({
        preventScroll: true
      });
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

  _defineProperty(Play, "defaultOptions", {
    $handler: '.video__play',
    showClass: 'is-shown'
  });

  class PlayPause extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set handler.
      this.$handler = this.options.$handler;

      if (typeof this.$handler === 'string') {
        this.$handler = this.video.$el.querySelector(this.$handler);
      } // Check if the handler element exists.


      try {
        if (!this.$handler) {
          throw new DOMException('A handler element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set events.


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

  _defineProperty(PlayPause, "defaultOptions", {
    $handler: '.video__playpause',
    playClass: 'is-playing'
  });

  class Progress extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set props.
      this.props = {
        pos: null,
        time: null,
        isPlaying: false
      }; // Set element.

      this.$el = this.options.$el;

      if (typeof this.$el === 'string') {
        this.$el = this.video.$el.querySelector(this.$el);
      } // Check if the element exists.


      try {
        if (!this.$el) {
          throw new DOMException('A progress element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set bar element.


      this.$bar = this.options.$bar;

      if (typeof this.$bar === 'string') {
        this.$bar = this.$el.querySelector(this.$bar);
      } // Check if the bar element exists.


      try {
        if (!this.$bar) {
          throw new DOMException('A bar element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set loaded element.


      this.$loaded = this.options.$loaded;

      if (typeof this.$loaded === 'string') {
        this.$loaded = this.$el.querySelector(this.$loaded);
      } // Set default aria attributes.


      this.$el.setAttribute('aria-valuemin', 0);
      this.$el.setAttribute('aria-valuenow', this.video.$video.currentTime);
      this.$el.setAttribute('aria-valuetext', this.video.formatTime(this.video.$video.currentTime)); // Set events.

      this.on(this.$el, 'touchstart', this.handleDragStart.bind(this));
      this.on(this.$el, 'mousedown', this.handleDragStart.bind(this));
      this.on(document, 'keydown', this.handleKeyDown.bind(this));
      this.on(this.video.$el, 'loadedmetadata.video', this.handleLoadedMetadata.bind(this));
      this.on(this.video.$el, 'timeupdate.video', this.handleTimeUpdate.bind(this));
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
      this.$el.setAttribute('aria-valuetext', this.video.formatTime(e.detail.currentTime));
      this.$bar.style.transform = `scaleX(${e.detail.currentTime / this.video.$video.duration}`;
    }
    /**
     * Handle progress.
     */


    handleProgress() {
      const {
        buffered
      } = this.video.$video;

      if (this.$loaded && buffered && buffered.length > 0 && buffered.end && this.video.$video.duration) {
        this.$loaded.style.transform = `scaleX(${buffered.end(buffered.length - 1) / this.video.$video.duration}`;
      }
    }
    /**
     * Handle key down event.
     *
     * @param {Event} e
     *   The triggered event.
     */


    handleKeyDown(e) {
      if (!this.$el.contains(e.target) || !this.video.$video.duration || e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        return;
      }

      const isSeeking = !!this.props.time;
      this.props.time = isSeeking ? this.props.time : this.video.$video.currentTime; // Check left arrow key.

      if (e.key === 'ArrowLeft') {
        this.props.time = Math.max(0, this.props.time - 5);
      } // Check right arrow key.


      if (e.key === 'ArrowRight') {
        this.props.time = Math.min(this.props.time + 5, this.video.$video.duration);
      }

      this.props.pos = this.props.time / this.video.$video.duration;
      this.$bar.style.transform = `scaleX(${this.props.pos})`; // Pause video when playing.

      if (!isSeeking) {
        this.props.isPlaying = !(this.video.$video.paused || this.video.$video.ended);

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
      } // Play video when playing.


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
      this.props.isPlaying = !(this.video.$video.paused || this.video.$video.ended);
      this.$bar.style.transform = `scaleX(${this.props.pos})`; // Pause video when playing.

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
      let x = touches.clientX - rect.left; // Check if position is out of boundaries.

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
      const {
        duration
      } = this.video.$video; // Check if duration is known.

      if (duration) {
        this.video.$video.currentTime = this.props.pos * duration;
      }

      this.$bar.style.transform = `scaleX(${this.props.pos})`; // Play video when playing.

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

  _defineProperty(Progress, "defaultOptions", {
    $el: '.video__progress',
    $bar: '.video__progress-bar',
    $loaded: '.video__progress-loaded'
  });

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var lib = {};

  (function (exports) {

    var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
          resolve(value);
        });
      }

      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }

        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }

        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };

    var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
      var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
          f,
          y,
          t,
          g;
      return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v]);
        };
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");

        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) _.ops.pop();

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }

        if (op[0] & 5) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.moduleName = void 0;
    exports.moduleName = 'toWebVTT';
    /**
     * @param blob
     * @param readAs
     * @returns Promise<ArrayBuffer>
     */

    var blobToBufferOrString = function (blob, readAs) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        /**
         * @param event
         */

        var loadedCb = function (event) {
          var buf = event.target.result;
          reader.removeEventListener('loadend', loadedCb);
          resolve(readAs !== 'string' ? new Uint8Array(buf) : buf);
        };

        var errorCb = function () {
          reader.removeEventListener('error', errorCb);
          reject(new Error(exports.moduleName + ": Error while reading the Blob object"));
        };

        reader.addEventListener('loadend', loadedCb);
        reader.addEventListener('error', errorCb);

        if (readAs !== 'string') {
          reader.readAsArrayBuffer(blob);
        } else {
          reader.readAsText(blob);
        }
      });
    };
    /**
     * @param text
     * @returns ObjectURL
     */


    var blobToURL = function (text) {
      return URL.createObjectURL(new Blob([text], {
        type: 'text/vtt'
      }));
    };
    /**
     * @param utf8str
     * @returns string
     */


    var toVTT = function (utf8str) {
      return utf8str.replace(/\{\\([ibu])\}/g, '</$1>').replace(/\{\\([ibu])1\}/g, '<$1>').replace(/\{([ibu])\}/g, '<$1>').replace(/\{\/([ibu])\}/g, '</$1>').replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2').concat('\r\n\r\n');
    };
    /**
     * @param resource
     * @returns Promise<string>
     */


    var toWebVTT = function (resource) {
      return __awaiter(void 0, void 0, void 0, function () {
        var text, vttString, buffer, buffer, decode;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!FileReader) {
                throw new Error(exports.moduleName + ": No FileReader constructor found");
              }

              if (!TextDecoder) {
                throw new Error(exports.moduleName + ": No TextDecoder constructor found");
              }

              if (!(resource instanceof Blob)) {
                throw new Error(exports.moduleName + ": Expecting resource to be a Blob but something else found.");
              }

              vttString = 'WEBVTT FILE\r\n\r\n';
              _a.label = 1;

            case 1:
              _a.trys.push([1, 3,, 5]);

              return [4
              /*yield*/
              , blobToBufferOrString(resource, 'string')];

            case 2:
              buffer = _a.sent();
              text = vttString.concat(toVTT(buffer));
              return [3
              /*break*/
              , 5];

            case 3:
              _a.sent();
              return [4
              /*yield*/
              , blobToBufferOrString(resource, 'buffer')];

            case 4:
              buffer = _a.sent();
              decode = new TextDecoder('utf-8').decode(buffer);
              text = vttString.concat(toVTT(decode));
              return [3
              /*break*/
              , 5];

            case 5:
              return [2
              /*return*/
              , Promise.resolve(blobToURL(text))];
          }
        });
      });
    };

    exports.default = toWebVTT;
  })(lib);

  var toWebVTT = /*@__PURE__*/getDefaultExportFromCjs(lib);

  class Caption extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set handlers.
      this.$handlers = this.options.$handlers;

      if (typeof this.$handlers === 'string') {
        this.$handlers = this.video.$el.querySelectorAll(this.$handlers);
      } // If $handlers is a single node, put it in an array.


      if (this.$handlers instanceof Node) {
        this.$handlers = [this.$handlers];
      } // Filter handlers with no language.


      this.$handlers = [...this.$handlers].filter($handler => {
        return $handler.dataset.videoCaptionLang;
      }); // Check if there are $handlers.

      if (this.$handlers.length === 0) {
        return;
      } // Process tracks.


      const tracks = this.video.$video.textTracks;
      Object.keys(tracks).forEach(key => {
        // Default hide.
        tracks[key].mode = 'hidden'; // Attach track to the handler.

        this.$handlers.forEach($handler => {
          if ($handler.dataset.videoCaptionLang === tracks[key].language) {
            $handler.track = tracks[key]; // Retrieve the node the convert the track if necessary.

            const $track = this.video.$el.querySelector(`track[srclang="${$handler.track.language}"]`);

            if ($track) {
              this.convertTrack($track);
            }
          }
        });
      });
      this.$handlers.forEach($handler => {
        this.on($handler, 'click', this.handleClick.bind(this, $handler));
      });
    }
    /**
     * Handle click event.
     *
     * @param {Node} $handler
     *   The triggered $handler.
     * @param {Event} e
     *   The triggered event.
     */


    handleClick($handler, e) {
      this.toggleSubtitle($handler.track.language);
      e.preventDefault();
    }
    /**
     * Toggle caption.
     *
     * @param {String} lang
     *   Toggle caption based on the language.
     */


    toggleSubtitle(lang) {
      this.$handlers.forEach($handler => {
        if ($handler.track.language === lang && $handler.track.mode === 'hidden') {
          $handler.track.mode = 'showing';

          if (this.options.activeClass) {
            $handler.classList.add(this.options.activeClass);
          }
        } else {
          $handler.track.mode = 'hidden';

          if (this.options.activeClass) {
            $handler.classList.remove(this.options.activeClass);
          }
        }
      }); // Trigger event.

      this.video.dispatchEvent('caption', {
        $handlers: this.$handlers
      });
    }
    /**
     * Convert track to webvtt.
     *
     * @param {Node} $track
     *   The track node to convert.
     */


    convertTrack($track) {
      const {
        src
      } = $track; // Check if the source is a srt file.

      if (src.substring(src.lastIndexOf('.') + 1) !== 'srt') {
        return;
      } // Fetch the source as a blob.


      fetch(src).then(response => {
        return response.blob();
      }).then(blob => {
        const trackUrl = toWebVTT(blob);
        trackUrl.then(url => {
          $track.src = url;
        }).catch(err => {
          /* eslint no-console: ["error", { allow: ["error"] }] */
          console.error(err);
        });
      }).catch(err => {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(err);
      });
    }
    /**
     * Destroy the Plugin.
     */


    destroy() {
      this.$handlers.forEach(($handler, index) => {
        // Remove the event listener.
        this.off($handler, 'click'); // Remove track assignment.

        delete $handler.track; // Remove the handler from the collection.

        this.$handlers.splice(index, 1);
      });
      this.$handlers = null;
    }

  }

  _defineProperty(Caption, "defaultOptions", {
    $handlers: '.video__caption',
    activeClass: 'is-active'
  });

  class Time extends Plugin {
    /**
     * Default options.
     */

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
        this.on(this.video.$el, 'loadedmetadata.video', this.handleLoadedMetadata.bind(this));
      } // Set duration.


      this.$duration = this.options.$duration;

      if (typeof this.$duration === 'string') {
        this.$duration = this.video.$el.querySelector(this.$duration);
      }

      if (this.$duration) {
        this.on(this.video.$el, 'timeupdate.video', this.handleTimeUpdate.bind(this));
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

  _defineProperty(Time, "defaultOptions", {
    $currentTime: '.video__current-time',
    $duration: '.video__duration'
  });

  class Volume extends Plugin {
    /**
     * Default options.
     */

    /**
     * Init.
     */
    init() {
      // Set element.
      this.$el = this.options.$el;

      if (typeof this.$el === 'string') {
        this.$el = this.video.$el.querySelector(this.$el);
      } // Check if the element exists.


      try {
        if (!this.$el) {
          throw new DOMException('A element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set bar.


      this.$bar = this.options.$bar;

      if (typeof this.$bar === 'string') {
        this.$bar = this.$el.querySelector(this.$bar);
      } // Check if the bar element exists.


      try {
        if (!this.$bar) {
          throw new DOMException('A bar element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set default.


      const isMuted = this.video.$video.muted;
      const volume = this.video.getVolume();
      const pos = isMuted ? 0 : volume;
      this.$el.setAttribute('aria-valuemin', 0);
      this.$el.setAttribute('aria-valuemax', 100);
      this.$el.setAttribute('aria-valuenow', volume * 100);
      this.$el.setAttribute('aria-valuetext', `${volume * 100}%`);
      this.$bar.style.transform = `scaleX(${pos})`; // Set events.

      this.on(this.$el, 'touchstart', this.handleDragStart.bind(this));
      this.on(this.$el, 'mousedown', this.handleDragStart.bind(this));
      this.on(document, 'keydown', this.handleKeyDown.bind(this));
      this.on(this.video.$el, 'volumechange.video', this.handleVolumeChange.bind(this));
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
      this.$bar.style.transform = `scaleX(${e.detail.muted ? 0 : e.detail.volume})`;
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

      let volume = this.video.getVolume(); // Check left arrow key.

      if (e.key === 'ArrowLeft') {
        volume = Math.max(0, volume - 0.1);
      } // Check right arrow key.


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
      let x = touches.clientX - rect.left; // Check if position is out of boundaries.

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

  _defineProperty(Volume, "defaultOptions", {
    $el: '.video__volume',
    $bar: '.video__volume-bar'
  });

  class Video {
    /**
     * List of build-in plugins. This list is mutable.
     */

    /**
     * Default options.
     */

    /**
     * Constructs a Video player.
     *
     * @param {HTMLElement|string} $el
     *   Given selector or HTMLElement.
     * @param {Array} [options]
     *   Different options.
     */
    constructor($el, options) {
      // If $el is a string, then use the querySelector to find the media player.
      if (typeof $el === 'string') {
        $el = document.querySelector($el);
      }

      this.$el = $el; // Attach object to element.

      this.$el.video = this; // Merge and set options.

      this.options = { ...Video.defaultOptions,
        ...options
      }; // Set video element.

      this.$video = this.options.$video;

      if (typeof this.$video === 'string') {
        this.$video = this.$el.querySelector(this.$video);
      } // Check if the video element exists.


      try {
        if (!this.$video) {
          throw new DOMException('A video element is required.');
        }
      } catch (e) {
        /* eslint no-console: ["error", { allow: ["error"] }] */
        console.error(e);
      } // Set default volume.


      this.$video.volume = this.options.volume; // Set default muted.

      this.$video.muted = this.options.muted; // Set events.

      this.on(this.$video, 'keydown', this.handleKeydown.bind(this));
      this.on(this.$video, 'loadedmetadata', this.handleLoadedMetadata.bind(this));
      this.on(this.$video, 'progress', this.handleProgress.bind(this));
      this.on(this.$video, 'seeking', this.handleSeeking.bind(this));
      this.on(this.$video, 'seeked', this.handleSeeked.bind(this));
      this.on(this.$video, 'waiting', this.handleWaiting.bind(this));
      this.on(this.$video, 'timeupdate', this.handleTimeUpdate.bind(this));
      this.on(this.$video, 'volumechange', this.handleVolumeChange.bind(this));
      this.on(this.$video, 'play', this.handlePlay.bind(this));
      this.on(this.$video, 'pause', this.handlePause.bind(this));
      this.on(this.$video, 'click', this.handleClick.bind(this)); // Set plugins.

      this.plugins = {};
      Video.listPlugins.forEach(PluginInstance => {
        const name = PluginInstance.name.toLowerCase();
        const opts = this.options.plugins[name] || {};
        this.plugins[name] = new PluginInstance(this, opts);
      }); // Load video.

      this.$video.load(); // Invoke the plugins.

      this.invokePlugins('init');
    }
    /**
     * Deconstructs the Video.
     */


    deconstructor() {
      // Invoke the plugins.
      this.invokePlugins('destroy');
      this.invokePlugins('deconstructor'); // Remove events.

      this.off(this.$video, 'keydown');
      this.off(this.$video, 'loadedmetadata');
      this.off(this.$video, 'progress');
      this.off(this.$video, 'seeking');
      this.off(this.$video, 'seeked');
      this.off(this.$video, 'waiting');
      this.off(this.$video, 'timeupdate');
      this.off(this.$video, 'volumechange');
      this.off(this.$video, 'play');
      this.off(this.$video, 'pause');
      this.off(this.$video, 'click');
      delete this.$el.video;
      this.$el = null;
      this.options = null;
      this._events = null;
      this.plugins = null;
    }
    /**
     * Add a custom plugin.
     *
     * @param {Plugin} plugin
     *   The given plugin.
     */


    static addPlugin(plugin) {
      if (plugin instanceof Plugin) {
        plugin = [plugin];
      }

      plugin.forEach(instance => {
        Video.listPlugins.push(instance);
      });
    }
    /**
     * Handle loaded metadata.
     */


    handleLoadedMetadata() {
      // Trigger event.
      this.dispatchEvent('loadedmetadata');
    }
    /**
     * Handle time update.
     */


    handleTimeUpdate() {
      // Trigger event.
      this.dispatchEvent('timeupdate', {
        currentTime: this.$video.currentTime
      });
    }
    /**
     * Handle progress.
     */


    handleProgress() {
      // Trigger event.
      this.dispatchEvent('progress');
    }
    /**
     * Handle seeking.
     */


    handleSeeking() {
      // Trigger event.
      this.dispatchEvent('seeking');
    }
    /**
     * Handle seeked.
     */


    handleSeeked() {
      // Trigger event.
      this.dispatchEvent('seeked');
    }
    /**
     * Handle waiting.
     */


    handleWaiting() {
      // Trigger event.
      this.dispatchEvent('waiting');
    }
    /**
     * Handle volume change.
     */


    handleVolumeChange() {
      // Trigger event.
      this.dispatchEvent('volumechange', {
        volume: this.$video.volume,
        muted: this.$video.muted
      });
    }
    /**
     * Handle play event.
     */


    handlePlay() {
      // Trigger event.
      this.dispatchEvent('play');
    }
    /**
     * Handle pause.
     */


    handlePause() {
      // Trigger event.
      this.dispatchEvent('pause');
    }
    /**
     * Handle click.
     */


    handleClick() {
      if (this.$video.paused || this.$video.ended) {
        this.play();
      } else {
        this.pause();
      }
    }
    /**
     * Handle keydown event.
     *
     * @param {Event} e
     *   The triggered event.
     */


    handleKeydown(e) {
      // Check if the spacebar is used.
      if (e.key === ' ') {
        if (this.$video.paused || this.$video.ended) {
          this.play();
        } else {
          this.pause();
        }

        e.preventDefault();
      }
    }
    /**
     * Invoke plugins.
     *
     * @param {string} method
     *   The name of the method that will be triggered.
     * @param {array} args
     *   An array of arguments.
     */


    invokePlugins(method) {
      let args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      Object.keys(this.plugins).forEach(key => {
        if (this.plugins[key][method]) {
          this.plugins[key][method](...args);
        }
      });
    }
    /**
     * Dispatch a custom event.
     *
     * @param {string} name
     *   Name of the custom event.
     * @param {object} data
     *   Additional data to dispatch.
     */


    dispatchEvent(name) {
      let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // Trigger event.
      const event = new CustomEvent(`${name}.video`, {
        detail: data
      });
      this.$el.dispatchEvent(event);
    }
    /**
     * Play the video.
     */


    play() {
      this.$video.play();
    }
    /**
     * Pause the video.
     */


    pause() {
      this.$video.pause();
    }
    /**
     * Mute or unmute the video.
     *
     * @param {boolean} force
     *   State to mute or unmute.
     */


    mute(force) {
      const state = force === true || force === false ? force : !this.$video.muted; // Set muted state.

      this.$video.muted = state;
    }
    /**
     * Set the volume of the video.
     *
     * @param {number} volume
     *   Volume level.
     */


    setVolume(volume) {
      this.$video.volume = volume;
    }
    /**
     * Get the volume level.
     *
     * @return {number}
     *   The volume level.
     */


    getVolume() {
      return this.$video.volume;
    }
    /**
     * Format seconds to time.
     *
     * @param {int} seconds
     *   Number of seconds.
     * @return {string}
     *   Formated time.
     */


    formatTime(seconds) {
      const ISOstring = new Date(seconds * 1000).toISOString();

      if (seconds < 3600) {
        return ISOstring.substring(14, 19);
      }

      return ISOstring.substring(11, 19);
    }

  } // Add an EventHelper mixin to the class.


  _defineProperty(Video, "listPlugins", [Ad, Fullscreen, Loading, Mute, Play, PlayPause, Progress, Caption, Time, Volume]);

  _defineProperty(Video, "defaultOptions", {
    $video: 'video',
    $container: 'video__container',
    volume: 0.75,
    muted: false,
    plugins: {}
  });

  Object.assign(Video.prototype, EventHelper);

  return Video;

}));
