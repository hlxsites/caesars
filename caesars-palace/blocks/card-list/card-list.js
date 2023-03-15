import { readBlockConfig, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { lookupCardsByType } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // read configs and remove elements
  const cfg = readConfig(block);
  // fetch cards by type
  const cardIndex = await lookupCardsByType(cfg.type);
  // build filter panel, if filters
  if (cfg.filters) {
    const fullWidth = document.createElement('div');
    fullWidth.classList.add('full-width');
    addFilterPanel(block, fullWidth, cfg.filters);
    // card count and active filters
    const activeFilters = document.createElement('div');
    activeFilters.classList.add('active-filters');
    const cardCount = document.createElement('span');
    cardCount.classList.add('card-count');
    cardCount.innerHTML = cardIndex.data.length + ' Results';
    activeFilters.appendChild(cardCount);
    const activeFilterList = document.createElement('ul');
    activeFilterList.classList.add('active-filter-list');
    activeFilters.appendChild(activeFilterList);
    fullWidth.appendChild(activeFilters);
    block.appendChild(fullWidth);
  }
  // render card data
  const cardResults = document.createElement('div');
  cardResults.classList.add('card-results');
  cardResults.setAttribute('data-page-size', cfg.pageSize);
  cardIndex.data.forEach((cardData, index) => {  
    const card = document.createElement('div');
    card.classList.add('card');
    if (index >= cfg.pageSize) {
      card.classList.add('hidden');
    }
    // preprocess for synthetic filters
    preprocessCardData(cardData, cfg.type);
    // populate filters and tag cards
    if (cfg.filters) {
      processFiltersWithCard(cardData, card, cfg.filters);
    }
    const cardLink = cardData.pageUrl != '' ? cardData.pageUrl : cardData.secondaryUrl;
    // card image
    const cardImage = document.createElement('div');
    cardImage.classList.add('card-image');
    const cardImageLink = document.createElement('a');
    cardImageLink.href = cardLink;
    cardImageLink.appendChild(createOptimizedPicture(cardData.thumbnail, cardData.title, false, [{ media: '(min-width: 960px)', width: '480' }, { width: '350' } ]));
    cardImage.appendChild(cardImageLink);
    // mobile
    const mobile = document.createElement('div');
    mobile.classList.add('card-mobile');
    const mobileTitle = document.createElement('div');
    mobileTitle.classList.add('card-mobile-title');
    mobileTitle.innerHTML = cardData.title;
    mobile.appendChild(mobileTitle);
    if (cfg.type == 'restaurants' && cardData.propertyName) {
      const mobileLocation = document.createElement('div');
      mobileLocation.classList.add('card-mobile-location');
      mobileLocation.innerHTML = cardData.propertyName;
      mobile.appendChild(mobileLocation);
    }
    cardImage.appendChild(mobile);
    card.appendChild(cardImage);
    // card content
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    // card top
    const cardTop = document.createElement('div');
    cardTop.classList.add('card-top');
    // title
    const title = document.createElement('div');
    title.classList.add('card-title');
    const titleLink = document.createElement('a');
    titleLink.href = cardLink;
    const titleH4 = document.createElement('h4');
    titleH4.innerHTML = cardData.title;
    titleLink.appendChild(titleH4);
    title.appendChild(titleLink);
    cardTop.appendChild(title);
    // description
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('card-description');
    const descriptionP = document.createElement('p');
    descriptionP.innerHTML = cardData.description;
    descriptionDiv.appendChild(descriptionP);
    cardTop.appendChild(descriptionDiv);
    // subtitle
    if (cardData.propertyName && cardData.propertyName != '') {
      const subtitleDiv = document.createElement('div');
      subtitleDiv.classList.add('card-subtitle');
      subtitleDiv.innerHTML = cardData.propertyName;
      cardTop.appendChild(subtitleDiv);
    }
    cardContent.appendChild(cardTop);
    // card bottom
    const cardBottom = document.createElement('div');
    cardBottom.classList.add('card-bottom')
    // card bottom left
    const cardBottomLeft = document.createElement('div');
    cardBottomLeft.classList.add('card-bottom-left');
    if (cardData.location) {
      const locationDiv = document.createElement('span');
      locationDiv.innerHTML = cardData.location;
      cardBottomLeft.appendChild(locationDiv);
    }
    const categoryDiv = document.createElement('div');
    categoryDiv.innerHTML = cfg.type == 'restaurants' ? cardData.cuisine : cardData.category;
    cardBottomLeft.appendChild(categoryDiv);
    cardBottom.appendChild(cardBottomLeft);
    // card bottom middle
    const cardBottomMiddle = document.createElement('div');
    cardBottomMiddle.classList.add('card-bottom-middle');
    if (cfg.type == 'restaurants' && cardData.price && cardData.price != '') {
      const price = document.createElement('span');
      price.classList.add('card-price');
      price.innerHTML = cardData.price;
      cardBottomMiddle.appendChild(price);
      const priceUnused = document.createElement('span');
      priceUnused.classList.add('card-price-unused');
      priceUnused.innerHTML = '$'.repeat(4 - cardData.price.length);
      cardBottomMiddle.appendChild(priceUnused);
    }
    cardBottom.appendChild(cardBottomMiddle);
    // card bottom right
    const linkDiv = document.createElement('div');
    linkDiv.classList.add('card-bottom-right');
    const link = document.createElement('a');
    link.href = cardLink;
    linkDiv.appendChild(link);
    cardBottom.appendChild(linkDiv);
    cardContent.appendChild(cardBottom)
    // add to card and results
    card.appendChild(cardContent);
    cardResults.appendChild(card);
  });
  block.appendChild(cardResults);
  drawPagination(block);
}

