export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.classList.contains('cet-card') && cols.length === 2) {
    // image placement
    if (cols[0].querySelector('picture')) {
      block.classList.add('image-start');
    } else if (cols[1].querySelector('picture')) {
      block.classList.add('image-end');
    }
    // button group
    block.querySelectorAll('a').forEach((anchor) => anchor.closest('p').classList.add('button-group'));
  }
}
