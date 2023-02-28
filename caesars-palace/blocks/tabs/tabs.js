function showTab(rowIndex) {
  let tabToShow = document.getElementsByClassName(`tab-content-${rowIndex}`);
  let tabToHide = document.getElementsByClassName('active-tab');

  if (tabToHide.length === 1 && tabToShow.length === 1) {
    tabToHide = tabToHide[0];
    tabToShow = tabToShow[0];

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
