import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';

const NotificationList = ({ open, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data || []));
  }, [user, open]);

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  };

  if (!open) return null;
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-lg z-50">
      <div className="p-4 border-b font-bold flex justify-between">
        Notifications
        <button onClick={onClose}>×</button>
      </div>
      <ul>
        {notifications.length === 0 && <li className="p-4 text-gray-500">No notifications</li>}
        {notifications.map(n => (
          <li
            key={n.id}
            className={`p-4 border-b last:border-b-0 cursor-pointer ${n.read ? 'bg-gray-100' : 'bg-white'}`}
            onClick={() => markAsRead(n.id)}
          >
            {n.type === 'like' && 'Someone liked your photo.'}
            {n.type === 'comment' && 'Someone commented on your photo.'}
            {n.type === 'follow' && 'You have a new follower!'}
            {n.type === 'message' && 'You have a new message!'}
            <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList; 