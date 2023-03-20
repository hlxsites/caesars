export default function decorate(block) {
  [...block.children].forEach((row) => {
    const columnsInRow = [...row.children].length;
    row.style = `grid-template-columns: repeat(${columnsInRow}, 1fr)`;
  });
}
