import { readBlockConfigWithContent, buildEllipsis } from '../../scripts/scripts.js';

const DEFAULT_CONFIG = Object.freeze({
  'visible-slides': 3,
  maxlines: 3,
  ellipsis: '...more',
});

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
  const blockConfig = { ...DEFAULT_CONFIG, ...readBlockConfigWithContent(block) };
  const isSpacious = block.classList.contains('spacious');

  const cardWrapper = document.createElement('div');
  cardWrapper.classList.add('card-wrapper');
  block.querySelectorAll('div.slider > div').forEach((div) => {
    cardWrapper.appendChild(div);
    div.classList.add('card');
    const picture = div.querySelector('picture');
    if (picture) {
      const imageParent = picture.closest('div');
      imageParent.classList.add('card-image');
      div.classList.add('tall-card');
    }

    const contentDivs = div.querySelectorAll(':scope > div:not(.card-image)');
    contentDivs[0].classList.add('short-description');
  });

  block.appendChild(cardWrapper);

  setTimeout(() => {
    const shortDescriptionDivs = block.querySelectorAll('.short-description');
    shortDescriptionDivs.forEach((div) => {
      const ellipsableText = div.querySelector('p');
      if (!ellipsableText) return;

      const textStyle = window.getComputedStyle(div);
      const textOptions = {
        font: `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`,
        letterSpacing: `${textStyle.letterSpacing}`,
      };

      const displayBufferPixels = 16;
      const textContentWidth = div.offsetWidth - displayBufferPixels;

      const fullTextContent = ellipsableText.innerText;
      if (!fullTextContent) return;

      const ellipsisBuilder = buildEllipsis(
        fullTextContent,
        textContentWidth,
        blockConfig.maxlines,
        blockConfig.ellipsis,
        textOptions,
      );

      if (ellipsisBuilder.lineCount > blockConfig.maxlines) {
        const clickableCloseButton = document.createElement('span');
        const clickableEllipsis = document.createElement('span');

        clickableCloseButton.classList.add('hidden-close-button');
        clickableEllipsis.classList.add('clickable-ellipsis');

        clickableCloseButton.innerHTML = '';
        clickableCloseButton.classList.add('close-button');
        clickableEllipsis.innerHTML = blockConfig.ellipsis;
        ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;

        ellipsableText.append(clickableEllipsis);
        div.append(clickableCloseButton);

        clickableEllipsis.addEventListener('click', () => {
          div.classList.add('extended-text');
          ellipsableText.innerHTML = `${fullTextContent}`;
          clickableCloseButton.classList.remove('hidden-close-button');
          clickableCloseButton.classList.add('active-close-button');
        });
        clickableCloseButton.addEventListener('click', () => {
          div.classList.remove('extended-text');
          ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;
          ellipsableText.append(clickableEllipsis);
          clickableCloseButton.classList.remove('active-close-button');
          clickableCloseButton.classList.add('hidden-close-button');
        });
      }
    });
  }, 0);

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
  const tabletMediaQuery = window.matchMedia('only screen and (min-width:769px) and (max-width:1169px)');
  const desktopMediaQuery = window.matchMedia('only screen and (min-width:1170px)');
  const originalText = [];

  const mediaChangeHandler = () => {
    if (desktopMediaQuery.matches) {
      setTimeout(() => {
        const shortDescriptionDivs = block.querySelectorAll('.slider > .card-wrapper > .card > .short-description');
        shortDescriptionDivs.forEach((div, index) => {
          const ellipsableText = div.querySelector('p');
          console.log('ellipsabletext = ' + ellipsableText.innerHTML);
          if (!ellipsableText) return;
          const span = ellipsableText.querySelector('span');
          if (span && originalText[index]) {
            ellipsableText.removeChild(span);
            ellipsableText.innerHTML = originalText[index];
          }

          const textStyle = window.getComputedStyle(div);
          const textOptions = {
            font: `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`,
            letterSpacing: `${textStyle.letterSpacing}`,
          };

          const displayBufferPixels = 16;
          const textContentWidth = div.offsetWidth - displayBufferPixels;
          const fullText = originalText[index] ? originalText[index] : ellipsableText.innerText;
          if (!fullText) return;

          const ellipsisBuilder = buildEllipsis(
            fullText,
            textContentWidth,
            blockConfig.maxlines,
            blockConfig.ellipsis,
            textOptions,
          );
          if (ellipsisBuilder.lineCount > blockConfig.maxlines) {
            const clickableCloseButton = document.createElement('span');
            const clickableEllipsis = document.createElement('span');

            clickableCloseButton.classList.add('hidden-close-button');
            clickableEllipsis.classList.add('clickable-ellipsis');

            clickableCloseButton.innerHTML = '';
            clickableCloseButton.classList.add('close-button');
            clickableEllipsis.innerHTML = blockConfig.ellipsis;
            ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;
            ellipsableText.append(clickableEllipsis);
            div.append(clickableCloseButton);

            clickableEllipsis.addEventListener('click', () => {
              div.classList.add('extended-text');
              ellipsableText.innerHTML = `${fullText}`;
              clickableCloseButton.classList.remove('hidden-close-button');
              clickableCloseButton.classList.add('active-close-button');
            });
            clickableCloseButton.addEventListener('click', () => {
              div.classList.remove('extended-text');
              ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;
              ellipsableText.append(clickableEllipsis);
              clickableCloseButton.classList.remove('active-close-button');
              clickableCloseButton.classList.add('hidden-close-button');
            });
          }
        });
      }, 0);
    }
    if (tabletMediaQuery.matches) {
      const shortDescriptionDivs = block.querySelectorAll('.slider > .card-wrapper > .card > .short-description');
      shortDescriptionDivs.forEach((div) => {
        const ellipsableText = div.querySelector('p');
        if (!ellipsableText) return;

        const textStyle = window.getComputedStyle(div);
        const textOptions = {
          font: `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`,
          letterSpacing: `${textStyle.letterSpacing}`,
        };

        const displayBufferPixels = 16;
        const textContentWidth = div.offsetWidth - displayBufferPixels;
        const fullTextContent = ellipsableText.innerText;
        if (!fullTextContent) return;
        originalText.push(fullTextContent);
        const ellipsisBuilder = buildEllipsis(
          fullTextContent,
          textContentWidth,
          2,
          blockConfig.ellipsis,
          textOptions,
        );
        if (ellipsisBuilder.lineCount > 2) {
          const clickableCloseButton = document.createElement('span');
          const clickableEllipsis = document.createElement('span');

          clickableCloseButton.classList.add('hidden-close-button');
          clickableEllipsis.classList.add('clickable-ellipsis');

          clickableCloseButton.innerHTML = '';
          clickableCloseButton.classList.add('close-button');
          clickableEllipsis.innerHTML = blockConfig.ellipsis;
          ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;
          ellipsableText.append(clickableEllipsis);
          div.append(clickableCloseButton);

          clickableEllipsis.addEventListener('click', () => {
            div.classList.add('extended-text');
            ellipsableText.innerHTML = `${fullTextContent}`;
            clickableCloseButton.classList.remove('hidden-close-button');
            clickableCloseButton.classList.add('active-close-button');
          });
          clickableCloseButton.addEventListener('click', () => {
            div.classList.remove('extended-text');
            ellipsableText.innerHTML = `${ellipsisBuilder.shortText}`;
            ellipsableText.append(clickableEllipsis);
            clickableCloseButton.classList.remove('active-close-button');
            clickableCloseButton.classList.add('hidden-close-button');
          });
        }
      });
    }
    if (mobileMediaQuery.matches) {
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
  tabletMediaQuery.addEventListener('change', mediaChangeHandler);
  mobileMediaQuery.addEventListener('change', mediaChangeHandler);
  desktopMediaQuery.addEventListener('change', mediaChangeHandler);

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
