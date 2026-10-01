/**
 * @file
 * Setup a base class for a Video Plugin.
 *
 * Build your own plugin. All variables and methods are optional:
 * @code
 * class MyPlugin extends Plugin {
 *   static name = 'plugin_name';
 *
 *   static defaultOptions = {
 *     // Custom options.
 *   };
 *
 *   init() {
 *     // Called after the class contructor.
 *   }
 *
 *   destroy() {
 *     // Destroy the plugin. Called before the deconstructor.
 *   }
 * };
 * @endcode
 *
 * Add you custom plugin to Video.plugins[], like `Video.plugins[] = MyPlugin`.
 * Custom plugin options are set through the class constructor of the Video.
 */

import EventHelper from './eventhelper';

class Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {};

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
    this.video = video;

    // Set options.
    this.options = { ...this.constructor.defaultOptions, ...options };
  }

  /**
   * Deconstructs the Plugin.
   */
  deconstructor() {
    this.video = null;
    this._events = null;
  }
}

// Add an EventHelper mixin to the class.
Object.assign(Plugin.prototype, EventHelper);

export default Plugin;
