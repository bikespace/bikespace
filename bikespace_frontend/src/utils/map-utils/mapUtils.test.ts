import {metersOffsetFrom} from './mapUtils';

describe('metersOffsetFrom', () => {
  test('returns [0, 0] for a point relative to itself', () => {
    const origin: [number, number] = [-79.3832, 43.6532];
    expect(metersOffsetFrom(origin, origin)).toEqual([0, 0]);
  });

  test('returns a positive north offset for a point due north', () => {
    const origin: [number, number] = [-79.3832, 43.6532];
    // ~0.0001 degrees north is ~11.1m
    const north: [number, number] = [-79.3832, 43.6533];
    const [east, north_] = metersOffsetFrom(north, origin);
    expect(east).toBeCloseTo(0, 3);
    expect(north_).toBeCloseTo(11.13, 1);
  });

  test('returns a positive east offset for a point due east', () => {
    const origin: [number, number] = [-79.3832, 43.6532];
    const east: [number, number] = [-79.3831, 43.6532];
    const [east_, north] = metersOffsetFrom(east, origin);
    expect(north).toBeCloseTo(0, 3);
    // east-west meters-per-degree shrinks with cos(latitude)
    expect(east_).toBeCloseTo(11.13 * Math.cos((43.6532 * Math.PI) / 180), 1);
  });

  test('matches known pairwise distances between nearby points', () => {
    // same coordinates used to investigate the cluster-member match-radius bug
    const origin: [number, number] = [-79.3832, 43.6532];
    const a: [number, number] = [-79.38315, 43.65315];
    const b: [number, number] = [-79.38325, 43.65325];

    const [aEast, aNorth] = metersOffsetFrom(a, origin);
    const [bEast, bNorth] = metersOffsetFrom(b, origin);
    const abDistance = Math.hypot(aEast - bEast, aNorth - bNorth);
    expect(abDistance).toBeCloseTo(13.7, 0);
  });
});
