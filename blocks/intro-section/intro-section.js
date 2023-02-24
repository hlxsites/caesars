export default function decorate(block) {
    const rows = [...block.children];

    // section inner
    const innerContainer = rows[0];
    innerContainer.classList.add('intro-section__inner');

    // content
    const mainChildren = [...innerContainer.children];
    mainChildren[0].classList.add('intro-section__content');

    // main image
    const mainImageContainer = mainChildren[1];
    mainImageContainer.classList.add('intro-section__image-container');

    // secondary image.  move to section inner.
    const secondImageContainer = rows[1];
    const secondImageDiv = secondImageContainer.firstElementChild;
    secondImageDiv.classList.add('intro-section__secondary-image-container');
    innerContainer.append(secondImageDiv);
    secondImageContainer.remove();

}