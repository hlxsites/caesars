import {
  isVentureOpen, getNextClosing, getNextOpening, createTag,
} from '../../scripts/scripts.js';

const CLOSED_TXT = 'CLOSED';
const OPEN_TXT = 'NOW OPEN';
const NEXT_OPEN_TXT = 'Opens';
const NEXT_CLOSE_TXT = 'Closes';
const ALWAYS_OPEN_TXT = 'Open 24hr';
const ALL_HOURS_TXT = 'See all hours';
const MODAL_ALL_HOURS_TXT = 'Daily hours';
const DAYS_REVERSE_LOOKUP = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
const DAYS_LOOKUP = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const ALWAYS_OPEN_PRINT_SCHEDULE = [
  { day: 'Sunday', hours: '12AM-12AM' },
  { day: 'Monday', hours: '12AM-12AM' },
  { day: 'Tuesday', hours: '12AM-12AM' },
  { day: 'Wednesday', hours: '12AM-12AM' },
  { day: 'Thursday', hours: '12AM-12AM' },
  { day: 'Friday', hours: '12AM-12AM' },
  { day: 'Saturday', hours: '12AM-12AM' },
];

/**
 * Convert authored datetime format to 24hours format
 * @param {*} textualHours Authored hours (AM/PM format)
 * @returns Hour value in 24 hour format, as object (hours, minutes, halfday marker)
 */
