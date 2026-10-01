/**
 * @file
 * Plugin: Caption.
 *
 * This plugin adds logic for a caption handler. A handler must have a
 * 'data-video-caption-lang' attribute to reference a <track> element.
 *
 * Options:
 *   - $handlers: string, Node or a collection of Nodes. Default string.
 *   - activeClass: classname for the active state. Default 'is-active'.
 */

import toWebVTT from 'srt-webvtt'
import Plugin from '../plugin';

class Caption extends Plugin {
  /**
   * Default options.
   */
  static defaultOptions = {
    $handlers: '.video__caption',
    activeClass: 'is-active',
  };

  /**
   * Init.
   */
  init() {
    // Set handlers.
    this.$handlers = this.options.$handlers;

    if (typeof this.$handlers === 'string') {
      this.$handlers = this.video.$el.querySelectorAll(this.$handlers);
    }

    // If $handlers is a single node, put it in an array.
    if (this.$handlers instanceof Node) {
      this.$handlers = [this.$handlers];
    }

    // Filter handlers with no language.
    this.$handlers = [...this.$handlers].filter(($handler) => {
      return $handler.dataset.videoCaptionLang;
    });

    // Check if there are $handlers.
    if (this.$handlers.length === 0) {
      return;
    }

    // Process tracks.
    const tracks = this.video.$video.textTracks;

    Object.keys(tracks).forEach((key) => {
      // Default hide.
      tracks[key].mode = 'hidden';

      // Attach track to the handler.
      this.$handlers.forEach(($handler) => {
        if ($handler.dataset.videoCaptionLang === tracks[key].language) {
          $handler.track = tracks[key];

          // Retrieve the node the convert the track if necessary.
          const $track = this.video.$el.querySelector(
            `track[srclang="${$handler.track.language}"]`,
          );

          if ($track) {
            this.convertTrack($track);
          }
        }
      });
    });

    this.$handlers.forEach(($handler) => {
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
    this.$handlers.forEach(($handler) => {
      if (
        $handler.track.language === lang &&
        $handler.track.mode === 'hidden'
      ) {
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
    });

    // Trigger event.
    this.video.dispatchEvent('caption', {
      $handlers: this.$handlers,
    });
  }

  /**
   * Convert track to webvtt.
   *
   * @param {Node} $track
   *   The track node to convert.
   */
  convertTrack($track) {
    const { src } = $track;

    // Check if the source is a srt file.
    if (src.substring(src.lastIndexOf('.') + 1) !== 'srt') {
      return;
    }

    // Fetch the source as a blob.
    fetch(src)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        const trackUrl = toWebVTT(blob);

        trackUrl
          .then((url) => {
            $track.src = url;
          })
          .catch((err) => {
            /* eslint no-console: ["error", { allow: ["error"] }] */
            console.error(err);
          });
      })
      .catch((err) => {
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
      this.off($handler, 'click');

      // Remove track assignment.
      delete $handler.track;

      // Remove the handler from the collection.
      this.$handlers.splice(index, 1);
    });

    this.$handlers = null;
  }
}

export default Caption;
