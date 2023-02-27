export default function decorate(block) {
  let targetLink = null;
  block.querySelectorAll('a').forEach((buttonLink) => {
    targetLink = buttonLink.href;
    buttonLink.classList.add('button');
    buttonLink.classList.add('secondary');
    buttonLink.closest('div').classList.add('button-container');
  });

  let childRowNumber = 0;
  [...block.children].forEach((row) => {
    if (childRowNumber !== 0) row.classList.add('highlight-card-text');
    else row.classList.add('highlight-card-image');
    childRowNumber += 1;
  });

  const wrapElement = (element, wrapper) => {
    if (element && element.parentNode) {
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    }
  };

  const unwrapElement = (element, parent, wrapper) => {
  };

  console.log('----')
  console.log(block.childNodes);
  console.log('----')

  // const mediaWidthQueryMatcher  = window.matchMedia('only screen and (max-width: 960px)');
  
  // const mediaWidthChangeHandler = (event) => {
  //   const wrapElement = (element, wrapper) => {
  //     if (element && element.parentNode) {
  //       element.parentNode.insertBefore(wrapper, element);
  //       wrapper.appendChild(element);
  //     }
  //   };

  //   const unwrapElement = (element, parent, wrapper) => {

  //   };

  //   if(event.matches){
  //   } else {
      
  //   }
  // }
  // mediaWidthChangeHandler(mediaWidthQueryMatcher);

  // mediaWidthQueryMatcher.addEventListener('change', (event) => {
  //   mediaWidthChangeHandler(event);
  // });
}