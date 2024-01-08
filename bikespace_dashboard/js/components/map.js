import { Component } from './main.js';
import { issue_attributes as ia } from './issue_attributes.js';

const tiles = {
  'thunderforest_atlas': "https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e",
  'openstreetmap': "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
};

class Map extends Component {
  constructor(parent, root_id, shared_state) {
    super(parent, root_id, shared_state);
    
    this.lmap = L.map('map').setView([43.733399, -79.376221], 11);
    L.tileLayer(tiles.thunderforest_atlas, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.lmap);

    this.markers = this.buildMarkers();
    this.lmap.addLayer(this.markers);

    // improve keyboard navigation
    $(document).on("keydown", ".marker-cluster", function(e) {
      if (e.key == "Enter" || e.key == " ") {
        $(document.activeElement).trigger('click');
      }
    });
    $(document).on("keydown", ".leaflet-marker-icon", function(e) {
      if (e.key == " ") { // Enter already works
        $(document.activeElement).trigger('click');
      }
    });
  }

  buildMarkers() {
    let markers = L.markerClusterGroup();

    // build popup content
    const duration_descr = {
      'minutes': "for <strong>less than an hour</strong>",
      'hours': "for <strong>several hours</strong>",
      'overnight': "<strong>overnight</strong>",
      'multiday': "for <strong>several days</strong>"
    };
    let issue_tags = {};
    for (let entry of Object.values(ia)) {
      issue_tags[entry.id] = [
        `<div class="issue issue-${entry.id.replace('_', '-')}" `,
          `style="border-color:${entry.color};`,
            `background-color:${entry.color_light};"`,
        `>${entry.label_long}</div>`
      ].join("");
    }

    for (let point of this.shared_state.display_data) {
      let issues = point.issues.map((x) => issue_tags[x] ?? `<div class="issue">${x}</div>`).join(" ");
      let parking_time = new Date(point.parking_time);
      let parking_time_desc = parking_time.toLocaleString("en-CA", {
        "dateStyle": "full",
        "timeStyle": "short"
      });
      let comments = `<strong>Comments:</strong> ${point.comments ? point.comments : "<em>none</em>"}`;

      let content = [
        `<div class="issue-list">`,
        `<strong>Issues:</strong> ${issues ? issues : "<em>none</em>"}`,
        `</div>`,
        `<p>This person wanted to park ${duration_descr[point.parking_duration] ?? `<strong>${point.parking_duration}</strong>`} on <strong>${parking_time_desc}</strong></p>`,
        `<p>${comments}</p>`,
        `<p class="submission-id">ID: ${point.id}</p>`
      ].join("");

      // build custom markers
      // @TODO use class inheritance instead like tutorial
      const marker_defaults = {
        shadowUrl: "./leaflet/images/marker-shadow.png",
        iconSize:     [36, 36],
        iconAnchor:   [18, 36], // half of width and full height
        popupAnchor:  [0, -30], // nearly all the height, not sure why negative
        shadowSize:   [41, 41], // from default
        shadowAnchor: [12, 41], // more manual offset, bottom point of shadow is ~30% along x axis, not at (0, 0)
      };
      // @TODO tag list should also go in this order
      // @TODO make marker color programmatic?

      // pick the relevant issue to display via marker
      const marker_issue = point.issues.reduce(
        (a, c) => ia[a]?.render_priority < ia[c]?.render_priority ? a : c,
        null);
      const custom_marker = ia[marker_issue ?? "other"];

      let customIcon = L.icon({
        iconUrl: custom_marker.icon,
        ...marker_defaults,
      })
      // let customIcon = L.divIcon();

      var marker = L.marker([point.latitude, point.longitude], {icon: customIcon});
      marker.bindPopup(content);
      markers.addLayer(marker);
    }

    return markers;
  }

  refresh() {
    this.markers.remove();
    this.markers = this.buildMarkers();
    this.markers.addTo(this.lmap);
  }
}

export { Map };