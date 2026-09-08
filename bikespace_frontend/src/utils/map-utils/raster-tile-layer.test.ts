import {getRasterTileLayerProps} from './raster-tile-layer';

describe('getRasterTileLayerProps', () => {
  test('uses MapTiler and credits both providers when a key is configured', () => {
    expect(getRasterTileLayerProps('test-maptiler-key')).toEqual({
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: 'https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=test-maptiler-key',
    });
  });

  test.each([undefined, ''])(
    'uses the OpenStreetMap fallback when the key is %p',
    maptilerApiKey => {
      expect(getRasterTileLayerProps(maptilerApiKey)).toEqual({
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      });
    }
  );
});
