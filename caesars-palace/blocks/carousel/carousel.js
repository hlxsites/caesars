const RESPONSIVE_MEDIA_QUERY = 'only screen and (min-width: 1170px)';
const TOUCH_MIN_CHANGE_TOLERANCE = 100;
const direction = Object.freeze({
  slideIn: 'SLIDE_IN',
  slideOut: 'SLIDE_OUT',
});
const classes = Object.freeze({
  carouselElement: 'carousel-element',
  activeCarouselElement: 'carousel-visible-element',
  hiddenCarouselElement: 'carousel-hidden-element',
  carouselImage: 'carousel-image',
  carouselMainImage: 'carousel-main-image',
  carouselAltImage: 'carousel-alt-image',
  carouselText: 'carousel-text',
  carouselSlideOut: 'carousel-slide-out',
  carouselSlideIn: 'carousel-slide-in',
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

function moveCarousel(block, from, to, moveDirection) {
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

  const animationSlideIn = block.getElementsByClassName(classes.carouselSlideIn);
  [...animationSlideIn].forEach((animatedElement) => {
    animatedElement.classList.remove(classes.carouselSlideIn);
  });
  const animationSlideOut = block.getElementsByClassName(classes.carouselSlideOut);
  [...animationSlideOut].forEach((animatedElement) => {
    animatedElement.classList.remove(classes.carouselSlideOut);
  });

  if (moveDirection === direction.slideOut) {
    elementToShow.classList.add(classes.carouselSlideOut);
  } else if (moveDirection === direction.slideIn) {
    elementToShow.classList.add(classes.carouselSlideIn);
  }
}

function getPreviousIndex(currentActiveIndex, totalCarouselElements){
  let indexToShow = 0;
  if (currentActiveIndex === 0) {
    indexToShow = totalCarouselElements - 1;
  } else {
    indexToShow = currentActiveIndex - 1;
  }
  return indexToShow;
}

function showPreviousElement(block, totalCarouselElements) {
  const currentActiveIndex = getCurrentActiveIndex(block);
  if (currentActiveIndex === null) {
    return;
  }

  let indexToShow = getPreviousIndex(currentActiveIndex, totalCarouselElements);
  moveCarousel(block, currentActiveIndex, indexToShow, direction.slideOut);
}

function getNextIndex(currentActiveIndex, totalCarouselElements){
  let indexToShow = currentActiveIndex + 1;
  if (indexToShow === totalCarouselElements) {
    indexToShow = 0;
  }
  return indexToShow;
}

function showNextElement(block, totalCarouselElements) {
  const currentActiveIndex = getCurrentActiveIndex(block);
  if (currentActiveIndex === null) {
    return;
  }

  let indexToShow = getNextIndex(currentActiveIndex, totalCarouselElements);
  moveCarousel(block, currentActiveIndex, indexToShow, direction.slideIn);
}

function addSwipeCapability(block, intervalId, totalCarouselElements) {
  let touchstartX = 0;
  let touchendX = 0;
  let offset = 0;

  block.addEventListener('touchstart', (event) => {
    touchstartX = event.changedTouches[0].screenX;
  }, { passive: true });

  block.addEventListener('touchmove', (event) => {
    offset = event.changedTouches[0].screenX - touchstartX;
    const activeCarouselQueryResult = block.getElementsByClassName(classes.activeCarouselElement);
    if (activeCarouselQueryResult.length !== 1) {
      return;
    }

    const currentMovingIndex = getCurrentActiveIndex(block);
    console.log("Current moving index is: ", currentMovingIndex);

    const currentActiveCarouselElement = activeCarouselQueryResult[0];
    currentActiveCarouselElement.style.transform = `translate(${offset}px)`;
    currentActiveCarouselElement.classList.add('is-moving');
  }, { passive: true });

  block.addEventListener('touchend', (event) => {
    touchendX = event.changedTouches[0].screenX;

    const activeCarouselQueryResult = block.getElementsByClassName(classes.activeCarouselElement);
    if (activeCarouselQueryResult.length !== 1) {
      return;
    }
    const currentActiveCarouselElement = activeCarouselQueryResult[0];
    currentActiveCarouselElement.style.transform = 'translate(0)';
    currentActiveCarouselElement.classList.remove('is-moving');

    const moveSize = Math.abs(touchendX - touchstartX);
    if (moveSize < TOUCH_MIN_CHANGE_TOLERANCE) {
      return;
    }

    if (touchendX < touchstartX) {
      clearInterval(intervalId);
      showNextElement(block, totalCarouselElements);
    }
    if (touchendX > touchstartX) {
      clearInterval(intervalId);
      showPreviousElement(block, totalCarouselElements);
    }
  }, { passive: true });
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

    const mediaWidthQueryMatcher = window.matchMedia(RESPONSIVE_MEDIA_QUERY);
    const mediaWidthChangeHandler = (event) => {
      const imagesInRow = row.querySelectorAll('img');

      if (imagesInRow.length === 1) {
        const carouselImage = imagesInRow[0];
        if (event.matches === false) {
          carouselImage.closest('div').classList.add(classes.carouselImage);
          carouselImage.closest('div').classList.add(classes.carouselMainImage);
        } else {
          carouselImage.closest('div').classList.add(classes.carouselImage);
          carouselImage.closest('div').classList.add(classes.carouselAltImage);
        }
      }

      if (imagesInRow.length === 2) {
        const carouselImage = imagesInRow[0];
        carouselImage.closest('div').classList.add(classes.carouselImage);
        carouselImage.closest('div').classList.add(classes.carouselMainImage);

        const carouselAltImage = imagesInRow[1];
        carouselAltImage.closest('div').classList.add(classes.carouselImage);
        carouselAltImage.closest('div').classList.add(classes.carouselAltImage);
      }
    };
    mediaWidthChangeHandler(mediaWidthQueryMatcher);
    mediaWidthQueryMatcher.addEventListener('change', (event) => {
      mediaWidthChangeHandler(event);
    });

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

  const intervalId = null;
  // const intervalId = setInterval(() => {
  //   showNextElement(block, totalCarouselElements);
  // }, AUTOSCROLL_INTERVAL);

  addSwipeCapability(block, intervalId, totalCarouselElements);
}
