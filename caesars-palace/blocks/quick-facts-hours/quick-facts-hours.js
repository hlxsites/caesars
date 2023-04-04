import { isVentureOpen, getNextClosing, getNextOpening } from '../../scripts/scripts.js';

const CLOSED_TXT = 'CLOSED';
const OPEN_TXT = 'NOW OPEN';
const NEXT_OPEN_TXT = 'Opens';
const NEXT_CLOSE_TXT = 'Closes';

const DAYS_REVERSE_LOOKUP = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};
const DAYS_LOOKUP = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
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
    }
  }

  if (textualHours.endsWith('PM')) {
    let hours = textualHours.replace('PM', '');
    const hourMinutes = hours.split(':');
    return {
      hours: 12 + parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0,
      halfdayMarker: 'PM',
    }
  }
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
  const midnightEnd ={
    fullText: '',
    hours: 24,
    minutes: 0,
  };

  const midnightStart ={
    fullText: '',
    hours: 0,
    minutes: 0,
  };

  if(opens.halfdayMarker === 'PM' && closes.halfdayMarker === 'AM'){
    // needs to go to next day, as it closes the next day ~ has late hours
    const targetDayIndex = (DAYS_REVERSE_LOOKUP[dayOfSchedule] + 1) % 7;
    const targetDay = DAYS_LOOKUP[targetDayIndex];

    productSchedule[dayOfSchedule].opens.push({
      start: opens,
      end: midnightEnd
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
  const printedSchedule = {};
  const productOpenSchedule = {
    'Sunday': {
      opens: [],
    },
    'Monday': {
      opens: [],
    },
    'Tuesday': {
      opens: [],
    },
    'Wednesday': {
      opens: [],
    },
    'Thursday': {
      opens: [],
    },
    'Friday': {
      opens: [],
    },
    'Saturday': {
      opens: [],
    }
  };

  [...block.children].forEach((row) => {
    printedSchedule[row.children[0].innerText] = row.children[1].innerText;
    updateOpeningSchedule(productOpenSchedule, row.children[0].innerText, row.children[1].innerText);
  });

  console.log("Printed schedule is: ", printedSchedule);
  console.log("Opening schedule is: ", productOpenSchedule);

  let dateToCheck = new Date();
  // dateToCheck = new Date(2023, 3, 4, 22, 35);
  // dateToCheck = new Date(2023, 3, 4, 1, 0); // Tuesday, 1AM
  // dateToCheck = new Date(2023, 3, 5, 3, 59);// Wednesday 1AM
  // dateToCheck = new Date(2023, 3, 2, 22, 31);// Sunday
  // dateToCheck = new Date(2023, 3, 2, 6, 0);// Sunday 6AM
  // dateToCheck = new Date(2023, 3, 5, 17, 0);// Wednesday 5PM
  console.log("Checking opening for date: ", dateToCheck);

  const isOpen = isVentureOpen(productOpenSchedule, dateToCheck);

  let openingStatusText;
  let nextStatusChangeTime;
  if(isOpen){
    openingStatusText = OPEN_TXT;
    nextStatusChangeTime = getNextClosing(productOpenSchedule, dateToCheck);
  } else {
    openingStatusText = CLOSED_TXT;
    nextStatusChangeTime = getNextOpening(productOpenSchedule, dateToCheck);
  }
}