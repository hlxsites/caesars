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

  const rewardsPath = cfg.rewards || '/caesars-palace/rewards';
  const footerPath = cfg.footer || '/caesars-palace/footer';

  const contentPaths = {
    footer: {
      path: `${footerPath}.plain.html`,
      isFragment: false,
    },
  };

  const includeRewards = getMetadata('rewards') || true;
  if (includeRewards || includeRewards === 'true') {
    contentPaths.rewards = {
      path: `${rewardsPath}.plain.html`,
      isFragment: true,
    };
  }

  const contentEntries = Object.entries(contentPaths);
  const resp = await Promise.allSettled(contentEntries.map(
    ([name, content]) => (
      fetch(content.path, window.location.pathname.endsWith(
        `/${name}`,
      ) ? { cache: 'reload' } : {})),
  ));

  const contentBlocks = await Promise.all(resp.map(async ({ status, value }, index) => {
    // determine block type
    const [blockName, blockConfig] = contentEntries[index];
    const blockEntry = { name: blockName };

    if (status === 'fulfilled') {
      const blockWrapper = document.createElement('div');
      blockWrapper.classList.add(`${blockName}-wrapper`);
      const html = await value.text();
      if (blockConfig.isFragment) {
        const fragment = document.createElement('main');
        fragment.innerHTML = html;
        decorateMain(fragment);
        await loadBlocks(fragment);
        const fragmentSection = fragment.querySelector(':scope .section');
        if (fragmentSection) {
          blockWrapper.append(...fragmentSection.childNodes);
        }
      } else {
        blockWrapper.innerHTML = html;
        await decorateIcons(blockWrapper);
      }
      blockEntry.content = blockWrapper;
    }
    return blockEntry;
  }));

  // add rewards
  const { content: rewards } = contentBlocks.find((cb) => cb.name === 'rewards');
  if (rewards) {
    block.append(rewards);
  }

  // add footer
  const { content: footer } = contentBlocks.find((cb) => cb.name === 'footer');
  if (footer) {
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
