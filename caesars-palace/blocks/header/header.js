import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1170px)');
// const MAX_NAV_ITEMS_DESKTOP = 6;
const CAESARS_DOT_COM = 'https://www.caesars.com';
const GLOBAL_HEADER_JSON = '/content/empire/en/jcr:content/root/header.model.json';
const GLOBAL_HEADER_JSON_LOCAL = '/caesars-palace/scripts/resources/header.model.json';
const GLOBAL_HEADER_LOGO_LOCAL = '/caesars-palace/icons/caesars-global-logo.svg';

async function createGlobalNavLogo(logoFileReference) {
  // Add logo
  const logo = document.createElement('div');
  logo.classList.add('logo');
  if (logoFileReference) {
    try {
      let response;
      if (window.location.host.endsWith('.page') || window.location.host.endsWith('.live') || window.location.host.startsWith('localhost')) {
        response = await fetch(`${GLOBAL_HEADER_LOGO_LOCAL}`);
      } else {
        response = await fetch(`${logoFileReference}`);
      }
      if (!response.ok) response = await fetch(`${GLOBAL_HEADER_LOGO_LOCAL}`);
      if (response.ok) {
        const svg = await response.text();
        const svgSpan = document.createElement('span');
        svgSpan.innerHTML = svg;
        logo.appendChild(svgSpan);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('error', err);
    }
  }
  return logo;
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleNavSectionTitles(navSectionTitle, navSection) {
  const expanded = navSectionTitle.getAttribute('aria-expanded') === 'true';
  navSection.querySelectorAll('ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  navSectionTitle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  const globalNavSections = nav.querySelector('.nav-sections .global-nav');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    if (globalNavSections) globalNavSections.setAttribute('aria-hidden', true);
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    if (globalNavSections) globalNavSections.removeAttribute('aria-hidden', true);
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.textContent = '';
  let globalNav;
  let globalNavSections;
  // let globalNavLogin;
  // let globalNavLogo;
  const globalNavDesktop = document.createElement('div');
  globalNavDesktop.classList.add('global-nav-desktop');
  const globalNavSection = document.createElement('div');
  globalNavSection.classList.add('global-nav-section');

  const globalNavTitleClickHandler = () => {
    toggleNavSectionTitles(globalNavTitle, globalNavSections);
  };

  // fetch global nav
  if (window.location.host.endsWith('.page') || window.location.host.endsWith('.live') || window.location.host.startsWith('localhost')) {
    globalNav = await fetch(`${GLOBAL_HEADER_JSON_LOCAL}`);
  } else {
    globalNav = await fetch(`${CAESARS_DOT_COM}${GLOBAL_HEADER_JSON}`);
  }
  if (globalNav.ok) {
    const globalNavJson = await globalNav.json();
    if (globalNavJson.navItems) {
      const globalNavDiv = document.createElement('div');
      globalNavDiv.classList.add('global-nav');
      const globalNavTitle = document.createElement('div');
      globalNavTitle.classList.add('global-nav-title');
      globalNavTitle.setAttribute('aria-expanded', false);
      globalNavTitle.innerHTML = 'Caesars Entertainment';
      globalNavDiv.appendChild(globalNavTitle);
      globalNavDiv.setAttribute('aria-expanded', false);
      const ul = document.createElement('ul');
      globalNavJson.navItems.forEach((item) => {
        const li = document.createElement('li');
        li.setAttribute('aria-expanded', false);
        const link = document.createElement('a');
        link.href = item.path;
        link.innerHTML += item.text;
        link.setAttribute('target', item.target);
        link.setAttribute('aria-label', item.text);
        li.append(link);
        ul.append(li);
      });
      globalNavDiv.appendChild(ul);
      const globalNavLinks = ul.cloneNode(true);
      globalNavSection.appendChild(globalNavLinks);
      globalNavDesktop.appendChild(globalNavSection);
      globalNavSections = globalNavDiv;
      globalNavTitle.addEventListener('click', globalNavTitleClickHandler);
    }
    if (globalNavJson.logoFileReference) {
      globalNavDesktop.prepend(await createGlobalNavLogo(globalNavJson.logoFileReference));
    }
    if (globalNavJson.style) globalNavDesktop.classList.add(globalNavJson.style);
  }

  // fetch nav content
  const navPath = getMetadata('nav') || '/caesars-palace/nav';
  const resp = await fetch(`${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    // Remove the text in the link
    nav.querySelector('.nav-brand a').innerHTML = '';

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      const newDiv = document.createElement('div');
      newDiv.classList.add('local-nav');
      const localNavTitle = document.createElement('div');
      localNavTitle.classList.add('local-nav-title');
      localNavTitle.setAttribute('aria-expanded', true);
      localNavTitle.innerHTML = 'Property Links';
      newDiv.appendChild(localNavTitle);
      while (navSections.hasChildNodes()) newDiv.appendChild(navSections.firstChild);
      newDiv.setAttribute('aria-expanded', true);
      navSections.append(newDiv);
      localNavTitle.addEventListener('click', () => {
        toggleNavSectionTitles(localNavTitle, newDiv);
      });
      if (globalNavSections) navSections.append(globalNavSections);
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');

    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);

    // add event listeners when window width changes
    isDesktop.addEventListener('change', () => {
      const localNavTitle = block.querySelector('.local-nav-title');
      const globalNavTitle = block.querySelector('.global-nav-title');
      toggleMenu(nav, navSections, isDesktop.matches);

      const localNavTitleEventHandler = () => {
        toggleNavSectionTitles(localNavTitle, localNavTitle.parentElement());
        toggleNavSectionTitles(globalNavTitle, globalNavTitle.parentElement());
      };
      if (isDesktop.matches) {
        localNavTitle.removeEventListener('click', localNavTitleEventHandler);
        globalNavTitle.removeEventListener('click', globalNavTitleClickHandler);
      } else {
        localNavTitle.addEventListener('click', localNavTitleEventHandler);
      }
    });

    // close the mobile menu when clicking anywhere outside of it
    window.addEventListener('click', (event) => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      if (!isDesktop.matches && expanded) {
        const rect = navSections.getBoundingClientRect();
        if (event.clientX > rect.right) {
          toggleMenu(nav, navSections);
        }
      }
    });

    // add page scroll listener to know when header turns to sticky
    const header = block.parentNode;
    window.addEventListener('scroll', () => {
      const scrollAmount = window.scrollY;
      if (scrollAmount > 0) {
        header.classList.add('is-sticky');
      } else {
        header.classList.remove('is-sticky');
      }
    });

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.prepend(globalNavDesktop);
    block.append(navWrapper);
  }
}
