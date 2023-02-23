import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  console.log('Decorating highlight-card block');

  let childRowNumber = 0;
  [...block.children].forEach((row) => {
    if (childRowNumber === 0) row.classList.add(`highlight-card-image`);
    else row.classList.add(`highlight-card-text`);
    ++childRowNumber;
  });

  // img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
}
