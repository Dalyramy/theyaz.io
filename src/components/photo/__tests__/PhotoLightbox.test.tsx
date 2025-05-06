import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PhotoLightbox from '../PhotoLightbox';

const mockPhotos = [
  {
    id: '1',
    title: 'Test Photo 1',
    caption: 'Test Caption 1',
    image_url: 'https://example.com/photo1.jpg',
    tags: ['nature', 'landscape'],
    created_at: '2024-03-20T00:00:00Z',
    likes: 10,
    comments: 5,
  },
  {
    id: '2',
    title: 'Test Photo 2',
    caption: 'Test Caption 2',
    image_url: 'https://example.com/photo2.jpg',
    tags: ['portrait', 'people'],
    created_at: '2024-03-19T00:00:00Z',
    likes: 15,
    comments: 8,
  },
];

describe('PhotoLightbox', () => {
  beforeEach(() => {
    // Mock window.URL.createObjectURL
    window.URL.createObjectURL = vi.fn(() => 'mock-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the lightbox with initial photo', () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Caption 1')).toBeInTheDocument();
  });

  it('navigates to next photo on right arrow click', async () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    const nextButton = screen.getByLabelText('Next photo');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 2')).toBeInTheDocument();
      expect(screen.getByText('Test Photo 2')).toBeInTheDocument();
    });
  });

  it('navigates to previous photo on left arrow click', async () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="2"
        onClose={onClose}
      />
    );

    const prevButton = screen.getByLabelText('Previous photo');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Photo 1')).toBeInTheDocument();
    });
  });

  it('closes lightbox when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('toggles zoom on image click', async () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    const image = screen.getByAltText('Test Photo 1');
    
    // Initial state
    expect(image).toHaveStyle({ transform: 'scale(1)' });
    
    // Click to zoom in
    fireEvent.click(image);
    await waitFor(() => {
      expect(image).toHaveStyle({ transform: 'scale(1.5)' });
    });
    
    // Click to zoom out
    fireEvent.click(image);
    await waitFor(() => {
      expect(image).toHaveStyle({ transform: 'scale(1)' });
    });
  });

  it('handles keyboard navigation', () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    // Press right arrow
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Test Photo 2')).toBeInTheDocument();

    // Press left arrow
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();

    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('handles touch swipe navigation', async () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={mockPhotos}
        initialPhotoId="1"
        onClose={onClose}
      />
    );

    const container = screen.getByTestId('lightbox-container');

    // Swipe left
    fireEvent.touchStart(container, {
      touches: [{ clientX: 500, clientY: 200 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 100, clientY: 200 }],
    });
    fireEvent.touchEnd(container);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 2')).toBeInTheDocument();
    });

    // Swipe right
    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 200 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 500, clientY: 200 }],
    });
    fireEvent.touchEnd(container);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();
    });
  });
}); 