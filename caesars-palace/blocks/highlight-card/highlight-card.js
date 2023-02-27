export default function decorate(block) {
  let targetLink = null;
  let targetTitle = null;
  block.querySelectorAll('a').forEach((buttonLink) => {
    targetLink = buttonLink.href;
    targetTitle = buttonLink.title;
    buttonLink.classList.add('button');
    buttonLink.classList.add('secondary');
    buttonLink.closest('div').classList.add('button-container');
  });

  [...block.children].forEach((row, i) => {
    if (i !== 0) row.classList.add('highlight-card-text');
    else row.classList.add('highlight-card-image');
  });

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 960px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      const link = document.createElement('a');
      link.classList.add('highlight-card-link');
      link.href = targetLink;
      link.title = targetTitle;

      link.innerHTML = block.innerHTML;
      block.innerHTML = '';
      block.append(link);
    } else {
      const wrapper = block.firstChild;
      if (block.firstChild && block.firstChild.href) {
        const wrappedContent = wrapper.innerHTML;
        block.innerHTML = wrappedContent;
      }
    }
  };

  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
