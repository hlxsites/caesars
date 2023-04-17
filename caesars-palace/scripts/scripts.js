import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  createOptimizedPicture,
  readBlockConfig,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'caesars-palace'; // add your RUM generation information here

const DAYS_LOOKUP = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Gets next closing hour of a venture, based on an opening schedule
 * @param {*} openingSchedule The opening schedule to use
 * @param {*} dateToCheck Datetime to use to find next closing time
 * Precondition: `dateToCheck` must not be in a current open time
 * @returns An object describing the next closing time
 */
export function getNextOpening(openingSchedule, dateToCheck, allowGoingToNextDay = true) {
  const day = DAYS_LOOKUP[dateToCheck.getDay()];
  const scheduleToUse = openingSchedule[day];

  let openingHourCandidate;
  const hourToCheck = dateToCheck.getHours();
  const minuteToCheck = dateToCheck.getMinutes();
  if (scheduleToUse.opens.length > 1) {
    let openingDistance = Number.POSITIVE_INFINITY;
    scheduleToUse.opens.forEach((openingHourOption) => {
      if (hourToCheck <= openingHourOption.start.hours) {
        const currentOpeningDistance = (openingHourOption.start.hours - hourToCheck) * 60;
        if (currentOpeningDistance < openingDistance) {
          openingHourCandidate = openingHourOption.start;
          openingHourCandidate.day = day;
          openingDistance = currentOpeningDistance;
        }
      } else if (hourToCheck === openingHourOption.start.hours) {
        // same hour, depends on minutes
        if (openingHourOption.start.minutes >= minuteToCheck) {
          const currentOpeningDistance = openingHourOption.start.minutes - minuteToCheck;
          if (currentOpeningDistance < openingDistance) {
            openingHourCandidate = openingHourOption.start;
            openingHourCandidate.day = day;
            openingDistance = currentOpeningDistance;
          }
        }
      }
    });
  } else if (scheduleToUse.opens.length === 1) {
    if (scheduleToUse.opens[0].start.hours > hourToCheck) {
      openingHourCandidate = scheduleToUse.opens[0].start;
      openingHourCandidate.day = day;
    } else if (scheduleToUse.opens[0].start.hours === hourToCheck) {
      if (scheduleToUse.opens[0].start.minutes > minuteToCheck) {
        openingHourCandidate = scheduleToUse.opens[0].start;
        openingHourCandidate.day = day;
      } else if (allowGoingToNextDay) {
        const nextDayDate = new Date();
        nextDayDate.setDate(dateToCheck.getDate() + 1);
        nextDayDate.setHours(0);
        nextDayDate.setMinutes(0);
        nextDayDate.setSeconds(0);
        openingHourCandidate = getNextOpening(openingSchedule, nextDayDate, false);
      }
    } else if (allowGoingToNextDay) {
      const nextDayDate = new Date();
      nextDayDate.setDate(dateToCheck.getDate() + 1);
      nextDayDate.setHours(0);
      nextDayDate.setMinutes(0);
      nextDayDate.setSeconds(0);
      openingHourCandidate = getNextOpening(openingSchedule, nextDayDate, false);
    }
  }

  return openingHourCandidate;
}

/**
 * Gets next closing hour of a venture, based on an opening schedule
 * @param {*} openingSchedule The opening schedule to use
 * @param {*} dateToCheck Datetime to use to find next closing time
 * Precondition: `dateToCheck` must be in a current open time
 * @returns An object describing the next closing time
 */
export function getNextClosing(openingSchedule, dateToCheck) {
  const day = DAYS_LOOKUP[dateToCheck.getDay()];
  const scheduleToUse = openingSchedule[day];

  const hourToCheck = dateToCheck.getHours();
  const minuteToCheck = dateToCheck.getMinutes();

  let closingHoursCandidate;
  scheduleToUse.opens.forEach((openingHours) => {
    if ((hourToCheck > openingHours.start.hours
      && hourToCheck < openingHours.end.hours)
      || (hourToCheck === openingHours.start.hours
        && minuteToCheck >= openingHours.start.minutes)
      || (hourToCheck === openingHours.end.hours
        && minuteToCheck <= openingHours.end.minutes)) {
      closingHoursCandidate = openingHours.end;
    }
  });

  let closingHour = closingHoursCandidate;
  if (closingHour.hours === 24 && closingHour.minutes === 0) {
    // check if we have a continuous next day "late hours opening"
    const nextDay = DAYS_LOOKUP[(dateToCheck.getDay() + 1) % 7];
    const nextDaySchedule = openingSchedule[nextDay];
    nextDaySchedule.opens.forEach((openingHours) => {
      if (openingHours.start.hours === 0 && openingHours.start.minutes === 0) {
        closingHour = openingHours.end;
        closingHour.isNextDay = true;
      }
    });
  }
  return closingHour;
}

