const MapContainer = ({children}) => <div>{children}</div>;

const useMap = () => ({fitBounds: () => {}});

const TileLayer = () => <div />;

const Marker = ({children}) => <div>{children}</div>;

const Popup = () => <div />;

export {MapContainer, TileLayer, Marker, Popup, useMap};
