/**
 * Carousel Block
 *
 * Features:
 * - smooth scrolling
 * - mouse drag between slides
 * - swipe between slides
 * - allow endless sliding
 * - next and previous navigation button
 */

import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const DEFAULT_SCROLL_INTERVAL_MS = 5000;
const SLIDE_ID_PREFIX = 'carousel-slide';
const NAVIGATION_DIRECTION_PREV = 'prev';
const NAVIGATION_DIRECTION_NEXT = 'next';
const SLIDE_ANIMATION_DURATION_MS = 640;

const firstVisibleSlide = 1;
let scrollInterval;
let curSlide = 1;
let maxVisibleSlides = 0;

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

/**
 * Clear any active scroll intervals
 */
function stopAutoScroll() {
  clearInterval(scrollInterval);
  scrollInterval = undefined;
}

/**
 * Scroll a single slide into view.
 *
 * @param carousel The carousel
 * @param slideIndex {number} The slide index
 */
function scrollToSlide(carousel, slideIndex = 1, scrollBehavior = 'smooth') {
  const carouselSlider = carousel.querySelector('.carousel-slide-container');

  let leftSlideOffset;
  const realSlideWidth = carouselSlider.offsetWidth * 0.9;
  const slidePadding = 32;
  const realSlideWidthWithPadding = realSlideWidth + slidePadding;
  const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
  const paddingFix = 16;

  if (slideIndex >= firstVisibleSlide && slideIndex <= maxVisibleSlides) {
    console.log("1")

    // normal sliding
    console.log("normal sliding: carouselSlider.offsetWidth: ", carouselSlider.offsetWidth);
    console.log("normal sliding: realSlideWidth", realSlideWidth);
    console.log("normal sliding: slidePadding", slidePadding);
    console.log("normal sliding: realSlideWidthWithPadding", realSlideWidthWithPadding);
    console.log("normal sliding: translationCorrection", translationCorrection);
    console.log("-----");

    leftSlideOffset = carouselSlider.offsetWidth * slideIndex - translationCorrection * slideIndex - paddingFix;
    carouselSlider.scrollTo({
      left: leftSlideOffset,
      behavior: scrollBehavior,
    });
    console.log("normal sliding: Left slided offset: ", leftSlideOffset);
    console.log("------------------------------");

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === slideIndex) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    curSlide = slideIndex;
  } else if (slideIndex === 0) {
    console.log("Sliding from first to last (backwards)")

    // sliding from first to last
    console.log("backwards first->last sliding step 1: carouselSlider.offsetWidth: ", carouselSlider.offsetWidth);
    console.log("backwards first->last sliding step 1: realSlideWidth", realSlideWidth);
    console.log("backwards first->last sliding step 1: slidePadding", slidePadding);
    console.log("backwards first->last sliding step 1: realSlideWidthWithPadding", realSlideWidthWithPadding);
    console.log("backwards first->last sliding step 1: translationCorrection", translationCorrection);
    console.log("-----");

    leftSlideOffset = carouselSlider.offsetWidth * slideIndex - translationCorrection * slideIndex - paddingFix;
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });
    console.log("backwards first->last sliding step 1: Left slided offset for smooth slide: ", leftSlideOffset);
    console.log("-----");
    console.log("-----");

    console.log("backwards first->last sliding step 2: carouselSlider.offsetWidth: ", carouselSlider.offsetWidth);
    console.log("backwards first->last sliding step 2: realSlideWidth", realSlideWidth);
    console.log("backwards first->last sliding step 2: slidePadding", slidePadding);
    console.log("backwards first->last sliding step 2: realSlideWidthWithPadding", realSlideWidthWithPadding);
    console.log("backwards first->last sliding step 2: translationCorrection", translationCorrection);
    console.log("-----");

    leftSlideOffset = carouselSlider.offsetWidth * maxVisibleSlides - translationCorrection * maxVisibleSlides - paddingFix;
    setTimeout(() => carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' }), SLIDE_ANIMATION_DURATION_MS);
    console.log("backwards first->last sliding step 2: Left slided offset for instant slide: ", leftSlideOffset);
    console.log("------------------------------");

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === maxVisibleSlides) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    curSlide = maxVisibleSlides;
  } else if (slideIndex === maxVisibleSlides + 1) {
    // sliding from last to first
    console.log("Sliding from last to first (looping)")

    console.log("looping last->first sliding step 1: carouselSlider.offsetWidth: ", carouselSlider.offsetWidth);
    console.log("looping last->first sliding step 1: realSlideWidth", realSlideWidth);
    console.log("looping last->first sliding step 1: slidePadding", slidePadding);
    console.log("looping last->first sliding step 1: realSlideWidthWithPadding", realSlideWidthWithPadding);
    console.log("looping last->first sliding step 1: translationCorrection", translationCorrection);
    console.log("-----");

    leftSlideOffset = carouselSlider.offsetWidth * slideIndex - translationCorrection * slideIndex - paddingFix;
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });
    console.log("looping last->first sliding step 1: Left slided offset for smooth slide: ", leftSlideOffset);
    console.log("-----");
    console.log("-----");

    console.log("looping last->first sliding step 2: carouselSlider.offsetWidth: ", carouselSlider.offsetWidth);
    console.log("looping last->first sliding step 2: realSlideWidth", realSlideWidth);
    console.log("looping last->first sliding step 2: slidePadding", slidePadding);
    console.log("looping last->first sliding step 2: realSlideWidthWithPadding", realSlideWidthWithPadding);
    console.log("looping last->first sliding step 2: translationCorrection", translationCorrection);
    console.log("-----");

    leftSlideOffset = carouselSlider.offsetWidth * firstVisibleSlide - translationCorrection * firstVisibleSlide - paddingFix;
    setTimeout(() => carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' }), SLIDE_ANIMATION_DURATION_MS);
    console.log("looping last->first sliding step 2: Left slided offset for instant slide: ", leftSlideOffset);
    console.log("------------------------------");

    // sync slide state
    [...carouselSlider.children].forEach((slide, index) => {
      if (index === firstVisibleSlide) {
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('tabindex', '-1');
      }
    });
    curSlide = firstVisibleSlide;
  }
}

