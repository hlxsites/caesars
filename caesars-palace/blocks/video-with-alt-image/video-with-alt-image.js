/* below 1170px width: show image, otherwise show video */

export default function decorate(block) {
  // turn link into video tag 
  /* 
  <video autoplay="" loop="" playsinline=""><source src="/content/dam/empire/clv/things-to-do/nightlife/omnia-nightclub/video/clv-omnia-main-room.mp4" type="video/mp4"></video>
  */ 

  block.querySelectorAll('a').forEach((videoLink) => {
    videoLink.closest('div').classList.add('video-link');
  });

  block.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('video-alt-image');
  });

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      console.log("Event matches");
    } else {
      console.log("Event does not match");
    }
  };

  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}