export default function decorate(block) {
  [...block.children].forEach((row, rowIndex) => {
    row.classList.add('carousel-element');
    row.classList.add(`carousel-element-${rowIndex}`);

    const imagesInRow = row.querySelectorAll('img');
    if(imagesInRow.length === 1){
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add('carousel-image');
      carouselImage.closest('div').classList.add('carousel-only-image');
    } else if(imagesInRow.length === 2){
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add('carousel-image');
      carouselImage.closest('div').classList.add('carousel-main-image');

      const carouselAltImage = imagesInRow[1];
      carouselAltImage.closest('div').classList.add('carousel-image');
      carouselAltImage.closest('div').classList.add('carousel-alt-image');
    }

    [...row.children].forEach((item) => {
      if (item.innerHTML) {
        if(![...item.classList].includes('carousel-image')){
          item.classList.add('carousel-text');
        }
      } else {
        item.remove();
      }
    });
  });
}