import {
  readBlockConfig, decorateIcons, getMetadata, loadBlocks,
} from '../../scripts/lib-franklin.js';

import {
  decorateMain,
} from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  let resp;

  // add rewards
  let rewards = null;
  const includeRewards = getMetadata('rewards') || true;
  if (includeRewards || includeRewards === 'true') {
    const rewardsPath = cfg.rewards || '/caesars-palace/rewards';
    resp = await fetch(`${rewardsPath}.plain.html`, window.location.pathname.endsWith('/rewards') ? { cache: 'reload' } : {});
    if (resp.ok) {
      rewards = document.createElement('div');
      rewards.classList.add('rewards-wrapper');
      const fragment = document.createElement('main');
      fragment.innerHTML = await resp.text();
      decorateMain(fragment);
      await loadBlocks(fragment);
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        rewards.append(...fragmentSection.childNodes);
      }
      block.append(rewards);
    }
  }

  // add footer
  let footer = null;
  const footerPath = cfg.footer || '/caesars-palace/footer';
  resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  if (resp.ok) {
    const html = await resp.text();
    footer = document.createElement('div');
    footer.classList.add('footer-wrapper');
    footer.innerHTML = html;
    await decorateIcons(footer);
    block.append(footer);
  }

  if (footer) {
    footer.firstElementChild.classList.add('footer-content');
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
}
