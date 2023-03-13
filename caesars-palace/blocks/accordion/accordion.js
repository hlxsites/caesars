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
    console.log(row);
  });
}
