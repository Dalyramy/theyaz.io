import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PhotoLightbox from './PhotoLightbox';
import { AuthProvider } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

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
    profiles: {
      username: 'user1',
      avatar_url: 'https://example.com/avatar1.jpg',
      full_name: 'User One',
    },
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
    profiles: {
      username: 'user2',
      avatar_url: 'https://example.com/avatar2.jpg',
      full_name: 'User Two',
    },
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
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();
    expect(screen.getAllByText('Test Photo 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Test Caption 1')[0]).toBeInTheDocument();
  });

  it('navigates to next photo on right arrow click', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    const nextButton = screen.getByLabelText('Next photo');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 2')).toBeInTheDocument();
      expect(screen.getAllByText('Test Photo 2')[0]).toBeInTheDocument();
    });
  });

  it('navigates to previous photo on left arrow click', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="2"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    const prevButton = screen.getByLabelText('Previous photo');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByAltText('Test Photo 1')).toBeInTheDocument();
      expect(screen.getAllByText('Test Photo 1')[0]).toBeInTheDocument();
    });
  });

  it('closes lightbox when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('toggles zoom on image click', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    const image = screen.getByAltText('Test Photo 1');
    
    // Initial state
    expect(image).toHaveAttribute('aria-label', 'Zoom in');
    
    // Click to zoom in
    fireEvent.click(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('aria-label', 'Zoom out');
    });
    
    // Click to zoom out
    fireEvent.click(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('aria-label', 'Zoom in');
    });
  });

  it('handles keyboard navigation', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
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
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PhotoLightbox
              photos={mockPhotos}
              initialPhotoId="1"
              onClose={onClose}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
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