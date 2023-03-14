export default function decorate(block) {
  const accordionSlider = document.createElement('div');
  accordionSlider.classList.add('accordion-slider');
  [...block.children].forEach((row, index) => {
    row.classList.add('accordion-panel');

    const accordionImage = row.children[0];
    accordionImage.classList.add('accordion-item-image');

    const accordionTitle = row.children[1];
    accordionTitle.classList.add('accordion-item-title');

    if (row.children.length === 3) {
      const accordionDescription = row.children[2];
      accordionDescription.classList.add('accordion-item-description');
    }

    accordionSlider.appendChild(row);
  });
  block.appendChild(accordionSlider);

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
