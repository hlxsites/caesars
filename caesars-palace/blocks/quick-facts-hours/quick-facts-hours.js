import { isVentureOpen } from '../../scripts/scripts.js';

const CLOSED_TXT = 'CLOSED';

/**
 * 
 * @param {*} textualHours 
 * @returns 
 */
function convertHoursTo24HoursFormat(textualHours) {
  if (textualHours.endsWith('AM')) {
    const hours = textualHours.replace('AM', '');
    const hourMinutes = hours.split(':');
    return {
      fullText: textualHours,
      hours: parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0
    }
  }

  if (textualHours.endsWith('PM')) {
    let hours = textualHours.replace('PM', '');
    const hourMinutes = hours.split(':');
    return {
      fullText: textualHours,
      hours: 12 + parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0
    }
  }
}

/**
 * 
 * @param {*} openingHours 
 * @returns 
 */
function parseOpeningHours(openingHours) {
  if (openingHours.toUpperCase() === CLOSED_TXT) {
    return CLOSED_TXT;
  }

  const openedHours = openingHours.split('-');
  if (openedHours.length !== 2) {
    return openingHours;
  }

  const opens = convertHoursTo24HoursFormat(openedHours[0]);
  const closes = convertHoursTo24HoursFormat(openedHours[1]);
  return {
    opens: opens,
    closes: closes
  };
}

// Structure:
// One line: Current status, closes/opens next, see all hours overlay link
export default function decorate(block) {
  const productSchedule = {};
  [...block.children].forEach((row) => {
    productSchedule[row.children[0].innerText] = parseOpeningHours(row.children[1].innerText);
  });

  const isOpen = isVentureOpen(productSchedule, new Date(Date.now()));
  console.log("Venture is open: ", isOpen);

  let dateToCheck = new Date(2023, 3, 5, 9, 22);
  console.log(dateToCheck);
}