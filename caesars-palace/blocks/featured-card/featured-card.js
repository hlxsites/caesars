export default function decorate(block) {
  const blockElements = [...block.children];
  const backgroundImageElement = blockElements[0];
  backgroundImageElement.classList.add('featured-card-background');

  const blockContent = blockElements[1];
  blockContent.classList.add('featured-card-feature');

  blockContent.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('featured-card-image');
    console.log(image);
  });

  [...blockContent.children].forEach((item) => {
    if(![...item.classList].includes('featured-card-image')){
      item.classList.add('featured-card-content');
    }
  });




  // TODO: Design on desktop changes
  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 768px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
    } else {
    }
  };
  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
