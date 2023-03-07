import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/caesars-palace/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.classList.add('footer-content');
  footer.innerHTML = html;
  await decorateIcons(footer);
  block.append(footer);

  // decorate footer buttons
  const allButtons = footer.querySelectorAll('strong > a');
  allButtons.forEach((button) => {
    button.closest('p').classList.add('button-container');
    button.classList.add('button', 'primary');
  });

  // decorate footer content
  const colContainer = footer.querySelector('div.footer-links > div');
  const cols = [...colContainer.children];
  const propertyContainer = document.createElement('div');
  propertyContainer.classList.add('footer-property-content');
  const linkContainer = document.createElement('div');
  linkContainer.classList.add('footer-property-links');
  propertyContainer.appendChild(linkContainer);
  colContainer.appendChild(propertyContainer);
  cols.forEach((col, index, allCols) => {
    if (index > 0 && index < allCols.length) {
      linkContainer.appendChild(col);
    }
    if (index === allCols.length - 1) {
      col.classList.add('footer-property-social');
      const socialLinks = col.querySelectorAll('a');
      [...socialLinks].forEach((link) => {
        link.target = '_blank';
        const textNode = [...link.childNodes].find((node) => node.nodeType === 3);
        const span = document.createElement('span');
        span.appendChild(textNode);
        link.appendChild(span);
      });
      propertyContainer.appendChild(col);
    }
  });

  // decorate property link headers
  const headings = footer.querySelectorAll('.footer-property-links h2');
  await Promise.all([...headings].map(async (heading) => {
    const button = document.createElement('button');
    heading.parentElement.insertBefore(button, heading);
    button.appendChild(heading);
    // add svg
    try {
      const response = await fetch(`${window.hlx.codeBasePath}/icons/chevron-down.svg`);
      if (!response.ok) {
        return;
      }
      const svg = await response.text();
      const svgSpan = document.createElement('span');
      svgSpan.innerHTML = svg;
      button.appendChild(svgSpan);
      button.addEventListener('click', () => {
        button.classList.toggle('open');
        button.nextElementSibling.classList.toggle('open');
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }));
}
