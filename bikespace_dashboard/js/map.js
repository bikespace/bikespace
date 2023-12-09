var map = {
    init: function(shared_state) {
        shared_state.components.map = this;

        $('body').append('<div id="map"></div>');

        var lmap = L.map('map').setView([43.652771, -79.383756], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(lmap);

        for (var i = 0; i < shared_state.data.submissions.length; i++) {
            point = shared_state.data.submissions[i];
            L.marker([point.latitude, point.longitude])
                .addTo(lmap)
                .bindPopup(`<h2>${point.id}</h2> <div>${point.comments}</div>`);
        }
    },
    refresh: function() {
        console.log('sidebar refreshing');
    }
};


