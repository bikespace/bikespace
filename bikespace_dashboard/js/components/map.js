import {issue_attributes as ia} from './api_tools.js';
import {Component} from './main.js';

const tiles = {
  thunderforest_atlas: {
    url: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e',
    attribution: [
      '&copy; Maps ',
      '<a href="https://www.thunderforest.com/">',
      'Thunderforest',
      '</a>, ',
      '&copy; Data ',
      '<a href="https://www.openstreetmap.org/copyright">',
      'OpenStreetMap contributors',
      '</a>',
    ].join(''),
  },
  openstreetmap: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: [
      '&copy; ',
      '<a href="https://www.openstreetmap.org/copyright">',
      'OpenStreetMap contributors',
      '</a>',
    ].join(''),
  },
};

const DEFAULT_TILES = tiles.thunderforest_atlas;
const ICON_SIZE_NORMAL = 36;
const ICON_SIZE_LARGER = 36 * 1.5;
const STARTING_LATLNG = [43.733399, -79.376221]; // city of toronto
const STARTING_ZOOM = 11;
const MOBILE_BREAKPOINTS = '(width < 1024px) and (min-height: 500px)';

const CUSTOM_GEO_ERROR_MESSAGES = {
  // leaflet internally uses 0 to denote missing Geolocation API
  // ref: https://github.com/Leaflet/Leaflet/blob/00e0534cd9aa723d10a652146311efd9ce990b46/src/map/Map.js#L632
  0: 'GPS is not supported in your browser.',
  [GeolocationPositionError.PERMISSION_DENIED]: 'Please allow location access.',
  // happens when: location is disabled at OS-level / when GPS has other errors
  [GeolocationPositionError.POSITION_UNAVAILABLE]:
    'Had trouble locating you. Please turn on / restart your GPS or try another device.',
  [GeolocationPositionError.TIMEOUT]:
    'It took too long to locate you. Please try again.',
};

class Map extends Component {
  #zoomedToMarker = null;

