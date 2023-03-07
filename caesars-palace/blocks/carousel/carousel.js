async function getChevronSvg(iconPath) {
  let svg = null;
  try {
    const response = await fetch(`${window.hlx.codeBasePath}/${iconPath}`);
    if (!response.ok) {
      return svg;
    }
    svg = await response.text();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    svg = null;
  }

  return svg;
}


export default async function decorate(block) {
  const carouselContent = document.createElement('div');
  carouselContent.classList.add('carousel-elements-holder');

  [...block.children].forEach((row, rowIndex) => {
    row.classList.add('carousel-element');
    row.classList.add(`carousel-element-${rowIndex}`);

    if (rowIndex === 0) {
      row.classList.add('carousel-element-visible');
    } else {
      row.classList.add('carousel-element-hidden');
    }

    const imagesInRow = row.querySelectorAll('img');
    if (imagesInRow.length === 1) {
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add('carousel-image');
      carouselImage.closest('div').classList.add('carousel-only-image');
    } else if (imagesInRow.length === 2) {
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add('carousel-image');
      carouselImage.closest('div').classList.add('carousel-main-image');

      const carouselAltImage = imagesInRow[1];
      carouselAltImage.closest('div').classList.add('carousel-image');
      carouselAltImage.closest('div').classList.add('carousel-alt-image');
    }

    [...row.children].forEach((item) => {
      if (item.innerHTML) {
        if (![...item.classList].includes('carousel-image')) {
          item.classList.add('carousel-text');
        }
      } else {
        item.remove();
      }
    });

    carouselContent.append(row);
  });

  // build the carousel
  const backChevron = await getChevronSvg('icons/chevron-left.svg');
  const backChevronSpan = document.createElement('span');
  backChevronSpan.innerHTML = backChevron;
  const backButton = document.createElement('div');
  backButton.classList.add('back-carousel-button');
  backButton.appendChild(backChevronSpan);
  backButton.addEventListener('click', () => {
    console.log("Back!");
  });
  block.append(backButton);

  block.append(carouselContent);

  const forwardChevron = await getChevronSvg('icons/chevron-right.svg');
  const forwardChevronSpan = document.createElement('span');
  forwardChevronSpan.innerHTML = forwardChevron;
  const forwardButton = document.createElement('div');
  forwardButton.classList.add('forward-carousel-button');
  forwardButton.appendChild(forwardChevronSpan);
  forwardButton.addEventListener('click', () => {
    console.log("Forward!");
  });
  block.append(forwardButton);
}