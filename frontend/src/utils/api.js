import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

axios.defaults.withCredentials = true;

export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}.`);
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `Expected a JSON response but received ${contentType || 'an unknown content type'} (HTTP ${response.status}).`
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Response declared JSON but could not be parsed (HTTP ${response.status}): ${error.message}`);
  }
}
