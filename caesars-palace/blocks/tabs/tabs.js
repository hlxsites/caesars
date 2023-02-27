export default function decorate(block) {
  // http://localhost:3000/caesars-palace/drafts/tmathern/tabs

  [...block.children].forEach((row, i) => {
    [...row.children].forEach((contentElement, i) => {
      if(contentElement.innerHTML){
          if(i === 0){
            contentElement.closest('div').classList.add('tab-title');
          }
        } else {
          contentElement.remove();
        }
    });
  });
}
