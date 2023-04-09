function embedOpentable(otWidgetLink, block) {
  const otDiv = document.createElement('div');
  otDiv.classList.add('otDiv');
  const script = document.createElement('script');
  script.src = otWidgetLink;
  otDiv.append(script);
  block.append(otDiv);
}

export default async function decorate(block) {
  const otWidgetLink = block.querySelector('a');
  if (otWidgetLink) {
    otWidgetLink.parentElement.remove();
    window.setTimeout(() => embedOpentable(otWidgetLink, block), 3000);
  } else {
    block.remove();
  }
}
