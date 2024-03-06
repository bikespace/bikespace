class PanelNav {
  static Tabs = {
    data: {name: 'Data'},
    filters: {name: 'Filters'},
    feed: {name: 'Feed'},
  };
  static DEFAULT_TAB = 'data';
  static tabsMap(cb) {
    return Object.entries(PanelNav.Tabs).map(([id, tabDesc]) =>
      cb({...tabDesc, id})
    );
  }

  makeTabHandle({id, name}) {
    const root_id = this.root_id;
    return `
      <input type="radio" id="${root_id}-nav-${id}" name="${root_id}-nav" value="${root_id}-section-${id}" ${
        id === PanelNav.DEFAULT_TAB ? 'checked' : ''
      } data-panel-id="${id}">
      <label for="${root_id}-nav-${id}">${name}</label>
    `;
  }

  makeTabContent({id}) {
    const root_id = this.root_id;
    return `
      <div id="${root_id}-section-${id}" class="${root_id}-section" 
        data-panel-id="${id}"
        ${id === PanelNav.DEFAULT_TAB ? '' : 'hidden'}
      ></div>
    `;
  }

  switchTab(id) {
    window.location.hash = id;
    console.log(
      'sections:',
      document.querySelectorAll(`.${this.root_id}-section`)
    );
    for (const section of document.querySelectorAll(`.${this.root_id}-section`))
      section.hidden = section.dataset.panelId !== id;
  }

  constructor(selector_prior_sibling, root_id) {
    this.root_id = root_id;
    console.log(
      'hmmm',
      PanelNav.tabsMap(this.makeTabContent.bind(this)).join('')
    );

    document.querySelector(selector_prior_sibling).insertAdjacentHTML(
      'afterend',
      `<div id="${root_id}" aria-label="Sidebar">
        <nav id="${root_id}-nav">
          <fieldset>
            ${PanelNav.tabsMap(this.makeTabHandle.bind(this)).join('')}
          </fieldset>
        </nav>
        <div id="${root_id}-sections">
          ${PanelNav.tabsMap(this.makeTabContent.bind(this)).join('')}
        </div>
      </div>`
    );
    document
      .querySelector(`#${root_id}-nav`)
      .addEventListener('click', event => {
        if (event.target?.matches('input[type="radio"]')) {
          this.switchTab(event.target.dataset.panelId);
        }
      });
  }
}

export {PanelNav};