/**
 * Uses an opening schedule to determine if a venture is currently open
 * @param {*} openingSchedule Opening schedule for the week
 * @param {*} dateToCheck Datetime to check for opening status
 * @returns true if open, false otherwise
 */
export function isVentureOpen(openingSchedule, dateToCheck) {
  const day = DAYS_LOOKUP[dateToCheck.getDay()];
  const scheduleToUse = openingSchedule[day];
  // console.log("Using schedule: ", scheduleToUse);

  if (!scheduleToUse || !scheduleToUse.opens || scheduleToUse.opens.length === 0) {
    return false;
  }

  let isOpen = false;
  const hourToCheck = dateToCheck.getHours();
  const minuteToCheck = dateToCheck.getMinutes();
  scheduleToUse.opens.forEach((openingHours) => {
    if (hourToCheck > openingHours.start.hours && hourToCheck < openingHours.end.hours) {
      isOpen = true;
    } else if (hourToCheck === openingHours.start.hours
      && minuteToCheck >= openingHours.start.minutes) {
      isOpen = true;
    } else if (hourToCheck === openingHours.end.hours
      && minuteToCheck <= openingHours.end.minutes) {
      isOpen = true;
    }
  });

  return isOpen || false;
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
export function buildEllipsis(text, width, maxVisibleLines, suffix, options = {}) {
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
    lineCount,
    shortText,
  };
}

/**
 * Determine if we are serving content for the block-library, if so don't load the header or footer
 * @returns {boolean} True if we are loading block library content
 */
export function isBlockLibrary() {
  return window.location.pathname.includes('block-library');
}

/**
 * Convience method for creating tags in one line of code
 * @param {string} tag Tag to create
 * @param {object} attributes Key/value object of attributes
 * @param {HTMLElement | HTMLElement[] | string} children Child element
 * @returns {HTMLElement} The created tag
 */
export function createTag(tag, attributes, children) {
  const element = document.createElement(tag);
  if (children) {
    if (children instanceof HTMLElement
      || children instanceof SVGElement
      || children instanceof DocumentFragment) {
      element.append(children);
    } else if (Array.isArray(children)) {
      element.append(...children);
    } else {
      element.insertAdjacentHTML('beforeend', children);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      element.setAttribute(key, val);
    });
  }
  return element;
}

/**
 * Read and return a configuration object for a block that contains both config
 * values and content. Config values can be in the first row or multiple
 * rows. When using multiple rows there must be a blank row between config and content.
 * Config rows will also be remove from the block to allow further decoration of the
 * content only.
 *
 * @param block A block to extract config from
 */
export function readBlockConfigWithContent(block) {
  const configBlock = document.createElement('div');
  const allRows = [...block.querySelectorAll(':scope>div')];
  allRows.every((row) => {
    if (row.children) {
      const cols = [...row.children];
      const isConfigRow = !!cols[1]
        && cols[0].hasChildNodes()
        && cols[0].firstChild.nodeType === Node.TEXT_NODE
        && cols[0].children.length === 0;
      if (isConfigRow) {
        configBlock.append(row);
        return true;
      }
    }
    if (row.children.length === 1 && row.firstElementChild.textContent.trim().length === 0) {
      block.removeChild(row);
    }
    return false;
  });
  const configObj = readBlockConfig(configBlock);
  Object.entries(configObj).forEach(([key, value]) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      configObj[key] = value;
    } else {
      configObj[key] = Number(value);
    }
  });
  return configObj;
}

function buildSectionBackground(main) {
  const mediaMobileWidthQueryMatcher = window.matchMedia('only screen and (min-width: 1170px)');
  const mediaMobileWidthChangeHandler = (event) => {
    if (event.matches === false) {
      main.querySelectorAll('.section.has-background').forEach((section) => {
        section.querySelectorAll('img').forEach((image) => {
          image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '1170' }]));
        });
      });
    }
  };
  mediaMobileWidthChangeHandler(mediaMobileWidthQueryMatcher);
  mediaMobileWidthQueryMatcher.addEventListener('change', (event) => {
    mediaMobileWidthChangeHandler(event);
  });

  main.querySelectorAll('.section.has-background').forEach((section) => {
    const picture = section.querySelector('picture');
    if (picture) {
      section.appendChild(picture);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
  buildSectionBackground(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  if (!isBlockLibrary()) {
    loadHeader(doc.querySelector('header'));
    loadFooter(doc.querySelector('footer'));
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.ico`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

export async function lookupCardsByType(type) {
  if (!window.cardIndex || !window.cardIndex[type]) {
    const resp = await fetch(`${window.hlx.codeBasePath}/${type}.json`);
    const json = await resp.json();
    if (!window.cardIndex) {
      window.cardIndex = {};
    }
    window.cardIndex[type] = json;
  }
  return (window.cardIndex[type]);
}

loadPage();
