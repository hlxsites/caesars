import { isVentureOpen, getNextClosing, getNextOpening } from '../../scripts/scripts.js';

const CLOSED_TXT = 'CLOSED';
const OPEN_TXT = 'NOW OPEN';
const NEXT_OPEN_TXT = 'Opens';
const NEXT_CLOSE_TXT = 'Closes';
const ALL_HOURS_TXT = 'See all hours';

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
      hours: parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0,
      halfdayMarker: 'AM',
    };
  }

  if (textualHours.endsWith('PM')) {
    const hours = textualHours.replace('PM', '');
    const hourMinutes = hours.split(':');
    return {
      hours: 12 + parseInt(hourMinutes[0], 10),
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

    productSchedule[dayOfSchedule].opens.push({
      start: opens,
      end: midnightEnd,
    });
    productSchedule[targetDay].opens.push({
      start: midnightStart,
      end: closes,
    });
  } else {
    productSchedule[dayOfSchedule].opens.push({
      start: opens,
      end: closes,
    });
  }

  return productSchedule;
}

export default function decorate(block) {
  if (block.classList.contains('live-show')) {
    if (block.parentNode.previousSibling && block.parentNode.previousSibling.classList.contains('default-content-wrapper')) {
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
      block.parentNode.previousSibling.append(showTimeHolder);
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
    const printedSchedule = {};
    [...block.children].forEach((row) => {
      printedSchedule[row.children[0].innerText] = row.children[1].innerText;
      row.remove();
    });

    const statusDiv = document.createElement('div');
    const statusIconNode = document.createElement('span');

    const allHours = document.createElement('a');
    allHours.href = '#';
    allHours.title = ALL_HOURS_TXT;
    allHours.text = 'Open 24hr';
    allHours.classList.add('quick-facts-hours-link');

    statusIconNode.classList.add('status-open');
    statusDiv.classList.add('quick-facts-hours-container');

    statusDiv.append(statusIconNode, allHours);
    block.append(statusDiv);
  } else {
    const printedSchedule = {};
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

    [...block.children].forEach((row) => {
      printedSchedule[row.children[0].innerText] = row.children[1].innerText;
      updateOpeningSchedule(
        productOpenSchedule,
        row.children[0].innerText,
        row.children[1].innerText,
      );
      row.remove();
    });

    const dateToCheck = new Date();
    const isOpen = isVentureOpen(productOpenSchedule, dateToCheck);
    let openingStatusText;
    let nextStatusChangeTime;
    let nextStatusChangeTimeText;
    let statusIconClass;
    if (isOpen) {
      openingStatusText = OPEN_TXT;
      statusIconClass = 'status-open';
      nextStatusChangeTime = getNextClosing(productOpenSchedule, dateToCheck);
      if (nextStatusChangeTime) {
        nextStatusChangeTimeText = `${NEXT_CLOSE_TXT} ${nextStatusChangeTime.hours % 12}:${nextStatusChangeTime.minutes} ${nextStatusChangeTime.halfdayMarker}`;
      }
    } else {
      openingStatusText = CLOSED_TXT;
      statusIconClass = 'status-closed';
      nextStatusChangeTime = getNextOpening(productOpenSchedule, dateToCheck);
      if (nextStatusChangeTime) {
        nextStatusChangeTimeText = `${NEXT_OPEN_TXT} ${nextStatusChangeTime.hours % 12}:${nextStatusChangeTime.minutes} ${nextStatusChangeTime.halfdayMarker}`;
      }
    }

    const statusDiv = document.createElement('div');
    const statusIconNode = document.createElement('span');
    const statusTextNode = document.createElement('span');
    const nextStatusChangeNode = document.createElement('span');
    statusTextNode.innerText = openingStatusText;
    nextStatusChangeNode.innerText = nextStatusChangeTimeText;
    const allHours = document.createElement('a');
    allHours.href = '#';
    allHours.title = ALL_HOURS_TXT;
    allHours.text = ALL_HOURS_TXT;
    allHours.classList.add('quick-facts-hours-link');

    statusIconNode.classList.add(statusIconClass);
    statusDiv.classList.add('quick-facts-hours-container');
    statusTextNode.classList.add('hours-status');
    nextStatusChangeNode.classList.add('next-status-change');

    statusDiv.append(statusIconNode);
    statusDiv.append(statusTextNode);
    statusDiv.append(nextStatusChangeNode);
    statusDiv.append(allHours);
    block.append(statusDiv);
  }
}
