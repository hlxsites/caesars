import {
  createOptimizedPicture,
  buildBlock,
  loadBlocks,
} from '../../scripts/lib-franklin.js';
import {
  createTag,
  decorateMain,
  getDateFromExcel,
  containsOnlyNumbers,
} from '../../scripts/scripts.js';

const CROSSMARK = 'icon-crossmark';
const CHECKMARK = 'icon-checkmark';

export default async function decorate(block) {
  // Check if json endpoint exists and this is a product details template
  // const template = getMetadata('template');
  const endpoint = block.querySelector('a').href;
  if (endpoint) {
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
      const overview = json.overview.data[0];
      const title = overview.Title;
      const heroImage = overview['Hero Image'];
      const heroVideo = overview['Hero Video'];
      const heroTitle = overview['Hero Title'];
      const heroBadge = overview['Hero Badge'];
      const heroTitleAdd = overview['Hero Title Add'];
      const heroSubtitle = overview['Hero Subtitle'];
      const openTableEmbed = overview['Opentable Widget Link'];
      const secondaryUrl = overview['Secondary Url'];
      const secondaryUrlText = overview['Secondary Url button text'];
      const secondaryUrlNewWindow = overview['Open secondary url in new tab'];
      const logo = overview.Logo;
      const longDescription = overview['Long Description'];
      const cuisine = overview.Cuisine;
      const price = overview.Price;
      const attire = overview.Attire;
      const phone = overview.Phone;
      const groupMenu = overview['Group Dining Menu'];
      const mainMenu = overview['Main Menu'];
      const togoMenu = overview['To Go Menu'];
      const groupDescription = overview['Group Dining Description'];
      const groupLink = overview['Group Dining Link'];
      const dinein = overview['Dine In'];
      const takeout = overview['Take Out'];
      const delivery = overview.Delivery;
      const rewardsEarn = overview['Caesars Rewards Earn'];
      const rewardsRedeem = overview['Caesars Rewards Redeem'];
      const rewardsLink = overview['Caesars Rewards Link'];
      const superBowlDescription = overview['Super Bowl LVII'];
      const superBowlLink = overview['Super Bowl LVII Link'];
      if (heroImage && heroTitle) {
        // Create the content structure
        const heroSection = document.createElement('div');
        if (heroImage && heroVideo && heroVideo.endsWith('.mp4')) {
          const video = createTag('a', { href: heroVideo, title: heroTitle });
          const picture = createOptimizedPicture(`${heroImage}`, heroTitle, true);
          const videoBlock = buildBlock('video-with-alt-image', [[video], [picture]]);
          heroSection.classList.add('has-video-background');
          heroSection.append(videoBlock);
        } else if (heroImage && !heroVideo) {
          const picture = createOptimizedPicture(`${heroImage}`, heroTitle, true);
          heroSection.classList.add('has-background');
          heroSection.append(picture);
        }
        if (heroBadge) {
          const heroBadgePicture = createOptimizedPicture(`${heroBadge}`, heroTitle, true);
          const heroBadgeBlock = buildBlock('overlay-logo', [[heroBadgePicture]]);
          heroSection.append(heroBadgeBlock);
        }
        const heroH1 = createTag('h1', {}, heroTitle);
        // Add the elements to the section
        heroSection.classList.add('section', 'is-hero', 'right-aligned');
        heroSection.append(heroH1);
        if (heroTitleAdd) {
          const heroH1Add = createTag('h1', {}, heroTitleAdd);
          heroSection.append(heroH1Add);
        }
        if (heroSubtitle) {
          const heroH4 = createTag('h4', {}, heroSubtitle);
          heroSection.append(heroH4);
        }
        if (openTableEmbed) {
          const otLink = createTag('a', { href: openTableEmbed });
          const openTableBlock = buildBlock('opentable', [[otLink]]);
          heroSection.append(openTableBlock);
        } else if (secondaryUrl && secondaryUrlText) {
          const secondaryLink = createTag('a', { href: secondaryUrl, title: secondaryUrlText }, secondaryUrlText);
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

      /** Create Product quick facts section */
      const productQuickFactsSection = document.createElement('div');
      productQuickFactsSection.classList.add('product-quickfacts');
      // Add the logo and description column block
      if (logo && longDescription && title) {
        const logoPicture = createOptimizedPicture(`${logo}`, title, false);
        const quickFactsBlock = buildBlock('columns', [[logoPicture, longDescription]]);
        quickFactsBlock.classList.add('product-quickfacts', 'stretch-end');
        productQuickFactsSection.append(quickFactsBlock);
      }

      // Add hours
      const { hours } = json;
      if (hours && hours.data && (hours.data.length > 0)) {
        const hoursArray = [];
        hours.data.forEach((row) => {
          const day = row.Day;
          if (containsOnlyNumbers(row['Open Time']) && containsOnlyNumbers(row['Close Time'])) {
            const openTime = getDateFromExcel(row['Open Time']);
            const openTimeOutput = openTime.toLocaleTimeString('en-US', {
              timeZone: 'UTC',
              hour12: true,
              hour: 'numeric',
              minute: 'numeric',
            });
            const closeTime = getDateFromExcel(row['Close Time']);
            const closeTimeOutput = closeTime.toLocaleTimeString('en-US', {
              timeZone: 'UTC',
              hour12: true,
              hour: 'numeric',
              minute: 'numeric',
            });
            hoursArray.push([day, `${openTimeOutput}-${closeTimeOutput}`]);
          } else {
            hoursArray.push([day, `${row['Open Time']}-${row['Close Time']}`]);
          }
        });
        const hoursBlock = buildBlock('quick-facts-hours', hoursArray);
        productQuickFactsSection.append(hoursBlock);
      }

      // Add cuisine, price and attire
      if (cuisine) {
        const cuisineIconName = cuisine.trim().replace(' ', '-').toLowerCase();
        const cuisineP = document.createElement('p');
        const cuisineIcon = createTag('span', { class: `icon icon-${cuisineIconName}` });
        cuisineP.append(cuisineIcon);
        cuisineP.append(cuisine);
        productQuickFactsSection.append(cuisineP);
      }
      if (price) {
        const priceP = document.createElement('p');
        const priceIcon = createTag('span', { class: 'icon icon-costs' });
        priceP.append(priceIcon);
        priceP.append(price);
        productQuickFactsSection.append(priceP);
      }
      if (attire) {
        const attireIconName = attire.trim().replace(' ', '-').toLowerCase();
        const attireP = document.createElement('p');
        const attireIcon = createTag('span', { class: `icon icon-${attireIconName}` });
        attireP.append(attireIcon);
        attireP.append(attire);
        productQuickFactsSection.append(attireP);
      }
      if (phone) {
        const phoneP = document.createElement('p');
        const phoneIcon = createTag('span', { class: 'icon icon-phone-contact' });
        phoneP.append(phoneIcon);
        phoneP.append(phone);
        productQuickFactsSection.append(phoneP);
      }

      if (productQuickFactsSection.hasChildNodes()) main.append(productQuickFactsSection);

      /** Add Menu and Dining Options */
      // Get the content in place first
      const diningMenus = document.createElement('div');
      if (groupMenu || mainMenu || togoMenu) {
        const menuTitle = createTag('h2', {}, 'MENUS');
        const groupP = createTag('p');
        const groupMenuIcon = createTag('span', { class: 'icon icon-pdf' });
        const groupMenuLink = createTag('a', { href: groupMenu, title: 'Group Dining Menu' }, 'Group Dining Menu');
        groupP.append(groupMenuIcon);
        groupP.append(groupMenuLink);
        const mainMenuP = createTag('p');
        const mainMenuIcon = createTag('span', { class: 'icon icon-pdf' });
        const mainMenuLink = createTag('a', { href: mainMenu, title: 'Main Menu' }, 'Main Menu');
        mainMenuP.append(mainMenuIcon);
        mainMenuP.append(mainMenuLink);
        const togoMenuP = createTag('p');
        const togoMenuIcon = createTag('span', { class: 'icon icon-pdf' });
        const togoMenuLink = createTag('a', { href: groupMenu, title: 'To Go' }, 'To Go');
        togoMenuP.append(togoMenuIcon);
        togoMenuP.append(togoMenuLink);
        diningMenus.append(menuTitle);
        if (groupMenu) {
          diningMenus.append(groupP);
        }
        if (mainMenu) {
          diningMenus.append(mainMenuP);
        }
        if (togoMenu) {
          diningMenus.append(togoMenuP);
        }
      }

      // Super Bowl block
      const superBowlContent = document.createElement('div');
      if (superBowlDescription && superBowlLink) {
        const superBowlTitle = createTag('h2', {}, 'SUPER BOWL LVII');
        const superBowlP = createTag('p', {}, superBowlDescription);
        const superBowlButtonLink = createTag('a', { href: superBowlLink, title: 'Reserve Now' }, 'Reserve Now');
        const superBowlButtonLinkP = createTag('p', {}, superBowlButtonLink);
        superBowlContent.append(superBowlTitle);
        superBowlContent.append(superBowlP);
        superBowlContent.append(superBowlButtonLinkP);
      }
      const groupDiningContent = document.createElement('div');
      if (groupDescription && groupLink) {
        const groupDiningTitle = createTag('h2', {}, 'GROUP DINING');
        const groupDiningP = createTag('p', {}, groupDescription);
        const groupDiningLink = createTag('a', { href: groupLink, title: 'Contact Us' }, 'Contact Us');
        const groupDiningLinkP = createTag('p', {}, groupDiningLink);
        groupDiningContent.append(groupDiningTitle);
        groupDiningContent.append(groupDiningP);
        groupDiningContent.append(groupDiningLinkP);
      }

      const rewardsContent = document.createElement('div');
      if (rewardsEarn && rewardsRedeem && rewardsLink) {
        let earnIcon = CROSSMARK;
        const isRewardsEarn = (rewardsEarn === 'true');
        if (isRewardsEarn) earnIcon = CHECKMARK;
        let redeemIcon = CROSSMARK;
        const isRewardsRedeem = (rewardsRedeem === 'true');
        if (isRewardsRedeem) redeemIcon = CHECKMARK;
        const rewardsTitle = createTag('h2', {}, 'CAESAR REWARDS');
        const rewardsEarnSpan = createTag('span', { class: `icon ${earnIcon}` });
        const rewardsRedeemSpan = createTag('span', { class: `icon ${redeemIcon}` });
        const rewardsEarnH4 = createTag('h4', {}, [rewardsEarnSpan, 'Earn Credit Rewards']);
        const rewardsRedeemH4 = createTag('h4', {}, [rewardsRedeemSpan, 'Redeem Reward Credits']);
        const rewardsDiv = createTag('div', { class: 'menu-rewards' }, [rewardsEarnH4, rewardsRedeemH4]);
        const rewardsLinkA = createTag('a', { href: rewardsLink, title: 'Learn More' }, 'Learn More');
        const rewardsLinkP = createTag('p', {}, rewardsLinkA);
        rewardsContent.append(rewardsTitle);
        rewardsContent.append(rewardsDiv);
        rewardsContent.append(rewardsLinkP);
      }

      const diningOptions = document.createElement('div');
      if (dinein && takeout && delivery) {
        let dineinIcon = CROSSMARK;
        let takeoutIcon = CROSSMARK;
        let deliveryIcon = CROSSMARK;
        const isDinein = (dinein === 'true');
        if (isDinein) dineinIcon = CHECKMARK;
        const isDelivery = (delivery === 'true');
        if (isDelivery) deliveryIcon = CHECKMARK;
        const isTakeout = (takeout === 'true');
        if (isTakeout) takeoutIcon = CHECKMARK;
        const diningOptionsTitle = createTag('h2', null, 'DINING OPTIONS');
        const dineinSpan = createTag('span', { class: `icon ${dineinIcon}` });
        const takeoutSpan = createTag('span', { class: `icon ${takeoutIcon}` });
        const deliverySpan = createTag('span', { class: `icon ${deliveryIcon}` });

        const dineinH4 = createTag('h4', {}, [dineinSpan, 'DINE IN']);
        const takeoutH4 = createTag('h4', {}, [takeoutSpan, 'TAKE OUT']);
        const deliveryH4 = createTag('h4', {}, [deliverySpan, 'DELIVERY']);

        const diningOptionsDiv = createTag('div', { class: 'menu-rewards' }, [dineinH4, takeoutH4, deliveryH4]);
        diningOptions.append(diningOptionsTitle);
        diningOptions.append(diningOptionsDiv);
      }

      // Build out the block with the content from above
      if (diningMenus.hasChildNodes() || groupDiningContent.hasChildNodes()
        || rewardsContent.hasChildNodes() || diningOptions.hasChildNodes() 
        || superBowlContent.hasChildNodes()) {
        const menuOptions = [[]];
        const menuOptionsRow = [];
        if (diningMenus.hasChildNodes()) {
          menuOptionsRow.push(diningMenus);
        }
        if (superBowlContent.hasChildNodes()) {
          menuOptionsRow.push(superBowlContent);
        }
        if (groupDiningContent.hasChildNodes()) {
          menuOptionsRow.push(groupDiningContent);
        }
        if (rewardsContent.hasChildNodes()) {
          menuOptionsRow.push(rewardsContent);
        }
        if (diningOptions.hasChildNodes()) {
          menuOptionsRow.push(diningOptions);
        }
        menuOptions.push(menuOptionsRow);
        const menuOptionsBlock = buildBlock('menu-options', menuOptions);
        const menuOptionsSection = createTag('div', {}, menuOptionsBlock);
        main.append(menuOptionsSection);
      }

      /** Create stats section */
      const stats = json.stats?.data;
      if (stats && stats.length > 0) {
        const statsSection = document.createElement('div');
        statsSection.classList.add('product-stats');
        const statsArr = [[]];
        stats.forEach((element, i) => {
          const statItemDiv = document.createElement('div');

          let statsTitle;
          const statsValue = element['Stat value'];
          if (statsValue.startsWith(':') && statsValue.endsWith(':')) {
            const iconName = statsValue.slice(1, -1);
            statsTitle = createTag('h1', {}, '');
            const statsIcon = createTag('span', { class: `icon icon-${iconName}` });
            statsTitle.append(statsIcon);
          } else {
            statsTitle = createTag('h1', '', element['Stat value']);
          }
          const statsSubtitle = createTag('h3', '', element['Stat element']);
          statItemDiv.append(statsTitle);
          statItemDiv.append(statsSubtitle);
          statsArr[0][i] = statItemDiv;
        });
        const statsBlock = buildBlock('stats', statsArr);
        statsSection.append(statsBlock);
        if (statsSection.hasChildNodes()) main.append(statsSection);
      }

      /** Create Columns section */
      const contentDetails = json['content-details'].data;
      if (contentDetails && contentDetails.length > 0) {
        contentDetails.forEach(async (row, i) => {
          const colTitle = row.Title;
          const colDesc = row.Description;
          const colImage = row.Image;
          const buttonTitle = row['Button Title'];
          const buttonLink = row['Button Link'];
          const textOverlay = row['Text Overlay'];

          if (colTitle && colDesc && colImage) {
            // Create the content structure
            const colH3 = createTag('h3', {}, colTitle);
            const colP = createTag('p', {}, colDesc);
            const contentDiv = createTag('div', {}, [colH3, colP]);
            if (buttonTitle && buttonLink) {
              const button = createTag('a', { href: buttonLink, title: buttonTitle }, buttonTitle);
              const emButton = createTag('em', {}, button);
              const pButton = createTag('p', {}, emButton);
              contentDiv.append(pButton);
            }
            const colPicture = createOptimizedPicture(`${colImage}`, colTitle, false);

            /** Create Columns Block for first content detail row */
            if (i === 0) {
              const columnsBlock = buildBlock('columns', [[contentDiv, colPicture]]);
              // Add these elements to a new section
              const columnsSection = document.createElement('div');
              columnsSection.classList.add('section', 'has-centered-text');
              columnsSection.append(columnsBlock);
              main.append(columnsSection);
            } else {
              let columnsBlock;
              if (textOverlay && textOverlay.toLowerCase() === 'right') {
                columnsBlock = buildBlock('columns', [[colPicture, contentDiv]]);
              } else {
                columnsBlock = buildBlock('columns', [[contentDiv, colPicture]]);
              }
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
          const mapH4 = createTag('h4', {}, mapTitle);
          const mapP = createTag('p', {}, mapDescription);
          const contentDiv = document.createElement('div');
          contentDiv.append(mapH4);
          contentDiv.append(mapP);
          // Picture
          const mapPicture = createOptimizedPicture(`${mapImage}`, mapTitle, false);
          // Button
          const emphasis = document.createElement('em');
          const button = createTag('a', { href: mapLink, title: mapLinkLabel }, mapLinkLabel);
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
