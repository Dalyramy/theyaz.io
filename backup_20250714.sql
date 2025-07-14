


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."assign_default_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Assign 'viewer' role to new users by default
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'viewer';
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."assign_default_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_perform_action"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_permissions(user_uuid) 
        WHERE resource = resource_name AND action = action_name
    );
END;
$$;


ALTER FUNCTION "public"."can_perform_action"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trending_photos"("limit_count" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "title" "text", "caption" "text", "image_url" "text", "likes_count" integer, "created_at" timestamp with time zone, "user_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.caption,
    p.image_url,
    p.likes_count,
    p.created_at,
    p.user_id
  FROM public.photos p
  WHERE p.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY p.likes_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_trending_photos"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("user_uuid" "uuid") RETURNS TABLE("permission_name" "text", "resource" "text", "action" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.resource, p.action
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."get_user_permissions"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_stats"("user_uuid" "uuid") RETURNS TABLE("total_photos" integer, "total_likes" integer, "total_comments" integer, "avg_likes_per_photo" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::integer as total_photos,
    COALESCE(SUM(p.likes_count), 0)::integer as total_likes,
    COALESCE(SUM(p.comments_count), 0)::integer as total_comments,
    CASE 
      WHEN COUNT(p.id) > 0 THEN ROUND(AVG(p.likes_count), 2)
      ELSE 0
    END as avg_likes_per_photo
  FROM public.photos p
  WHERE p.user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."get_user_stats"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_messages_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_messages_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (
        id, username, full_name, avatar_url, bio, is_admin, updated_at, created_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
        NEW.raw_user_meta_data->>'bio',
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Assign default 'viewer' role if not already assigned
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'viewer'
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role_id = r.id
      );

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("user_uuid" "uuid", "perm_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_permissions(user_uuid) 
        WHERE permission_name = perm_name
    );
END;
$$;


ALTER FUNCTION "public"."has_permission"("user_uuid" "uuid", "perm_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comment_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments
        SET likes = likes + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments
        SET likes = likes - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comment_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comments_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.photos
        SET comments_count = comments_count + 1
        WHERE id = NEW.photo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.photos
        SET comments_count = comments_count - 1
        WHERE id = OLD.photo_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comments_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.photos
        SET likes_count = likes_count + 1
        WHERE id = NEW.photo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.photos
        SET likes_count = likes_count - 1
        WHERE id = OLD.photo_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_photo_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.caption, ''));
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_photo_search_vector"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cover_photo_id" "uuid",
    "user_id" "uuid",
    "category_id" "uuid",
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "tags" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."comment_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "likes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid",
    "recipient_id" "uuid",
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_id" "uuid",
    "sender_id" "uuid",
    "type" "text" NOT NULL,
    "data" "jsonb",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "resource" "text" NOT NULL,
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "caption" "text",
    "image_url" "text" NOT NULL,
    "image_path" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "album_id" "uuid",
    "order" integer DEFAULT 0,
    "thumbnail_url" "text",
    "search_vector" "tsvector"
);


ALTER TABLE "public"."photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_admin" boolean DEFAULT false,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "assigned_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_photo_id_user_id_key" UNIQUE ("photo_id", "user_id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");



CREATE INDEX "albums_category_id_idx" ON "public"."albums" USING "btree" ("category_id");



CREATE INDEX "albums_tags_idx" ON "public"."albums" USING "gin" ("tags");



CREATE INDEX "albums_user_id_idx" ON "public"."albums" USING "btree" ("user_id");



CREATE INDEX "categories_name_idx" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "comments_created_at_idx" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "comments_photo_created_idx" ON "public"."comments" USING "btree" ("photo_id", "created_at" DESC);



CREATE INDEX "comments_photo_id_idx" ON "public"."comments" USING "btree" ("photo_id");



CREATE INDEX "comments_user_id_idx" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_albums_cover_photo_id" ON "public"."albums" USING "btree" ("cover_photo_id");



CREATE INDEX "idx_comment_likes_comment_id" ON "public"."comment_likes" USING "btree" ("comment_id");



CREATE INDEX "idx_comment_likes_user_id" ON "public"."comment_likes" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_sender_id" ON "public"."notifications" USING "btree" ("sender_id");



CREATE INDEX "idx_permissions_resource_action" ON "public"."permissions" USING "btree" ("resource", "action");



CREATE INDEX "idx_role_permissions_permission_id" ON "public"."role_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_role_permissions_role_id" ON "public"."role_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_user_roles_assigned_by" ON "public"."user_roles" USING "btree" ("assigned_by");



CREATE INDEX "idx_user_roles_role_id" ON "public"."user_roles" USING "btree" ("role_id");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "likes_photo_created_idx" ON "public"."likes" USING "btree" ("photo_id", "created_at" DESC);



CREATE INDEX "likes_photo_id_idx" ON "public"."likes" USING "btree" ("photo_id");