  /**
   * Base class for graphs, map, etc. Registers component with shared_state.
   * @param {string} parent JQuery selector for parent element
   * @param {string} root_id tag id for root div
   * @param {Object} shared_state
   * @param {import('./main.js').ComponentOptions} [options = {}] Options for the component
   */
  constructor(parent, root_id, shared_state, options = {}) {
    super(parent, root_id, shared_state, options);

    // initialize map and zoom to starting location
    this.lmap = L.map('issue-map').setView(STARTING_LATLNG, STARTING_ZOOM);
    L.tileLayer(DEFAULT_TILES.url, {
      attribution: DEFAULT_TILES.attribution,
    }).addTo(this.lmap);
    L.control
      .locate({
        flyTo: true,
        onLocationError: err => {
          const message =
            CUSTOM_GEO_ERROR_MESSAGES[err.code] ||
            'Unknown error while trying to locate you';
          this.analytics_event('locationerror', {code: err.code, message});
          alert(message);
        },
      })
      .addTo(this.lmap);
    this.lmap.on('locationfound', () => {
      // combined with locationerror, we can count how many of the users request GPS location
      this.analytics_event('locationfound');
    });

    this.markers = this.#buildMarkers();
    this.lmap.addLayer(this.markers);

    // map resizing
    const invalidateLmapObserver = new ResizeObserver(() => {
      // put this at the end of the queue so the invalidation is executed after everything else has resized.
      setTimeout(() => this.lmap.invalidateSize(), 0);
    });
    // invalidate map size upon root elem resize
    invalidateLmapObserver.observe(this.getRootElem());

    // improve keyboard navigation
    $(document).on('keydown', '.marker-cluster', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        $(document.activeElement).trigger('click');
      }
    });
    $(document).on('keydown', '.leaflet-marker-icon', e => {
      if (e.key === ' ') {
        // Enter already works
        $(document.activeElement).trigger('click');
      }
    });

    // popup open actions
    this.lmap.on('popupopen', e => {
      // analytics
      super.analytics_event(`${this.root_id}_${e.type}`, {
        submission_id: e.popup.submission_id,
      });
    });

    // map click unfocuses submission via hash router
    this.lmap.on('click', e => {
      setTimeout(() => {
        this.shared_state.router.params.delete('submission_id');
        this.shared_state.router.params = this.shared_state.router.params;
      }, 0);
    });

    // set callback that responds to router changes
    this.shared_state.router.onChange(() => {
      this.#refreshFocusedMarker();
    });

    // zoom to marker if specified in url hash when map is loaded
    this.lmap.invalidateSize();
    setTimeout(() => {
      this.#refreshFocusedMarker();
    }, 0);
  }

  refresh() {
    this.markers.remove();
    this.markers = this.#buildMarkers();
    this.markers.addTo(this.lmap);
  }

  #refreshFocusedMarker() {
    this.#clearZoomedToStyles();
    const submissionId = parseInt(
      this.shared_state.router.params.get('submission_id')
    );
    if (!isNaN(submissionId)) {
      this.#zoomToSubmission(submissionId);
    }
    this.#zoomedToMarker = this.#getMapMarkerByID(submissionId) ?? null;
  }

  #getMapMarkerByID(submission_id) {
    return this.all_markers.filter(
      m => `${m.submission_id}` === `${submission_id}`
    )[0];
  }

  #setIconSize(icon, size) {
    icon.options.iconSize = L.point(size, size);
    icon.options.iconAnchor = L.point(size / 2, size);
    icon.options.popupAnchor = L.point(0, -size * 0.8);
  }

  #clearZoomedToStyles() {
    if (this.#zoomedToMarker) {
      const icon = this.#zoomedToMarker.getIcon();
      this.#setIconSize(icon, ICON_SIZE_NORMAL);
      this.#zoomedToMarker.setIcon(icon);
    }
  }

  #applyZoomedToStyles(marker) {
    this.#setIconSize(marker.getIcon(), ICON_SIZE_LARGER);
    marker.setIcon(marker.getIcon());
  }

  #zoomToSubmission(id) {
    const marker = this.#getMapMarkerByID(id);
    this.#applyZoomedToStyles(marker);
    this.#zoomedToMarker = marker;
    this.markers.zoomToShowLayer(marker, () => marker.openPopup());
  }

  #buildMarkers() {
    const marker_cluster_group = L.markerClusterGroup();
    this.all_markers = [];

    // BUILD POPUP CONTENT
    // pre-generate template for each issue type
    const duration_descr = {
      minutes: 'for <strong>less than an hour</strong>',
      hours: 'for <strong>several hours</strong>',
      overnight: '<strong>overnight</strong>',
      multiday: 'for <strong>several days</strong>',
    };
    const issue_tags = {};
    for (const entry of Object.values(ia)) {
      issue_tags[entry.id] = [
        `<div class="issue issue-${entry.id.replace('_', '-')}" `,
        `style="border-color:${entry.color};`,
        `background-color:${entry.color_light};"`,
        `>${entry.label_long}</div>`,
      ].join('');
    }

    // use templates to generate popup content
    for (const point of this.shared_state.display_data) {
      // display issue chips in priority order
      point.issues.sort(
        (a, b) => ia[a].render_priority - ia[b].render_priority
      );
      const issues = point.issues
        .map(x => issue_tags[x] ?? `<div class="issue">${x}</div>`)
        .join(' ');
      const parking_time = new Date(point.parking_time);
      const parking_time_desc = parking_time.toLocaleString('en-CA', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      const comments = `<strong>Comments:</strong> ${
        point.comments ? point.comments : '<em>none</em>'
      }`;

      const content = `
        <div class="issue-list">
          <strong>Issues:</strong> ${issues ? issues : '<em>none</em>'}
        </div>
        <p>This person wanted to park ${
          duration_descr[point.parking_duration] ??
          `<strong>${point.parking_duration}</strong>`
        } on <strong>${parking_time_desc}</strong></p>
        <p>${comments}</p>
        <div class="flex-distribute">
          <a class="open-in-sidebar a-button" 
            href='#feed?view_all=1&submission_id=${point.id}'
            data-umami-event="issue-map_open_in_sidebar"
            data-umami-event-id="${point.id}"
          >
            Focus in Sidebar
          </a>
          <span class="submission-id">ID: ${point.id}</span>
        </div>`;

      const contentElem = document.createElement('div');
      contentElem.innerHTML = content;

      const openInSideBarLink = contentElem.querySelector('a.open-in-sidebar');
      openInSideBarLink.addEventListener('click', () => {
        this.shared_state.router.push({
          path: 'feed',
          params: new URLSearchParams({
            view_all: 1,
            submission_id: point.id,
          }),
        });
      });

      // BUILD MARKERS
      // set up custom markers
      const BaseIcon = L.Icon.extend({
        options: {
          shadowUrl: './libraries/leaflet/images/marker-shadow.png',
          iconSize: [ICON_SIZE_NORMAL, ICON_SIZE_NORMAL],
          iconAnchor: [ICON_SIZE_NORMAL / 2, ICON_SIZE_NORMAL], // half of width and full height
          popupAnchor: [0, -ICON_SIZE_NORMAL * 0.8], // nearly all the height, not sure why negative
          shadowSize: [41, 41], // from default
          shadowAnchor: [12, 41], // more manual offset, bottom point of shadow is ~30% along x axis, not at (0, 0)
        },
      });

      // pick the marker icon based on highest priority issue
      const marker_issue = point.issues.reduce(
        (a, c) => (ia[a]?.render_priority < ia[c]?.render_priority ? a : c),
        null
      );
      const custom_marker = ia[marker_issue ?? 'other'];
      const customIcon = new BaseIcon({
        iconUrl: custom_marker.icon,
      });

      // generate marker with icon and content
      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon,
      });
      marker.bindPopup(contentElem);
      // focus in sidebar if in mobile view
      marker.on('click', e => {
        if (window.matchMedia(MOBILE_BREAKPOINTS).matches) {
          this.shared_state.router.push({
            path: 'feed',
            params: new URLSearchParams({
              view_all: 1,
              submission_id: point.id,
            }),
          });
        } else {
          // unfocus previous selection if desktop marker click
          this.shared_state.router.params.delete('submission_id');
          this.shared_state.router.params = this.shared_state.router.params;
        }
      });
      this.all_markers.push(marker);
      marker_cluster_group.addLayer(marker);

      // add ids for lookup during events
      marker.submission_id = point.id;
      marker.getPopup().submission_id = point.id;
    }

    return marker_cluster_group;
  }
}

export {Map};
