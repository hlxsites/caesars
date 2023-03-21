export default function decorate(block) {
  const statsRows = [...block.children];

  if (statsRows.length === 1) {
    // row of stats can be short, so adjusting styling depending on columns count
    statsRows[0].classList.add('short-stats');
    const columnsInRow = [...statsRows[0].children].length;

    const mediaSmallWidthQueryMatcher = window.matchMedia('only screen and (max-width: 767px)');
    const mediaSmallWidthChangeHandler = (event) => {
      if (event.matches === false) {
        statsRows[0].style = '';
      } else if (columnsInRow < 2) {
        statsRows[0].style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
      }
    };
    mediaSmallWidthChangeHandler(mediaSmallWidthQueryMatcher);
    mediaSmallWidthQueryMatcher.addEventListener('change', mediaSmallWidthChangeHandler);

    const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 768px)');
    const mediaWidthChangeHandler = (event) => {
      if (event.matches === false) {
        statsRows[0].style = '';
      } else if (columnsInRow < 3) {
        statsRows[0].style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
      }
    };
    mediaWidthChangeHandler(mediaWidthQueryMatcher);
    mediaWidthQueryMatcher.addEventListener('change', mediaWidthChangeHandler);

    const mediaLargeWidthQueryMatcher = window.matchMedia('only screen and (min-width: 960px)');
    const mediaLargeWidthChangeHandler = (event) => {
      if (event.matches === false) {
        statsRows[0].style = '';
      } else if (columnsInRow < 5) {
        statsRows[0].style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
      }
    };
    mediaLargeWidthChangeHandler(mediaLargeWidthQueryMatcher);
    mediaLargeWidthQueryMatcher.addEventListener('change', mediaLargeWidthChangeHandler);
  } else {
    // put all stats in a single first row
    const singleRow = statsRows[0];
    singleRow.classList.add('long-stats');

    statsRows.forEach((row, index) => {
      if (index === 0) {
        return;
      }

      [...row.children].forEach((statValue) => {
        singleRow.append(statValue);
      });
      row.remove();
    });
  }
}
