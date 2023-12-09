var sidebar = {
    init: function(shared_state) {
        shared_state.components.sidebar = this;

        $('body').append('<div id="sidebar">This is a sidebar.</div>');
    },
    refresh: function() {
        console.log('sidebar refreshing');
    }
};