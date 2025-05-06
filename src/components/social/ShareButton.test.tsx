import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ShareButton from './ShareButton';

describe('ShareButton', () => {
  const mockProps = {
    url: 'https://example.com/photo/1',
    title: 'Test Photo',
    description: 'A beautiful test photo',
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    // Mock Web Share API
    Object.assign(navigator, {
      share: vi.fn(),
    });

    // Mock window.open
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders share button', () => {
    render(<ShareButton {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('uses Web Share API when available', async () => {
    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: mockProps.title,
        text: mockProps.description,
        url: mockProps.url,
      });
    });
  });

  it('shows dropdown menu when Web Share API is not available', async () => {
    // Remove share API
    delete (navigator as any).share;

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Copy link')).toBeInTheDocument();
      expect(screen.getByText('Share on Twitter')).toBeInTheDocument();
      expect(screen.getByText('Share on Facebook')).toBeInTheDocument();
    });
  });

  it('copies link to clipboard', async () => {
    delete (navigator as any).share;

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProps.url);
    });
  });

  it('opens Twitter share dialog', async () => {
    delete (navigator as any).share;

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    const twitterButton = screen.getByText('Share on Twitter');
    fireEvent.click(twitterButton);

    const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      mockProps.title
    )}&url=${encodeURIComponent(mockProps.url)}`;

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expectedUrl,
        '_blank',
        'width=600,height=400'
      );
    });
  });

  it('opens Facebook share dialog', async () => {
    delete (navigator as any).share;

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    const facebookButton = screen.getByText('Share on Facebook');
    fireEvent.click(facebookButton);

    const expectedUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      mockProps.url
    )}`;

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expectedUrl,
        '_blank',
        'width=600,height=400'
      );
    });
  });

  it('handles clipboard errors', async () => {
    delete (navigator as any).share;
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Failed to copy'));

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to copy link. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles Web Share API errors', async () => {
    navigator.share = vi.fn().mockRejectedValue(new Error('Share failed'));

    render(<ShareButton {...mockProps} />);
    
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to share. Please try again.')).toBeInTheDocument();
    });
  });
}); 