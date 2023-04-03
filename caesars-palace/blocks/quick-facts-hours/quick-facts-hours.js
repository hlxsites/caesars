const OPEN_TXT = 'OPEN';
const CLOSED_TXT = 'CLOSED';
const SEE_DETAILS_TXT = 'See all hours';
const OPENS_NEXT_TXT = 'Opens ';
const CLOSES_NEXT_TXT = 'Closes ';

const DAYS_LOOKUP = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

function convertHoursTo24HoursFormat(textualHours){
  if(textualHours.endsWith('AM')){
    const hours = textualHours.replace('AM', '');
    const hourMinutes = hours.split(':');

    return {
      fullText: textualHours,
      hours: 12+parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0
    }
  }

  if(textualHours.endsWith('PM')){
    let hours = textualHours.replace('PM', '');
    const hourMinutes = hours.split(':');

    return {
      fullText: textualHours,
      hours: 12+parseInt(hourMinutes[0], 10),
      minutes: hourMinutes[1] ? parseInt(hourMinutes[1], 10) : 0
    }
  }
}

function parseOpeningHours(openingHours){
  if(openingHours.toUpperCase() === CLOSED_TXT){
    return CLOSED_TXT;
  }

  const openedHours = openingHours.split('-');
  if(openedHours.length !== 2){
    return openingHours;
  }

  const opens = convertHoursTo24HoursFormat(openedHours[0]);
  const closes = convertHoursTo24HoursFormat(openedHours[1]);
  return {
    opens: opens,
    closes: closes
  };
}

function getOpeningStatus(openingSchedule){
  const mydate = new Date(Date.now());
  const day = DAYS_LOOKUP[mydate.getDay()];
  console.log("Day is ", day);

  const todayOpeningHours = openingSchedule[day];
  console.log("Today's opening schedule: ", todayOpeningHours);
  if(todayOpeningHours === CLOSED_TXT){
    return CLOSED_TXT;
  }

  const hours = mydate.getHours();
  console.log("Hour is ", hours);
  const minutes = mydate.getMinutes();
  console.log("Minutes are ", minutes);
}

// Structure:
// One line: Current status, closes/opens next, see all hours overlay link
export default function decorate(block) {
  const productSchedule = {};
  [...block.children].forEach((row) => {
    productSchedule[row.children[0].innerText] = parseOpeningHours(row.children[1].innerText);
  });

  console.log('-----');
  console.log(productSchedule);
  console.log('-----');

  const openingStatus = getOpeningStatus(productSchedule);
  console.log("opening status based on browser time: ", openingStatus);
}