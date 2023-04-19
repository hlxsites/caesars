import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

const BOOKINGFORM_HTML_LOCAL = '/caesars-palace/scripts/resources/book.html';

async function fetchBookingForm(block, bookingformurl) {
  if (bookingformurl) {
    let url;
    if (window.location.host.endsWith('.page') || window.location.host.endsWith('.live') || window.location.host.startsWith('localhost')) {
      url = BOOKINGFORM_HTML_LOCAL;
    } else {
      url = bookingformurl;
    }
    // url = bookingformurl;

    const resp = await fetch(url);
    if (resp.ok) {
      const bookingFormHtml = await resp.text();
      // Initialize the DOM parser
      const parser = new DOMParser();

      // Parse the text
      const bookingFormDiv = document.createElement('div');
      bookingFormDiv.setAttribute('id', 'global-booker');
      bookingFormDiv.classList.add('global-booker', 'container');
      block.append(bookingFormDiv);
      window.enableGlobalBooker = true;
      // Pull in script tags
      const doc = parser.parseFromString(bookingFormHtml, 'text/html');
      const allScripts = Array.from(doc.scripts);
      allScripts.forEach((script) => {
        // console.log(`script is ${script}`);
        // if ((script.src && script.src.endsWith('main.e926e65a.js'))
        //  || (script.textContent.includes('webpack'))) {
        //   const newScriptTag = document.createElement('script');
        //   if (script.src) {
        //     newScriptTag.src = script.src;
        //   } else {
        //     newScriptTag.text = script.text;
        //   }
        //   document.head.appendChild(newScriptTag);
        // }
      });
    }
  }
  return null;
}

export default async function decorate(block) {
  block.innerHTML = '';
  const placeholders = await fetchPlaceholders();
  const { bookingformurl } = placeholders;
  const form = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        await fetchBookingForm(block, bookingformurl);
      }
    });
  });
  form.observe(block);
}
