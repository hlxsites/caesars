export default function decorate(block) {
  block.querySelectorAll('a').forEach((videoLink) => {
    const divToReplace = videoLink.closest('div');
    divToReplace.remove();

    const videoDiv = document.createElement('div');
    videoDiv.classList.add('video-link');
    const videoElement = document.createElement('video');
    videoElement.innerHTML = `<source src="${videoLink.href}" type="video/mp4">`;
    videoElement.toggleAttribute('muted', true);
    videoDiv.appendChild(videoElement);

    block.append(videoDiv);
  });

  block.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('video-alt-image');
  });

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      console.log("Event matches: hide video, display image (default)");
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.toggleAttribute('autoplay', false);
        videoElement.toggleAttribute('loop', false);
        videoElement.toggleAttribute('playsinline', false);
      });
    } else {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.toggleAttribute('autoplay', true);
        videoElement.toggleAttribute('loop', true);
        videoElement.toggleAttribute('playsinline', true);
      });
    }
  };

  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}