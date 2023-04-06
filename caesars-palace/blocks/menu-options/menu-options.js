export default function decorate(block) {
  const iconPdfs = block.querySelectorAll('.icon-pdf');
  [...iconPdfs].forEach((iconPdf) => {
    const iconPdfParent = iconPdf.closest('p');
    iconPdfParent.classList.add('menu-link');
  });

  const menuDivs = block.querySelectorAll('.menu-options > div > div');
  [...menuDivs]
    .forEach((menuDiv) => {
      const h4Divs = menuDiv.querySelectorAll('h4');
      const checkmarkDiv = document.createElement('div');
      checkmarkDiv.classList.add('menu-rewards');
      h4Divs.forEach((h4Div) => {
        menuDiv.replaceChild(checkmarkDiv, h4Div);
        checkmarkDiv.appendChild(h4Div);
      });
    });
}