/**
 * Based on the direction of a scroll snap the scroll position based on the
 * offset width of the scrollable element. The snap threshold is determined
 * by the direction of the scroll to ensure that snap direction is natural.
 *
 * @param el the scrollable element
 * @param dir the direction of the scroll
 */
function snapScroll(el, dir = 1) {
  if (!el) {
    return;
  }
  let threshold = el.offsetWidth * 0.5;
  if (dir >= 0) {
    threshold -= (threshold * 0.5);
  } else {
    threshold += (threshold * 0.5);
  }
  const block = Math.floor(el.scrollLeft / el.offsetWidth);
  const pos = el.scrollLeft - (el.offsetWidth * block);
  const snapToBlock = pos <= threshold ? block : block + 1;
  const carousel = el.closest('.carousel');
  scrollToSlide(carousel, snapToBlock);
}

/**
 * Build a navigation button for controlling the direction of carousel slides.
 *
 * @param dir A string of either 'prev or 'next'
 * @return {HTMLDivElement} The resulting nav element
 */
async function buildNav(navigationDirection) {
  const btn = document.createElement('div');

  let chevron;
  if (navigationDirection === NAVIGATION_DIRECTION_PREV) {
    chevron = await getChevronSvg('icons/chevron-left.svg');
  } else if (navigationDirection === NAVIGATION_DIRECTION_NEXT) {
    chevron = await getChevronSvg('icons/chevron-right.svg');
  }
  const chevronButton = document.createElement('span');
  chevronButton.innerHTML = chevron;
  btn.appendChild(chevronButton);

  btn.classList.add('carousel-nav', `carousel-nav-${navigationDirection}`);
  btn.addEventListener('click', (e) => {
    let nextSlide = firstVisibleSlide;

    if (navigationDirection === NAVIGATION_DIRECTION_PREV) {
      nextSlide = curSlide === firstVisibleSlide ? 0 : curSlide - 1;
    } else if (navigationDirection === NAVIGATION_DIRECTION_NEXT) {
      nextSlide = curSlide === maxVisibleSlides ? maxVisibleSlides + 1 : curSlide + 1;
    }

    const carousel = e.target.closest('.carousel');
    stopAutoScroll();
    scrollToSlide(carousel, nextSlide);
  });
  return btn;
}

