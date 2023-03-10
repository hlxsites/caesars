/**
 * Loads and decorates the block
 * @param {Element} block, the block element
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.setAttribute('role', 'region');
    row.setAttribute('tabindex', i);
    row.setAttribute('aria-expanded', false);
    row.classList.add('questions-content');
    row.addEventListener('click', () => {
      const button = row.querySelector('[role="button"]');
      const span = row.querySelector('span');
      if (row.getAttribute('aria-expanded') === 'true') {
        row.setAttribute('aria-expanded', false);
        row.classList.remove('expanded');
        button.setAttribute('aria-pressed', false);
        span.classList.remove('expanded');
      } else {
        row.setAttribute('aria-expanded', true);
        row.classList.add('expanded');
        button.setAttribute('aria-pressed', true);
        span.classList.add('expanded');
      }
    });

    const questionContentText = document.createElement('div');
    questionContentText.classList.add('questions-content-text');

    Array.from(row.children)
      .forEach((childElement) => {
        questionContentText.appendChild(childElement);
      });

    row.appendChild(questionContentText);

    const expandIcon = document.createElement('div');
    expandIcon.innerHTML = '<div class="toggle" role="button" aria-pressed="false"><span data-testid="toggle-span"><i data-testid="toggle-icon"></i></span></div>';
    row.appendChild(expandIcon);
  });
}
