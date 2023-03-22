const isADesktop = () => {
  const mediaDesktop = window.matchMedia('only screen and (min-width: 769px)');
  return mediaDesktop.matches;
};

const getPositionX = (event) => (event.type.includes('mouse')
  ? event.pageX
  : event.touches[0].clientX);

const setSliderPosition = (currentTranslate, slider) => {
  slider.style.transform = `translateX(${currentTranslate}px)`;
};

export default function decorate(block) {
  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');

  // default value is 3
  let numberOfCardsDisplayed = 3;
  block.querySelectorAll('div.slider > div').forEach((div) => {
    // We do not need to add a class to the first div as it includes the number of
    // cards we wish to display
    block.classList.forEach((className) => {
      if (className.startsWith('max-visible-')) {
        // If the classname is 'max-visible-4', numberOfCardsDisplayed = 4
        numberOfCardsDisplayed = className.substring(12);
      }
    });
    block.style = `width: calc((100%/${numberOfCardsDisplayed} - 10px)); gap: 10px;`;
    div.classList.add('card');

    const picture = div.querySelector('picture');
    if (picture) {
      picture.classList.add('card-image');
      const imageParent = picture.closest('div');
      imageParent.classList.add('card-image-parent');
    }

    const contentDivs = div.querySelectorAll(':scope > div:not(.card-image-parent)');
    contentDivs[0].classList.add('short-description');
    contentDivs[0].classList.add('active');
    contentDivs[1].classList.add('long-description');

    const closeButton = document.createElement('div');
    closeButton.classList.add('close-button');
    closeButton.classList.add('hide');
    div.insertBefore(closeButton, contentDivs[1]);
  });

  const shortDescriptionDivs = block.querySelectorAll('.short-description');
  shortDescriptionDivs.forEach((div) => {
    const title = div.querySelector('h4');
    title?.classList.add('title');
    const subtitle = div.querySelector('h5');
    subtitle?.classList.add('subtitle');
    const showMore = div.querySelector('p > strong');
    if (showMore) {
      showMore.classList.add('show-more');
    }
  });

  const mobileMediaQuery = window.matchMedia('only screen and (max-width:480px)');
  const mobileMediaWidthChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        if (!div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        if (div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });
      const sliderCard = block.closest('.slider');
      sliderCard.style = 'width: 100%;';
    }
  };

  mobileMediaWidthChangeHandler(mobileMediaQuery);
  mobileMediaQuery.addEventListener('change', mobileMediaWidthChangeHandler);

  const mediaQuery = window.matchMedia(
    'only screen and (min-width: 481px) and (max-width:768px)',
  );

  const mediaWidthChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        if (div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        if (!div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      const sliderCard = block.closest('.slider');
      sliderCard.style = 'width: 100%;';
    }
  };
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;
  let indexFactor = 0;

  mediaWidthChangeHandler(mediaQuery);
  mediaQuery.addEventListener('change', mediaWidthChangeHandler);

  function isATablet() {
    const mediaQueryTablet = window.matchMedia(
      'only screen and (min-width: 481px) and (max-width:768px)',
    );
    return mediaQueryTablet.matches;
  }

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

  // On click, we wish to show the long description
  // instead of the short description
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

  if (isATablet()) {
    const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
    shortDesriptionTabletDivs.forEach((div) => {
      if (div.classList.contains('active')) {
        div.classList.toggle('active');
      }
    });

    const longDescriptionDivs = block.querySelectorAll('.long-description');
    longDescriptionDivs.forEach((div) => {
      if (!div.classList.contains('active')) {
        div.classList.toggle('active');
      }
    });
  }

  const slider = block.closest('.slider');
  const sliderWrapper = block.closest('.slider-wrapper');
  const slides = [...block.querySelectorAll('.card')];
  if (slides.length > numberOfCardsDisplayed) {
    const arrowLeft = document.createElement('div');
    arrowLeft.classList.add('slider-button');
    arrowLeft.classList.add('left');

    sliderWrapper.insertBefore(arrowLeft, slider);

    const arrowRight = document.createElement('div');
    arrowRight.classList.add('slider-button');
    arrowRight.classList.add('right');

    sliderWrapper.appendChild(arrowRight);
  }

  function animation() {
    setSliderPosition(currentTranslate, slider);
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
    setSliderPosition(currentTranslate, slider);
  }

  function touchEnd() {
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    if ((!isADesktop() || slides.length > numberOfCardsDisplayed)
    && movedBy < 0 && currentIndex < slides.length) {
      currentIndex += 1;
      indexFactor = 1;
    }
    if ((!isADesktop() || slides.length > numberOfCardsDisplayed)
      && movedBy > 0 && currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
    }

    if (movedBy !== 0) {
      setPositionByIndex();
    }
    cancelAnimationFrame(animationID);
  }

  sliderWrapper.querySelector('.slider-button.left')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
      setPositionByIndex();
    }
  });

  sliderWrapper.querySelector('.slider-button.right')?.addEventListener('click', () => {
    if (slides.length - currentIndex > numberOfCardsDisplayed) {
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

  const mediaQueryDesktop = window.matchMedia(
    'only screen and (min-width: 769px)',
  );

  const mediaWidthDesktopChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        if (!div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });

      const sliderCard = block.closest('.slider');
      sliderCard.style = `width: calc((100%/${numberOfCardsDisplayed}) - 10px)`;

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        if (div.classList.contains('active')) {
          div.classList.toggle('active');
        }
      });
      slides.forEach((slide, index) => {
        const slideImage = slide.querySelector('img');
        slideImage?.addEventListener('dragstart', (e) => e.preventDefault());
        slide.addEventListener('mousedown', touchStart(index), {
          passive: true,
        });
        slide.addEventListener('mouseup', touchEnd, { passive: true });
        slide.addEventListener('mouseleave', touchEnd, { passive: true });
        slide.addEventListener('mousemove', touchMove, { passive: true });
      });
    }
  };

  mediaWidthDesktopChangeHandler(mediaQueryDesktop);
  mediaQueryDesktop.addEventListener('change', (event) => {
    mediaWidthDesktopChangeHandler(event);
  });
}
