function showTab(rowIndex) {
  const tabTitleToHighlightQueryResults = document.getElementsByClassName(`tab-navbar-element-${rowIndex}`);
  const currentHighlightedTabQueryResults = document.getElementsByClassName('active-tab-title');

  if (currentHighlightedTabQueryResults.length === 1
    && tabTitleToHighlightQueryResults.length === 1) {
    const currentHighlightedTab = currentHighlightedTabQueryResults[0];
    const tabTitleToHighlight = tabTitleToHighlightQueryResults[0];

    // hide currently active tab
    currentHighlightedTab.classList.remove('active-tab-title');

    // show new tab
    tabTitleToHighlight.classList.add('active-tab-title');
  }

  const tabToShowQueryResults = document.getElementsByClassName(`tab-content-${rowIndex}`);
  const tabToHideQueryResults = document.getElementsByClassName('active-tab');

  if (tabToHideQueryResults.length === 1 && tabToShowQueryResults.length === 1) {
    const tabToHide = tabToHideQueryResults[0];
    const tabToShow = tabToShowQueryResults[0];

    // hide currently active tab
    tabToHide.classList.remove('active-tab');
    tabToHide.classList.add('hidden');

    // show new tab
    tabToShow.classList.remove('hidden');
    tabToShow.classList.add('active-tab');
  }
}

export default function decorate(block) {
  // http://localhost:3000/caesars-palace/drafts/tmathern/tabs
  const tabTitles = document.createElement('div');
  tabTitles.classList.add('tab-navbar');
  block.prepend(tabTitles);

  [...block.children].forEach((row, rowIndex) => {
    if (rowIndex > 0) {
      row.classList.add('tab');
      row.classList.add(`tab-content-${rowIndex}`);
    }

    if (rowIndex === 1) {
      row.classList.add('active-tab');
    } else if (rowIndex > 1) {
      row.classList.add('hidden');
    }

    [...row.children].forEach((contentElement, i) => {
      if (contentElement.innerHTML) {
        if (i === 0) {
          const divToMove = contentElement.closest('div');
          divToMove.classList.add('tab-title');
          divToMove.classList.add(`tab-navbar-element-${rowIndex}`);
          if (rowIndex === 1) {
            divToMove.classList.add('active-tab-title');
          }
          tabTitles.appendChild(divToMove);

          divToMove.addEventListener('click', () => {
            showTab(rowIndex);
          });
        } else if (contentElement.children
          && contentElement.children.length > 0
          && contentElement.children[0].tagName === 'PICTURE') {
          contentElement.closest('div').classList.add('tab-image');
        } else {
          contentElement.closest('div').classList.add('tab-text');
        }
      } else {
        // empty div, remove it
        contentElement.remove();
      }
    });
  });
}
