/**
 * Carousel Block
 *
 * Features:
 * - smooth scrolling
 * - mouse drag between slides
 * - TODO: swipe between slides
 * - TODO: allow endless swiping/sliding
 * - next and previous navigation button
 */

const DEFAULT_SCROLL_INTERVAL = 5000;
const SLIDE_CAPTION_SIZE = 64;
const SLIDE_ID_PREFIX = 'carousel-slide';
const SLIDE_CONTROL_ID_PREFIX = 'carousel-slide-control';

let resizeTimeout;
let scrollInterval;
let curSlide = 0;
let maxSlide = 0;

/**
 * Clear any active scroll intervals
 */
function stopAutoScroll() {
  clearInterval(scrollInterval);
  scrollInterval = undefined;
}

/**
 * Count how many lines a block of text will consume when wrapped within a container
 * that has a maximum width.
 * @param text The full text
 * @param width Width of container
 * @param options Options to be applied to context (eg. font style)
 *
 * @return {number} The number of lines
 */
function getLineCount(text, width, options = {}) {
  // re-use canvas object for better performance
  const canvas = getLineCount.canvas || (getLineCount.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  Object.entries(options).forEach(([key, value]) => {
    if (key in context) {
      context[key] = value;
    }
  });
  const words = text.split(' ');
  let testLine = '';
  let lineCount = 1;
  words.forEach((w, index) => {
    testLine += `${w} `;
    const { width: testWidth } = context.measureText(testLine);
    if (testWidth > width && index > 0) {
      lineCount += 1;
      testLine = `${w} `;
    }
  });
  return lineCount;
}

/**
 * Calculate the actual height of a slide based on its contents.
 *
 * @param carousel The carousel
 * @param slide A slide within the carousel
 */
function calculateSlideHeight(carousel, slide) {
  requestAnimationFrame(() => {
    const slideBody = slide.querySelector('div');
    const bodyStyle = window.getComputedStyle(slideBody);
    const textOptions = {
      font: `${bodyStyle.fontWeight} ${bodyStyle.fontSize} ${bodyStyle.fontFamily}`,
      letterSpacing: '0.0175em',
    };
    const lineCount = getLineCount(
      slideBody.textContent,
      parseInt(bodyStyle.width, 10),
      textOptions,
    );
    const bodyHeight = parseFloat(bodyStyle.lineHeight) * lineCount;
    carousel.style.height = `${bodyHeight + 570}px`;
  });
}

/**
 * Scroll a single slide into view.
 *
 * @param carousel The carousel
 * @param slideIndex {number} The slide index
 */
function scrollToSlide(carousel, slideIndex = 0) {
  const carouselSlider = carousel.querySelector('.carousel-slide-container');
  calculateSlideHeight(carouselSlider, carouselSlider.children[slideIndex]);
  carouselSlider.scrollTo({ left: carouselSlider.offsetWidth * slideIndex, behavior: 'smooth' });

  // sync slide
  [...carouselSlider.children].forEach((slide, index) => {
    if (index === slideIndex) {
      slide.removeAttribute('tabindex');
      slide.setAttribute('aria-hidden', 'false');
    } else {
      slide.setAttribute('tabindex', '-1');
      slide.setAttribute('aria-hidden', 'true');
    }
  });
  curSlide = slideIndex;
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
function buildNav(dir) {
  const btn = document.createElement('div');
  btn.classList.add('carousel-nav', `carousel-nav-${dir}`);
  btn.addEventListener('click', (e) => {
    let nextSlide = 0;
    if (dir === 'prev') {
      nextSlide = curSlide === 0 ? maxSlide : curSlide - 1;
    } else {
      nextSlide = curSlide === maxSlide ? 0 : curSlide + 1;
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
  if (index !== 0) {
    slide.setAttribute('tabindex', '-1');
  }

  return slide;
}

function startAutoScroll(block) {
  // TODO: Restore
  // if (!scrollInterval) {
  //   scrollInterval = setInterval(() => {
  //     scrollToSlide(block, curSlide < maxSlide ? curSlide + 1 : 0);
  //   }, DEFAULT_SCROLL_INTERVAL);
  // }
}

/**
 * Decorate and transform a carousel block.
 *
 * @param block HTML block from Franklin
 */
export default function decorate(block) {
  const carousel = document.createElement('div');
  carousel.classList.add('carousel-slide-container');

  // make carousel draggable
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let prevScroll = 0;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    startScroll = carousel.scrollLeft;
    prevScroll = startScroll;
  });

  carousel.addEventListener('mouseenter', () => {
    stopAutoScroll();
  });

  carousel.addEventListener('mouseleave', () => {
    if (isDown) {
      snapScroll(carousel, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    startAutoScroll(block);
    isDown = false;
  });

  carousel.addEventListener('mouseup', () => {
    if (isDown) {
      snapScroll(carousel, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    isDown = false;
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX);
    carousel.scrollLeft = prevScroll - walk;
  });

  // process each slide
  const slides = [...block.children];
  maxSlide = slides.length - 1;
  slides.forEach((slide, index) => {
    carousel.appendChild(buildSlide(slide, index));
  });

  // add decorated carousel to block
  block.append(carousel);

  // calculate height of first slide
  calculateSlideHeight(carousel, slides[0]);

  // add nav buttons and dots to block
  if (slides.length > 1) {
    const prevBtn = buildNav('prev');
    const nextBtn = buildNav('next');
    block.append(prevBtn, nextBtn);
  }

  // auto scroll when visible
  const intersectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  };

  const handleAutoScroll = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoScroll(block);
      } else {
        stopAutoScroll();
      }
    });
  };

  const carouselObserver = new IntersectionObserver(handleAutoScroll, intersectionOptions);
  carouselObserver.observe(block);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoScroll();
    } else {
      startAutoScroll(block);
    }
  });

  window.addEventListener('resize', () => {
    // clear the timeout
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => calculateSlideHeight(carousel, slides[curSlide]), 500);
  });
}