import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

async function getProducts(type) {
  const indexPath = `${window.hlx.codeBasePath}/products/${type}/query-index.json`;
  const indexRes = await fetch(`${indexPath}`);
  const indexJson = await indexRes.json();
  if (indexJson && indexJson.data && (indexJson.data.length > 0)) {
    const productList = indexJson.data;
    const productData = await Promise.all(productList.map(async (product) => {
      const productPath = product.path;
      const productDetailsRes = await fetch(productPath);
      const productDetailsJson = await productDetailsRes.json();
      if (productDetailsJson && productDetailsJson.overview && productDetailsJson.overview.data
        && (productDetailsJson.overview.data.length > 0)) {
        const productDetails = productDetailsJson.overview.data[0];
        const returnObj = { productPath };
        if (productDetails.Title) returnObj.productTitle = productDetails.Title;
        // If secondaryUrl exists, use that. Otherwise, default to the product details page
        if (productDetails['Secondary Url']) {
          returnObj.secondaryUrl = productDetails['Secondary Url'];
        } else if (productDetails['Page URL']) {
          returnObj.secondaryUrl = productDetails['Page URL'];
        }
        if (productDetails['Open secondary url in new tab']) returnObj.secondaryUrlNewTab = productDetails['Open secondary url in new tab'];
        if (productDetails['Secondary Url button text']) returnObj.buttonText = productDetails['Secondary Url button text'];

        return returnObj;
      }
      return { productPath };
    }));
    return productData;
  }
  return null;
}

/**
 * Loads and decorates the block
 * @param {Element} block, the block element
 */
export default async function decorate(block) {
  const cfg = await readBlockConfig(block);
  const { type, title } = cfg;
  // Clear out the block contents
  block.innerHTML = '';
  const products = await getProducts(type);
  // Create structure
  const heading = createTag('h6', {}, title);
  const dropdownMenu = createTag('ul', { class: 'dropdown-menu' });
  let buttonText;
  products.forEach((product) => {
    let attrs = {};
    if (product.secondaryUrl) {
      attrs = {
        'data-url': product.secondaryUrl,
        'data-newtab': product.secondaryUrlNewTab,
      };
    }
    buttonText = product.buttonText;
    const li = createTag('li', attrs, product.productTitle);
    dropdownMenu.append(li);
  });
  const dropdownLabel = createTag('div', { class: 'dropdown-label' }, '');
  const dropdownButton = createTag('a', { href: '', class: 'button primary' }, buttonText);
  const strong = document.createElement('strong');
  strong.append(dropdownButton);
  const dropdownButtonContainer = createTag('p', { class: 'button-container' }, strong);
  const dropdownContainer = createTag('div', { class: 'dropdown-container' }, [dropdownLabel, dropdownMenu]);
  const divider = createTag('div', { class: 'divider' }, '');
  const dropdown = createTag('div', { class: 'dropdown' }, [heading, divider, dropdownContainer, dropdownButtonContainer]);

  // Event listeners to show/hide the dropdown
  // When you click on the main selection
  dropdownContainer.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
    dropdownContainer.classList.toggle('show');
  });
  // Or when you click outside the dropdown area
  document.addEventListener('click', (event) => {
    const isClickInside = dropdownContainer.contains(event.target);
    if (!isClickInside) {
      if (dropdownMenu.classList.contains('show')) dropdownMenu.classList.toggle('show');
      if (dropdownContainer.classList.contains('show')) dropdownContainer.classList.toggle('show');
    }
  });

  // Event listener when an item in the dropdown is selected
  dropdownMenu.addEventListener('click', (event) => {
    const selectedItem = event.target;
    // Set the label
    dropdownLabel.textContent = selectedItem.textContent;
    // Update the button url
    const { url, newtab } = selectedItem.dataset;
    if (url && newtab) {
      dropdownButton.setAttribute('href', url);
      if (newtab === 'true') dropdownButton.setAttribute('target', '_blank');
    }
  });

  block.append(dropdown);
}