function readConfig(block) {
  const config = { pageSize: 12 };
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const configName = cols[0].textContent;
        if (configName == 'type') {
          config.type = cols[1].textContent;
          row.remove();
        } else if (configName == 'filter') {
          if (!config.filters) {
            config.filters = [];
          }
          // todo: add some error handling here
          const filterSplit = cols[1].textContent.trim().split(',');
          const icon = cols[1].querySelector('span');
          config.filters.push({
              name: filterSplit[0].trim(),
              property: filterSplit[1].trim(),
              icon: icon ? icon : null,
              values: []
            });
          row.remove();
        } else if (configName == 'page-size') {
          config.pageSize = Number(cols[1].textContent);
          row.remove();
        }
      }
    }
  });
  return config;
}

// todo: add special handling for dining options and open now.
function addFilterPanel(block, fullWidth, filters) {
  // filter panel
  const filterPanel = document.createElement('div');
  filterPanel.classList.add('filter-panel');
  const filterLabel = document.createElement('div');
  filterLabel.classList.add('filter-label')
  filterLabel.innerHTML = 'Filter By:';
  filterPanel.appendChild(filterLabel);
  const filterGroup = document.createElement('div');
  filterGroup.classList.add('filter-group');
  const mobileFilterGroup = document.createElement('div');
  mobileFilterGroup.classList.add('filter-group'); // test 
  //mobileFilterGroup.classList.add('mobile-filter-group');
  filters.forEach(filter => {
    const filterDropdown = document.createElement('div');
    filterDropdown.classList.add('dropdown');
    // category
    const filterTarget = document.createElement('div');
    filterTarget.classList.add('dropdown-target');
    filterTarget.addEventListener('click', toggleDropdown);
    if (filter.icon) {
      filter.icon.classList.add('dropdown-target-icon');
      filterTarget.appendChild(filter.icon);
    }
    const filterName = document.createElement('div');
    filterName.classList.add('dropdown-target-button')
    const filterNameLink = document.createElement('a');
    filterNameLink.innerHTML = filter.name;
    filterName.appendChild(filterNameLink);
    filterTarget.appendChild(filterName);
    filterDropdown.appendChild(filterTarget);
    // options
    const filterContent = document.createElement('div');
    filterContent.classList.add('dropdown-content');
    filterDropdown.appendChild(filterContent);
    filter.element = filterContent;
    filterGroup.appendChild(filterDropdown);
    // mobile options
    const mobileFilterDropdown = filterDropdown.cloneNode(true);
    filter.mobileElement = mobileFilterDropdown.querySelector('.dropdown-content');
    mobileFilterDropdown.querySelector('.dropdown-target').addEventListener('click', toggleDropdown);
    mobileFilterGroup.appendChild(mobileFilterDropdown);
  });
  filterPanel.appendChild(filterGroup);
  // clear button
  const filterClear = document.createElement('div');
  filterClear.classList.add('filter-clear');
  filterClear.appendChild(createButton('Clear', clearFilters, 'ghost'));
  filterPanel.appendChild(filterClear);
  // edit button
  const filterEdit = document.createElement('div');
  filterEdit.classList.add('filter-edit');
  filterEdit.appendChild(createButton('Edit', toggleMobileFilters, 'ghost'));
  filterPanel.appendChild(filterEdit);
  fullWidth.appendChild(filterPanel);
  // filter modal
  const modal = document.createElement('div');
  modal.classList.add('modal');
  //modal.classList.add('open'); // temporary
  const mobileFilterPanel = document.createElement('div');
  mobileFilterPanel.classList.add('mobile-filter-panel');
  const filterModal = document.createElement('div');
  filterModal.classList.add('modal-main');
  filterModal.setAttribute('role', 'dialog');
  filterModal.setAttribute('aria_labelledby', 'modal-label');
  filterModal.setAttribute('aria_describedby', 'modal-description');
  filterModal.setAttribute('aria-modal', true);
  mobileFilterPanel.appendChild(filterModal);
  const modalClose = document.createElement('div');
  modalClose.classList.add('close-button');
  modalClose.setAttribute('aria-label', 'Close');
  modalClose.setAttribute('role', 'button');
  modalClose.addEventListener('click', toggleMobileFilters);
  filterModal.append(modalClose);
  const modalLabel = document.createElement('h2');
  modalLabel.classList.add('h2');
  modalLabel.id = 'modal-label';
  modalLabel.innerHTML = 'Filter By:';
  filterModal.appendChild(modalLabel);
  const modalDescription = document.createElement('div');
  modalDescription.classList.add('modal-contents');
  modalDescription.id = 'modal-description';
  filterModal.appendChild(modalDescription);
  modalDescription.appendChild(mobileFilterGroup);
  const mobileFilterClear = document.createElement('div');
  mobileFilterClear.classList.add('clear');
  mobileFilterClear.appendChild(createButton('Clear', clearFilters, 'light'));
  modalDescription.appendChild(mobileFilterClear);
  modal.appendChild(mobileFilterPanel);
  block.appendChild(modal);
}

