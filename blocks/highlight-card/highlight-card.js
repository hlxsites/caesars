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

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (max-width: 960px)');
  const mediaWidthChangeHandler = (event) => {
    const wrapElement = (element, wrapper) => {
      if (element && element.parentNode) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
      }
    };

    const unwrapElement = (element, wrapper) => {
      const parent = wrapper.parentNode;
      parent.appendChild(element);
      wrapper.remove();
    };

    if (event.matches) {
      let elementsToWrap = document.getElementsByClassName('highlight-card-text');
      [...elementsToWrap].forEach((wrappedElement) => {
        const anchorElement = document.createElement('a');
        anchorElement.href = targetLink;
        const wrapper = anchorElement;
        wrapElement(wrappedElement, wrapper);
      });

      elementsToWrap = document.getElementsByClassName('highlight-card-image');
      [...elementsToWrap].forEach((wrappedElement) => {
        const anchorElement = document.createElement('a');
        anchorElement.href = targetLink;
        const wrapper = anchorElement;
        wrapElement(wrappedElement, wrapper);
      });
    } else {
      block.querySelectorAll('a').forEach((clickableElement) => {
        if (clickableElement.firstChild
          && clickableElement.classList
          && clickableElement.classList.length === 0) {
          unwrapElement(clickableElement.firstChild, clickableElement);
        }
      });
    }
  };
  mediaWidthChangeHandler(mediaWidthQueryMatcher);

  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
