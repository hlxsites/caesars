/* Breakpoint for desktop at 1170px */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('carousel-element');

    const imagesInRow = row.querySelectorAll('img');
    if(imagesInRow.length === 1){
      const carouselImage = imagesInRow[0];
      image.closest('div').classList.add('carousel-image');
      image.closest('div').classList.add('carousel-main-image');
      image.closest('div').classList.add('carousel-alt-image');
    } else if(imagesInRow.length === 2){
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add('carousel-image');
      carouselImage.closest('div').classList.add('carousel-main-image');

      const carouselAltImage = imagesInRow[1];
      carouselAltImage.closest('div').classList.add('carousel-image');
      carouselAltImage.closest('div').classList.add('carousel-alt-image');
    }
  });
}