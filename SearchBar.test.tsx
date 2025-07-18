import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from './omniswitcher prototype';

describe('SearchBar Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Search messages, files, and more...')).toBeInTheDocument();
  });

  it('toggles between AI and Traditional mode', async () => {
    render(<SearchBar />);
    const toggleButton = screen.getByText('Traditional');
    
    // Click toggle button
    await userEvent.click(toggleButton);
    expect(screen.getByText('AI')).toBeInTheDocument();
    
    // Click again to toggle back
    await userEvent.click(screen.getByText('AI'));
    expect(screen.getByText('Traditional')).toBeInTheDocument();
  });

  it('automatically switches to AI mode when typing a question', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search messages, files, and more...');
    
    // Type a question
    await userEvent.type(input, 'How do I create a new channel?');
    
    // Should switch to AI mode
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Switched to AI Q&A mode')).toBeInTheDocument();
  });

  it('shows search results when typing', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search messages, files, and more...');
    
    // Type a search term
    await userEvent.type(input, 'test');
    
    // Wait for results to appear
    const results = await screen.findByText(/document.pdf/);
    expect(results).toBeInTheDocument();
  });
}); 