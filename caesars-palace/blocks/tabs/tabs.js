function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showTab(block, rowIndex) {
  // Clean animations 
  const tabsActiveWithSlideOut = block.getElementsByClassName('active-tab-slide-out');
  [...tabsActiveWithSlideOut].forEach((item) => { 
    if(item.classList) item.classList.remove('active-tab-slide-out');
  })
  const tabsActiveWithSlideIn = block.getElementsByClassName('active-tab-slide-in');
  [...tabsActiveWithSlideIn].forEach((item) => { 
    if(item.classList) item.classList.remove('active-tab-slide-in');
  })
  const tabsHiddenWithSlideOut = block.getElementsByClassName('hidden-tab-slide-in');
  [...tabsHiddenWithSlideOut].forEach((item) => { 
    if(item.classList) item.classList.remove('hidden-tab-slide-in');
  })
  const tabsWithSlideIn = block.getElementsByClassName('hidden-tab-slide-out');
  [...tabsWithSlideIn].forEach((item) => { 
    if(item.classList) item.classList.remove('hidden-tab-slide-out');
  })

  const tabTitleToHighlightQueryResults = block.getElementsByClassName(`tab-navbar-element-${rowIndex}`);
  const currentHighlightedTabQueryResults = block.getElementsByClassName('active-tab-title');

  if (currentHighlightedTabQueryResults.length === 1
    && tabTitleToHighlightQueryResults.length === 1) {
    const currentHighlightedTab = currentHighlightedTabQueryResults[0];
    const tabTitleToHighlight = tabTitleToHighlightQueryResults[0];

    // hide currently active tab
    currentHighlightedTab.classList.remove('active-tab-title');

    // show new tab
    tabTitleToHighlight.classList.add('active-tab-title');
  }

  const tabToShowQueryResults = block.getElementsByClassName(`tab-content-${rowIndex}`);
  const tabToHideQueryResults = block.getElementsByClassName('active-tab');

  if (tabToHideQueryResults.length === 1 && tabToShowQueryResults.length === 1) {
    const tabToHide = tabToHideQueryResults[0];
    const tabToShow = tabToShowQueryResults[0];

    let tabToHideIndex = -1;
    [...tabToHide.classList].forEach((item) => {
        if(item.startsWith('tab-content-')){
          tabToHideIndex = parseInt(item.split('tab-content-')[1], 10);
        }
    });

    let tabToShowIndex = -1;
    [...tabToShow.classList].forEach((item) => {
      if(item.startsWith('tab-content-')){
        tabToShowIndex = parseInt(item.split('tab-content-')[1], 10);
      }
  });

    // hide currently active tab
    tabToHide.classList.remove('active-tab');
    tabToHide.classList.add('hidden');

    // show new tab
    tabToShow.classList.remove('hidden');
    tabToShow.classList.add('active-tab');

    if(tabToHideIndex === tabToShowIndex){
      return;
    } if(tabToHideIndex > tabToShowIndex){ // slide out, then slide in
      tabToShow.classList.add('active-tab-slide-out');
    } else if (tabToHideIndex < tabToShowIndex){ // slide in, then slide out
      tabToShow.classList.add('active-tab-slide-in');
    }
  }
}

export default function decorate(block) {
  // http://localhost:3000/caesars-palace/drafts/tmathern/tabs
  const tabTitles = document.createElement('div');
  tabTitles.classList.add('tab-navbar');
  block.prepend(tabTitles);

  const tabsHolder = document.createElement('div');
  tabsHolder.classList.add('tab-tabs-holder');
  
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
            showTab(block, rowIndex);
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

    if (rowIndex > 0) {
      tabsHolder.append(row);
    }
  });

  block.append(tabsHolder);
}