function createButton(title, clickEvent, style) {
  const button = document.createElement('div');
  button.classList.add('link-button');
  if (style) {
    button.classList.add('link-button-' + style);
  }
  button.addEventListener('click', clickEvent);
  const buttonLink = document.createElement('a');
  buttonLink.title = title;
  buttonLink.target = '_self';
  buttonLink.setAttribute('aria-label', title);
  buttonLink.innerHTML = title;
  button.appendChild(buttonLink);
  return button;
}

function toggleDropdown() {
  const dropdown = this.closest('.dropdown');
  if (dropdown.classList.contains('open')) {
    dropdown.classList.remove('open');
  } else {
    dropdown.classList.add('open');
  }
}

function toggleMobileFilters() {
  const modal = this.closest('.card-list.block').querySelector('.modal')
  if (modal.classList.contains('open')) {
    modal.classList.remove('open');
  } else {
    modal.classList.add('open');
  }
}

function preprocessCardData(cardData, type) {
  if (type == 'restaurants') {
    cardData.diningOptions = [];
    if (cardData.dineIn && cardData.dineIn == 'true') {
      cardData.diningOptions.push('Dine In');
    }
    if (cardData.takeOut && cardData.takeOut == 'true') {
      cardData.diningOptions.push('Take Out');
    }
    if (cardData.delivery && cardData.delivery == 'true') {
      cardData.diningOptions.push('Delivery');
    }
    cardData['openNow'] = true;
  }
}