/**
 * Decorate a base slide element.
 *
 * @param slide A base block slide element
 * @param index The slide's position
 * @return {HTMLUListElement} A decorated carousel slide element
 */
function buildSlide(slide, index) {
  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  slide.setAttribute('role', 'tabpanel');
  if (index !== firstVisibleSlide) {
    slide.setAttribute('tabindex', '-1');
  }

  if (index === firstVisibleSlide
    || index === firstVisibleSlide + 1) {
    slide.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
  }

  slide.classList.add('carousel-slide');

  // build image slider content
  slide.children[0].classList.add('carousel-main-image');
  const slideAltImage = slide.children[1];
  if (!slideAltImage.classList.contains('carousel-alt-video')) {
    slideAltImage.classList.add('carousel-alt-image');
  }
  slide.children[2].classList.add('carousel-text');

  // slide positioning
  slide.style.transform = `translateX(calc(${index * 100}%))`;
  return slide;
}

/**
 * Updates load setting for images in a slide
 * @param {*} slideId Id of the slide to update
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
  clone.id = `data-slide-index${targetIndex}`;
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
 * Defaults to DEFAULT_SCROLL_INTERVAL_MS
 */
function startAutoScroll(block, interval) {
  if (interval === 0) return;

  if (!scrollInterval) {
    scrollInterval = setInterval(() => {
      const targetSlide = curSlide <= maxVisibleSlides ? curSlide + 1 : 0;
      scrollToSlide(block, targetSlide);
    }, interval || DEFAULT_SCROLL_INTERVAL_MS);
  }
}

/**
 * Decorate and transform a carousel block.
 *
 * @param block HTML block from Franklin
 */
