const MOVE_TABS_FORWARD = 1;
const MOVE_TABS_BACK = -1;

const TAB_SLIDE_IN_ANIMATION = 'active-tab-slide-in';
const TAB_SLIDE_OUT_ANIMATION = 'active-tab-slide-out';

const ACTIVE_TAB_TITLE_CLASS = 'active-tab-title';
const HIDDEN_TAB_TITLE_CLASS = 'hidden-tab-title';

const ACTIVE_TAB_CLASS = 'active-tab';
const HIDDEN_TAB_CLASS = 'hidden-tab';

const RESPONSIVE_MEDIA_QUERY = 'only screen and (min-width: 768px)';

function showTab(block, rowIndex, overflowDetails = null) {
  const tabsActiveWithSlideOut = block.getElementsByClassName(TAB_SLIDE_OUT_ANIMATION);
  const tabsActiveWithSlideIn = block.getElementsByClassName(TAB_SLIDE_IN_ANIMATION);
  [...tabsActiveWithSlideOut].forEach((item) => {
    if (item.classList) item.classList.remove(TAB_SLIDE_OUT_ANIMATION);
  });
  [...tabsActiveWithSlideIn].forEach((item) => {
    if (item.classList) item.classList.remove(TAB_SLIDE_IN_ANIMATION);
  });

  const tabTitleToHighlightQueryResults = block.getElementsByClassName(`tab-navbar-element-${rowIndex}`);
  const currentHighlightedTabQueryResults = block.getElementsByClassName(ACTIVE_TAB_TITLE_CLASS);

  if (currentHighlightedTabQueryResults.length === 1
    && tabTitleToHighlightQueryResults.length === 1) {
    const currentHighlightedTab = currentHighlightedTabQueryResults[0];
    const tabTitleToHighlight = tabTitleToHighlightQueryResults[0];

    // hide currently active tab
    currentHighlightedTab.classList.remove(ACTIVE_TAB_TITLE_CLASS);

    // show new tab
    tabTitleToHighlight.classList.add(ACTIVE_TAB_TITLE_CLASS);
  }

  const tabToShowQueryResults = block.getElementsByClassName(`tab-content-${rowIndex}`);
  const tabToHideQueryResults = block.getElementsByClassName(ACTIVE_TAB_CLASS);

  if (tabToHideQueryResults.length === 1 && tabToShowQueryResults.length === 1) {
    const tabToHide = tabToHideQueryResults[0];
    const tabToShow = tabToShowQueryResults[0];

    let tabToHideIndex = -1;
    [...tabToHide.classList].forEach((item) => {
      if (item.startsWith('tab-content-')) {
        tabToHideIndex = parseInt(item.split('tab-content-')[1], 10);
      }
    });

    let tabToShowIndex = -1;
    [...tabToShow.classList].forEach((item) => {
      if (item.startsWith('tab-content-')) {
        tabToShowIndex = parseInt(item.split('tab-content-')[1], 10);
      }
    });

    // hide currently active tab
    tabToHide.classList.remove(ACTIVE_TAB_CLASS);
    tabToHide.classList.add(HIDDEN_TAB_CLASS);

    // show new tab
    tabToShow.classList.remove(HIDDEN_TAB_CLASS);
    tabToShow.classList.add(ACTIVE_TAB_CLASS);

    if (tabToHideIndex === tabToShowIndex) {
      return;
    }

    const mediaWidthQueryMatcher = window.matchMedia(RESPONSIVE_MEDIA_QUERY);
    if (mediaWidthQueryMatcher.matches) {
      // Desktop
      if (tabToHideIndex > tabToShowIndex) { // slide out, then slide in
        tabToShow.classList.add(TAB_SLIDE_OUT_ANIMATION);
      } else if (tabToHideIndex < tabToShowIndex) { // slide in, then slide out
        tabToShow.classList.add(TAB_SLIDE_IN_ANIMATION);
      }
    } else if (!mediaWidthQueryMatcher.matches && tabToHideIndex > tabToShowIndex) {
      if (overflowDetails && overflowDetails.overflowMovement) {
        tabToShow.classList.add(TAB_SLIDE_IN_ANIMATION);
      } else {
        tabToShow.classList.add(TAB_SLIDE_OUT_ANIMATION);
      }
    } else if (!mediaWidthQueryMatcher.matches && tabToHideIndex < tabToShowIndex) {
      if (overflowDetails && overflowDetails.underflowMovement) {
        tabToShow.classList.add(TAB_SLIDE_OUT_ANIMATION);
      } else {
        tabToShow.classList.add(TAB_SLIDE_IN_ANIMATION);
      }
    }
  }
}