// todo: add special handling for dining options and open now.
function processFiltersWithCard(cardData, card, filters) {
  const cardFilters = [];
  filters.forEach(filter => {
    let filterValues = cardData[filter.property];
    if (filterValues) {
      // some values may be arrays.  convert single values.
      if (!Array.isArray(filterValues)) {
        filterValues = [ filterValues ];
      } 
      filterValues.forEach(filterValue => {
        if (!filter.values.includes(filterValue)) {
          // new filter option found. add.
          const filterOption = createFilterOption(filter, filterValue);
          filter.element.appendChild(filterOption);
          // mobile filter option.
          const mobileFilterOption = filterOption.cloneNode(true);
          mobileFilterOption.addEventListener('change', toggleFilter);
          filter.mobileElement.appendChild(mobileFilterOption);
          filter.values.push(filterValue);
        }
        cardFilters.push(filter.property + ':' + filterValue);
      })
    }
  });
  if (cardFilters.length > 0) {
    // write filter data to card.
    card.setAttribute('data-filters', cardFilters);
  }
}

function createFilterOption(filter, filterValue) {
  const checkbox = document.createElement('div');
  checkbox.classList.add('checkbox');
  checkbox.setAttribute('data-filter', filter.property + ':' + filterValue);
  checkbox.addEventListener('change', toggleFilter);
  const label = document.createElement('label');
  label.classList.add('checkbox-label');
  const labelContent = document.createElement('div');
  labelContent.classList.add('checkbox-label-content');
  const checkboxInput = document.createElement('input');
  checkboxInput.type = 'checkbox';
  checkboxInput.classList.add('checkbox-input');
  checkboxInput.name = filterValue;
  checkboxInput.setAttribute('aria-label', filterValue);
  labelContent.appendChild(checkboxInput);
  const labelSpan = document.createElement('span');
  labelSpan.classList.add('checkbox-label-text');
  labelSpan.innerHTML = filterValue;
  labelContent.appendChild(labelSpan);
  label.appendChild(labelContent);
  checkbox.appendChild(label);
  return checkbox;
}

