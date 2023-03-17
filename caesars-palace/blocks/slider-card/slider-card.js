export default function decorate(block) {
  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');
  block.querySelectorAll('div.slider-card > div').forEach((div) => {
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

  const shortDescriptionDivs = document.querySelectorAll('.short-description');
  shortDescriptionDivs.forEach((div) => {
    let showMore;
    const title = div.children[0].children[0];
    title.classList.add('title');
    if (div.children.length >= 3) {
      [, , showMore] = div.children;
      const discount = div.children[1].children[0];
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
      const shortDesriptionTabletDivs = document.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        div.classList.add('show');
        div.classList.remove('hide');
      });

      const longDescriptionDivs = document.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });
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
      const shortDesriptionTabletDivs = document.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });

      const longDescriptionDivs = document.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('show');
        div.classList.remove('hide');
      });
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

  document.querySelectorAll('.close-button').forEach((item) => {
    item.addEventListener('click', (event) => {
      const { parentNode } = event.target;
      let index = 0;
      if (parentNode.getElementsByTagName('picture').length > 0) {
        index += 1;
      }
      parentNode.children[index].classList.remove('hide');
      parentNode.children[index + 1].classList.add('hide');
      parentNode.children[index + 2].classList.remove('show');
    });
  });

  // On click, we wish to show the long description
  // instead of the short description
  document.querySelectorAll('.show-more').forEach((item) => {
    item.addEventListener('click', (event) => {
      const { parentNode } = event.target;
      let index = 0;
      // To account for cards that have an image
      if (parentNode.parentNode.parentNode.getElementsByTagName('picture').length > 0) {
        index += 1;
      }
      parentNode.parentNode.classList.add('hide');
      parentNode.parentNode.parentNode.children[index + 1].classList.remove('hide');
      parentNode.parentNode.parentNode.children[index + 2].classList.add('show');
    });
  });

  if (isATablet()) {
    const shortDesriptionTabletDivs = document.querySelectorAll('.short-description');
    shortDesriptionTabletDivs.forEach((div) => {
      div.classList.add('hide');
      div.classList.remove('show');
    });

    const longDescriptionDivs = document.querySelectorAll('.long-description');
    longDescriptionDivs.forEach((div) => {
      div.classList.add('show');
      div.classList.remove('hide');
    });
  }

  const slider = document.querySelector('.slider-card');
  const slides = Array.from(document.querySelectorAll('.card'));

  function isADesktop() {
    const mediaDesktop = window.matchMedia('only screen and (min-width: 769px)');
    return mediaDesktop.matches;
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
      currentTranslate = prevTranslate - indexFactor * slides[0].offsetWidth;
    }
    prevTranslate = currentTranslate;
    setSliderPosition();
  }

  function touchEnd() {
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    if ((!isADesktop() || slides.length > 3)
    && movedBy < -100 && currentIndex < slides.length) {
      currentIndex += 1;
      indexFactor = 1;
    }
    if ((!isADesktop() || slides.length > 3)
     && movedBy > 100 && currentIndex > 0) {
      currentIndex -= 1;
      indexFactor = -1;
    }

    setPositionByIndex();
    cancelAnimationFrame(animationID);
  }

  function moveEnd() {
    isDragging = false;
    setPositionByIndex();
    cancelAnimationFrame(animationID);
  }

  function touchMove(event) {
    if (isDragging) {
      animationID = requestAnimationFrame(animation);
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  // For desktop animation
  if (isADesktop()) {
    slider.addEventListener('mousedown', touchStart(0), {
      passive: true,
    });
    slider.addEventListener('mouseup', moveEnd, {
      passive: true,
    });
    slider.addEventListener('mouseleave', moveEnd, {
      passive: true,
    });
  }

  // Card slider animation
  slides.forEach((slide, index) => {
    const slideImage = slide.querySelector('img');
    slideImage.addEventListener('dragstart', (e) => e.preventDefault());
    slide.addEventListener('touchstart', touchStart(index), {
      passive: true,
    });
    slide.addEventListener('touchend', touchEnd, { passive: true });
    slide.addEventListener('touchmove', touchMove, { passive: true });
  });

  const mediaQueryDesktop = window.matchMedia(
    'only screen and (min-width: 769px)',
  );

  const mediaWidthDesktopChangeHandler = (event) => {
    if (event.matches) {
      const shortDesriptionTabletDivs = document.querySelectorAll('.short-description');
      shortDesriptionTabletDivs.forEach((div) => {
        div.classList.add('show');
        div.classList.remove('hide');
      });

      const longDescriptionDivs = document.querySelectorAll('.long-description');
      longDescriptionDivs.forEach((div) => {
        div.classList.add('hide');
        div.classList.remove('show');
      });
      slider.addEventListener('mousedown', touchStart(0), {
        passive: true,
      });
      slider.addEventListener('mouseup', moveEnd, {
        passive: true,
      });
      slider.addEventListener('mouseleave', moveEnd, {
        passive: true,
      });
    }
  };

  mediaWidthDesktopChangeHandler(mediaQueryDesktop);
  mediaQueryDesktop.addEventListener('change', (event) => {
    mediaWidthDesktopChangeHandler(event);
  });
}
