import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/common/StatCard';
import { Award } from 'lucide-react';

describe('StatCard Component Tests', () => {
  it('renders title, value, subtext, and trend correctly', () => {
    render(
      <StatCard
        title="Total Placed"
        value="85%"
        subtext="Class of 2026"
        trend="+12%"
        icon={Award}
      />
    );

    expect(screen.getByText('Total Placed')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Class of 2026')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});
