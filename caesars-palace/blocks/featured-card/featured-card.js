export default function decorate(block) {
  const blockElements = [...block.children];
  const [backgroundImageElement, blockContent] = blockElements;

  const hasBackgroundImage = backgroundImageElement.querySelectorAll('img');
  if (hasBackgroundImage.length === 0) {
    block.parentElement.classList.add('featured-card-wrapper-no-background');
  } else {
    backgroundImageElement.classList.add('featured-card-background');
  }

  blockContent.classList.add('featured-card-content');

  blockContent.querySelectorAll('img').forEach((image) => {
    image.closest('div').classList.add('featured-card-image');
  });

  [...blockContent.children].forEach((item) => {
    if (!item.classList.contains('featured-card-image')) {
      item.classList.add('featured-card-text');
    }
  });
}
