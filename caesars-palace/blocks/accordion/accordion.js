export default function decorate(block) {
  // first line is configuration of star item to be open/selected by default
  let starItem = 1;
  const configuredStarElement = parseInt(block.children[0].innerText, 10);
  if (!Number.isNaN(configuredStarElement)
    && Number.isInteger(configuredStarElement)) {
      starItem = configuredStarElement;
  }
  block.children[0].remove();
  console.log("Star item is ", starItem);

  [...block.children].forEach((row) => {
    row.classList.add('accordion-panel');

    const accordionTitle = row.children[0];
      accordionTitle.classList.add('accordion-item-title');

      const accordionImage = row.children[1];
      accordionImage.classList.add('accordion-item-image');

    if(row.children.length === 3){
      const accordionDescription = row.children[2];
      accordionDescription.classList.add('accordion-item-description');
    }
  });
}