CREATE INDEX "likes_user_id_idx" ON "public"."likes" USING "btree" ("user_id");



CREATE INDEX "messages_recipient_id_idx" ON "public"."messages" USING "btree" ("recipient_id");



CREATE INDEX "messages_sender_id_idx" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "notifications_recipient_id_idx" ON "public"."notifications" USING "btree" ("recipient_id");



CREATE INDEX "photos_album_id_idx" ON "public"."photos" USING "btree" ("album_id");



CREATE INDEX "photos_created_idx" ON "public"."photos" USING "btree" ("created_at" DESC);



CREATE INDEX "photos_featured_idx" ON "public"."photos" USING "btree" ("created_at" DESC) WHERE ("likes_count" > 0);



CREATE INDEX "photos_order_idx" ON "public"."photos" USING "btree" ("order");



CREATE INDEX "photos_public_idx" ON "public"."photos" USING "btree" ("created_at" DESC) WHERE ("user_id" IS NOT NULL);



CREATE INDEX "photos_search_idx" ON "public"."photos" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("caption", ''::"text"))));



CREATE INDEX "photos_tags_idx" ON "public"."photos" USING "gin" ("tags");



CREATE INDEX "photos_user_created_idx" ON "public"."photos" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "profiles_updated_at_idx" ON "public"."profiles" USING "btree" ("updated_at");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "handle_comment_likes_count_delete" AFTER DELETE ON "public"."comment_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_likes_count"();



CREATE OR REPLACE TRIGGER "handle_comment_likes_count_insert" AFTER INSERT ON "public"."comment_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_likes_count"();



CREATE OR REPLACE TRIGGER "handle_comments_count_delete" AFTER DELETE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_comments_count"();



CREATE OR REPLACE TRIGGER "handle_comments_count_insert" AFTER INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_comments_count"();



CREATE OR REPLACE TRIGGER "handle_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_likes_count_delete" AFTER DELETE ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_likes_count"();



CREATE OR REPLACE TRIGGER "handle_likes_count_insert" AFTER INSERT ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_likes_count"();



CREATE OR REPLACE TRIGGER "handle_messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_messages_updated_at"();



CREATE OR REPLACE TRIGGER "handle_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_photo_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."photos" FOR EACH ROW EXECUTE FUNCTION "public"."update_photo_search_vector"();



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_cover_photo_id_fkey" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."photos"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anyone to insert profiles" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anyone to insert profiles_new" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can create categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can create likes" ON "public"."likes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can like comments" ON "public"."comment_likes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can view categories" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view comment likes" ON "public"."comment_likes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view comments" ON "public"."comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view likes" ON "public"."likes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view photos" ON "public"."photos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view role permissions" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view roles" ON "public"."roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Only admins can delete permissions" ON "public"."permissions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can delete role permissions" ON "public"."role_permissions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can delete roles" ON "public"."roles" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can delete user roles" ON "public"."user_roles" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert permissions" ON "public"."permissions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert role permissions" ON "public"."role_permissions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert roles" ON "public"."roles" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can insert user roles" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can update permissions" ON "public"."permissions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can update role permissions" ON "public"."role_permissions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can update roles" ON "public"."roles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Only admins can update user roles" ON "public"."user_roles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can create photos" ON "public"."photos" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own albums" ON "public"."albums" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own likes" ON "public"."likes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own photos" ON "public"."photos" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));



CREATE POLICY "Users can delete their sent messages" ON "public"."messages" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "sender_id"));



CREATE POLICY "Users can insert messages as sender" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "sender_id"));



CREATE POLICY "Users can insert notifications for themselves" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));



CREATE POLICY "Users can insert own albums" ON "public"."albums" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own albums" ON "public"."albums" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own photos" ON "public"."photos" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their sent messages" ON "public"."messages" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "sender_id"));



CREATE POLICY "Users can view own albums and featured albums" ON "public"."albums" FOR SELECT TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("is_featured" = true)));



CREATE POLICY "Users can view their messages" ON "public"."messages" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "sender_id") OR (( SELECT "auth"."uid"() AS "uid") = "recipient_id")));



CREATE POLICY "Users can view their notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "recipient_id"));



CREATE POLICY "Users can view their own roles or admins view all" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("r"."name" = 'admin'::"text"))))));



ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."assign_default_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_default_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_default_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_perform_action"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_perform_action"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_perform_action"("user_uuid" "uuid", "resource_name" "text", "action_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trending_photos"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trending_photos"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trending_photos"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_stats"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_stats"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_stats"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_messages_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_messages_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_messages_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "perm_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "perm_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "perm_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comments_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_photo_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_photo_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_photo_search_vector"() TO "service_role";


















GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."photos" TO "anon";
GRANT ALL ON TABLE "public"."photos" TO "authenticated";
GRANT ALL ON TABLE "public"."photos" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
