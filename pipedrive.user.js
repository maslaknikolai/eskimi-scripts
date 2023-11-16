// ==UserScript==
// @name        Pipedrive paste from LinkedIn
// @namespace   Violentmonkey Scripts
// @match       *://*.pipedrive.com/*
// @grant       none
// @version     1.3
// @author      Nikolai Maslak
// @description 11/16/2023, 4:36:30 AM
// @run-at      document-end
// @updateURL    https://github.com/maslaknikolai/eskimi-scripts/raw/main/pipedrive.meta.js
// @downloadURL  https://github.com/maslaknikolai/eskimi-scripts/raw/main/pipedrive.user.js
// @update       https://github.com/maslaknikolai/eskimi-scripts/raw/main/pipedrive.user.js
// ==/UserScript==

main()

async function main() {
  injectStyles()

  const finder = elementsFinderFactory()
  finder.on('[data-test="left-panel"]', insertPasteButton)

  function insertPasteButton(modal) {
    const modalTitle = modal.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('header')?.innerText
    if (modalTitle !== 'Add person') {
      return
    }

    const fields = Array.from(modal.querySelectorAll('[data-test-type]'))

    const nameField = fields.find(it => it.innerText === 'Name')?.querySelector('input')
    const orgField = fields.find(it => it.innerText === 'Organization')?.querySelector('input')
    const jobTitleField = fields.find(it => it.innerText === 'Job title')?.querySelector('input')
    const linkedInField = fields.find(it => it.innerText === 'LinkedIn')?.querySelector('input')
    const sourceField = fields.find(it => it.innerText === 'Source (Required)')
    const countryField = fields.find(it => it.innerText === 'Country (Required)')

    const pasteListenerInput = $(`
      <input
        placeholder="CTRL+V over here"
        class="eskimiPasteListenerInput"
      />
    `)
    const modalHeader = modal.parentElement.parentElement.parentElement.parentElement.previousSibling

    modalHeader.append(pasteListenerInput)

    setTimeout(() => {
      pasteListenerInput.focus()
    }, 500);

    pasteListenerInput.oninput = () => {
      pasteListenerInput.value = ''
    }

    pasteListenerInput.onpaste = async (e) => {
      pasteListenerInput.value = 'Pasted!'

      setTimeout(() => {
        pasteListenerInput.value = ''
      }, 500);

      e.preventDefault()

      const json = (() => {
        try {
          return JSON.parse(e.clipboardData.getData('text'))
        } catch {
          return null
        }
      })()

      if (!json || !json?.lnkdn) {
        return
      }

      fillInput(nameField, json.name)
      fillInput(linkedInField, json.url)
      fillInput(jobTitleField, json.jobTitle)
      await fillSelect(sourceField, 'Outbound')
      await fillSelect(countryField, json.country)
      fillInput(orgField, json.company)

      function fillInput(input, value) {
        if (!input || !value) {
          return
        }

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        const event = new Event('input', {bubbles: true});

        input.focus()
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(event);
      }

      async function fillSelect(select, value) {
        if (!select || !value) {
          return
        }

        select.querySelector('span[type="button"]').click()
        await sleep(300)
        Array.from(select.querySelectorAll('[role="option"]')).find(it => it.innerText === value)?.click()
      }
    }
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

function injectStyles() {
  const styleEl = $(`<style>
    .eskimiPasteListenerInput {
      border: 1px solid transparent;
      transition: all .3s;
    }

    .eskimiPasteListenerInput:focus {
      border-color: blue;
    }
  </style>`)

  document.head.append(styleEl)
}