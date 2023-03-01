import { readBlockConfig, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { lookupCardsByType } from '../../scripts/scripts.js';

export default async function decorate(block) {

  // read configs and from ui
  const cfg = readBlockConfig(block);
  block.querySelectorAll('div').forEach(configDiv => {
    configDiv.remove();
  })

  // parse filters
  const filters = parseFilters(cfg.filters);
  // build filter panel, if filters
  if (filters.length > 0) {
    block.appendChild(buildFilterPanel(block, filters));
  }

  // fetch cards by type
  const cardIndex = await lookupCardsByType(cfg.type);
  
  const cardResults = document.createElement('div');
  cardResults.classList.add('card-list-results');

  cardIndex.data.forEach(cardData => {

    const card = document.createElement('div');
    card.classList.add('card')

    preprocessCardData(cardData, cfg.type);

    // populate filters and tag cards
    processFiltersWithCard(cardData, card, filters);

    // image
    const imageLink = document.createElement('a');
    imageLink.href = cardData.pageUrl;
    const cardImage = document.createElement('div');
    cardImage.classList.add('card-image');
    cardImage.appendChild(createOptimizedPicture(cardData.thumbnail, cardData.title, false, [{ media: '(min-width: 1170px)', width: '436.48' }, { media: '(min-width: 768px)', width: '180' }, { media: '(min-width: 480px)', width: '120' }]));
    imageLink.appendChild(cardImage);
    card.appendChild(imageLink);
    // card top
    const cardTop = document.createElement('div');
    cardTop.classList.add('card-top');
    // title
    const title = document.createElement('div');
    title.classList.add('card-title');
    const titleH4 = document.createElement('h4');
    titleH4.innerHTML = cardData.title;
    title.appendChild(titleH4);
    cardTop.appendChild(title);
    // description
    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerHTML = cardData.description;
    cardTop.appendChild(descriptionDiv);
    card.appendChild(cardTop);

    // card bottom
    const cardBottom = document.createElement('div');
    cardBottom.classList.add('card-bottom')
    // location
    if (cardData.location) {
      const locationDiv = document.createElement('div');
      locationDiv.innerHTML = cardData.location;
      cardBottom.appendChild(locationDiv);
    }
    // category
    const categoryDiv = document.createElement('div');
    categoryDiv.innerHTML = cardData.category;
    cardBottom.appendChild(categoryDiv);
    // link
    const linkDiv = document.createElement('div');
    const link = document.createElement('a');
    link.href = cardData.pageUrl != '' ? cardData.pageUrl : cardData.secondaryUrl;
    link.innerHTML = 'link';
    const linkSpan = document.createElement('span');
    linkSpan.classList.add('icon');
    linkSpan.classList.add('icon-arrow-right');
    linkSpan.appendChild(link);
    linkDiv.appendChild(linkSpan);
    cardBottom.appendChild(linkDiv);
    card.appendChild(cardBottom)

    // temporary for debugging 
    if (cfg.type == 'restaurants') {
      const diningOptions = document.createElement('div');
      const diningOptionsUl = document.createElement('ul');
      cardData.diningOptions.forEach(diningOption => {
        const diningOptionsLi = document.createElement('li');
        diningOptionsLi.innerHTML = diningOption;
        diningOptionsUl.appendChild(diningOptionsLi);
      });
      diningOptions.appendChild(diningOptionsUl);
      card.appendChild(diningOptions);
    }

    // add card to block
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
function buildFilterPanel(block, filters) {
  const filterPanel = document.createElement('div');
  filterPanel.classList.add('card-list-filters');
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
  filterPanel.appendChild(filterUl);
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