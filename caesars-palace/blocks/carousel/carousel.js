const classes = Object.freeze({
  carouselElement: 'carousel-element',
  activeCarouselElement: 'carousel-visible-element',
  hiddenCarouselElement: 'carousel-hidden-element',
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

function getCurrentActiveIndex(block) {
  const activeCarouselQueryResult = block.getElementsByClassName(classes.activeCarouselElement);
  if (activeCarouselQueryResult.length !== 1) {
    return;
  }
  const currentActiveCarouselElement = activeCarouselQueryResult[0].classList;
  let currentIndex = null;
  let i = 0;
  while (currentIndex === null && i < currentActiveCarouselElement.length) {
    const item = currentActiveCarouselElement[i];
    if (item.startsWith(`${classes.carouselElement}-`)) {
      const possibleIndex = parseInt(item.split(`${classes.carouselElement}-`)[1], 10);
      if (Number.isInteger(possibleIndex)) {
        currentIndex = possibleIndex;
      }
    }
    i += 1;
  }

  return currentIndex; // eslint-disable-line consistent-return
}

function moveCarousel(block, from, to) {
  const elementToShowName = `${classes.carouselElement}-${to}`;
  const elementToShowQueryResult = block.getElementsByClassName(elementToShowName);
  if (elementToShowQueryResult.length !== 1) {
    return;
  }
  const elementToShow = elementToShowQueryResult[0];

  const elementToHideName = `${classes.carouselElement}-${from}`;
  const elementToHideQueryResult = block.getElementsByClassName(elementToHideName);
  if (elementToHideQueryResult.length !== 1) {
    return;
  }
  const elementHide = elementToHideQueryResult[0];

  elementHide.classList.remove('carousel-visible-element');
  elementHide.classList.add('carousel-hidden-element');

  elementToShow.classList.remove('carousel-hidden-element');
  elementToShow.classList.add('carousel-visible-element');
}

function showPreviousElement(block, totalCarouselElements) {
  const currentActiveIndex = getCurrentActiveIndex(block);
  if (currentActiveIndex === null) {
    return;
  }

  let indexToShow = null;
  if (currentActiveIndex === 0) {
    indexToShow = totalCarouselElements - 1;
  } else {
    indexToShow = currentActiveIndex - 1;
  }

  moveCarousel(block, currentActiveIndex, indexToShow);
}

function showNextElement(block, totalCarouselElements) {
  const currentActiveIndex = getCurrentActiveIndex(block);
  if (currentActiveIndex === null) {
    return;
  }

  let indexToShow = null;
  indexToShow = currentActiveIndex + 1;
  if (indexToShow === totalCarouselElements) {
    indexToShow = 0;
  }

  moveCarousel(block, currentActiveIndex, indexToShow);
}

export default async function decorate(block) {
  const carouselContent = document.createElement('div');
  carouselContent.classList.add(`${classes.carouselElement}-holder`);

  let totalCarouselElements = 0;

  [...block.children].forEach((row, rowIndex) => {
    row.classList.add(classes.carouselElement);
    row.classList.add(`${classes.carouselElement}-${rowIndex}`);
    totalCarouselElements += 1;

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

    block.querySelectorAll('h1').forEach((textContent) => {
      const textHolderDiv = textContent.closest('div');
      if (textHolderDiv.outerHTML.includes('data-align="right"')) {
        textHolderDiv.classList.add('right-text');
      } else if (textHolderDiv.outerHTML.includes('data-align="left"')) {
        textHolderDiv.classList.add('left-text');
      } else {
        textHolderDiv.classList.add('center-text');
      }
    });

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
      showPreviousElement(block, totalCarouselElements);
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
      showNextElement(block, totalCarouselElements);
    });
    block.append(forwardButton);
  }
}
