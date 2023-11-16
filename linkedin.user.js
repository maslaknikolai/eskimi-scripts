// ==UserScript==
// @name        LinkedIn Copy User Info
// @namespace   Violentmonkey Scripts
// @match       *://*linkedin.com/*
// @grant       none
// @version     1.1
// @author      -
// @description 11/16/2023, 4:01:58 AM
// @run-at      document-end
// @updateURL    https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.meta.js
// @downloadURL  https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.user.js
// @update       https://github.com/maslaknikolai/eskimi-scripts/raw/main/linkedin.user.js
// ==/UserScript==

main()

async function main() {
  const finder = elementsFinderFactory()

  finder.on('.pvs-profile-actions', insertCopyButton)

  function insertCopyButton() {
    const btnsRow = document.querySelector('.pvs-profile-actions')

    const newBtn = $(`
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
          🪝
      </button>
    `)

    newBtn.onclick = () => {
      const userInfo = getUserInfo()
      console.log(userInfo)
      navigator.clipboard.writeText(JSON.stringify({
        ...userInfo,
        lnkdn: true,
      }, null, 4))
    }

    btnsRow.append(newBtn)
  }
}

function getUserInfo() {
    const company = Array.from(document.querySelectorAll('button')).find(it => it.getAttribute('aria-label')?.startsWith('Current company: '))?.innerText;

    const nameEl = document.querySelector('h1')

    const name = nameEl?.innerText
    const jobTitle = nameEl?.parentElement?.parentElement?.parentElement?.nextElementSibling?.innerText
    const url = document.location.href
    const country = (() => {
      const s = document.querySelector('#top-card-text-details-contact-info')?.parentElement?.previousElementSibling?.innerText.trim().split(', ')
      return s[s.length-1]
    })()

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
