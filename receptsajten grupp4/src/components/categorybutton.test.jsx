import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryButton from './categorybutton';
import { test, expect } from 'vitest';

test('renders button w/ correct name', () => {
  render(
    <BrowserRouter>
      <CategoryButton name="Gindrinkar" isActive={false} />
    </BrowserRouter>
  );
  const button = screen.getByText('Gindrinkar');
  expect(button).toBeInTheDocument();
});
