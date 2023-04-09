import {
  createOptimizedPicture,
  getMetadata,
  buildBlock,
  loadBlocks,
} from '../../scripts/lib-franklin.js';
import { decorateMain } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // Check if json endpoint exists and this is a product details template
  const template = getMetadata('template');
  const endpoint = block.querySelector('a').href;
  if ((template === 'Product Details') && endpoint) {
    // Remove the existing block and containing section
    const productDetailsSection = document.querySelector('.section.product-details-container');
    productDetailsSection.remove();
    // Replace /caesars-palace from the url since that is already in the codebasePath
    const pdPath = new URL(endpoint).pathname.replace('/caesars-palace', '');
    const resp = await fetch(`${window.hlx.codeBasePath}${pdPath}`);
    const json = await resp.json();
    if (json) {
      const main = document.querySelector('main');

      /** Create Hero Section */
      // Get Image, Title
      const heroImage = json.overview.data[0]['Hero Image'];
      const heroTitle = json.overview.data[0].Title;
      if (heroImage && heroTitle) {
        // Create the content structure
        const heroH1 = document.createElement('h1');
        heroH1.innerText = heroTitle;
        const picture = createOptimizedPicture(`${heroImage}`, heroTitle, true);
        // Add the elements to the section
        const heroSection = document.createElement('div');
        heroSection.classList.add('section', 'has-background', 'is-hero', 'right-aligned');
        heroSection.append(picture);
        heroSection.append(heroH1);
        main.prepend(heroSection);
      }

      /** Create Columns section */
      const contentDetails = json['content-details'].data;
      if (contentDetails && contentDetails.length > 0) {
        contentDetails.forEach(async (row, i) => {
          const colTitle = row.Title;
          const colDesc = row.Description;
          const colImage = row.Image;

          if (colTitle && colDesc && colImage) {
            // Create the content structure
            const colH3 = document.createElement('h3');
            colH3.innerText = colTitle;
            const colP = document.createElement('p');
            colP.innerText = colDesc;
            const contentDiv = document.createElement('div');
            contentDiv.append(colH3);
            contentDiv.append(colP);
            const colPicture = createOptimizedPicture(`${colImage}`, colTitle, false);

            /** Create Columns Block for first content detail row */
            if (i === 0) {
              const columnsBlock = buildBlock('columns', [[contentDiv, colPicture]]);
              // Add these elements to a new section
              const columnsSection = document.createElement('div');
              columnsSection.classList.add('section', 'has-centered-text');
              columnsSection.append(columnsBlock);
              main.append(columnsSection);
            } else if (i % 2 === 0) {
              // Even rows
              const columnsBlock = buildBlock('columns', [[colPicture, contentDiv]]);
              columnsBlock.classList.add('cet-card', 'full-width');
              // Add these elements to a new section
              const columnsSection = document.createElement('div');
              columnsSection.classList.add('section', 'has-centered-text');
              columnsSection.append(columnsBlock);
              main.append(columnsSection);
            } else {
              // Odd rows
              const columnsBlock = buildBlock('columns', [[contentDiv, colPicture]]);
              columnsBlock.classList.add('cet-card', 'full-width');
              // Add these elements to a new section
              const columnsSection = document.createElement('div');
              columnsSection.classList.add('section', 'has-centered-text');
              columnsSection.append(columnsBlock);
              main.append(columnsSection);
            }
          }
        });

        /** Create Map Highlight Card section */
        const mapTitle = contentDetails[0]['Map Title'];
        const mapDescription = contentDetails[0]['Map Description'];
        const mapLink = contentDetails[0]['Map Link'];
        const mapLinkLabel = contentDetails[0]['Map Link Button Label'];
        const mapImage = contentDetails[0]['Map Image'];

        if (mapTitle && mapDescription && mapLink && mapLinkLabel && mapImage) {
          // Create the content structure
          // Title and description
          const mapH4 = document.createElement('h4');
          mapH4.innerText = mapTitle;
          const mapP = document.createElement('p');
          mapP.innerText = mapDescription;
          const contentDiv = document.createElement('div');
          contentDiv.append(mapH4);
          contentDiv.append(mapP);
          // Picture
          const mapPicture = createOptimizedPicture(`${mapImage}`, mapTitle, false);
          // Button
          const emphasis = document.createElement('em');
          const button = document.createElement('a');
          button.href = mapLink;
          button.innerText = mapLinkLabel;
          emphasis.append(button);
          // Build block
          const highlightCard = buildBlock('highlight-card', [[mapPicture], [contentDiv, emphasis]]);
          // Add these elements to a new section
          const highlightCardSection = document.createElement('div');
          highlightCardSection.append(highlightCard);
          main.append(highlightCardSection);
        }

        // Decorate and load all the newly injected content
        decorateMain(main);
        await loadBlocks(main);
      }
    }
  }
}
