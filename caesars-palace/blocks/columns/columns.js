import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const picture = block.querySelector('picture');

  // CET Card variations
  if (block.classList.contains('cet-card') && cols.length === 2) {
    // image placement
    if (cols[0].contains(picture)) {
      block.classList.add('image-start');
    } else if (cols[1].contains(picture)) {
      block.classList.add('image-end');
    }

    // button group
    block.querySelectorAll('a').forEach((anchor) => anchor.closest('p').classList.add('button-group'));

    // full Width variations
    if (block.classList.contains('full-width')) {
      const section = block.closest('.section');
      section.classList.add('has-background');

      // move picture based on screen size
      const mqList = window.matchMedia('(min-width: 768px)');
      const handleScreenChange = (mql) => {
        if (mql.matches) {
          // non-mobile
          section.appendChild(picture);
        } else {
          // mobile
          let pictureCol = -1;
          if (block.classList.contains('image-start')) {
            pictureCol = 0;
          } else if (block.classList.contains('image-end')) {
            pictureCol = 1;
          }
          if (pictureCol >= 0) {
            cols[pictureCol].appendChild(picture);
          }
        }
      };
      handleScreenChange(mqList);
      mqList.addEventListener('change', handleScreenChange);
    }
  }

  const mediaQueryMatcher = window.matchMedia('(max-width: 768px)');
  const handleScreenChange = (query) => {
    if (query.matches) {
      block.querySelectorAll('img').forEach((image) => {
        image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '768' }]));
      });
    }
  };
  handleScreenChange(mediaQueryMatcher);
  mediaQueryMatcher.addEventListener('change', handleScreenChange);
}
