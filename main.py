import psycopg2

DATABASE_URL = "postgresql://postgres:0nBqqeqhqhWu8pVz@db.qjrysayswbdqskynywkr.supabase.co:5432/postgres"

try:
    connection = psycopg2.connect(DATABASE_URL)
    print("Connection successful!")
    
    cursor = connection.cursor()
    
    # Test query: Get your photos
    cursor.execute("""
        SELECT p.title, p.caption, p.likes_count, p.comments_count, a.title as album_name
        FROM public.photos p
        JOIN public.albums a ON p.album_id = a.id
        WHERE p.user_id = '042f9bdb-b636-498e-9da6-008e40710590'
        ORDER BY p.created_at DESC
    """)
    
    results = cursor.fetchall()
    print(f"\nFound {len(results)} photos:")
    for row in results:
        print(f"- {row[0]} (Album: {row[4]}, Likes: {row[2]}, Comments: {row[3]})")
    
    cursor.close()
    connection.close()
    print("\nConnection closed.")

except Exception as e:
    print(f"Failed to connect: {e}")
    