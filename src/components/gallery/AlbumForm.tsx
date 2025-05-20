import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AlbumForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => setCategories(data || []));
  }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from('albums').insert([
      { title, description, category_id: categoryId || null }
    ]);
    if (error) alert(error.message);
    else {
      alert('Album created!');
      onCreated?.();
    }
  };

  return (
    <div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Album Title" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Markdown supported)" />
      <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <button onClick={handleCreate}>Create Album</button>
    </div>
  );
} 