export default async function decorate(block) {
  let scrollDisplayTime = DEFAULT_SCROLL_INTERVAL_MS;

  // first line is configuration of display time per carousel element
  const configuredScrollDisplayTime = parseInt(block.children[0].innerText, 10);
  if (!Number.isNaN(configuredScrollDisplayTime)
    && Number.isInteger(configuredScrollDisplayTime)) {
    scrollDisplayTime = configuredScrollDisplayTime * 1000;
  }
  block.children[0].remove();

  // turn video links into displayable videos
  block.querySelectorAll('a').forEach((videoLink) => {
    const foundLink = videoLink.href;
    if (foundLink && foundLink.endsWith('.mp4')) {
      const videoDiv = document.createElement('div');
      videoDiv.classList.add('carousel-video');

      const videoElement = document.createElement('video');
      videoElement.innerHTML = `<source src="${foundLink}" type="video/mp4">`;
      videoElement.muted = true;

      const divToReplace = videoLink.closest('div');
      divToReplace.classList.add('carousel-alt-video');

      videoDiv.appendChild(videoElement);
      divToReplace.appendChild(videoElement);
      videoLink.remove();
    }
  });

  // now, let's build the carousel
  const carousel = document.createElement('div');
  carousel.classList.add('carousel-slide-container');

  // add carousel to page
  const slides = [...block.children];
  maxVisibleSlides = slides.length;
  const slidesToAdd = new Array(maxVisibleSlides);
  slides.forEach((slide, index) => {
    slidesToAdd[index] = buildSlide(slide, index + 1);
  });
  carousel.append(...slidesToAdd);
  addClones(carousel);
  block.append(carousel);
  setTimeout(() => {
    console.log("Initial scroll: ON");
    scrollToSlide(block, firstVisibleSlide, 'instant');
  }, 0);

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
  carousel.addEventListener('mousedown', (e) => {
    movementStartEventHandler(e);
  });
  carousel.addEventListener('touchstart', (e) => {
    movementStartEventHandler(e);
  }, { passive: true });

  carousel.addEventListener('mouseenter', () => {
    stopAutoScroll();
  });
  carousel.addEventListener('mouseleave', () => {
    if (isDown) {
      snapScroll(carousel, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    startAutoScroll(block, scrollDisplayTime);
    isDown = false;
  });

  const movementEndEventHandler = () => {
    if (isDown) {
      snapScroll(carousel, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    isDown = false;
  };
  carousel.addEventListener('mouseup', () => {
    movementEndEventHandler();
  });
  carousel.addEventListener('touchend', () => {
    movementEndEventHandler();
  }, { passive: true });

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

  const mediaSmallWidthQueryMatcher = window.matchMedia('(max-width: 768px)');
  const mediaSmallWidthChangeHandler = (event) => {
    if (event.matches === true) {
      block.querySelectorAll('img').forEach((image) => {
        image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '768' }]));
      });
      setImageEagerLoading(block, 'carousel-slide0');
      setImageEagerLoading(block, 'carousel-slide1');
    }
  };
  mediaSmallWidthChangeHandler(mediaSmallWidthQueryMatcher);
  mediaSmallWidthQueryMatcher.addEventListener('change', mediaSmallWidthChangeHandler);

  const mediaMediumWidthQueryMatcher = window.matchMedia('(min-width: 769px) and (max-width: 960px)');
  const mediaMediumWidthChangeHandler = (event) => {
    if (event.matches === true) {
      block.querySelectorAll('img').forEach((image) => {
        image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '960' }]));
      });
      setImageEagerLoading(block, 'carousel-slide0');
      setImageEagerLoading(block, 'carousel-slide1');
    }
  };
  mediaMediumWidthChangeHandler(mediaMediumWidthQueryMatcher);
  mediaMediumWidthQueryMatcher.addEventListener('change', mediaMediumWidthChangeHandler);

  const mediaLargeWidthQueryMatcher = window.matchMedia('(min-width: 961px) and (max-width: 1170px)');
  const mediaLargeWidthChangeHandler = (event) => {
    if (event.matches === true) {
      block.querySelectorAll('img').forEach((image) => {
        image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '1170' }]));
      });
      setImageEagerLoading(block, 'carousel-slide0');
      setImageEagerLoading(block, 'carousel-slide1');
    }
  };
  mediaLargeWidthChangeHandler(mediaLargeWidthQueryMatcher);
  mediaLargeWidthQueryMatcher.addEventListener('change', (event) => {
    mediaLargeWidthChangeHandler(event);
  });

  const mediaExtraLargeWidthQueryMatcher = window.matchMedia('(min-width: 1171px) and (max-width: 1440px)');
  const mediaExtraLargeWidthChangeHandler = (event) => {
    if (event.matches === true) {
      block.querySelectorAll('img').forEach((image) => {
        image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '1440' }]));
      });
      setImageEagerLoading(block, 'carousel-slide0');
      setImageEagerLoading(block, 'carousel-slide1');
    }
  };
  mediaExtraLargeWidthChangeHandler(mediaExtraLargeWidthQueryMatcher);
  mediaExtraLargeWidthQueryMatcher.addEventListener('change', mediaExtraLargeWidthChangeHandler);

  const mediaVideoWidthQueryMatcher = window.matchMedia('only screen and (max-width: 1170px)');
  const mediaVideoWidthChangeHandler = async (event) => {
    if (event.matches === false) {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.muted = true;
        videoElement.autoplay = false;
        videoElement.loop = false;
        videoElement.playsinline = false;
      });
      if (slides.length > 1) {
        console.log("## Building nav buttons");
        const prevBtn = await buildNav('prev');
        const nextBtn = await buildNav('next');
        block.append(prevBtn, nextBtn);
      }
    } else {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.playsinline = true;
        videoElement.muted = true;
        videoElement.play();
      });
      if (slides.length > 1) {
        const prevBtn = await buildNav('prev');
        const nextBtn = await buildNav('next');
        block.append(prevBtn, nextBtn);
      }
    }
  };
  mediaVideoWidthChangeHandler(mediaVideoWidthQueryMatcher);
  mediaVideoWidthQueryMatcher.addEventListener('change', mediaLargeWidthChangeHandler);

  // auto scroll when visible only
  const intersectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  };
  const handleAutoScroll = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoScroll(block, scrollDisplayTime);
      } else {
        stopAutoScroll();
      }
    });
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      handleAutoScroll(entries);
    }
  }, intersectionOptions);
  observer.observe(block);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoScroll();
    } else {
      startAutoScroll(block, scrollDisplayTime);
    }
  });
}
