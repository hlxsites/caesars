export default function decorate(block) {
    const rows = [...block.children];
    
    // background image
    rows[0].classList.add('intro-section-background');
    rows[0].firstElementChild.className = 'intro-section-background-image-container';
    const backgroundImage = rows[0].querySelector('img').src;
    block.style.backgroundImage = 'url(' + backgroundImage + ')';
    block.classList.add('full-width');
    rows[0].remove();



    // section inner
    const innerSection = rows[1];
    innerSection.classList.add('intro-section-inner');
    innerSection.classList.add('container');

    const mainChildren = [...rows[1].children];
    mainChildren[0].classList.add('intro-section-main-content');
    const mainImage = mainChildren[1];
    mainImage.classList.add('intro-section-main-image-container');
    mainImage.firstElementChild.classList.add('intro-section-main-image');

    const secondImageDiv = rows[2].firstElementChild;
    secondImageDiv.classList.add('intro-section-secondary-image-container');
    secondImageDiv.firstElementChild.classList.add('intro-section-secondary-image');
    innerSection.append(secondImageDiv);
    rows[2].remove();

}