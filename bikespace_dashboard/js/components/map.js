import { Component } from './main.js';

class Map extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);
    var lmap = L.map('map').setView([43.652771, -79.383756], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(lmap);
    var markers = L.markerClusterGroup();

    // build popup content
    const duration_descr = {
      'minutes': "for <strong>less than an hour</strong>",
      'hours': "for <strong>several hours</strong>",
      'overnight': "<strong>overnight</strong>",
      'multiday': "for <strong>several days</strong>"
    };
    const issue_tags = {
      'not_provided': `<div class="issue issue-not-provided">Bicycle parking was not provided</div>`,
      'full': `<div class="issue issue-full">Bicycle parking was full</div>`,
      'damaged': `<div class="issue issue-damaged">Bicycle parking was damaged</div>`,
      'abandoned': `<div class="issue issue-abandoned">Parked bicycle was abandoned</div>`,
      'other': `<div class="issue issue-other">Other issue</div>`
    };

    for (let point of shared_state.display_data) {
      let issues = point.issues.map((x) => issue_tags[x] ?? `<div class="issue">${x}</div>`).join(" ");
      let parking_time = new Date(point.parking_time);
      let parking_time_desc = parking_time.toLocaleString("en-CA", {
        "dateStyle": "full",
        "timeStyle": "short"
      });
      let comments = `<strong>Comments:</strong> ${point.comments ? point.comments : "<em>none</em>"}`;

      let content = [
        `<div class="issue-list"><strong>Issues:</strong> ${issues ? issues : "<em>none</em>"}</div>`,
        `<p>This person wanted to park ${duration_descr[point.parking_duration] ?? `<strong>${point.parking_duration}</strong>`} on <strong>${parking_time_desc}</strong></p>`,
        `<p>${comments}</p>`,
        `<p class="submission-id">ID: ${point.id}</p>`
      ].join("");
      var marker = L.marker([point.latitude, point.longitude]);
      marker.bindPopup(content);
      markers.addLayer(marker);
    }
    lmap.addLayer(markers);

    // improve keyboard navigation
    $(document).on("keydown", ".marker-cluster", function(e) {
      if (e.key == "Enter" || e.key == " ") {
        $(document.activeElement).trigger('click');
      }
    })
    $(document).on("keydown", ".leaflet-marker-icon", function(e) {
      if (e.key == " ") { // Enter already works
        $(document.activeElement).trigger('click');
      }
    })
  }
}

export { Map };