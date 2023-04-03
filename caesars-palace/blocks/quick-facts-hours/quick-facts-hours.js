const OPEN_TXT = 'OPEN';
const CLOSED_TXT = 'CLOSED';
const SEE_DETAILS_TXT = 'See all hours';
const OPENS_NEXT_TXT = 'Opens ';
const CLOSES_NEXT_TXT = 'Closes ';

// Structure:
// One line: CUrrent status, closes/opens next, see all hours overlay link

export default function decorate(block) {
  const productSchedule = {};
  const today = new Date();
  [...block.children].forEach((row) => {
    productSchedule[row.children[0].innerText] = row.children[1].innerText;
  });
}