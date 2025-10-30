// src/utils/loadLocalData.test.ts
import { loadLocalData } from './loadLocalData';

describe('loadLocalData', () => {
  // Save original fetch to restore after tests
  const originalFetch = global.fetch;

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('successful data loading', () => {
    it('should successfully fetch and parse JSON data', async () => {
      const mockData = {
        GET_STATS_DATA: {
          STATISTICAL_DATA: {
            DATA_INF: {
              VALUE: [{ '@time': '2024000701', '$': '1000' }],
            },
          },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await loadLocalData();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/datastore/statData.json');
      expect(result).toEqual(mockData);
    });

    it('should return data with complex nested structure', async () => {
      const complexData = {
        GET_STATS_DATA: {
          STATISTICAL_DATA: {
            CLASS_INF: {
              CLASS_OBJ: [
                { '@id': 'cat01', CLASS: [{ '@code': '100000', '@name': 'Test' }] },
              ],
            },
            DATA_INF: {
              VALUE: [
                { '@time': '2024000701', '@cat01': '100000', '$': '1000' },
                { '@time': '2024000701', '@cat01': '103000', '$': '2000' },
              ],
            },
          },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => complexData,
      } as Response);

      const result = await loadLocalData();

      expect(result).toEqual(complexData);
      expect(result.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE).toHaveLength(2);
    });

    it('should handle empty JSON object', async () => {
      const emptyData = {};

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => emptyData,
      } as Response);

      const result = await loadLocalData();

      expect(result).toEqual(emptyData);
    });

    it('should handle array response', async () => {
      const arrayData = [1, 2, 3];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => arrayData,
      } as Response);

      const result = await loadLocalData();

      expect(result).toEqual(arrayData);
    });
  });

  describe('HTTP error handling', () => {
    it('should return null on 404 error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('HTTP error loading data:', 404);

      consoleErrorSpy.mockRestore();
    });

    it('should return null on 500 error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('HTTP error loading data:', 500);

      consoleErrorSpy.mockRestore();
    });

    it('should return null on 403 Forbidden', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('HTTP error loading data:', 403);

      consoleErrorSpy.mockRestore();
    });

    it('should log error message for HTTP errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await loadLocalData();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('HTTP error loading data:', 404);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('network error handling', () => {
    it('should return null on network error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading local data:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return null when fetch throws TypeError', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading local data:',
        expect.any(TypeError)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log error message for network errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const networkError = new Error('Failed to connect');

      global.fetch = jest.fn().mockRejectedValue(networkError);

      await loadLocalData();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading local data:', networkError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('JSON parsing error handling', () => {
    it('should return null when JSON parsing fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token in JSON');
        },
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading local data:',
        expect.any(SyntaxError)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed JSON response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should log error message for JSON parsing errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const parseError = new SyntaxError('Unexpected end of JSON input');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw parseError;
        },
      } as Response);

      await loadLocalData();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading local data:', parseError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle null response from json()', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeNull();
    });

    it('should handle undefined response from json()', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => undefined,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBeUndefined();
    });

    it('should handle response with string primitive', async () => {
      const stringData = 'test string';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => stringData,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBe(stringData);
    });

    it('should handle response with number primitive', async () => {
      const numberData = 42;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => numberData,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBe(numberData);
    });

    it('should handle response with boolean primitive', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => true,
      } as Response);

      const result = await loadLocalData();

      expect(result).toBe(true);
    });

    it('should make request to correct path', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      global.fetch = mockFetch;

      await loadLocalData();

      expect(mockFetch).toHaveBeenCalledWith('/datastore/statData.json');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('return type consistency', () => {
    it('should always return Promise', () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = loadLocalData();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should return null on all error paths', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Test HTTP error path
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);
      let result = await loadLocalData();
      expect(result).toBeNull();

      // Test network error path
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      result = await loadLocalData();
      expect(result).toBeNull();

      // Test JSON parse error path
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Parse error');
        },
      } as Response);
      result = await loadLocalData();
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
