CREATE VIRTUAL TABLE `posts_fts` USING fts5(title, excerpt, body, tags, tokenize = 'unicode61 remove_diacritics 2');--> statement-breakpoint
INSERT INTO `posts_fts` (rowid, title, excerpt, body, tags)
SELECT p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
  coalesce((SELECT group_concat(t.name, ' ') FROM posts_to_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '')
FROM posts p;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_insert` AFTER INSERT ON `posts` BEGIN
  INSERT INTO posts_fts (rowid, title, excerpt, body, tags)
  VALUES (new.id, new.title, coalesce(new.excerpt, ''), new.content_text, '');
END;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_update` AFTER UPDATE OF title, excerpt, content_text ON `posts` BEGIN
  DELETE FROM posts_fts WHERE rowid = new.id;
  INSERT INTO posts_fts (rowid, title, excerpt, body, tags)
  SELECT p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
    coalesce((SELECT group_concat(t.name, ' ') FROM posts_to_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '')
  FROM posts p WHERE p.id = new.id;
END;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_delete` AFTER DELETE ON `posts` BEGIN
  DELETE FROM posts_fts WHERE rowid = old.id;
END;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_tag_attach` AFTER INSERT ON `posts_to_tags` BEGIN
  DELETE FROM posts_fts WHERE rowid = new.post_id;
  INSERT INTO posts_fts (rowid, title, excerpt, body, tags)
  SELECT p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
    coalesce((SELECT group_concat(t.name, ' ') FROM posts_to_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '')
  FROM posts p WHERE p.id = new.post_id;
END;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_tag_detach` AFTER DELETE ON `posts_to_tags` BEGIN
  DELETE FROM posts_fts WHERE rowid = old.post_id;
  INSERT INTO posts_fts (rowid, title, excerpt, body, tags)
  SELECT p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
    coalesce((SELECT group_concat(t.name, ' ') FROM posts_to_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '')
  FROM posts p WHERE p.id = old.post_id;
END;--> statement-breakpoint
CREATE TRIGGER `posts_fts_after_tag_rename` AFTER UPDATE OF name ON `tags` BEGIN
  DELETE FROM posts_fts WHERE rowid IN (SELECT post_id FROM posts_to_tags WHERE tag_id = new.id);
  INSERT INTO posts_fts (rowid, title, excerpt, body, tags)
  SELECT p.id, p.title, coalesce(p.excerpt, ''), p.content_text,
    coalesce((SELECT group_concat(t.name, ' ') FROM posts_to_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '')
  FROM posts p WHERE p.id IN (SELECT post_id FROM posts_to_tags WHERE tag_id = new.id);
END;
