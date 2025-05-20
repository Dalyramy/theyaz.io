import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function PhotoUpload({ albumId }: { albumId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    const filePath = `${albumId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (error) {
      alert(error.message);
      return;
    }

    const imageUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;

    await supabase.from('photos').insert([
      {
        title,
        caption,
        image_url: imageUrl,
        image_path: filePath,
        album_id: albumId,
      },
    ]);
    alert('Uploaded!');
  };

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (Markdown supported)" />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
} 