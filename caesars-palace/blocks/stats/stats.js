export default function decorate(block) {
  const statsRows = [...block.children];

  if (statsRows.length === 1) {
    [...block.children].forEach((row) => {
      const columnsInRow = [...row.children].length;

      const mediaSmallWidthQueryMatcher = window.matchMedia('only screen and (max-width: 767px)');
      const mediaSmallWidthChangeHandler = async (event) => {
        if (event.matches === false) {
          row.style = '';
        } else if (columnsInRow < 2) {
          row.style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
        }
      };
      mediaSmallWidthChangeHandler(mediaSmallWidthQueryMatcher);
      mediaSmallWidthQueryMatcher.addEventListener('change', (event) => {
        mediaSmallWidthChangeHandler(event);
      });

      const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 768px)');
      const mediaWidthChangeHandler = async (event) => {
        if (event.matches === false) {
          row.style = '';
        } else if (columnsInRow < 3) {
          row.style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
        }
      };
      mediaWidthChangeHandler(mediaWidthQueryMatcher);
      mediaWidthQueryMatcher.addEventListener('change', (event) => {
        mediaWidthChangeHandler(event);
      });

      const mediaLargeWidthQueryMatcher = window.matchMedia('only screen and (min-width: 960px)');
      const mediaLargeWidthChangeHandler = async (event) => {
        if (event.matches === false) {
          row.style = '';
        } else if (columnsInRow < 5) {
          row.style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
        }
      };
      mediaLargeWidthChangeHandler(mediaLargeWidthQueryMatcher);
      mediaLargeWidthQueryMatcher.addEventListener('change', (event) => {
        mediaLargeWidthChangeHandler(event);
      });
    });
  }
}
