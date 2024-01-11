
module.exports = {
    ...jest.requireActual('react'),
    useState: jest.fn((v) => [v, jest.fn()]),
    useCallback: (fn) => fn,
    useContext: jest.fn(),
    useEffect: jest.fn(),
    useLayoutEffect: jest.fn(),
    useMemo: jest.fn((f) => f()),
    useRef: jest.fn((current) => ({ current })),
    Children: {
        toArray(children) {
            return Array.isArray(children) ? children : Array.of(children);
        },
        map(children, fn) {
            return this.toArray(children).map(fn);
        },
    },
};