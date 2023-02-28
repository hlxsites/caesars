export default function decorate(block) {
  // http://localhost:3000/caesars-palace/drafts/tmathern/tabs

  [...block.children].forEach((row) => {
    row.classList.add('tab');
    [...row.children].forEach((contentElement, i) => {
      if (contentElement.innerHTML) {
        if (i === 0) {
          contentElement.closest('div').classList.add('tab-title');
        } else if (contentElement.children
          && contentElement.children.length > 0
          && contentElement.children[0].tagName === 'PICTURE') {
          contentElement.closest('div').classList.add('tab-image');
        } else {
          contentElement.closest('div').classList.add('tab-text');
        }
      } else {
        contentElement.remove();
      }
    });
  });
}
