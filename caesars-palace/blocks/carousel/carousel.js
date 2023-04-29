/**
 * Carousel Block
 *
 * Features:
 * - smooth scrolling
 * - mouse drag between slides
 * - swipe between slides
 * - endless sliding
 * - next and previous navigation buttons
 *
 * Showcase variant only:
 * - clickable short/long text for showcase variant with close button
 * - direct selection via dots
 * - active slide indicator
 */

import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { readBlockConfigWithContent, buildEllipsis } from '../../scripts/scripts.js';

const DEFAULT_SCROLL_INTERVAL_MS = 5000;
const SLIDE_ID_PREFIX = 'carousel-slide';
const NAVIGATION_DIRECTION_PREV = 'prev';
const NAVIGATION_DIRECTION_NEXT = 'next';
const SLIDE_ANIMATION_DURATION_MS = 640;

const DEFAULT_CONFIG = Object.freeze({
  interval: DEFAULT_SCROLL_INTERVAL_MS,
});

class CarouselState {
  constructor(curSlide, interval, isShowcase, firstVisibleSlide = 1, maxVisibleSlides = 0) {
    this.firstVisibleSlide = firstVisibleSlide;
    this.maxVisibleSlides = maxVisibleSlides;
    this.curSlide = curSlide;
    this.interval = interval;
    this.isShowcase = isShowcase || false;
    this.scrollInterval = null; /* for auto-scroll interval handling */
  }
}

/**
 * Keep active dot in sync with current slide
 * @param carousel The carousel
 * @param activeSlide {number} The active slide
 */
function syncActiveDot(block, slideIndex) {
  [...block.getElementsByClassName('carousel-nav-dot')].forEach((navDot) => {
    if (navDot.id === `carousel-nav-dot-${slideIndex}`) {
      navDot.classList.add('carousel-nav-dot-active');
    } else {
      navDot.classList.remove('carousel-nav-dot-active');
    }
  });
}

/**
 * Clear any active scroll intervals
 */
function stopAutoScroll(blockState) {
  clearInterval(blockState.scrollInterval);
  blockState.scrollInterval = undefined;
}

/**
 * Scroll a single slide into view.
 * @param carousel The carousel
 * @param slideIndex {number} The slide index
 */
function scrollToSlide(carousel, blockState, slideIndex = 1, scrollBehavior = 'smooth') {
  const carouselSlider = carousel.querySelector('.carousel-slide-container');

  let widthUsage;
  let realSlideWidth;
  let slidePadding;
  let realSlideWidthWithPadding;
  let paddingFix;

  if (blockState.isShowcase) {
    widthUsage = 0.9; /* carousel-slide width */
    realSlideWidth = carouselSlider.offsetWidth * widthUsage;
    slidePadding = 32; /* carousel-slide padding-right */
    realSlideWidthWithPadding = realSlideWidth + slidePadding;
    paddingFix = 16; /* carousel-text abs(margin-left) */
  }

  if (slideIndex >= blockState.firstVisibleSlide && slideIndex <= blockState.maxVisibleSlides) {
    // normal sliding in-between slides
    let leftSlideOffset;
    if (blockState.isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex
        - translationCorrection * slideIndex
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex;
    }
    carouselSlider.scrollTo({
      left: leftSlideOffset,
      behavior: scrollBehavior,
    });

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === slideIndex) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    blockState.curSlide = slideIndex;
    syncActiveDot(carousel, blockState.curSlide);
  } else if (slideIndex === 0) {
    // sliding from first to last
    let leftSlideOffset;
    if (blockState.isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex
        - translationCorrection * slideIndex
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex;
    }
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });
    if (blockState.isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * blockState.maxVisibleSlides
        - translationCorrection * blockState.maxVisibleSlides
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * blockState.maxVisibleSlides;
    }
    setTimeout(() => {
      carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' });
      syncActiveDot(carousel, blockState.maxVisibleSlides);
    }, SLIDE_ANIMATION_DURATION_MS);

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === blockState.maxVisibleSlides) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    blockState.curSlide = blockState.maxVisibleSlides;
  } else if (slideIndex === blockState.maxVisibleSlides + 1) {
    // sliding from last to first
    let leftSlideOffset;
    if (blockState.isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex
        - translationCorrection * slideIndex
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex;
    }
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });

    if (blockState.isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * blockState.firstVisibleSlide
        - translationCorrection * blockState.firstVisibleSlide
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * blockState.firstVisibleSlide;
    }
    setTimeout(() => {
      carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' });
      syncActiveDot(carousel, blockState.firstVisibleSlide);
    }, SLIDE_ANIMATION_DURATION_MS);

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === blockState.firstVisibleSlide) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    blockState.curSlide = blockState.firstVisibleSlide;
  }
}

