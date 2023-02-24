export default function decorate(block) {
  block.querySelectorAll('a').forEach((buttonLink) => {
    buttonLink.classList.add('button');
    buttonLink.classList.add('secondary');
    buttonLink.closest('div').classList.add('button-container');
  });

  let childRowNumber = 0;
  [...block.children].forEach((row) => {
    if (childRowNumber !== 0) row.classList.add('highlight-card-text');
    else row.classList.add('highlight-card-image');
    childRowNumber += 1;
  });

  /*
  const mediaWidthQueryMatcher  = window.matchMedia('only screen and (max-width: 960px)');
  const mediaWidthChangeHandler = (event) => {
    if(event.matches){
      // add click event listener on block
    } else {
      // remove click event listener on block
    }
  }
  mediaWidthChangeHandler(mediaWidthQueryMatcher);

  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
  // */
}
