import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

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
}