/**
 * Build navigation dots
 * @param slides An array of slide elements within the carousel
 * @return {HTMLUListElement} The carousel dots element
 */
function buildDots(block, blockState, slides = []) {
  const dots = document.createElement('ul');
  dots.classList.add('carousel-dots');

  const navigationDots = new Array(slides.length);
  slides.forEach((slide, index) => {
    const dotItem = document.createElement('li');
    const dotBtn = document.createElement('button');

    dotBtn.classList.add('carousel-nav-dot');
    dotBtn.setAttribute('id', `carousel-nav-dot-${index + 1}`);
    dotBtn.setAttribute('type', 'button');

    if (index + 1 === blockState.firstVisibleSlide) {
      dotBtn.setAttribute('tabindex', '0');
      dotBtn.classList.add('carousel-nav-dot-active');
    } else {
      dotBtn.setAttribute('tabindex', '-1');
    }

    dotItem.append(dotBtn);

    dotItem.addEventListener('click', () => {
      scrollToSlide(block, blockState, index + 1);
    });

    navigationDots[index] = dotItem;
  });

  dots.append(...navigationDots);

  return dots;
}

/**
 * Based on the direction of a scroll snap the scroll position based on the
 * offset width of the scrollable element. The snap threshold is determined
 * by the direction of the scroll to ensure that snap direction is natural.
 * @param el the scrollable element
 * @param dir the direction of the scroll
 */
function snapScroll(el, blockState, dir = 1) {
  if (!el) {
    return;
  }

  let snapLimit = 0.5;
  if (blockState.isShowcase) {
    snapLimit = 0.05;
  }
  let threshold = el.offsetWidth * snapLimit;
  if (dir >= 0) {
    threshold -= (threshold * snapLimit);
  } else {
    threshold += (threshold * snapLimit);
  }
  const block = Math.floor(el.scrollLeft / el.offsetWidth);
  const pos = el.scrollLeft - (el.offsetWidth * block);
  const snapToBlock = pos <= threshold ? block : block + 1;
  scrollToSlide(el.closest('.carousel'), blockState, snapToBlock);
}

/**
 * Build a navigation button for controlling the direction of carousel slides.
 * @param navigationDirection A string of either 'prev or 'next'
 * @return {HTMLDivElement} The resulting nav element
 */
function buildNav(blockState, navigationDirection) {
  const btn = document.createElement('div');
  btn.classList.add('carousel-nav', `carousel-nav-${navigationDirection}`);
  btn.addEventListener('click', (e) => {
    stopAutoScroll(blockState);
    let nextSlide = blockState.firstVisibleSlide;
    if (navigationDirection === NAVIGATION_DIRECTION_PREV) {
      nextSlide = blockState.curSlide === blockState.firstVisibleSlide
        ? 0
        : blockState.curSlide - 1;
    } else if (navigationDirection === NAVIGATION_DIRECTION_NEXT) {
      nextSlide = blockState.curSlide === blockState.maxVisibleSlides
        ? blockState.maxVisibleSlides + 1
        : blockState.curSlide + 1;
    }

    scrollToSlide(e.target.closest('.carousel'), blockState, nextSlide);
  });
  return btn;
}

/**
 * Decorate a base slide element.
 * @param slide A base block slide element
 * @param index The slide's position
 * @return {HTMLUListElement} A decorated carousel slide element
 */
function buildSlide(blockState, slide, index) {
  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  if (index !== blockState.firstVisibleSlide) {
    slide.setAttribute('tabindex', '-1');
  }

  if (index === blockState.firstVisibleSlide
    || index === blockState.firstVisibleSlide + 1) {
    slide.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
  }

  slide.classList.add('carousel-slide');

  slide.children[0].classList.add('carousel-main-image');
  const slideAltImage = slide.children[1];
  if (!slideAltImage.classList.contains('carousel-alt-video')) {
    slideAltImage.classList.add('carousel-alt-image');
  }
  if (slide.children && slide.children.length >= 2 && !!slide.children[2]) {
    slide.children[2].classList.add('carousel-text');
  }

  slide.style.transform = `translateX(calc(${index * 100}%))`;
  return slide;
}

