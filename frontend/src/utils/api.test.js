import { fetchJson } from './api';
import brandReducer, { fetchBrands } from '../redux/slices/brandSlice';
import categoryReducer, { fetchCategories } from '../redux/slices/categorySlice';
import productReducer, { fetchProducts } from '../redux/slices/productSlice';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

test('returns JSON for a successful JSON response', async () => {
  const payload = { success: true, data: [] };
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json; charset=utf-8' },
    json: jest.fn().mockResolvedValue(payload),
  });

  await expect(fetchJson('/api/products')).resolves.toEqual(payload);
});

test('rejects an HTML response without trying to parse it as JSON', async () => {
  const json = jest.fn();
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => 'text/html' },
    json,
  });

  await expect(fetchJson('/api/products')).rejects.toThrow(/Expected a JSON response/);
  expect(json).not.toHaveBeenCalled();
});

test('reports HTTP failures before parsing the response body', async () => {
  const json = jest.fn();
  global.fetch.mockResolvedValue({
    ok: false,
    status: 404,
    headers: { get: () => 'text/html' },
    json,
  });

  await expect(fetchJson('/api/products')).rejects.toThrow(/HTTP 404/);
  expect(json).not.toHaveBeenCalled();
});

test('keeps Redux collection state as arrays when API data is missing', () => {
  expect(brandReducer(undefined, fetchBrands.fulfilled({}, 'brands-request')).brands).toEqual([]);
  expect(categoryReducer(undefined, fetchCategories.fulfilled({}, 'categories-request')).categories).toEqual([]);
  expect(productReducer(undefined, fetchProducts.fulfilled({}, 'products-request')).products).toEqual([]);
});
