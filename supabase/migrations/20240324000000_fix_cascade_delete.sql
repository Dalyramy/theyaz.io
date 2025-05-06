-- Drop existing foreign key constraints
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_photo_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_photo_id_fkey;

-- Re-add foreign key constraints with ON DELETE CASCADE
ALTER TABLE likes 
    ADD CONSTRAINT likes_photo_id_fkey 
    FOREIGN KEY (photo_id) 
    REFERENCES photos(id) 
    ON DELETE CASCADE;

ALTER TABLE comments 
    ADD CONSTRAINT comments_photo_id_fkey 
    FOREIGN KEY (photo_id) 
    REFERENCES photos(id) 
    ON DELETE CASCADE; 