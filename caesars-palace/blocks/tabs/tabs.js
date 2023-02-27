export default function decorate(block) {
  // http://localhost:3000/caesars-palace/drafts/tmathern/tabs

  block.querySelectorAll('img').forEach((tabImage) => {
    tabImage.closest('div').classList.add('tab-image');
  });

  [...block.children].forEach((row, i) => {
    [...row.children].forEach((contentElement, i) => {
      if(![...contentElement.classList].includes('tab-image')){
        if(contentElement.innerHTML){
          if(i === 0){
            contentElement.closest('div').classList.add('tab-title');
          } else {
            contentElement.closest('div').classList.add('tab-text');
          }
        } else {
          contentElement.remove();
        }
      }
    });
  });
}
