import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Conversation = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [user, userId]);

  const sendMessage = async () => {
    if (!content.trim()) return;
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: userId,
      content,
    });
    setContent('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container mx-auto py-8 flex flex-col h-[80vh]">
      <h2 className="text-xl font-bold mb-4">Conversation</h2>
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded">
        {messages.map(m => (
          <div key={m.id} className={`mb-2 ${m.sender_id === user.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded ${m.sender_id === user.id ? 'bg-primary text-white' : 'bg-white border'}`}>
              {m.content}
            </div>
            <div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="px-4 py-1 rounded bg-primary text-white">Send</button>
      </div>
    </div>
  );
};

export default Conversation; 