function convertHoursTo24HoursFormat(textualHours) {
  if (textualHours.endsWith('AM')) {
    const hours = textualHours.replace('AM', '');
    const hourMinutes = hours.split(':');
    return {
      hours: parseInt((hourMinutes[0] % 12), 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0,
      halfdayMarker: 'AM',
    };
  }

  if (textualHours.endsWith('PM')) {
    const hours = textualHours.replace('PM', '');
    const hourMinutes = hours.split(':');

    return {
      hours: 12 + parseInt((hourMinutes[0] % 12), 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0,
      halfdayMarker: 'PM',
    };
  }
  return textualHours;
}

/**
 * Parses authored content to build a schedule used for time comparisions
 * @param {Object} productSchedule Known product schedule (empty per default) to be updated
 * @returns An updated product schedule
 */
function updateOpeningSchedule(productSchedule, dayOfSchedule, openingHours) {
  if (openingHours.toUpperCase() === CLOSED_TXT) {
    return CLOSED_TXT;
  }

  const openedHours = openingHours.split('-');
  if (openedHours.length !== 2) {
    return openingHours;
  }

  const opens = convertHoursTo24HoursFormat(openedHours[0]);
  const closes = convertHoursTo24HoursFormat(openedHours[1]);
  const midnightEnd = {
    fullText: '',
    hours: 24,
    minutes: 0,
  };

  const midnightStart = {
    fullText: '',
    hours: 0,
    minutes: 0,
  };

  if (opens.halfdayMarker === 'PM' && closes.halfdayMarker === 'AM') {
    // needs to go to next day, as it closes the next day ~ has late hours
    const targetDayIndex = (DAYS_REVERSE_LOOKUP[dayOfSchedule] + 1) % 7;
    const targetDay = DAYS_LOOKUP[targetDayIndex];

    opens.hours %= 24;
    if (closes.minutes === 0 && closes.hours === 12) {
      productSchedule[dayOfSchedule].opens.push({
        start: opens,
        end: midnightEnd,
      });
    } else {
      productSchedule[dayOfSchedule].opens.push({
        start: opens,
        end: midnightEnd,
      });
      productSchedule[targetDay].opens.push({
        start: midnightStart,
        end: closes,
      });
    }
  } else if (opens.halfdayMarker === 'AM' && closes.halfdayMarker === 'AM') {
    // needs to go to next day, as it closes the next day ~ has late hours
    const targetDayIndex = (DAYS_REVERSE_LOOKUP[dayOfSchedule] + 1) % 7;
    const targetDay = DAYS_LOOKUP[targetDayIndex];

    productSchedule[dayOfSchedule].opens.push({
      start: opens,
      end: midnightEnd,
    });
    productSchedule[targetDay].opens.push({
      start: midnightStart,
      end: closes,
    });
  } else if (opens.halfdayMarker === 'PM' && closes.halfdayMarker === 'PM') {
    // needs to go to next day, as it closes the next day ~ has late hours
    const targetDayIndex = (DAYS_REVERSE_LOOKUP[dayOfSchedule] + 1) % 7;
    const targetDay = DAYS_LOOKUP[targetDayIndex];

    if (closes.minutes === 0 && closes.hours === 24) {
      productSchedule[dayOfSchedule].opens.push({
        start: opens,
        end: midnightEnd,
      });
    } else {
      productSchedule[dayOfSchedule].opens.push({
        start: opens,
        end: midnightEnd,
      });
      productSchedule[targetDay].opens.push({
        start: midnightStart,
        end: closes,
      });
    }
  } if (opens.halfdayMarker === 'AM' && closes.halfdayMarker === 'PM') {
    productSchedule[dayOfSchedule].opens.push({
      start: opens,
      end: closes,
    });
  }

  return productSchedule;
}

/**
 * Builds the modal dialog displaying the opening hours
 * @param {*} printedSchedule Schedule to display
 * @param {*} modalOverlay Overlay (background) dialog node
 * @returns A build DOM node to use as modal dialog
 */
function buildHoursModal(printedSchedule, modalOverlay) {
  if (!printedSchedule || printedSchedule.length === 0) return null;

  const modalTitle = document.querySelector('.is-hero h1');

  const modalDiv = document.createElement('div');
  modalDiv.classList.add('quick-facts-modal');
  modalDiv.classList.add('quick-facts-modal-hidden');
  const hourLines = new Array(printedSchedule.length);

  const todayDay = new Date(Date.now()).getDay();
  const todayDayName = DAYS_LOOKUP[todayDay];

  for (let i = 0; i < printedSchedule.length; i += 1) {
    const hourLine = document.createElement('div');
    const dayDiv = document.createElement('div');
    const hoursDiv = document.createElement('div');

    hourLine.classList.add('quickfacts-opening-hours-line');
    dayDiv.classList.add('quickfacts-opening-hours-day');
    hoursDiv.classList.add('quickfacts-opening-hours-time');
    dayDiv.innerText = printedSchedule[i].day;
    hoursDiv.innerText = printedSchedule[i].hours;
    if (printedSchedule[i].day.toUpperCase() === todayDayName.toUpperCase()) {
      hourLine.classList.add('quickfacts-opening-hours-line-focused');
    }

    hourLine.append(dayDiv, hoursDiv);
    hourLines[i] = hourLine;
  }

  const modalCloseButton = document.createElement('div');
  const modalDivTitle = document.createElement('h3');
  const modalDivSubtitle = document.createElement('h4');
  modalCloseButton.classList.add('quick-facts-modal-close-button');
  modalDivTitle.innerText = modalTitle.innerText;
  modalDivSubtitle.innerText = MODAL_ALL_HOURS_TXT;
  modalDiv.append(modalCloseButton, modalDivTitle, modalDivSubtitle, ...hourLines);

  modalCloseButton.addEventListener('click', () => {
    modalDiv.classList.add('quick-facts-modal-hidden');
    modalOverlay.classList.add('quick-facts-modal-overlay-hidden');
  }, { passive: true });

  return modalDiv;
}

export default function decorate(block) {
  if (block.classList.contains('live-show')) {
    const targetBlockFromSection = block.parentNode.previousSibling;
    if (targetBlockFromSection && targetBlockFromSection.classList.contains('default-content-wrapper')) {
      const statusSpanIcon = document.createElement('span');
      const statusSpan = document.createElement('span');
      statusSpan.classList.add('quick-facts-showtime-hours');
      statusSpanIcon.classList.add('quick-facts-show-open');

      [...block.children].forEach((row) => {
        const timeSpan = document.createElement('span');
        timeSpan.innerText = `${row.children[0].innerText}: ${row.children[1].innerText}`;
        statusSpan.append(timeSpan);
        row.remove();
      });

      const showTimeHolder = document.createElement('p');
      showTimeHolder.append(statusSpanIcon, statusSpan);
      targetBlockFromSection.append(showTimeHolder);
    } else {
      const statusDivIcon = document.createElement('div');
      const statusDiv = document.createElement('div');
      statusDiv.classList.add('quick-facts-showtime-hours');
      statusDivIcon.classList.add('show-open');

      [...block.children].forEach((row) => {
        const timeDiv = document.createElement('div');
        timeDiv.innerText = `${row.children[0].innerText}: ${row.children[1].innerText}`;
        statusDiv.append(timeDiv);
        row.remove();
      });

      block.append(statusDivIcon, statusDiv);
    }
  } else if (block.classList.contains('always-open')) {
    [...block.children].forEach((row) => {
      row.remove();
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('quickfacts-modal-overlay');
    modalOverlay.classList.add('quick-facts-modal-overlay-hidden');

    const modalDiv = buildHoursModal(ALWAYS_OPEN_PRINT_SCHEDULE, modalOverlay);

    const statusDiv = document.createElement('div');
    const statusIconNode = document.createElement('span');

    const allHours = document.createElement('a');
    allHours.title = ALL_HOURS_TXT;
    allHours.text = ALWAYS_OPEN_TXT;
    allHours.classList.add('quick-facts-hours-link');

    statusIconNode.classList.add('status-open');
    statusDiv.classList.add('quick-facts-hours-container');

    statusDiv.append(statusIconNode, allHours);
    block.append(statusDiv);

    if (modalDiv) {
      block.append(modalOverlay, modalDiv);
      const allHoursViewHandler = () => {
        modalDiv.classList.remove('quick-facts-modal-hidden');
        modalOverlay.classList.remove('quick-facts-modal-overlay-hidden');
      };
      statusDiv.addEventListener('click', allHoursViewHandler, { passive: true });
      modalOverlay.addEventListener('click', () => {
        modalDiv.classList.add('quick-facts-modal-hidden');
        modalOverlay.classList.add('quick-facts-modal-overlay-hidden');
      }, { passive: true });
    }
  } else {
    const printedSchedule = new Array(7);
    const productOpenSchedule = {
      Sunday: {
        opens: [],
      },
      Monday: {
        opens: [],
      },
      Tuesday: {
        opens: [],
      },
      Wednesday: {
        opens: [],
      },
      Thursday: {
        opens: [],
      },
      Friday: {
        opens: [],
      },
      Saturday: {
        opens: [],
      },
    };

    [...block.children].forEach((row, index) => {
      printedSchedule[index] = {
        day: row.children[0].innerText,
        hours: row.children[1].innerText,
      };
      updateOpeningSchedule(
        productOpenSchedule,
        row.children[0].innerText,
        row.children[1].innerText,
      );
      row.remove();
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('quickfacts-modal-overlay');
    modalOverlay.classList.add('quick-facts-modal-overlay-hidden');
    const modalDiv = buildHoursModal(printedSchedule, modalOverlay);

    const dateToCheck = new Date();
    const isOpen = isVentureOpen(productOpenSchedule, dateToCheck);
    let openingStatusText;
    let nextStatusChangeTime;
    let nextStatusChangeTimeText;
    let statusIconClass;
    if (isOpen) {
      openingStatusText = OPEN_TXT;
      statusIconClass = 'status-open';
      nextStatusChangeTime = getNextClosing(productOpenSchedule, dateToCheck) || '';

      if (nextStatusChangeTime) {
        let { minutes } = nextStatusChangeTime;
        if (minutes < 10) {
          minutes = `0${minutes}`;
        }
        nextStatusChangeTimeText = `${NEXT_CLOSE_TXT} ${nextStatusChangeTime.hours % 12}:${minutes} ${nextStatusChangeTime.halfdayMarker}`;
      }
    } else {
      openingStatusText = CLOSED_TXT;
      statusIconClass = 'status-closed';
      nextStatusChangeTime = getNextOpening(productOpenSchedule, dateToCheck) || '';

      if (nextStatusChangeTime) {
        let { minutes } = nextStatusChangeTime;
        if (minutes < 10) {
          minutes = `0${minutes}`;
        }
        nextStatusChangeTimeText = `${NEXT_OPEN_TXT} ${nextStatusChangeTime.hours % 12}:${minutes} ${nextStatusChangeTime.halfdayMarker} ${nextStatusChangeTime.day}`;
      }
    }

    const statusDiv = document.createElement('a');
    const statusIconNode = document.createElement('span');
    const statusTextNode = document.createElement('span');
    const nextStatusChangeNode = document.createElement('span');
    const allHoursDecoration = document.createElement('div');
    const allHours = createTag('a', { title: ALL_HOURS_TXT, text: ALL_HOURS_TXT });

    statusTextNode.innerText = openingStatusText;
    nextStatusChangeNode.innerText = nextStatusChangeTimeText || '';
    allHours.classList.add('quick-facts-hours-link');
    allHoursDecoration.classList.add('quick-facts-hours-container-chevron');
    statusIconNode.classList.add(statusIconClass);
    statusDiv.classList.add('quick-facts-hours-container');
    statusDiv.setAttribute('role', 'button');
    statusTextNode.classList.add('hours-status');
    nextStatusChangeNode.classList.add('next-status-change');

    statusDiv.append(
      statusIconNode,
      statusTextNode,
      nextStatusChangeNode,
      allHours,
      allHoursDecoration,
    );
    block.append(statusDiv);

    if (modalDiv) {
      block.append(modalOverlay, modalDiv);
      const allHoursViewHandler = () => {
        modalDiv.classList.remove('quick-facts-modal-hidden');
        modalOverlay.classList.remove('quick-facts-modal-overlay-hidden');
      };
      statusDiv.addEventListener('click', allHoursViewHandler, { passive: true });
      modalOverlay.addEventListener('click', () => {
        modalDiv.classList.add('quick-facts-modal-hidden');
        modalOverlay.classList.add('quick-facts-modal-overlay-hidden');
      }, { passive: true });
    }
  }
}
