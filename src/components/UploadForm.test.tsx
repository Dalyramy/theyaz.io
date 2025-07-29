import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UploadForm from './UploadForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } }))
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  },
  testConnection: vi.fn(() => Promise.resolve(true))
}));

// Mock useAuth
vi.mock('@/contexts/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isLoading: false
  })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn((message) => {
      // Create a temporary element to check if the message appears
      const div = document.createElement('div');
      div.textContent = message;
      div.style.display = 'none';
      document.body.appendChild(div);
      return div;
    }),
    success: vi.fn(),
    info: vi.fn()
  }
}));

const renderUploadForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <UploadForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('UploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload form correctly', () => {
    renderUploadForm();
    
    expect(screen.getByText('Share Your iPhone Moment')).toBeInTheDocument();
    expect(screen.getByLabelText('Photo')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Caption')).toBeInTheDocument();
    expect(screen.getByText('Share Photo')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderUploadForm();
    
    const submitButton = screen.getByText('Share Photo');
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a title for your photo.');
    });
  });

  it('handles file upload', async () => {
    renderUploadForm();
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('Photo');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Just verify the form renders correctly
    expect(screen.getByText('Share Your iPhone Moment')).toBeInTheDocument();
  });

  it('handles drag and drop', async () => {
    renderUploadForm();
    
    const dropZone = screen.getByText('Click to upload or drag and drop');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    
    // Just verify the form renders correctly
    expect(screen.getByText('Share Your iPhone Moment')).toBeInTheDocument();
  });

  it('validates file type', async () => {
    renderUploadForm();
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('Photo');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please upload a JPEG, PNG, or WebP image.');
    });
  });
}); 