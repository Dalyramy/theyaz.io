'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

type Photo = {
  id: string
  title: string
  caption: string | null
  image_url: string
  likes_count: number | null
  comments_count: number | null
  album_name?: string
}

export default function GalleryTest() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true)
        
        // Fetch photos first
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select(`
            id,
            title,
            caption,
            image_url,
            likes_count,
            comments_count,
            album_id
          `)
          .order('created_at', { ascending: false })

        if (photosError) {
          console.error('Error fetching photos:', photosError)
          setError(photosError.message)
          return
        }

        // Fetch albums separately
        const { data: albumsData, error: albumsError } = await supabase
          .from('albums')
          .select('id, title')

        if (albumsError) {
          console.error('Error fetching albums:', albumsError)
          setError(albumsError.message)
          return
        }

        // Create a map of album titles
        const albumMap = new Map(albumsData?.map(album => [album.id, album.title]) || [])

        // Transform the data to match our Photo type
        const transformedPhotos = photosData?.map(photo => ({
          id: photo.id,
          title: photo.title,
          caption: photo.caption,
          image_url: photo.image_url,
          likes_count: photo.likes_count,
          comments_count: photo.comments_count,
          album_name: photo.album_id ? albumMap.get(photo.album_id) || null : null
        })) || []
        
        setPhotos(transformedPhotos)
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to fetch photos')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading photos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Photo Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={photo.image_url} 
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{photo.title}</h3>
              {photo.caption && (
                <p className="text-gray-600 mb-3">{photo.caption}</p>
              )}
              {photo.album_name && (
                <p className="text-sm text-blue-600 mb-2">Album: {photo.album_name}</p>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>❤️ {photo.likes_count || 0}</span>
                <span>💬 {typeof photo.comments_count === 'number' ? photo.comments_count : 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {photos.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No photos found
        </div>
      )}
    </div>
  )
} 