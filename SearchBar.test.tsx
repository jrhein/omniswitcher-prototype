import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './src/components/SearchBar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Ask for anything')).toBeInTheDocument();
  });

  it('shows suggestions when focused', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Ask for anything');
    
    await act(async () => {
      await userEvent.click(input);
    });
    
    // Check for suggestions
    expect(screen.getByText('Help me make the most of my day')).toBeInTheDocument();
    expect(screen.getByText('@Sales Coach Prep me for my Greenleaf Intro call in 1 hour')).toBeInTheDocument();
    expect(screen.getByText('Draft an out of office plan for my upcoming PTO')).toBeInTheDocument();
  });

  it('shows recent items when focused', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Ask for anything');
    
    await act(async () => {
      await userEvent.click(input);
    });
    
    // Check for recent items
    expect(screen.getByText('Design Moves')).toBeInTheDocument();
    expect(screen.getByText('Where is the Acme org chart?')).toBeInTheDocument();
    expect(screen.getByText('Project Gizmo PRD')).toBeInTheDocument();
    expect(screen.getByText('Reorg announcements')).toBeInTheDocument();
  });

  it('toggles between AI and search mode when clicking the input area', async () => {
    render(<SearchBar />);
    const searchInput = screen.getByRole('textbox');
    const searchContainer = searchInput.closest('div');
    
    // Initially in AI mode
    expect(screen.getByPlaceholderText('Ask for anything')).toBeInTheDocument();
    
    // Click to toggle mode
    if (searchContainer) {
      await act(async () => {
        await userEvent.click(searchContainer);
      });
      expect(screen.getByPlaceholderText('Search everywhere')).toBeInTheDocument();
    }
  });

  it('closes the dropdown when clicking the close button', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Ask for anything');
    
    // Open the dropdown
    await act(async () => {
      await userEvent.click(input);
    });
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    
    // Click close button
    const closeButton = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    
    // Wait for animation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // Verify dropdown is closed
    expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
  });

  // Additional test cases
  it('handles keyboard navigation', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Ask for anything');
    
    // Open dropdown with keyboard
    await act(async () => {
      input.focus();
    });
    
    // Type some text
    await act(async () => {
      await userEvent.type(input, 'test');
    });
    
    expect(input).toHaveValue('test');
  });

  it('maintains focus after mode toggle', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Ask for anything');
    const searchContainer = input.closest('div');
    
    // Focus the input
    await act(async () => {
      input.focus();
    });
    
    // Toggle mode
    if (searchContainer) {
      await act(async () => {
        await userEvent.click(searchContainer);
      });
    }
    
    // Input should still be focused
    expect(document.activeElement).toBe(input);
  });
}); 