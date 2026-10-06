import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the storefront home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /new arrivals/i })).toBeInTheDocument();
});
