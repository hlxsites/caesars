export default function decorate(block) {
  const blockElements = [...block.children];
  const backgroundImageElement = blockElements[0];
  backgroundImageElement.classList.add('featured-card-background');

  const blockContent = blockElements[1];
  blockContent.classList.add('featured-card-feature');

  blockContent.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('featured-card-image');
  });

  [...blockContent.children].forEach((item) => {
    if(![...item.classList].includes('featured-card-image')){
      item.classList.add('featured-card-content');
    }
  });
}
