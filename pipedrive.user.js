// ==UserScript==
// @name        Pipedrive paste from LinkedIn
// @namespace   Violentmonkey Scripts
// @match       *://*.pipedrive.com/*
// @grant       none
// @version     1.0
// @author      Nikolai Maslak
// @description 11/16/2023, 4:36:30 AM
// @run-at      document-end
// ==/UserScript==

main()

async function main() {
  const finder = elementsFinderFactory()

  finder.on('[data-test="left-panel"]', insertPasteButton)

  function insertPasteButton(modal) {
    const fields = Array.from(modal.querySelectorAll('[data-test-type]'))
    const nameField = fields.find(it => it.innerText === 'Name').querySelector('input')
    const orgField = fields.find(it => it.innerText === 'Organization').querySelector('input')
    const jobTitleField = fields.find(it => it.innerText === 'Job title').querySelector('input')
    const linkedInField = fields.find(it => it.innerText === 'LinkedIn').querySelector('input')
    const sourceField = fields.find(it => it.innerText === 'Source (Required)')
    const countryField = fields.find(it => it.innerText === 'Country')

    const modalHeader = modal.parentElement.parentElement.parentElement.parentElement.previousSibling

    const myinput = $(`<input placeholder="CTRL+V over here">`)

    myinput.onpaste = async (e) => {
      e.preventDefault()

      const pastedText = e.clipboardData.getData('text');

      const json = (() => {
        try {
          return JSON.parse(pastedText)
        } catch {
          return null
        }
      })()

      if (!json || !json?.lnkdn) {
        return
      }

      if (sourceField) {
        sourceField.querySelector('span[type="button"]').click()
        await sleep(300)
        Array.from(sourceField.querySelectorAll('[role="option"]')).find(it => it.innerText === 'Outbound').click()
      }

      if (countryField && json.country) {
        countryField.querySelector('span[type="button"]').click()
        await sleep(300)
        Array.from(countryField.querySelectorAll('[role="option"]')).find(it => it.innerText === json.country)?.click()
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const event = new Event('input', {bubbles: true});

      const name = json.name?.replaceAll(/[^A-Za-z\s]/g, '') || ''
      fillInput(nameField, name)

      const linkedIn = json.url || ''
      fillInput(linkedInField, linkedIn)

      const jobTitle = json.jobTitle || ''
      fillInput(jobTitleField, jobTitle)

      const org = json.company || ''
      fillInput(orgField, org)

      function fillInput(input, value) {
        input.focus()
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(event);
      }
    }

    modalHeader.append(myinput)
  }
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
