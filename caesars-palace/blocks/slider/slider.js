import { readBlockConfigWithContent } from '../../scripts/scripts.js';

const DEFAULT_CONFIG = Object.freeze({
  'visible-slides': 3,
});

const isADesktop = () => {
  const mediaDesktop = window.matchMedia('only screen and (min-width: 769px)');
  return mediaDesktop.matches;
};

function isATablet() {
  const mediaQueryTablet = window.matchMedia(
    'only screen and (min-width: 481px) and (max-width:768px)',
  );
  return mediaQueryTablet.matches;
}

const getPositionX = (event) => (event.type.includes('mouse')
  ? event.pageX
  : event.touches[0].clientX);

const setSliderPosition = (currentTranslate, slider) => {
  slider.style.transform = `translateX(${currentTranslate}px)`;
};

export default function decorate(block) {
  const blockConfig = { ...DEFAULT_CONFIG, ...readBlockConfigWithContent(block) };
  const isSpacious = block.classList.contains('spacious');

  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');

  block.querySelectorAll('div.slider > div').forEach((div) => {
    cardWrapper.appendChild(div);

    div.classList.add('card');

    const picture = div.querySelector('picture');
    if (picture) {
      picture.classList.add('card-image');
      const imageParent = picture.closest('div');
      imageParent.classList.add('card-image-parent');
    }

    const contentDivs = div.querySelectorAll(':scope > div:not(.card-image-parent)');
    contentDivs[0].classList.add('short-description', 'active');
    contentDivs[1].classList.add('long-description');

    const closeButton = document.createElement('div');
    closeButton.classList.add('close-button');
    closeButton.classList.add('hide');
    div.insertBefore(closeButton, contentDivs[1]);
  });

  block.appendChild(cardWrapper);

  const shortDescriptionDivs = block.querySelectorAll('.short-description');
  const longDescriptionDivs = block.querySelectorAll('.long-description');

  shortDescriptionDivs.forEach((div) => {
    const showMore = div.querySelector('p > strong');
    if (showMore) {
      showMore.classList.add('show-more');
    }
  });

  if (isATablet()) {
    shortDescriptionDivs.forEach((div) => {
      if (div.classList.contains('active')) {
        div.classList.toggle('active');
      }
    });

    longDescriptionDivs.forEach((div) => {
      if (!div.classList.contains('active')) {
        div.classList.toggle('active');
      }
    });
  }

  // add slider arrow buttons
  const slides = [...block.querySelectorAll('.card')];
  if (slides.length > blockConfig['visible-slides']) {
    const arrowLeft = document.createElement('div');
    arrowLeft.classList.add('slider-button', 'left');
    block.appendChild(arrowLeft);

    const arrowRight = document.createElement('div');
    arrowRight.classList.add('slider-button', 'right');
    block.appendChild(arrowRight);
  }

  const mobileMediaQuery = window.matchMedia('only screen and (max-width:768px)');
  const desktopMediaQuery = window.matchMedia('only screen and (min-width:1170px)');

  const mediaChangeHandler = () => {
    if (mobileMediaQuery.matches) {
      shortDescriptionDivs.forEach((div) => {
        if (!div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      longDescriptionDivs.forEach((div) => {
        if (div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      cardWrapper.style.width = '';
    } else {
      let totalPadding = (blockConfig['visible-slides'] - 1) * 4;
      if (desktopMediaQuery.matches) {
        totalPadding = (blockConfig['visible-slides'] - 1) * (isSpacious ? 20 : 4);
      }
      cardWrapper.style.width = `calc((100%/${blockConfig['visible-slides']} - ${totalPadding}px)`;
    }
  };

  mediaChangeHandler();
  mobileMediaQuery.addEventListener('change', mediaChangeHandler);
  desktopMediaQuery.addEventListener('change', mediaChangeHandler);

  // toggle from long to short description
  block.querySelectorAll('.close-button').forEach((button) => {
    button.addEventListener('click', () => {
      const parent = button.closest('.card');
      const shortDescription = parent.querySelector('.short-description');
      const longDescription = parent.querySelector('.long-description');
      if (!shortDescription.classList.contains('active')) {
        shortDescription.classList.toggle('active');
      }
      button.classList.add('hide');
      if (longDescription.classList.contains('active')) {
        longDescription.classList.toggle('active');
      }
    });
  });

  // toggle from short to long description
  block.querySelectorAll('.show-more').forEach((item) => {
    item.addEventListener('click', () => {
      const parent = item.closest('.card');
      const shortDescription = parent.querySelector('.short-description');
      const longDescription = parent.querySelector('.long-description');
      const closeButton = parent.querySelector('.close-button');
      if (shortDescription.classList.contains('active')) {
        shortDescription.classList.toggle('active');
      }
      closeButton.classList.remove('hide');
      if (!longDescription.classList.contains('active')) {
        longDescription.classList.toggle('active');
      }
    });
  });

  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;
  let indexFactor = 0;

  function animation() {
    setSliderPosition(currentTranslate, cardWrapper);
    if (isDragging) {
      requestAnimationFrame(animation);
    }
  }

  function touchStart(index) {
    return (event) => {
      currentIndex = index;
      startPos = getPositionX(event);
      isDragging = true;
    };
  }

  function setPositionByIndex() {
    if (currentIndex === 0) {
      currentTranslate = 0;
    } else if (currentIndex === slides.length) {
      currentTranslate = prevTranslate;
    } else {
      currentTranslate = prevTranslate - (indexFactor) * (slides[0].offsetWidth + 10);
    }
    prevTranslate = currentTranslate;
    setSliderPosition(currentTranslate, cardWrapper);
  }

  function touchEnd() {
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    if ((!isADesktop() || slides.length > blockConfig['visible-slides'])
      && movedBy < 0 && currentIndex < slides.length) {
      currentIndex += 1;
      indexFactor = 1;
    }
    if ((!isADesktop() || slides.length > blockConfig['visible-slides'])
      && movedBy > 0 && currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
    }

    if (movedBy !== 0) {
      setPositionByIndex();
    }
    cancelAnimationFrame(animationID);
  }

  block.querySelector('.slider-button.left')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
      setPositionByIndex();
    }
  });

  block.querySelector('.slider-button.right')?.addEventListener('click', () => {
    if (slides.length - currentIndex > blockConfig['visible-slides']) {
      currentIndex += 1;
      indexFactor = 1;
      setPositionByIndex();
    }
  });

  function touchMove(event) {
    if (isDragging) {
      animationID = requestAnimationFrame(animation);
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  // Card slider animation
  slides.forEach((slide, index) => {
    const slideImage = slide.querySelector('img');
    slideImage?.addEventListener('dragstart', (e) => e.preventDefault());
    slide.addEventListener('touchstart', touchStart(index), {
      passive: true,
    });
    slide.addEventListener('touchend', touchEnd, { passive: true });
    slide.addEventListener('touchmove', touchMove, { passive: true });
    slide.addEventListener('mousedown', touchStart(index), {
      passive: true,
    });
    slide.addEventListener('mouseup', touchEnd, { passive: true });
    slide.addEventListener('mouseleave', touchEnd, { passive: true });
    slide.addEventListener('mousemove', touchMove, { passive: true });
  });
}
