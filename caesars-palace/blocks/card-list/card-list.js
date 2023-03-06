import { readBlockConfig, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { lookupCardsByType } from '../../scripts/scripts.js';

export default async function decorate(block) {

  // read configs and from ui
  const cfg = readBlockConfig(block);
  block.querySelectorAll('div').forEach(configDiv => {
    configDiv.remove();
  })

  // fetch cards by type
  const cardIndex = await lookupCardsByType(cfg.type);

  // parse filters
  const filters = parseFilters(cfg.filters);
  // build filter panel, if filters
  if (filters.length > 0) {
    block.appendChild(buildFilterPanel(block, filters, cardIndex));
  }

  const cardResults = document.createElement('div');
  cardResults.classList.add('card-list-results');

  cardIndex.data.forEach(cardData => {  
    const card = document.createElement('div');
    card.classList.add('card')
    // preprocess for synthetic filters
    preprocessCardData(cardData, cfg.type);
    // populate filters and tag cards
    processFiltersWithCard(cardData, card, filters);
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
}

function parseFilters(filterConfig) {
  const filters = [];
  if (filterConfig) {
    filterConfig.split(",").forEach(filter => {
      const filterSplit = filter.trim().split(":");
      if (filterSplit.length == 2) {
        filters.push({
          name: filterSplit[0].trim(),
          property: filterSplit[1].trim(),
          values: []
        });
      }
    });
  }
  return filters;
}

// todo: add special handling for dining options and open now.
function buildFilterPanel(block, filters, cardIndex) {
  // filter panel
  const filterPanel = document.createElement('div');
  filterPanel.classList.add('card-list-filter-panel');
  // filter group
  const filterGroup = document.createElement('div');
  const filterUl = document.createElement('ul');
  filters.forEach(filter => {
    const filterLi = document.createElement('li');
    filterLi.setAttribute('data-filter', filter.property);
    filterLi.innerHTML = filter.name;
    filterUl.appendChild(filterLi);
    const filterValues = document.createElement('ul');
    filterLi.appendChild(filterValues);
    filter.element = filterValues;
  });
  filterGroup.appendChild(filterUl);
  filterPanel.appendChild(filterGroup);
  // filter count
  const filterCount = document.createElement('div');
  filterCount.classList.add('card-list-filter-count');
  filterCount.innerHTML = cardIndex.data.length + ' Results';
  filterPanel.appendChild(filterCount);
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
  filters.forEach(filter => {
    let filterValues = cardData[filter.property];
    if (filterValues) {
      if (!Array.isArray(filterValues)) {
        filterValues = [ filterValues ];
      }
      const cardFilters = [];
      filterValues.forEach(filterValue => {
        if (!filter.values.includes(filterValue)) {
          const filterOption = document.createElement('li');
          filterOption.setAttribute('data-filter-value', filterValue);
          filterOption.innerHTML = filterValue;
          filter.element.appendChild(filterOption);
          filter.values.push(filterValue);
        }
        cardFilters.push(filter.property + ':' + filterValue);
      })
      card.setAttribute('data-filters', cardFilters);
    }
  });
}