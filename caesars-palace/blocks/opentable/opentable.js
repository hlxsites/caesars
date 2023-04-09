export default async function decorate(block) {
  const otWidgetLink = block.querySelector('a');
  if (otWidgetLink) {
    otWidgetLink.parentElement.remove();
    const otDiv = document.createElement('div');
    otDiv.classList.add('otDiv');
    const script = document.createElement('script');
    script.src = otWidgetLink;
    otDiv.append(script);
    block.append(otDiv);
  } else {
    block.remove();
  }
  // window.setTimeout(() => embedMarketoForm(formId, divId), 3000);
}
