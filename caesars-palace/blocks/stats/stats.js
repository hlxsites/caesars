export default function decorate(block) {
  const statsContainerElement = [...block.children][0];

  if (statsContainerElement) {
    const columnsInRow = statsContainerElement.children.length;
    statsContainerElement.style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
  }
}
