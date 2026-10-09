import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/auth/Login';

describe('Login Page Component Tests', () => {
  it('renders login form inputs, submit button, and quick demo buttons', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('name@university.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

    // Verify 1-click quick demo buttons exist
    expect(screen.getByText('Admin Director')).toBeInTheDocument();
    expect(screen.getByText('Recruiter (Google)')).toBeInTheDocument();
  });

  it('populates fields when clicking a demo login button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const adminBtn = screen.getByText('Admin Director');
    fireEvent.click(adminBtn);

    const emailInput = screen.getByPlaceholderText('name@university.edu');
    expect(emailInput.value).toBe('admin@placement.edu');
  });
});
