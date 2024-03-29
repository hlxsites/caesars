import { getMetadata, decorateIcons, loadBlocks } from '../../scripts/lib-franklin.js';
import { decorateMain } from '../../scripts/scripts.js';

const screenConfig = Object.freeze({
  tablet: {
    media: window.matchMedia('(max-width: 1169px)'),
  },
  smallDesktop: {
    media: window.matchMedia('(min-width: 1170px) and (max-width: 1439px'),
    maxItems: 7,
  },
  largeDesktop: {
    media: window.matchMedia('(min-width: 1440px)'),
    maxItems: 9,
  },
});
const CAESARS_DOT_COM = 'https://www.caesars.com';
const GLOBAL_HEADER_JSON = '/content/empire/en/jcr:content/root/header.model.json';
const GLOBAL_HEADER_JSON_LOCAL = '/caesars-palace/scripts/resources/header.model.json';
const GLOBAL_HEADER_LOGO_LOCAL = '/caesars-palace/icons/caesars-global-logo.svg';
const GLOBAL_HEADER_SIGN_IN = '/caesars-palace/fragments/header/sign-in';
const DESKTOP_SIGN_IN_TEXT = 'Sign In';
const MOBILE_SIGN_IN_TEXT = 'Sign Up / Sign In';

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

async function fetchFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const container = document.createElement('div');
    container.innerHTML = await resp.text();
    decorateMain(container);
    await loadBlocks(container);
    return container;
  }
  return null;
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && screenConfig.smallDesktop.media.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!screenConfig.smallDesktop.media.matches) {
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
  document.body.style.overflowY = (expanded || screenConfig.smallDesktop.media.matches || screenConfig.largeDesktop.media.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || screenConfig.smallDesktop.media.matches || screenConfig.largeDesktop.media.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (screenConfig.smallDesktop.media.matches || screenConfig.largeDesktop.media.matches) {
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
  if (!expanded || screenConfig.smallDesktop.media.matches
    || screenConfig.largeDesktop.media.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

const showMore = (nav, maxItemsDesktop) => {
  const ul = nav.querySelector('.nav-sections > .local-nav > ul');
  const more = document.createElement('li');
  more.classList.add('more');
  const moreText = document.createElement('div');
  moreText.classList.add('more-text');
  const aMore = document.createElement('a');
  aMore.classList.add('more-link');
  aMore.text = 'MORE';
  moreText.appendChild(aMore);
  const dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add('dropdown-menu');

  [...ul.children].forEach((child, index) => {
    if (index < maxItemsDesktop) {
      return;
    }
    const dropdownItem = document.createElement('div');
    dropdownItem.classList.add('dropdown');
    child.firstChild.classList.add('menu-item');
    dropdownItem.appendChild(child.firstChild);
    dropdownMenu.appendChild(dropdownItem);
    ul.removeChild(child);
  });

  more.prepend(moreText);
  more.appendChild(dropdownMenu);
  ul.appendChild(more);

  more.addEventListener('click', () => {
    const dropdown = more.querySelector('.dropdown-menu');
    dropdown.classList.toggle('active');
    aMore.classList.toggle('active');
  });
  // Disable dropdown onclick outside the dropdown
  document.onclick = (e) => {
    const eventTarget = e.target.classList;
    if (!(eventTarget.contains('more') || eventTarget.contains('more-link') || eventTarget.contains('more-text')
     || eventTarget.contains('dropdown') || eventTarget.contains('dropdown-menu'))) {
      const dropdown = more.querySelector('.dropdown-menu');
      if (dropdown.classList.contains('active')) {
        dropdown.classList.toggle('active');
        aMore.classList.toggle('active');
      }
    }
  };
};

/**
 * shows the login modal
 */
function toggleUserMenu() {
  const userMenu = this.closest('.header.block').querySelector('.user-menu');
  if (userMenu.classList.contains('open')) {
    userMenu.classList.remove('open');
  } else {
    userMenu.classList.add('open');
  }
  if (this.classList.contains('user-account-mobile')) {
    const nav = this.closest('nav');
    const navSections = nav.querySelector('.nav-sections');
    toggleMenu(nav, navSections);
  }
}

/**
 * Creates the user menu
 * @param {Element} block Header block
 */
async function createUserMenu(block) {
  const userMenu = document.createElement('div');
  userMenu.classList.add('user-menu');
  const userMenuClose = document.createElement('div');
  userMenuClose.classList.add('user-menu-close');
  userMenuClose.addEventListener('click', toggleUserMenu);
  userMenu.appendChild(userMenuClose);
  const userMenuContainer = document.createElement('div');
  userMenuContainer.classList.add('user-menu-container');
  const userMenuMainPanel = document.createElement('div');
  userMenuMainPanel.classList.add('user-menu-main-panel');
  const loginText = document.createElement('div');
  loginText.classList.add('text-center');
  userMenuMainPanel.appendChild(loginText);
  const fragmentBlock = await fetchFragment(`${GLOBAL_HEADER_SIGN_IN}`);
  userMenuContainer.appendChild(fragmentBlock);
  userMenu.appendChild(userMenuContainer);
  block.appendChild(userMenu);
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
      globalNavTitle.addEventListener('click', () => {
        toggleNavSectionTitles(globalNavTitle, globalNavSections);
      });
      // user account
      const userAccount = document.createElement('div');
      userAccount.classList.add('user-account');
      const signIn = document.createElement('a');
      signIn.classList.add('sign-in');
      signIn.setAttribute('aria-label', `${DESKTOP_SIGN_IN_TEXT}`);
      signIn.innerHTML = `${DESKTOP_SIGN_IN_TEXT}`;
      signIn.addEventListener('click', toggleUserMenu);
      userAccount.appendChild(signIn);
      globalNavDesktop.appendChild(userAccount);
    }
    if (globalNavJson.logoFileReference) {
      globalNavDesktop.prepend(await createGlobalNavLogo(globalNavJson.logoFileReference));
    }
    if (globalNavJson.style) globalNavDesktop.classList.add(globalNavJson.style);
  }

  createUserMenu(block);

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

      const userAccountMobile = document.createElement('div');
      userAccountMobile.classList.add('user-account-mobile');
      const signInMobile = document.createElement('div');
      signInMobile.classList.add('sign-in');
      const signInLink = document.createElement('a');
      signInLink.textContent = `${MOBILE_SIGN_IN_TEXT}`;
      signInMobile.appendChild(signInLink);
      userAccountMobile.append(signInMobile);
      userAccountMobile.addEventListener('click', toggleUserMenu);
      navSections.prepend(userAccountMobile);
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
    toggleMenu(nav, navSections, screenConfig.smallDesktop.media.matches);

    // add event listeners when window width changes
    screenConfig.smallDesktop.media.addEventListener('change', () => {
      const localNavTitle = block.querySelector('.local-nav-title');
      const globalNavTitle = block.querySelector('.global-nav-title');
      toggleMenu(nav, navSections, screenConfig.smallDesktop.media.matches);
      if (screenConfig.smallDesktop.media.matches) {
        localNavTitle.removeEventListener('click');
        globalNavTitle.removeEventListener('click');
      } else {
        localNavTitle.addEventListener('click', () => {
          toggleNavSectionTitles(localNavTitle, localNavTitle.parentElement());
          toggleNavSectionTitles(globalNavTitle, globalNavTitle.parentElement());
        });
      }
    });

    // close the mobile menu when clicking anywhere outside of it
    window.addEventListener('click', (event) => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      if (!screenConfig.smallDesktop.media.matches
        && !screenConfig.largeDesktop.media.matches && expanded) {
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

    if (screenConfig.largeDesktop.media.matches) {
      showMore(nav, screenConfig.largeDesktop.maxItems);
    } else if (screenConfig.smallDesktop.media.matches) {
      showMore(nav, screenConfig.smallDesktop.maxItems);
    }

    const handleTabletScreenChange = (query) => {
      if (query.matches) {
        const ul = nav.querySelector('.nav-sections > .local-nav > ul');
        const more = nav.querySelector('.more');
        const dropdownMenu = nav.querySelector('.dropdown-menu');
        if (more && dropdownMenu) {
          [...dropdownMenu.children].forEach((item) => {
            item.firstChild.classList.remove('menu-item');
            const li = document.createElement('li');
            li.appendChild(item.firstChild);
            ul.appendChild(li);
          });
          ul.removeChild(more);
        }
      }
    };
    handleTabletScreenChange(screenConfig.tablet.media);
    screenConfig.tablet.media.addEventListener('change', handleTabletScreenChange);

    const handleScreenChange = (query) => {
      if (query.matches) {
        nav.setAttribute('aria-expanded', 'true');
        const ul = nav.querySelector('.nav-sections > .local-nav > ul');
        const dropdownMenu = nav.querySelector('.dropdown-menu');
        const more = nav.querySelector('.more');

        if (ul.children.length >= screenConfig.largeDesktop.maxItems + 1) {
          return;
        }
        [...dropdownMenu.children].forEach((menuItem, index) => {
          if (index >= (screenConfig.largeDesktop.maxItems - screenConfig.smallDesktop.maxItems)) {
            return;
          }
          dropdownMenu.removeChild(menuItem);
          menuItem.firstChild.classList.remove('menu-item');
          const li = document.createElement('li');
          li.appendChild(menuItem.firstChild);
          ul.insertBefore(li, more);
        });
      }
    };
    handleScreenChange(screenConfig.largeDesktop.media);
    screenConfig.largeDesktop.media.addEventListener('change', handleScreenChange);

    // screen change to small desktop
    const handleScreenChangeSmallDesktop = (query) => {
      if (query.matches) {
        const items = nav.querySelectorAll('.dropdown');
        if (items.length === 0) {
          // For screen change from tablet to small desktop
          showMore(nav, screenConfig.smallDesktop.maxItems);
          return;
        }
        const ul = nav.querySelector('.nav-sections > .local-nav > ul');
        const dropdownMenu = nav.querySelector('.dropdown-menu');
        const firstElementChild = dropdownMenu.firstChild;
        [...ul.children].forEach((li, index) => {
          if (index < screenConfig.smallDesktop.maxItems || li.classList.contains('more')) {
            return;
          }
          ul.removeChild(li);
          const dropdownItem = document.createElement('div');
          dropdownItem.classList.add('dropdown');
          li.firstChild.classList.add('menu-item');
          dropdownItem.appendChild(li.firstChild);
          dropdownMenu.insertBefore(dropdownItem, firstElementChild);
        });
      }
    };
    handleScreenChangeSmallDesktop(screenConfig.smallDesktop.media);
    screenConfig.smallDesktop.media.addEventListener('change', handleScreenChangeSmallDesktop);
  }
}
