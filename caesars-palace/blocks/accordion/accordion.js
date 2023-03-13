export default function decorate(block) {
  // first line is configuration of star item to be open/selected by default
  let selectedItem = 1;
  const configuredStarElement = parseInt(block.children[0].innerText, 10);
  if (!Number.isNaN(configuredStarElement)
    && Number.isInteger(configuredStarElement)) {
    selectedItem = configuredStarElement;
  }
  block.children[0].remove();
  console.log("Star item is ", selectedItem);

  [...block.children].forEach((row, index) => {
    row.classList.add('accordion-panel');
    if (selectedItem === index + 1) {
      // TODO
      // row.classList.add('accordion-panel-selected');
    }

    const accordionImage = row.children[0];
    accordionImage.classList.add('accordion-item-image');

    const accordionTitle = row.children[1];
    accordionTitle.classList.add('accordion-item-title');

    if (row.children.length === 3) {
      const accordionDescription = row.children[2];
      accordionDescription.classList.add('accordion-item-description');
    }
  });

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 960px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      console.log("Make whole panel item clickable");
    } else {
      console.log("Show description with button");
    }
  };
  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