function clearFilters() {
  const block = this.closest('.card-list.block');
  block.querySelectorAll('div.filter-group input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  // remove active filters.
  const activeFilterList = block.querySelector('ul.active-filter-list');
  activeFilterList.querySelectorAll('li').forEach(activeFilter => {
    activeFilter.remove();
  });
  performFiltering(block, activeFilterList);
}

function toggleFilter() {
  const filter = this.getAttribute('data-filter');
  const block = this.closest('.card-list.block');
  const activeFilterList = block.querySelector('ul.active-filter-list');
  const toggleOn = this.querySelector('input.checkbox-input').checked;
  const mobile = this.closest('.mobile-filter-panel');
  block.querySelector('.' + (!mobile ? 'mobile-' : '') + 'filter-panel div[data-filter="' + filter + '"] input[type="checkbox"]').checked = toggleOn;
  if (toggleOn) {
    const activeFilter = document.createElement('li');
    activeFilter.classList.add('active-filter');
    activeFilter.setAttribute('data-filter', filter);
    const activeFilterLabel = document.createElement('label');
    activeFilterLabel.innerHTML = this.querySelector('span.checkbox-label-text').innerHTML;
    activeFilter.appendChild(activeFilterLabel);
    activeFilterList.appendChild(activeFilter);
  } else {
    activeFilterList.querySelector('[data-filter="' + filter + '"]').remove();
  }
  performFiltering(block, activeFilterList)
}

function performFiltering(block, activeFilterListContainer) {
  const cards = block.querySelectorAll('div.card');
  const activeFilterListItems = activeFilterListContainer.querySelectorAll('li.active-filter');
  const activeFilters = [];
  activeFilterListItems.forEach(activeFilter => {
    activeFilters.push(activeFilter.getAttribute('data-filter'));
  });
  let count = 0;
  cards.forEach(card => {
    if (!card.getAttribute('data-filters')) {
      // no data filters.  always hide with filters.
      if (activeFilters.length == 0) {
        card.classList.remove('filtered');
        count++;
      } else {
        card.classList.add('filtered');
      }
    } else {
      const cardFilters = card.getAttribute('data-filters').split(',');
      const show = activeFilters.every(filter => cardFilters.includes(filter));
      if (show) {
        card.classList.remove('filtered');
        count++;
      } else {
        card.classList.add('filtered');
      }
    }
  });
  block.querySelector('span.card-count').innerHTML = count + ' Results';
  const firstPageButton = drawPagination(block);
  if (firstPageButton) {
    firstPageButton.click();
  } else {
    cards.forEach(card => { card.classList.remove('hidden'); });
  }
}

function drawPagination(block) {
  const cardResults = block.querySelector('div.card-results');
  const pagination = cardResults.querySelector('div.pagination');
  if (pagination) {
    pagination.remove();
  }
  const pageSize = cardResults.getAttribute('data-page-size');
  const totalCards = block.querySelectorAll('div.card:not(.filtered)').length;
  let firstPageButton = null;
  if (totalCards > pageSize) {
    const pagination = document.createElement('div');
    pagination.classList.add('pagination');
    // previous button
    const previous = document.createElement('button');
    previous.classList.add('previous')
    previous.classList.add('chevron');
    previous.classList.add('chevron-left');
    previous.classList.add('hidden');
    previous.addEventListener('click', previousPage);
    const previousText = document.createElement('span');
    previousText.classList.add('previous-text');
    previousText.innerHTML = 'Previous';
    previous.appendChild(previousText);
    pagination.appendChild(previous);
    let pageIndex = 1;
    while (pageIndex <= Math.ceil(totalCards / pageSize)) {
      const page = document.createElement('button');
      page.setAttribute('data-page-number', pageIndex);
      page.addEventListener('click', handlePagination);
      page.classList.add('page');
      if (pageIndex == 1) {
        page.classList.add('active-page');
        firstPageButton = page;
      }
      const pageNumber = document.createElement('span');
      pageNumber.classList.add('page-number');
      pageNumber.innerHTML = pageIndex++;
      page.appendChild(pageNumber);
      pagination.appendChild(page);
    }
    pagination.setAttribute('data-total-pages', pageIndex - 1);
    // next button
    const next = document.createElement('button');
    next.classList.add('next');
    next.classList.add('chevron');
    next.classList.add('chevron-right');
    next.addEventListener('click', nextPage);
    const nextText = document.createElement('span');
    nextText.classList.add('next-text');
    nextText.innerHTML = 'Next';
    next.appendChild(nextText);
    pagination.appendChild(next);
    cardResults.appendChild(pagination);
  }
  return firstPageButton;
}

function nextPage() {
  const pagination = this.closest('div.pagination');
  let pageNumber = pagination.querySelector('button.active-page').getAttribute('data-page-number');
  pagination.querySelector('button[data-page-number="' + ++pageNumber + '"]').click();
}

function previousPage() {
  const pagination = this.closest('div.pagination');
  let pageNumber = pagination.querySelector('button.active-page').getAttribute('data-page-number');
  pagination.querySelector('button[data-page-number="' + --pageNumber + '"]').click();
}

function handlePagination() {
  const totalPages = this.closest('div.pagination').getAttribute('data-total-pages');
  const cardResults = this.closest('div.card-results');
  cardResults.querySelector('button.active-page').classList.remove('active-page');
  this.classList.add('active-page');
  const pageSize = cardResults.getAttribute('data-page-size');
  const pageNumber = this.getAttribute('data-page-number');
  // handle previous/next
  if (pageNumber > 1) {
    cardResults.querySelector('button.previous').classList.remove('hidden');
  } else {
    cardResults.querySelector('button.previous').classList.add('hidden');
  }
  if (pageNumber < totalPages) {
    cardResults.querySelector('button.next').classList.remove('hidden');
  } else {
    cardResults.querySelector('button.next').classList.add('hidden');
  }
  // hide/show cards
  cardResults.querySelectorAll('div.card:not(.filtered)').forEach((card, index) => {
    if (Math.ceil((index + 1)/pageSize) == pageNumber) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
  // scroll to top of block
  window.scroll({
    top: this.closest('.card-list.block').scrollTop,
    left: 0,
    behavior: 'smooth'
  });
}