import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function CategoryForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    const { error } = await supabase.from('categories').insert([{ name, description }]);
    if (error) alert(error.message);
    else {
      alert('Category created!');
      onCreated?.();
    }
  };

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <button onClick={handleCreate}>Create Category</button>
    </div>
  );
} 