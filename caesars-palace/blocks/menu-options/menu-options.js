export default function decorate(block) {
  const iconPdfs = block.querySelectorAll('.icon-pdf');
  [...iconPdfs].forEach((iconPdf) => {
    const iconPdfParent = iconPdf.closest('p');
    iconPdfParent.classList.add('menu-link');
  });
}