/**
 * Updates load setting for images in a slide
 * @param block block containing slides
 * @param slideId id of the slide to update
 */
function setImageEagerLoading(block, slideId) {
  const slide = block.querySelector(`#${slideId}`);
  if (!slide) return;
  slide.querySelectorAll('img').forEach((image) => {
    image.loading = 'eager';
  });
}

/**
 * Clone an existing carousel item
 * @param {Element} item carousel item to be cloned
 * @returns the clone of the carousel item
 */
function createClone(item, targetIndex) {
  const clone = item.cloneNode(true);
  clone.setAttribute('data-slide-index', targetIndex);
  clone.style.transform = `translateX(${targetIndex * 100}%)`;
  return clone;
}

/**
 * Create clone items at the beginning and end of the carousel
 * to create the illusion of infinite scrolling
 * @param {Element} element carousel to add clones to
 */
function addClones(element) {
  if (element.children.length < 2) return;

  const initialChildren = [...element.children];

  const cloneForBeginning = createClone(initialChildren[initialChildren.length - 1], 0);
  element.firstChild.before(cloneForBeginning);
  element.firstChild.querySelectorAll('img').forEach((image) => {
    image.loading = 'eager';
  });

  const cloneForEnd = createClone(initialChildren[0], initialChildren.length + 1);
  element.lastChild.after(cloneForEnd);
}

/**
 * Start auto-scrolling
 * @param {*} block Block
 * @param {*} interval Optional, configured time in ms to show a slide
 * Defaults to DEFAULT_SCROLL_INTERVAL_MS when block is set up
 */
function startAutoScroll(block, blockState) {
  if (blockState.interval === 0) return; /* Means no auto-scrolling */

  if (!blockState.scrollInterval) {
    blockState.scrollInterval = setInterval(() => {
      const targetSlide = blockState.curSlide <= blockState.maxVisibleSlides
        ? blockState.curSlide + 1
        : 0;
      scrollToSlide(block, blockState, targetSlide);
    }, blockState.interval);
  }
}

/**
 * Decorate and transform a carousel block.
 * @param block HTML block from Franklin
 */