function showTitle(block, tabsCount, direction) {
  const currentActiveTabTitle = block.getElementsByClassName(ACTIVE_TAB_TITLE_CLASS);

  if (!currentActiveTabTitle || (currentActiveTabTitle && currentActiveTabTitle.length !== 1)) {
    return;
  }

  const tabTitleToHide = currentActiveTabTitle[0];
  let currentActiveIndex;
  tabTitleToHide.classList.forEach((tabClass) => {
    if (tabClass.startsWith('tab-navbar-element-')) {
      currentActiveIndex = parseInt(tabClass.split('tab-navbar-element-')[1], 10);
    }
  });

  let overflowMovement = false;
  let underflowMovement = false;
  let indexToActivate = currentActiveIndex + direction;
  if (indexToActivate > tabsCount) {
    overflowMovement = true;
    indexToActivate = 1;
  } else if (indexToActivate === 0) {
    underflowMovement = true;
    indexToActivate = tabsCount;
  }

  const nextTitleToActivate = block.getElementsByClassName(`tab-navbar-element-${indexToActivate}`);
  if (!nextTitleToActivate || (nextTitleToActivate && nextTitleToActivate.length !== 1)) {
    return;
  }

  tabTitleToHide.classList.remove(ACTIVE_TAB_TITLE_CLASS);
  tabTitleToHide.classList.add(HIDDEN_TAB_TITLE_CLASS);

  const tabTitleToActivate = nextTitleToActivate[0];
  tabTitleToActivate.classList.remove(HIDDEN_TAB_TITLE_CLASS);
  tabTitleToActivate.classList.add(ACTIVE_TAB_TITLE_CLASS);

  const overflowAnimationDetails = {
    overflowMovement,
    underflowMovement,
  };
  showTab(block, indexToActivate, overflowAnimationDetails);
}

export default function decorate(block) {
  const tabTitles = document.createElement('div');
  tabTitles.classList.add('tab-navbar');

  block.prepend(tabTitles);

  const tabsHolder = document.createElement('div');
  tabsHolder.classList.add('tab-tabs-holder');

  let tabsCount = 0;
  [...block.children].forEach((row, rowIndex) => {
    if (rowIndex > 0) {
      row.classList.add('tab');
      row.classList.add(`tab-content-${rowIndex}`);
      tabsCount += 1;
    }

    if (rowIndex === 1) {
      row.classList.add(ACTIVE_TAB_CLASS);
    } else if (rowIndex > 1) {
      row.classList.add(HIDDEN_TAB_CLASS);
    }

    [...row.children].forEach((contentElement, i) => {
      if (contentElement.innerHTML) {
        if (i === 0) {
          const divToMove = contentElement.closest('div');
          divToMove.classList.add('tab-title');
          divToMove.classList.add(`tab-navbar-element-${rowIndex}`);
          if (rowIndex === 1) {
            divToMove.classList.add(ACTIVE_TAB_TITLE_CLASS);
          } else {
            divToMove.classList.add(HIDDEN_TAB_TITLE_CLASS);
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

  const mediaWidthQueryMatcher = window.matchMedia(RESPONSIVE_MEDIA_QUERY);
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      const backButtons = block.getElementsByClassName('backward-tab-button');
      if (!backButtons || backButtons.length === 0) {
        const backButton = document.createElement('div');
        backButton.classList.add('backward-tab-button');
        tabTitles.prepend(backButton);

        backButton.addEventListener('click', () => {
          showTitle(block, tabsCount, MOVE_TABS_BACK);
        });
      }

      const forwardButtons = block.getElementsByClassName('forward-tab-button');
      if (!forwardButtons || forwardButtons.length === 0) {
        const forwardButton = document.createElement('div');
        forwardButton.classList.add('forward-tab-button');
        tabTitles.appendChild(forwardButton);

        forwardButton.addEventListener('click', () => {
          showTitle(block, tabsCount, MOVE_TABS_FORWARD);
        });
      }

      const tabTitleToHide = block.getElementsByClassName('tab-title');
      [...tabTitleToHide].forEach((tab) => {
        if (!tab.classList.toString().includes(ACTIVE_TAB_TITLE_CLASS)) {
          tab.classList.add(HIDDEN_TAB_TITLE_CLASS);
        }
      });
    } else {
      const hiddenTabs = block.getElementsByClassName(HIDDEN_TAB_TITLE_CLASS);
      [...hiddenTabs].forEach((hiddenTab) => hiddenTab.classList.remove(HIDDEN_TAB_TITLE_CLASS));
      
      const backButtons = block.getElementsByClassName('backward-tab-button');
      [...backButtons].forEach((button) => button.remove());

      const forwardButtons = block.getElementsByClassName('forward-tab-button');
      [...forwardButtons].forEach((button) => button.remove());
    }
  };
  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
