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

  if (slideIndex >= firstVisibleSlide && slideIndex <= maxVisibleSlides) {
    // normal sliding
    carouselSlider.scrollTo({
      left: carouselSlider.offsetWidth * slideIndex,
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
    curSlide = slideIndex;
  } else if (slideIndex === 0) {
    // sliding from first to last
    carouselSlider.scrollTo({ left: carouselSlider.offsetWidth * slideIndex, behavior: 'smooth' });
    setTimeout(() => carouselSlider.scrollTo({ left: carouselSlider.offsetWidth * maxVisibleSlides, behavior: 'auto' }), SLIDE_ANIMATION_DURATION_MS);

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
    carouselSlider.scrollTo({ left: carouselSlider.offsetWidth * slideIndex, behavior: 'smooth' });
    setTimeout(() => carouselSlider.scrollTo({ left: carouselSlider.offsetWidth * firstVisibleSlide, behavior: 'auto' }), SLIDE_ANIMATION_DURATION_MS);

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
async function buildNav(navigrationDirection) {
  const btn = document.createElement('div');

  let chevron;
  if (navigrationDirection === NAVIGATION_DIRECTION_PREV) {
    chevron = await getChevronSvg('icons/chevron-left.svg');
  } else if (navigrationDirection === NAVIGATION_DIRECTION_NEXT) {
    chevron = await getChevronSvg('icons/chevron-right.svg');
  }
  const chevronButton = document.createElement('span');
  chevronButton.innerHTML = chevron;
  btn.appendChild(chevronButton);

  btn.classList.add('carousel-nav', `carousel-nav-${navigrationDirection}`);
  btn.addEventListener('click', (e) => {
    let nextSlide = firstVisibleSlide;

    if (navigrationDirection === NAVIGATION_DIRECTION_PREV) {
      nextSlide = curSlide === firstVisibleSlide ? 0 : curSlide - 1;
    } else if (navigrationDirection === NAVIGATION_DIRECTION_NEXT) {
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
  slide.classList.add('carousel-slide');
  slide.style.transform = `translateX(${index * 100}%)`;

  slide.setAttribute('role', 'tabpanel');
  if (index !== firstVisibleSlide) {
    slide.setAttribute('tabindex', '-1');
  } else {
    slide.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
  }

  // build image slider content
  const slideMainImage = slide.children[0];
  slideMainImage.classList.add('carousel-main-image');

  const slideAltImage = slide.children[1];
  if (!slideAltImage.classList.contains('carousel-alt-video')) {
    slideAltImage.classList.add('carousel-alt-image');
  }

  const slideTextImage = slide.children[2];
  slideTextImage.classList.add('carousel-text');

  return slide;
}

/**
 * Clone an existing carousel item
 * @param {Element} item carousel item to be cloned
 * @returns the clone of the carousel item
 */
function createClone(item, targetIndex) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
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

  const cloneForEnd = createClone(initialChildren[0], initialChildren.length + 1);
  element.lastChild.after(cloneForEnd);

  const cloneForBeginning = createClone(initialChildren[initialChildren.length - 1], 0);
  element.firstChild.before(cloneForBeginning);
  element.firstChild.querySelectorAll('img').forEach((image) => {
    image.loading = 'eager';
  });
}

/**
 * Start auto-scrolling
 * @param {*} block Block
 * @param {*} interval Optionel, configured time in ms to show a slide
 * Defaults to DEFAULT_SCROLL_INTERVAL_MS
 */
function startAutoScroll(block, interval) {
  const intervalToUse = interval || DEFAULT_SCROLL_INTERVAL_MS;
  if (!scrollInterval) {
    scrollInterval = setInterval(() => {
      scrollToSlide(block, curSlide < maxVisibleSlides ? curSlide + 1 : firstVisibleSlide);
    }, intervalToUse);
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
      const divToReplace = videoLink.closest('div');
      divToReplace.classList.add('carousel-alt-video');

      const videoDiv = document.createElement('div');
      videoDiv.classList.add('carousel-video');

      const videoElement = document.createElement('video');
      videoElement.innerHTML = `<source src="${videoLink.href}" type="video/mp4">`;
      videoElement.muted = true;
      videoDiv.appendChild(videoElement);

      divToReplace.appendChild(videoElement);
      videoLink.remove();
    }
  });

  // now, let's build the carousel
  const carousel = document.createElement('div');
  carousel.classList.add('carousel-slide-container');

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

  // add carousel to page
  const slides = [...block.children];
  maxVisibleSlides = slides.length;
  slides.forEach((slide, index) => {
    carousel.appendChild(buildSlide(slide, index + 1));
  });
  addClones(carousel);
  block.append(carousel);
  setTimeout(() => {
    scrollToSlide(block, firstVisibleSlide, 'instant');
  }, 0);

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaWidthChangeHandler = async (event) => {
    if (event.matches === false) {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.autoplay = false;
        videoElement.loop = false;
        videoElement.playsinline = false;
      });
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
  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });

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
      // scrollToSlide(block, firstVisibleSlide, 'instant');
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
