import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])

  useEffect(() => {
    supabase.from('posts').select('*').then(({ data }) => setPosts(data || []))
    supabase.from('users').select('*').then(({ data }) => setUsers(data || []))
    supabase.from('comments_blog').select('*').then(({ data }) => setComments(data || []))
  }, [])

  const getUsername = (userId) => users.find(u => u.id === userId)?.username || 'Unknown'

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <div key={post.id} style={{border: '1px solid #ccc', margin: 8, padding: 8}}>
          <h2>{post.title}</h2>
          <p>By: {getUsername(post.author_id)}</p>
          <p>{post.content}</p>
          <h4>Comments:</h4>
          <ul>
            {comments.filter(c => c.post_id === post.id).map(c => (
              <li key={c.id}>
                <b>{getUsername(c.user_id)}:</b> {c.content}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 