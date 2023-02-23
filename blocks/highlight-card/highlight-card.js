import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  block.querySelectorAll('img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]));
  });

  let childRowNumber = 0;
  [...block.children].forEach((row) => {
    if (childRowNumber !== 0) row.classList.add('highlight-card-text'); 
    else row.classList.add('highlight-card-image');

    childRowNumber += 1;

    if (childRowNumber === block.children.length && row.children && row.children.length >= 1) {
      row.children[row.children.length - 1].classList.add('highlight-card-action'); 
    }
  });
}
