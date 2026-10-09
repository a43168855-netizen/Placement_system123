import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/common/Badge';

describe('Badge Component Tests', () => {
  it('renders status label capitalized correctly for pending', () => {
    render(<Badge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders selected status with emerald styling', () => {
    const { container } = render(<Badge status="selected" />);
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('renders custom label when provided', () => {
    render(<Badge status="shortlisted" label="Interview Stage 1" />);
    expect(screen.getByText('Interview Stage 1')).toBeInTheDocument();
  });
});