export default function decorate(block) {
  const blockConfig = { ...DEFAULT_CONFIG, ...readBlockConfigWithContent(block) };
  const blockState = new CarouselState(
    1,
    blockConfig.interval,
    block.classList.contains('showcase'),
    1,
    0,
  );

  // turn video links into displayable videos
  block.querySelectorAll('a').forEach((videoLink) => {
    const foundLink = videoLink.href;
    if (foundLink && foundLink.endsWith('.mp4')) {
      const divToReplace = videoLink.closest('div');
      const videoDiv = document.createElement('div');
      const videoElement = document.createElement('video');

      divToReplace.classList.add('carousel-alt-video');
      videoDiv.classList.add('carousel-video');

      videoElement.muted = true;
      videoElement.innerHTML = `<source src="${foundLink}" type="video/mp4">`;

      videoDiv.appendChild(videoElement);
      divToReplace.appendChild(videoElement);
      videoLink.remove();
    }
  });

  const carousel = document.createElement('div');
  carousel.classList.add('carousel-slide-container');

  const slides = [...block.children];
  blockState.maxVisibleSlides = slides.length;
  const slidesToAdd = new Array(blockState.maxVisibleSlides);
  slides.forEach((slide, index) => {
    slidesToAdd[index] = buildSlide(blockState, slide, index + 1);
  });

  carousel.append(...slidesToAdd);
  addClones(carousel);
  block.append(carousel);

  if (slides.length > 1) {
    const prevBtn = buildNav(blockState, 'prev');
    const nextBtn = buildNav(blockState, 'next');
    block.append(prevBtn, nextBtn);

    let navigationDots;
    if (blockState.isShowcase) {
      navigationDots = buildDots(block, blockState, slides);
      block.append(navigationDots);
    }
  }

  const mediaTextWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaTextWidthChangeHandler = (event) => {
    if (!blockState.isShowcase) return;

    if (event.matches === true) {
      // unwrap clickable slide
      const slidePanels = block.getElementsByClassName('carousel-slide');
      [...slidePanels].forEach((panel) => {
        const wrapper = panel.firstChild;
        if (wrapper && wrapper.href) {
          panel.innerHTML = wrapper.innerHTML;
        }
      });

      // build "ellipsable" text content
      const carouselTextElements = block.getElementsByClassName('carousel-text');
      [...carouselTextElements].forEach((carouselText) => {
        const textContents = carouselText.querySelectorAll('p');
        [...textContents].forEach((textContent) => {
          if (!textContent.classList.contains('button-container')) {
            const displayBufferPixels = 32;
            const textContentWidth = textContent.offsetWidth - displayBufferPixels;

            const textStyle = window.getComputedStyle(textContent);
            const fullTextContent = textContent.innerHTML;
            const ellipsisBuilder = buildEllipsis(
              fullTextContent,
              textContentWidth,
              blockConfig.maxlines,
              blockConfig.ellipsis,
              {
                font: `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`,
                letterSpacing: `${textStyle.letterSpacing}`,
              },
            );

            if (ellipsisBuilder.lineCount >= 2) {
              const clickableCloseButton = document.createElement('span');
              const clickableEllipsis = document.createElement('span');

              clickableCloseButton.classList.add('hidden-close-button');
              clickableEllipsis.classList.add('clickable-ellipsis');

              clickableEllipsis.innerHTML = blockConfig.ellipsis;
              textContent.innerHTML = `${ellipsisBuilder.shortText}`;

              textContent.append(clickableEllipsis);
              carouselText.append(clickableCloseButton);

              clickableEllipsis.addEventListener('click', () => {
                carouselText.classList.add('extended-text');
                textContent.innerHTML = `${fullTextContent}`;
                clickableCloseButton.classList.remove('hidden-close-button');
                clickableCloseButton.classList.add('active-close-button');
              });
              clickableCloseButton.addEventListener('click', () => {
                carouselText.classList.remove('extended-text');
                textContent.innerHTML = `${ellipsisBuilder.shortText}`;
                textContent.append(clickableEllipsis);
                clickableCloseButton.classList.remove('active-close-button');
                clickableCloseButton.classList.add('hidden-close-button');
              });
            }
          }
        });
      });
    } else {
      // make slide clickable
      const slidePanels = block.getElementsByClassName('carousel-slide');
      [...slidePanels].forEach((panel) => {
        let targetLink;
        let targetTitle;
        panel.querySelectorAll('a').forEach((link) => {
          // last link will always be the action button
          targetLink = link.href;
          targetTitle = link.title;
        });

        const link = document.createElement('a');
        link.classList.add('clickable-slide');
        link.href = targetLink;
        link.title = targetTitle;

        link.innerHTML = panel.innerHTML;
        panel.innerHTML = '';
        panel.append(link);
      });
    }
  };

  const mediaVideoWidthQueryMatcher = window.matchMedia('only screen and (max-width: 1170px)');
  const mediaVideoWidthChangeHandler = (event) => {
    if (event.matches === false) {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.playsinline = true;
        videoElement.muted = true;
        videoElement.play();
      });
    } else {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.muted = true;
        videoElement.autoplay = false;
        videoElement.loop = false;
        videoElement.playsinline = false;
      });
    }
  };
  mediaVideoWidthChangeHandler(mediaVideoWidthQueryMatcher);

  setTimeout(() => {
    // scroll to first slide once all DOM has been built
    scrollToSlide(block, blockState, blockState.firstVisibleSlide, 'instant');
    mediaTextWidthChangeHandler(mediaTextWidthQueryMatcher);
  }, 100);

  // make carousel draggable and swipeable
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let prevScroll = 0;
  const movementStartEventHandler = (e) => {
    let offset = 0;
    if (e.changedTouches && e.changedTouches.length >= 1) {
      offset = e.changedTouches[0].screenX;
    } else {
      offset = e.pageX;
    }
    isDown = true;
    startX = offset - carousel.offsetLeft;
    startScroll = carousel.scrollLeft;
    prevScroll = startScroll;
  };
  carousel.addEventListener('mousedown', movementStartEventHandler, { passive: true });
  carousel.addEventListener('touchstart', movementStartEventHandler, { passive: true });

  carousel.addEventListener('mouseenter', () => {
    stopAutoScroll(blockState);
  });
  carousel.addEventListener('mouseleave', () => {
    if (isDown) {
      snapScroll(carousel, blockState, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    startAutoScroll(block, blockState);
    isDown = false;
  });

  const movementEndEventHandler = () => {
    if (isDown) {
      snapScroll(carousel, blockState, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    isDown = false;
  };
  carousel.addEventListener('mouseup', movementEndEventHandler, { passive: true });
  carousel.addEventListener('touchend', movementEndEventHandler, { passive: true });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) {
      return;
    }
    e.preventDefault();

    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX);
    carousel.scrollLeft = prevScroll - walk;
  });
  carousel.addEventListener('touchmove', (e) => {
    if (!isDown) {
      return;
    }
    const x = e.changedTouches[0].screenX - carousel.offsetLeft;
    const walk = (x - startX);
    carousel.scrollLeft = prevScroll - walk;
  }, { passive: true });

  const imageSizeEventHandler = (targetWidth) => {
    block.querySelectorAll('img').forEach((image) => {
      image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: targetWidth }]));
    });
    setImageEagerLoading(block, 'carousel-slide0');
    setImageEagerLoading(block, 'carousel-slide1');
  };
  const mediaSmallWidthQueryMatcher = window.matchMedia('(max-width: 768px)');
  const mediaSmallWidthChangeHandler = (event) => {
    if (event.matches) {
      imageSizeEventHandler('768');
    }
  };
  mediaSmallWidthChangeHandler(mediaSmallWidthQueryMatcher);

  const mediaMediumWidthQueryMatcher = window.matchMedia('(min-width: 769px) and (max-width: 960px)');
  const mediaMediumWidthChangeHandler = (event) => {
    if (event.matches === true) {
      imageSizeEventHandler('960');
    }
  };
  mediaMediumWidthChangeHandler(mediaMediumWidthQueryMatcher);

  const mediaLargeWidthQueryMatcher = window.matchMedia('(min-width: 961px) and (max-width: 1170px)');
  const mediaLargeWidthChangeHandler = (event) => {
    if (event.matches === true) {
      imageSizeEventHandler('1170');
    }
  };
  mediaLargeWidthChangeHandler(mediaLargeWidthQueryMatcher);

  const mediaExtraLargeWidthQueryMatcher = window.matchMedia('(min-width: 1171px) and (max-width: 1440px)');
  const mediaExtraLargeWidthChangeHandler = (event) => {
    if (event.matches === true) {
      imageSizeEventHandler('1440');
    }
  };
  mediaExtraLargeWidthChangeHandler(mediaExtraLargeWidthQueryMatcher);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAutoScroll(block, blockState);
          mediaVideoWidthQueryMatcher.addEventListener('change', mediaVideoWidthChangeHandler);
          mediaTextWidthQueryMatcher.addEventListener('change', mediaTextWidthChangeHandler);
          mediaExtraLargeWidthQueryMatcher.addEventListener('change', mediaExtraLargeWidthChangeHandler);
          mediaLargeWidthQueryMatcher.addEventListener('change', mediaLargeWidthChangeHandler);
          mediaMediumWidthQueryMatcher.addEventListener('change', mediaMediumWidthChangeHandler);
          mediaSmallWidthQueryMatcher.addEventListener('change', mediaSmallWidthChangeHandler);
        } else {
          stopAutoScroll(blockState);
          mediaVideoWidthQueryMatcher.removeEventListener('change', mediaVideoWidthChangeHandler);
          mediaTextWidthQueryMatcher.removeEventListener('change', mediaTextWidthChangeHandler);
          mediaExtraLargeWidthQueryMatcher.removeEventListener('change', mediaExtraLargeWidthChangeHandler);
          mediaLargeWidthQueryMatcher.removeEventListener('change', mediaLargeWidthChangeHandler);
          mediaMediumWidthQueryMatcher.removeEventListener('change', mediaMediumWidthChangeHandler);
          mediaSmallWidthQueryMatcher.removeEventListener('change', mediaSmallWidthChangeHandler);
        }
      });
    }
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  });
  observer.observe(block);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoScroll(blockState);
    } else {
      startAutoScroll(block, blockState);
    }
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      scrollToSlide(block, blockState, blockState.firstVisibleSlide, 'instant');
    }, 500);
  });
}
