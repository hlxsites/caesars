import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const DEFAULT_SELECTED_PANEL = 1;

export default function decorate(block) {
  const accordionSlider = document.createElement('div');
  accordionSlider.classList.add('accordion-slider');
  [...block.children].forEach((row, index) => {
    row.classList.add('accordion-panel');
    row.classList.add(`accordion-panel-${index}`);

    if (index === DEFAULT_SELECTED_PANEL) {
      row.classList.add('accordion-panel-selected');
    }

    const accordionImage = row.children[0];
    accordionImage.classList.add('accordion-item-image');

    const accordionTitle = row.children[1];
    accordionTitle.classList.add('accordion-item-title');

    if (row.children.length === 3) {
      const accordionDescription = row.children[2];
      accordionDescription.classList.add('accordion-item-description');
    }

    accordionSlider.appendChild(row);

    row.addEventListener('mouseenter', () => {
      const selectedItems = block.getElementsByClassName('accordion-panel-selected');
      [...selectedItems].forEach((item) => {
        item.classList.remove('accordion-panel-selected');
      });
      row.classList.add('accordion-panel-selected');
    });
    row.addEventListener('mouseleave', () => {
      row.classList.remove('accordion-panel-selected');
      const selectedItems = block.getElementsByClassName(`accordion-panel-${DEFAULT_SELECTED_PANEL}`);
      [...selectedItems].forEach((item) => {
        item.classList.add('accordion-panel-selected');
      });
    });
  });
  block.appendChild(accordionSlider);

  const mediaSmallWidthQueryMatcher = window.matchMedia('(max-width: 768px)');
  const mediaSmallWidthChangeHandler = (event) => {
    if (event.matches === true) {
      const accordionPanels = block.getElementsByClassName('accordion-panel');
      [...accordionPanels].forEach((panel) => {
        panel.querySelectorAll('img').forEach((image) => {
          image.closest('picture').replaceWith(createOptimizedPicture(image.src, image.alt, false, [{ width: '768' }]));
        });
      });
    }
  };
  mediaSmallWidthChangeHandler(mediaSmallWidthQueryMatcher);
  mediaSmallWidthQueryMatcher.addEventListener('change', mediaSmallWidthChangeHandler);

  const mediaWidthQueryMatcher = window.matchMedia('only screen and (min-width: 960px)');
  const mediaWidthChangeHandler = (event) => {
    if (event.matches === false) {
      const accordionPanels = block.getElementsByClassName('accordion-panel');
      [...accordionPanels].forEach((panel) => {
        let targetLink;
        let targetTitle;
        panel.querySelectorAll('a').forEach((link) => {
          // last link will always be the action button
          targetLink = link.href;
          targetTitle = link.title;
        });

        const link = document.createElement('a');
        link.classList.add('highlight-card-link');
        link.href = targetLink;
        link.title = targetTitle;

        link.innerHTML = panel.innerHTML;
        panel.innerHTML = '';
        panel.append(link);
      });
    } else {
      const accordionPanels = block.getElementsByClassName('accordion-panel');
      [...accordionPanels].forEach((panel) => {
        const wrapper = panel.firstChild;
        if (panel.firstChild && panel.firstChild.href) {
          const wrappedContent = wrapper.innerHTML;
          panel.innerHTML = wrappedContent;
        }
      });
    }
  };
  mediaWidthChangeHandler(mediaWidthQueryMatcher);
  mediaWidthQueryMatcher.addEventListener('change', (event) => {
    mediaWidthChangeHandler(event);
  });
}
