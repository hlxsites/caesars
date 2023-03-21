export default function decorate(block) {
  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');

  function isADesktop() {
    const mediaDesktop = window.matchMedia('only screen and (min-width: 769px)');
    return mediaDesktop.matches;
  }

  // default value is 3
  let numberOfCardsDisplayed = 3;
  block.querySelectorAll('div.slider-card > div').forEach((div, idx) => {
    // We do not need to add a class to the first div as it includes the number of
    // cards we wish to display
    if (idx === 0) {
      numberOfCardsDisplayed = div.children[0].innerHTML;
      div.style.display = 'none';
      if (isADesktop()) {
        const sliderCard = block;
        sliderCard.style = `width: calc((100%/${numberOfCardsDisplayed} - 10px)); gap: 10px;`;
      }
      return;
    }
    div.classList.add('card');
    let index = 0;
    if (div.getElementsByTagName('picture').length > 0) {
      const imageDiv = div.children[index];
      imageDiv.children[index].children[3].classList.add('card-image');
      index += 1;
    }
    div.children[index].classList.add('short-description');
    div.children[index + 1].classList.add('long-description');

    const closeButton = document.createElement('div');
    closeButton.classList.add('close-button');
    closeButton.classList.add('hide');
    div.insertBefore(closeButton, div.children[index + 1]);
  });

  const shortDescriptionDivs = block.querySelectorAll('.short-description');
  shortDescriptionDivs.forEach((div) => {
    let showMore;
    const title = div.children[0].children[0];
    title?.classList.add('title');
    if (div.children.length >= 3) {
      [, , showMore] = div.children;
      const discount = div.children[1];
      discount.classList.add('discount');
    } else {
      [, showMore] = div.children;
    }
    if (showMore && showMore.children.length > 0) {
      showMore.children[0].classList.add('show-more');
    }
  });

  const mobileMediaQuery = window.matchMedia('only screen and (max-width:480px)');
  const mobileMediaWidthChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        div.classList.add('show');
        div.classList.remove('hide');
      });

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });
      const sliderCard = block.closest('.slider-card');
      sliderCard.style = 'width: 100%;';
    }
  };

  mobileMediaWidthChangeHandler(mobileMediaQuery);
  mobileMediaQuery.addEventListener('change', (event) => {
    mobileMediaWidthChangeHandler(event);
  });

  const mediaQuery = window.matchMedia(
    'only screen and (min-width: 481px) and (max-width:768px)',
  );

  const mediaWidthChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('show');
        div.classList.remove('hide');
      });

      const sliderCard = block.closest('.slider-card');
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
  mediaQuery.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });

  function isATablet() {
    const mediaQueryTablet = window.matchMedia(
      'only screen and (min-width: 481px) and (max-width:768px)',
    );
    return mediaQueryTablet.matches;
  }

  block.querySelectorAll('.close-button').forEach((item) => {
    item.addEventListener('click', () => {
      const parent = item.closest('.card');
      const shortDescription = parent.querySelector('.short-description');
      const longDescription = parent.querySelector('.long-description');
      shortDescription.classList.remove('hide');
      item.classList.add('hide');
      longDescription.classList.remove('show');
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

      shortDescription.classList.add('hide');
      closeButton.classList.remove('hide');
      longDescription.classList.add('show');
    });
  });

  if (isATablet()) {
    const shortDesriptionTabletDivs = block.querySelectorAll('.short-description');
    shortDesriptionTabletDivs.forEach((div) => {
      div.classList.add('hide');
      div.classList.remove('show');
    });

    const longDescriptionDivs = block.querySelectorAll('.long-description');
    longDescriptionDivs.forEach((div) => {
      div.classList.add('show');
      div.classList.remove('hide');
    });
  }

  const slider = block.closest('.slider-card');
  const sliderWrapper = block.closest('.slider-card-wrapper');
  const slides = Array.from(block.querySelectorAll('.card'));
  if (slides.length > numberOfCardsDisplayed) {
    const chevronLeft = document.createElement('div');
    chevronLeft.classList.add('chevron-left');

    sliderWrapper.insertBefore(chevronLeft, slider);

    const chevronLeftDiv = sliderWrapper.querySelector('.chevron-left');
    const chevronLeftSvg = document.createElement('span');
    chevronLeftSvg.classList.add('chevron-left-svg');
    chevronLeftDiv.appendChild(chevronLeftSvg);

    const chevronRight = document.createElement('div');
    chevronRight.classList.add('chevron-right');

    sliderWrapper.appendChild(chevronRight);
    const chevronRightDiv = sliderWrapper.querySelector('.chevron-right');
    const chevronRightSvg = document.createElement('span');
    chevronRightSvg.classList.add('chevron-right-svg');
    chevronRightDiv.appendChild(chevronRightSvg);
  }

  function getPositionX(event) {
    return event.type.includes('mouse')
      ? event.pageX
      : event.touches[0].clientX;
  }

  function setSliderPosition() {
    slider.style.transform = `translateX(${currentTranslate}px)`;
  }

  function animation() {
    setSliderPosition();
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
    setSliderPosition();
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

  sliderWrapper.querySelector('.chevron-left')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
      setPositionByIndex();
    }
  });

  sliderWrapper.querySelector('.chevron-right')?.addEventListener('click', () => {
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
        div.classList.add('show');
        div.classList.remove('hide');
      });

      const sliderCard = block.closest('.slider-card');
      sliderCard.style = `width: calc((100%/${numberOfCardsDisplayed}) - 10px)`;

      const longDescriptionDivs = block.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
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
