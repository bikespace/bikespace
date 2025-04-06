// adapted from https://github.com/openstreetmap/id-tagging-schema/blob/main/data/fields/bicycle_parking.json
export const bicycleParkingDescriptions: Record<string, string> = {
  stands: 'Stands', // (supports bicycle frame)
  wall_loops: 'Wheelbender', //  (supports wheel only)
  shed: 'Shed', // Closed Shed
  lockers: 'Lockers',
  building: 'In a Building',
  handlebar_holder: 'Handlebar Holder',
  // added these ones
  rack: 'Rack', // (supports bicycle frame)
  bollard: 'Post and Ring',
};
