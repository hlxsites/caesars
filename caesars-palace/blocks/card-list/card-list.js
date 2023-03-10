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
    fullWidth.appendChild(buildFilterPanel(block, cfg.filters));
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
    cardImageLink.appendChild(createOptimizedPicture(cardData.thumbnail, cardData.title, false, [{ media: '(min-width: 960px)', height: '440' }, { media: '(min-width: 768px)', height: '240' }, { media: '(min-width: 480px)', height: '180' }]));
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
function buildFilterPanel(block, filters, cardIndex) {

  // filter panel
  const filterPanel = document.createElement('div');
  filterPanel.classList.add('filter-panel');
  const filterLabel = document.createElement('div');
  filterLabel.classList.add('filter-label')
  filterLabel.innerHTML = 'Filter By:';
  filterPanel.appendChild(filterLabel);

  // filter group
  const filterGroup = document.createElement('div');
  filterGroup.classList.add('filter-group');
  filters.forEach(filter => {
    const filterDropdown = document.createElement('div');
    filterDropdown.classList.add('dropdown');

    // category
    const filterTarget = document.createElement('div');
    filterTarget.classList.add('dropdown-target');
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
   
  });
  filterPanel.appendChild(filterGroup);

  // clear button
  const filterClear = document.createElement('div');
  filterClear.classList.add('filter-clear');
  const clearButton = document.createElement('div');
  clearButton.classList.add('link-button');
  clearButton.classList.add('link-button-ghost');
  clearButton.addEventListener('click', clearFilters);
  const clearLink = document.createElement('a');
  clearLink.innerHTML = 'clear';
  clearButton.appendChild(clearLink);
  filterClear.appendChild(clearButton)
  filterPanel.appendChild(filterClear);
  
  // edit button
  const filterEdit = document.createElement('div');
  filterEdit.classList.add('filter-edit');
  const editButton = document.createElement('div');
  editButton.classList.add('link-button');
  editButton.classList.add('link-button-ghost');
  const editLink = document.createElement('a');
  editLink.href = 'https://www.google.com';
  editLink.innerHTML = 'edit';
  editButton.appendChild(editLink);
  filterEdit.appendChild(editButton);
  filterPanel.appendChild(filterEdit);
  return filterPanel;
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
          // new filter value.  add to dropdown.
          filter.element.appendChild(createDropdownOption(filter, filterValue));
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

function createDropdownOption(filter, filterValue) {
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
  // remove
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
    top: this.closest('.card-list.block').offsetTop,
    left: 0,
    behavior: 'smooth'
  });
}