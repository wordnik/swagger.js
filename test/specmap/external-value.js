import xmock from 'xmock';

import mapSpec, { plugins } from '../../src/specmap';

const { externalValue } = plugins;

describe('externalValue', () => {
  let xapp;

  beforeAll(() => {
    xapp = xmock();
  });

  afterAll(() => {
    xapp.restore();
  });

  beforeEach(() => {
    externalValue.clearCache();
  });

  describe('ExternalValueError', () => {
    test('should contain the externalValue error details', () => {
      try {
        throw new externalValue.ExternalValueError('Probe', {
          externalValue: 'http://test.com/probe',
          fullPath: 'probe',
        });
      } catch (e) {
        expect(e.toString()).toEqual('ExternalValueError: Probe');
        expect(e.externalValue).toEqual('http://test.com/probe');
        expect(e.fullPath).toEqual('probe');
      }
    });
    test('.wrapError should wrap an error in ExternalValueError', () => {
      try {
        throw externalValue.wrapError(new Error('hi'), {
          externalValue: 'http://test.com/probe',
          fullPath: 'probe',
        });
      } catch (e) {
        expect(e.message).toMatch(/externalValue/);
        expect(e.message).toMatch(/hi/);
        expect(e.externalValue).toEqual('http://test.com/probe');
        expect(e.fullPath).toEqual('probe');
      }
    });
  });

  describe('externalValue Plugin value collision', () => {
    const spec = {
      paths: {
        '/probe': {
          get: {
            responses: {
              200: {
                content: {
                  '*/*': {
                    examples: {
                      probe: {
                        externalValue: 'http://test.com/probe',
                        value: 'test',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    test('should skip resolution of externalValue if value is defined', () =>
      mapSpec({
        spec,
        plugins: [externalValue],
      }).then((res) => {
        expect(res.spec).toEqual(spec);
      }));
  });
});
