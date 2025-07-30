import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .then(({ data }) => {
        const partners = new Set();
        (data || []).forEach(m => {
          partners.add(m.sender_id === user.id ? m.receiver_id : m.sender_id);
        });
        setConversations(Array.from(partners));
      });
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      <ul>
        {conversations.map(pid => (
          <li key={pid}>
            <Link to={`/messaging/${pid}`}>Conversation with {pid}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inbox; 