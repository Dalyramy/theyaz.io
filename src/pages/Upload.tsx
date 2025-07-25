
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';

const Upload = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Peace Sign Background Watermark */}
      <div 
        className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
        style={{
          width: '300px',
          height: '300px',
          backgroundImage: 'url(/icons/peace-watermark.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(-10deg)',
        }}
      />

      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Upload a New Photo</h1>
        <UploadForm />
      </main>
    </div>
  );
};

export default Upload;
