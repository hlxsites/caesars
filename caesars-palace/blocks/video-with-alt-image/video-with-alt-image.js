/* below 1170px width: show image, otherwise show video */

export default function decorate(block) {
  // turn link into video tag 
  block.querySelectorAll('a').forEach((videoLink) => {
    console.log(videoLink);
  });

  // show image on mobile by default, video is hidden

  // show video only if on large screen, image is hidden, change classes on video tag
}