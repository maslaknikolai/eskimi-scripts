// ==UserScript==
// @name        LinkedIn Copy User Info
// @namespace   Violentmonkey Scripts
// @match       *://*linkedin.com/*
// @grant       none
// @version     1.5
// @author      Nikolai Maslak
// @description 11/16/2023, 4:01:58 AM
// @run-at      document-end
// @updateURL    https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.meta.js
// @downloadURL  https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.user.js
// @update       https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.user.js
// ==/UserScript==

main()

async function main() {
  const finder = elementsFinderFactory()

  finder.on('.pv-top-card-v2-ctas', insertCopyButton)
  finder.on('.pv-top-card-v2-ctas__custom', insertCopyButton)

  function insertCopyButton(el) {
    const btnsRow = el.children[0]

    const getInfoBtn = $(`
      <button
        class="
          artdeco-dropdown__trigger
          artdeco-dropdown__trigger--placement-bottom
          ember-view
          artdeco-button
          artdeco-button--secondary
          artdeco-button--muted
          artdeco-button--2
        "
      >
        ${SVG()}
      </button>
    `)

    getInfoBtn.onclick = () => {
      const userInfo = getUserInfo()
      console.log(userInfo)
      const clipboardData = { ...userInfo, lnkdn: true, }
      navigator.clipboard.writeText(JSON.stringify(clipboardData, null, 4))

      getInfoBtn.innerHTML = 'User info copied!'
      setTimeout(() => {
        getInfoBtn.innerHTML = SVG()
      }, 1000)
    }

    btnsRow.append(getInfoBtn)
  }
}

function getUserInfo() {
    const companyInHeader = Array.from(document.querySelectorAll('button')).find(it => it.getAttribute('aria-label')?.startsWith('Current company: '))?.innerText;

    const nameEl = document.querySelector('h1')

    const name = nameEl?.innerText
    const url = document.location.href
    const country = (() => {
      const s = document.querySelector('#top-card-text-details-contact-info')?.parentElement?.previousElementSibling?.innerText.trim().split(', ')
      return s[s.length-1]
    })()

    const experience = document.querySelector('#experience')?.nextElementSibling?.nextElementSibling
    const lastJob = experience?.querySelector('.pvs-entity--padded')
    const lastJobLines = lastJob?.children?.[1]?.children?.[0]?.children?.[0]

    const lastJobLastJourneyPosition = lastJob?.children?.[1]?.children?.[1]?.children?.[0]?.children?.[0]?.querySelector('.t-bold .visually-hidden')?.innerText
    const lastJobBoldRow = lastJobLines?.querySelector('.t-bold .visually-hidden')?.innerText

    const companyWhenJourney = lastJobLines?.children?.[1]?.querySelector('.visually-hidden')?.innerText.split(' · ')?.[0]
    const jobTitle = lastJobLastJourneyPosition || lastJobBoldRow
    const company = companyInHeader || companyWhenJourney

    return {company, name, jobTitle, country, url}
}

function $(s) {
    const el = document.createElement('div')
    el.innerHTML = s
    return el.children[0]
}


function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function elementsFinderFactory() {
  const mapSelectorHandlers = {};
  let alreadyFoundElements = [];

  setInterval(() => {
    Object.entries(mapSelectorHandlers)
      .forEach(([selector, handlers]) => {
        const newFoundElements = [...document.querySelectorAll(selector)]
          .filter((element) => !alreadyFoundElements.includes(element));

        newFoundElements.forEach((element) => {
          handlers.forEach((handler) => {
            handler(element);
          });
        });

        alreadyFoundElements = [
          ...alreadyFoundElements,
          ...newFoundElements,
        ];
      });
  }, 300);

  function on(selector, foundHandler) {
    if (!mapSelectorHandlers[selector]) {
      mapSelectorHandlers[selector] = [];
    }

    mapSelectorHandlers[selector].push(foundHandler);
  }

  return {
    on,
  };
}

function SVG() {
  return `<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
  >
    <path d="M20.05 9.61c0 3.93-2.53 6.62-6.15 6.62-1.73 0-3.15-.71-3.68-1.6l.03.91v5.63h-3.7V6.62c0-.2-.05-.25-.28-.25H5v-3.1h3.1c1.41 0 1.77 1.23 1.87 1.76.56-.94 2.02-2.03 4.1-2.03 3.58 0 5.98 2.66 5.98 6.61Zm-3.77.03c0-2.1-1.37-3.55-3.1-3.55-1.41 0-3.01.94-3.01 3.58 0 1.72.96 3.52 2.96 3.52 1.48 0 3.15-1.07 3.15-3.55Z"></path>
  </svg>`
}