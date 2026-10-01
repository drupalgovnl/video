function init () {
  // Select all videos.
  const $videos = document.querySelectorAll('.js-video');

  $videos.forEach(($video) => {
    // Set a Video for each video.
    const video = new Video($video);
  });
}

window.addEventListener('DOMContentLoaded', init, false);
