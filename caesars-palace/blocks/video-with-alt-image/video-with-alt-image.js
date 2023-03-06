export default function decorate(block) {
  let posterImage = null;

  block.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('video-alt-image');
    posterImage = image.src;
  });

  block.querySelectorAll('a').forEach((videoLink) => {
    const divToReplace = videoLink.closest('div');
    
    const videoDiv = document.createElement('div');
    videoDiv.classList.add('video-link');
    const videoElement = document.createElement('video');
    videoElement.innerHTML = `<source src="${videoLink.href}" type="video/mp4">`;
    videoElement.toggleAttribute('muted', true);
    videoDiv.appendChild(videoElement);

    divToReplace.remove();

    block.append(videoDiv);
  });

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      console.log("Should hide video");
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.toggleAttribute('autoplay', false);
        videoElement.toggleAttribute('loop', false);
        videoElement.toggleAttribute('playsinline', false);
        videoElement.posterImage = '';
      });
    } else {
      block.querySelectorAll('video').forEach((videoElement) => {
        console.log("Should show video");
        videoElement.toggleAttribute('autoplay', true);
        videoElement.toggleAttribute('loop', true);
        videoElement.toggleAttribute('playsinline', true);
        videoElement.posterImage = posterImage;
      });
    }
  };

  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}