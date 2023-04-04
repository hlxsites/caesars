/* eslint-disable no-unused-expressions */
/* global describe before it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

/** @type {import('./types').Scripts} */
let scripts;
/** @type {import('./types').LibFranklin} */
let lib;

document.body.innerHTML = await readFile({ path: './dummy.html' });
document.head.innerHTML = await readFile({ path: './head.html' });

describe('Core Helix features', () => {
  before(async () => {
    scripts = await import('../../caesars-palace/scripts/scripts.js');
    lib = await import('../../caesars-palace/scripts/lib-franklin.js');

    document.body.innerHTML = await readFile({ path: './body.html' });
  });

  it('Initializes window.hlx', async () => {
    // simulate code base path and turn on lighthouse
    document.head.appendChild(document.createElement('script')).src = '/foo/scripts/scripts.js';
    window.history.pushState({}, '', `${window.location.href}&lighthouse=on`);
    lib.setup();

    expect(window.hlx.codeBasePath).to.equal('/foo');
    expect(window.hlx.lighthouse).to.equal(true);

    // test error handling
    const url = sinon.stub(window, 'URL');

    // cleanup
    url.restore();
    window.hlx.codeBasePath = '';
    window.hlx.lighthouse = false;
    Array.from(document.querySelectorAll('script')).pop().remove();
  });

  it('Adds favicon', async () => {
    scripts.addFavIcon('/foo.svg');
    const $favIcon = document.querySelector('link[rel="icon"]');
    expect($favIcon.getAttribute('href')).to.equal('/foo.svg');
  });
});

describe('Quickfacts time calculations', () => {
  before(async () => {
    scripts = await import('../../caesars-palace/scripts/scripts.js');
    lib = await import('../../caesars-palace/scripts/lib-franklin.js');
  });

  it('identifies that a venture is closed based on an opening schedule, when checked date is clearly out of opening interval', async () => {
    const initialSchedule = {
      "Sunday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Monday": "CLOSED",
      "Tuesday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Wednesday": "CLOSED",
      "Thursday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Friday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Saturday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } }
    };

    // Monday
    let dateToCheck = new Date(2023, 3, 3, 9, 22);
    let isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Tuesday
    dateToCheck = new Date(2023, 3, 4, 9, 22);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Wednesday
    dateToCheck = new Date(2023, 3, 5, 10, 15);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Thursday
    dateToCheck = new Date(2023, 3, 6, 11, 15);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Friday
    dateToCheck = new Date(2023, 3, 7, 8, 0);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Saturday
    dateToCheck = new Date(2023, 3, 8, 7, 10);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);

    // Sunday
    dateToCheck = new Date(2023, 3, 9, 6, 0);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(false);
  });

  it('identifies that a venture is open based on an opening schedule, when checked date is clearly in the opening interval', async () => {
    const initialSchedule = {
      "Sunday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Monday": "CLOSED",
      "Tuesday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Wednesday": "CLOSED",
      "Thursday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Friday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } },
      "Saturday": { "opens": { "fullText": "10:30PM", "hours": 22, "minutes": 30 }, "closes": { "fullText": "4AM", "hours": 4, "minutes": 0 } }
    };

    // Tuesday
    let dateToCheck = new Date(2023, 3, 4, 22, 31);
    let isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(true);

    // Thursday
    dateToCheck = new Date(2023, 3, 6, 22, 45);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(true);

    // Friday
    dateToCheck = new Date(2023, 3, 7, 23, 0);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(true);

    // Saturday
    dateToCheck = new Date(2023, 3, 8, 23, 10);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(true);

    // Sunday
    dateToCheck = new Date(2023, 3, 9, 23, 59);
    isOpen = scripts.isVentureOpen(initialSchedule, dateToCheck, "CLOSED");
    expect(isOpen).to.equal(true);
  });
});