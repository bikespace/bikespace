class PanelNav {
  constructor(selector_prior_sibling, root_id) {
    document.querySelector(selector_prior_sibling).insertAdjacentHTML(
      'afterend',
      `<div id="${root_id}">
        <nav id="${root_id}-nav" aria-label="Sidebar">
          <fieldset>
              <input type="radio" id="${root_id}-nav-data" name="${root_id}-nav" value="${root_id}-section-data" checked>
              <label for="${root_id}-nav-data">Data</label>
              <input type="radio" id="${root_id}-nav-filters" name="${root_id}-nav" value="${root_id}-section-filters">
              <label for="${root_id}-nav-filters">Filters</label>
              <input type="radio" id="${root_id}-nav-feed" name="${root_id}-nav" value="${root_id}-section-feed">
              <label for="${root_id}-nav-feed">Feed</label>
          </fieldset>
        </nav>
        <div id="${root_id}-sections">
          <div id="${root_id}-section-data" class="${root_id}-section"></div>
          <div id="${root_id}-section-filters" class="${root_id}-section" hidden></div>
          <div id="${root_id}-section-feed" class="${root_id}-section" hidden></div>
        </div>
      </div>`
    );
    document
      .querySelector(`#${root_id}-nav`)
      .addEventListener('click', event => {
        if (event.target?.matches('input[type="radio"]')) {
          document.querySelectorAll(`.${root_id}-section`).forEach(section => {
            section.hidden = true;
          });
          document.getElementById(`${event.target.value}`).hidden = false;
        }
      });
  }
}

export {PanelNav};
