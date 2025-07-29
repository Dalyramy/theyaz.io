import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PhotoComments from './PhotoComments';
import { supabase } from '@/integrations/supabase/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                photo_id: 'test-photo',
                user_id: 'user1',
                user: {
                  name: 'John Doe',
                  avatar_url: 'https://example.com/avatar1.jpg',
                },
                content: 'Great photo!',
                created_at: '2024-03-20T00:00:00Z',
                likes: 5,
              },
              {
                id: '2',
                photo_id: 'test-photo',
                user_id: 'user2',
                user: {
                  name: 'Jane Smith',
                  avatar_url: 'https://example.com/avatar2.jpg',
                },
                content: 'Love the composition!',
                created_at: '2024-03-19T00:00:00Z',
                likes: 3,
              },
            ],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [
            {
              id: '3',
              photo_id: 'test-photo',
              user_id: 'demo-user',
              content: 'New comment',
            },
          ],
          error: null,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [
              {
                id: '1',
                likes: 6,
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
  testConnection: vi.fn(() => Promise.resolve(true))
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('PhotoComments', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders comments list', async () => {
    renderWithQueryClient(<PhotoComments photoId="test-photo" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Great photo!')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Love the composition!')).toBeInTheDocument();
    });
  });

  it('adds a new comment', async () => {
    renderWithQueryClient(<PhotoComments photoId="test-photo" />);

    const input = screen.getByPlaceholderText('Add a comment...');
    const submitButton = screen.getByText('Post');

    fireEvent.change(input, { target: { value: 'New comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('comments');
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Input should be cleared
    });
  });

  it('likes a comment', async () => {
    renderWithQueryClient(<PhotoComments photoId="test-photo" />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Initial likes count
    });

    const likeButton = screen.getAllByRole('button')[0]; // First like button
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('comments');
    });
  });

  it('shows loading state', () => {
    renderWithQueryClient(<PhotoComments photoId="test-photo" />);
    expect(screen.getByTestId('comments-loading')).toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    // Mock empty response
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    }));

    renderWithQueryClient(<PhotoComments photoId="test-photo" />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    // Mock error response
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: new Error('Failed to fetch comments'),
          })),
        })),
      })),
    }));

    renderWithQueryClient(<PhotoComments photoId="test-photo" />);

    await waitFor(() => {
      expect(screen.getByText('Error loading comments')).toBeInTheDocument();
    });
  });
}); 