/**
 * @file
 * Setup a class for a video player.
 *
 * This class helps to setup a video player with different functions. It also
 * uses a plugin system to extend the functionality.
 *
 * Param string or element.
 * Param object options:
 *   - $video: string or a Node. Default string.
 *   - plugins: object of plugin options. Default empty object.
 *
 * Build-in plugins:
 *   - Audio description
 *   - Fullscreen
 *   - Loading
 *   - Mute
 *   - Playpause
 *   - Progress
 *   - Caption
 *   - Time
 *   - Volume
 *
 * Available events:
 *   - loadedMetadata.video
 *   - timeUpdate.video
 *   - volumeChange.video
 *   - progress.video
 *   - seeking.video
 *   - seeked.video
 *   - waiting.video
 *   - play.video
 *   - pause.video
 *
 * For example:
 * @code
 * const video = new Video('#my-video, {
 *   $video: '.video',
 *   plugins: {
 *     mute: {
 *       $handler: '.mute',
 *     },
 *   },
 * });
 * @endcode
 */

import EventHelper from './eventhelper';
import Plugin from './plugin';
import Ad from './plugins/ad';
import Fullscreen from './plugins/fullscreen';
import Loading from './plugins/loading';
import Mute from './plugins/mute';
import Play from './plugins/play';
import PlayPause from './plugins/playpause';
import Progress from './plugins/progress';
import Caption from './plugins/caption';
import Time from './plugins/time';
import Volume from './plugins/volume';

class Video {
  /**
   * List of build-in plugins. This list is mutable.
   */
  static listPlugins = [
    Ad,
    Fullscreen,
    Loading,
    Mute,
    Play,
    PlayPause,
    Progress,
    Caption,
    Time,
    Volume,
  ];

  /**
   * Default options.
   */
  static defaultOptions = {
    $video: 'video',
    $container: 'video__container',
    volume: 0.75,
    muted: false,
    plugins: {},
  };

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

    this.$el = $el;

    // Attach object to element.
    this.$el.video = this;

    // Merge and set options.
    this.options = { ...Video.defaultOptions, ...options };

    // Set video element.
    this.$video = this.options.$video;

    if (typeof this.$video === 'string') {
      this.$video = this.$el.querySelector(this.$video);
    }

    // Check if the video element exists.
    try {
      if (!this.$video) {
        throw new DOMException('A video element is required.');
      }
    } catch (e) {
      /* eslint no-console: ["error", { allow: ["error"] }] */
      console.error(e);
    }

    // Set default volume.
    this.$video.volume = this.options.volume;

    // Set default muted.
    this.$video.muted = this.options.muted;

    // Set events.
    this.on(this.$video, 'keydown', this.handleKeydown.bind(this));
    this.on(
      this.$video,
      'loadedmetadata',
      this.handleLoadedMetadata.bind(this),
    );
    this.on(this.$video, 'progress', this.handleProgress.bind(this));
    this.on(this.$video, 'seeking', this.handleSeeking.bind(this));
    this.on(this.$video, 'seeked', this.handleSeeked.bind(this));
    this.on(this.$video, 'waiting', this.handleWaiting.bind(this));
    this.on(this.$video, 'timeupdate', this.handleTimeUpdate.bind(this));
    this.on(this.$video, 'volumechange', this.handleVolumeChange.bind(this));
    this.on(this.$video, 'play', this.handlePlay.bind(this));
    this.on(this.$video, 'pause', this.handlePause.bind(this));
    this.on(this.$video, 'click', this.handleClick.bind(this));

    // Set plugins.
    this.plugins = {};

    Video.listPlugins.forEach((PluginInstance) => {
      const name = PluginInstance.name.toLowerCase();
      const opts = this.options.plugins[name] || {};
      this.plugins[name] = new PluginInstance(this, opts);
    });

    // Load video.
    this.$video.load();

    // Invoke the plugins.
    this.invokePlugins('init');
  }

  /**
   * Deconstructs the Video.
   */
  deconstructor() {
    // Invoke the plugins.
    this.invokePlugins('destroy');
    this.invokePlugins('deconstructor');

    // Remove events.
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

    plugin.forEach((instance) => {
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
      currentTime: this.$video.currentTime,
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
      muted: this.$video.muted,
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
  invokePlugins(method, args = []) {
    Object.keys(this.plugins).forEach((key) => {
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
  dispatchEvent(name, data = {}) {
    // Trigger event.
    const event = new CustomEvent(`${name}.video`, {
      detail: data,
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
    const state =
      force === true || force === false ? force : !this.$video.muted;

    // Set muted state.
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
}

// Add an EventHelper mixin to the class.
Object.assign(Video.prototype, EventHelper);

export default Video;
