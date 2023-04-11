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
      const heroVideo = json.overview.data[0]['Hero Video'];
      const heroTitle = json.overview.data[0]['Hero Title'];
      const heroTitleAdd = json.overview.data[0]['Hero Title Add'];
      const heroSubtitle = json.overview.data[0]['Hero Subtitle'];
      const openTableEmbed = json.overview.data[0]['Opentable Widget Link'];
      const secondaryUrl = json.overview.data[0]['Secondary Url'];
      const secondaryUrlText = json.overview.data[0]['Secondary Url button text'];
      const secondaryUrlNewWindow = json.overview.data[0]['Open secondary url in new tab'];

      if (heroImage && heroTitle) {
        // Create the content structure
        const heroSection = document.createElement('div');
        if (heroImage && heroVideo && heroVideo.endsWith('.mp4')) {
          const video = document.createElement('a');
          video.href = heroVideo;
          const picture = createOptimizedPicture(`${heroImage}`, heroTitle, true);
          const videoBlock = buildBlock('video-with-alt-image', [[video], [picture]]);
          heroSection.classList.add('has-video-background');
          heroSection.append(videoBlock);
        } else if (heroImage && !heroVideo) {
          const picture = createOptimizedPicture(`${heroImage}`, heroTitle, true);
          heroSection.classList.add('has-background');
          heroSection.append(picture);
        }
        const heroH1 = document.createElement('h1');
        heroH1.innerText = heroTitle;
        // Add the elements to the section
        heroSection.classList.add('section', 'is-hero', 'right-aligned');
        heroSection.append(heroH1);
        if (heroTitleAdd) {
          const heroH1Add = document.createElement('h1');
          heroH1Add.innerText = heroTitleAdd;
          heroSection.append(heroH1Add);
        }
        if (heroSubtitle) {
          const heroH4 = document.createElement('h4');
          heroH4.innerText = heroSubtitle;
          heroSection.append(heroH4);
        }
        if (openTableEmbed) {
          const otLink = document.createElement('a');
          otLink.href = openTableEmbed;
          const openTableBlock = buildBlock('opentable', [[otLink]]);
          heroSection.append(openTableBlock);
        } else if (secondaryUrl && secondaryUrlText) {
          const secondaryLink = document.createElement('a');
          secondaryLink.href = secondaryUrl;
          secondaryLink.textContent = secondaryUrlText;
          if (secondaryUrlNewWindow === 'true') {
            secondaryLink.target = '_blank';
            secondaryLink.setAttribute('rel', 'noreferrer noopener');
          }
          const whiteButton = document.createElement('em');
          whiteButton.append(secondaryLink);
          const buttonParagraph = document.createElement('p');
          buttonParagraph.append(whiteButton);
          heroSection.append(buttonParagraph);
        }
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
