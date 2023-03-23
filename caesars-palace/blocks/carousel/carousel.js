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
import { readBlockConfigWithContent } from '../../scripts/scripts.js';

const DEFAULT_SCROLL_INTERVAL_MS = 5000;
const SLIDE_ID_PREFIX = 'carousel-slide';
const NAVIGATION_DIRECTION_PREV = 'prev';
const NAVIGATION_DIRECTION_NEXT = 'next';
const SLIDE_ANIMATION_DURATION_MS = 640;

const DEFAULT_CONFIG = Object.freeze({
  interval: DEFAULT_SCROLL_INTERVAL_MS,
});

const firstVisibleSlide = 1;
let scrollInterval;
let curSlide = 1;
let maxVisibleSlides = 0;
let isShowcase = false;

/**
 * Get icons of navigation buttons
 * @param {*} iconPath Icon to get
 * @returns The SVG of the icon
 */
async function getIconSvg(iconPath) {
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
 * Keep active dot in sync with current slide
 * @param carousel The carousel
 * @param activeSlide {number} The active slide
 */
function syncActiveDot(carousel, activeSlide) {

}

/**
 * Build navigation dots
 * @param slides An array of slide elements within the carousel
 * @return {HTMLUListElement} The carousel dots element
 */
function buildDots(block, slides = []) {
  const dots = document.createElement('ul');
  dots.classList.add('carousel-dots');
  dots.setAttribute('role', 'tablist');
  slides.forEach((slide, index) => {
    const dotItem = document.createElement('li');
    dotItem.setAttribute('role', 'presentation');
    const dotBtn = document.createElement('button');
    dotBtn.classList.add('carousel-nav-dot');
    dotBtn.setAttribute('id', `carousel-nav-dot-${index+1}`);
    dotBtn.setAttribute('type', 'button');
    dotBtn.setAttribute('role', 'tab');

    console.log(index)
    if (index+1 === firstVisibleSlide) {
      dotBtn.setAttribute('tabindex', '0');
      dotBtn.classList.add('carousel-nav-dot-active');
    } else {
      dotBtn.setAttribute('tabindex', '-1');
    }
    dotBtn.innerText = "";
    dotItem.append(dotBtn);

    dotItem.addEventListener('click', (e) => {
      const slideIndex = index+1;
      const otherCarouselNavDots = block.getElementsByClassName('carousel-nav-dot');

      const targetId = `carousel-nav-dot-${slideIndex}`;
      [...otherCarouselNavDots].forEach((navDot) =>{
        if(navDot.id === targetId){
          navDot.classList.add('carousel-nav-dot-active');
        } else {
          navDot.classList.remove('carousel-nav-dot-active');
        }
        scrollToSlide(block, slideIndex);
      })

    });

    dots.append(dotItem);
  });
  return dots;
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

  let widthUsage; let realSlideWidth; let slidePadding; let realSlideWidthWithPadding; let
    paddingFix;
  if (isShowcase) {
    widthUsage = 0.9; /* carousel-slide width */
    realSlideWidth = carouselSlider.offsetWidth * widthUsage;
    slidePadding = 32; /* carousel-slide padding-right */
    realSlideWidthWithPadding = realSlideWidth + slidePadding;
    paddingFix = 16; /* carousel-text abs(margin-left) */
  }

  if (slideIndex >= firstVisibleSlide && slideIndex <= maxVisibleSlides) {
    // normal sliding in-between slides
    let leftSlideOffset;
    if (isShowcase) {
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
    curSlide = slideIndex;
  } else if (slideIndex === 0) {
    // sliding from first to last
    let leftSlideOffset;
    if (isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex
        - translationCorrection * slideIndex
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex;
    }
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });
    if (isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * maxVisibleSlides
        - translationCorrection * maxVisibleSlides
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * maxVisibleSlides * maxVisibleSlides;
    }
    setTimeout(() => carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' }), SLIDE_ANIMATION_DURATION_MS);

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
    let leftSlideOffset;
    if (isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex
        - translationCorrection * slideIndex
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * slideIndex;
    }
    carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'smooth' });

    if (isShowcase) {
      const translationCorrection = carouselSlider.offsetWidth - realSlideWidthWithPadding;
      leftSlideOffset = carouselSlider.offsetWidth * firstVisibleSlide
        - translationCorrection * firstVisibleSlide
        - paddingFix;
    } else {
      leftSlideOffset = carouselSlider.offsetWidth * firstVisibleSlide * firstVisibleSlide;
    }
    setTimeout(() => carouselSlider.scrollTo({ left: leftSlideOffset, behavior: 'instant' }), SLIDE_ANIMATION_DURATION_MS);

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

  let snapLimit = 0.5;
  if (isShowcase) {
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
  const carousel = el.closest('.carousel');
  scrollToSlide(carousel, snapToBlock);
}

/**
 * Build a navigation button for controlling the direction of carousel slides.
 *
 * @param navigationDirection A string of either 'prev or 'next'
 * @return {HTMLDivElement} The resulting nav element
 */
async function buildNav(navigationDirection) {
  const btn = document.createElement('div');

  let chevron;
  if (navigationDirection === NAVIGATION_DIRECTION_PREV) {
    chevron = await getIconSvg('icons/chevron-left.svg');
  } else if (navigationDirection === NAVIGATION_DIRECTION_NEXT) {
    chevron = await getIconSvg('icons/chevron-right.svg');
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
 * Build the preview of a text with ellipsis
 * @param {String} text Text that will be shortened
 * @param {Integer} width Width of container
 * @param {Integer} maxVisibleLines Max visible lines allowed
 * @param {*} suffix Suffix to use for ellipsis
 *  (will make sure text+ellipsis fit in `maxVisibleLines`)
 * @param {*} options Text styling option
 *
 * @return The ellipsed text (without ellipsis suffix)
 */
function buildEllipsis(text, width, maxVisibleLines, suffix, options = {}) {
  const canvas = buildEllipsis.canvas || (buildEllipsis.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  Object.entries(options).forEach(([key, value]) => {
    if (key in context) {
      context[key] = value;
    }
  });

  const words = text.split(' ');
  let testLine = '';
  let lineCount = 1;

  let shortText = '';

  words.forEach((w, index) => {
    testLine += `${w} `;
    const { width: testWidth } = context.measureText(`${testLine}${suffix}`);
    if (testWidth > width && index > 0) {
      lineCount += 1;
      testLine = `${w} `;
    }

    if (lineCount <= maxVisibleLines) {
      shortText += `${w} `;
    }
  });

  return {
    lineCount: lineCount,
    shortText: shortText
  };
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
  const blockConfig = { ...DEFAULT_CONFIG, ...readBlockConfigWithContent(block) };
  isShowcase = block.classList.contains('showcase');

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

  const slides = [...block.children];
  maxVisibleSlides = slides.length;
  const slidesToAdd = new Array(maxVisibleSlides);
  slides.forEach((slide, index) => {
    slidesToAdd[index] = buildSlide(slide, index + 1);
  });

  let navigationDots;
  if(isShowcase){
    navigationDots = buildDots(block, slides);
  }
  carousel.append(...slidesToAdd);
  addClones(carousel);
  block.append(carousel);

  if (slides.length > 1) {
    const prevBtn = await buildNav('prev');
    const nextBtn = await buildNav('next');
    block.append(prevBtn, nextBtn);
    if(navigationDots){
      block.append(navigationDots);
    }
  }

  setTimeout(() => {
    // scroll to first slide once all DOM has been built
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
    startAutoScroll(block, blockConfig.interval);
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
  const mediaVideoWidthChangeHandler = (event) => {
    if (event.matches === false) {
      block.querySelectorAll('video').forEach((videoElement) => {
        videoElement.muted = true;
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
    }
  };
  mediaVideoWidthChangeHandler(mediaVideoWidthQueryMatcher);
  mediaVideoWidthQueryMatcher.addEventListener('change', mediaVideoWidthChangeHandler);

  const mediaTextWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaTextWidthChangeHandler = async (event) => {
    if (!isShowcase) return;

    if (event.matches === true) {
      const carouselTextElements = block.getElementsByClassName('carousel-text');

      const closeButtonSvg = await getIconSvg('icons/close-bold.svg');

      [...carouselTextElements].forEach((carouselText) => {
        // build "ellipsable" text content
        const textContents = carouselText.querySelectorAll('p');

        [...textContents].forEach((textContent) => {
          if (!textContent.classList.contains('button-container')) {
            const textStyle = window.getComputedStyle(textContent);
            const textOptions = {
              font: `${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`,
              letterSpacing: `${textStyle.letterSpacing}`,
            };

            const displayBufferPixels = 16;
            const textContentWidth = textContent.offsetWidth - displayBufferPixels;
            const ellipsedSuffix = blockConfig.ellipsis;
            const allowedMaxLines = blockConfig.maxlines;

            const fullTextContent = textContent.innerHTML;
            const ellipsisBuilder = buildEllipsis(
              fullTextContent,
              textContentWidth,
              allowedMaxLines,
              ellipsedSuffix,
              textOptions,
            );

            if (ellipsisBuilder.lineCount >= 2) { // TODO: make line count configurable using block config
              const clickableCloseButton = document.createElement('span');
              const clickableEllipsis = document.createElement('span');

              clickableCloseButton.classList.add('hidden-close-button');
              clickableEllipsis.classList.add('clickable-ellipsis');

              clickableCloseButton.innerHTML = closeButtonSvg;
              clickableEllipsis.innerHTML = ellipsedSuffix;
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
      console.log("Make slide clickable using button-container link");
    }
  };
  // needs DOM to be fully build and CSS applied for measurements
  setTimeout(() => mediaTextWidthChangeHandler(mediaTextWidthQueryMatcher), 0);
  mediaTextWidthQueryMatcher.addEventListener('change', mediaTextWidthChangeHandler);

  // auto scroll when visible only
  const intersectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  };
  const handleAutoScroll = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoScroll(block, blockConfig.interval);
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
      startAutoScroll(block, blockConfig.interval);
    }
  });

  window.addEventListener('resize', () => {
    setTimeout(() => {
      // scroll to first slide once all DOM has been rebuilt
      scrollToSlide(block, firstVisibleSlide, 'instant');
    }, 0);
  });
}
