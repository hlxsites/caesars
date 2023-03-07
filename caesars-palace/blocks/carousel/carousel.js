const classes = Object.freeze({
  carouselElement: 'carousel-element',
  activeCarouselElement: 'carousel-element-visible',
  hiddenCarouselElement: 'carousel-element-hidden',
  carouselImage: 'carousel-image',
  carouselOnlyImage: 'carousel-only-image',
  carouselMainImage: 'carousel-main-image',
  carouselAltImage: 'carousel-alt-image',
  carouselText: 'carousel-text',
});

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

function getCurrentActiveIndex(){
  // get active element
  // get active element index
}

function showPreviousElement(){
  console.log("Show previous element");

  // get active element index (getCurrentActiveIndex)
  // handle underflow
  // hide current, make previous visible
}

function showNextElement(){
  console.log("Show next element");

  // get active element index (getCurrentActiveIndex)
  // handle overflow
  // hide current, make next visible
}

export default async function decorate(block) {
  const carouselContent = document.createElement('div');
  carouselContent.classList.add(`${classes.carouselElement}-holder`);

  [...block.children].forEach((row, rowIndex) => {
    row.classList.add(classes.carouselElement);
    row.classList.add(`${classes.carouselElement}-${rowIndex}`);

    if (rowIndex === 0) {
      row.classList.add(classes.activeCarouselElement);
    } else {
      row.classList.add(classes.hiddenCarouselElement);
    }

    const imagesInRow = row.querySelectorAll('img');
    if (imagesInRow.length === 1) {
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add(classes.carouselImage);
      carouselImage.closest('div').classList.add(classes.carouselOnlyImage);
    } else if (imagesInRow.length === 2) {
      const carouselImage = imagesInRow[0];
      carouselImage.closest('div').classList.add(classes.carouselImage);
      carouselImage.closest('div').classList.add(classes.carouselMainImage);

      const carouselAltImage = imagesInRow[1];
      carouselAltImage.closest('div').classList.add(classes.carouselImage);
      carouselAltImage.closest('div').classList.add(classes.carouselAltImage);
    }

    [...row.children].forEach((item) => {
      if (item.innerHTML) {
        if (![...item.classList].includes(classes.carouselImage)) {
          item.classList.add(classes.carouselText);
        }
      } else {
        item.remove();
      }
    });

    carouselContent.append(row);
  });

  // build the carousel
  const backChevron = await getChevronSvg('icons/chevron-left.svg');
  const forwardChevron = await getChevronSvg('icons/chevron-right.svg');

  if (backChevron && forwardChevron) {
    const backChevronSpan = document.createElement('span');
    backChevronSpan.innerHTML = backChevron;
    const backButton = document.createElement('div');
    backButton.classList.add('back-carousel-button');
    backButton.appendChild(backChevronSpan);
    backButton.addEventListener('click', () => {
      console.log("Back!");
      showPreviousElement(block);
    });
    block.append(backButton);
  }

  block.append(carouselContent);

  if (backChevron && forwardChevron) {
    const forwardChevronSpan = document.createElement('span');
    forwardChevronSpan.innerHTML = forwardChevron;
    const forwardButton = document.createElement('div');
    forwardButton.classList.add('forward-carousel-button');
    forwardButton.appendChild(forwardChevronSpan);
    forwardButton.addEventListener('click', () => {
      console.log("Forward!");
      showNextElement(block);
    });
    block.append(forwardButton);
  }
}
