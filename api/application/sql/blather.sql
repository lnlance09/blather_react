-- Create syntax for TABLE 'archived_links'
CREATE TABLE `archived_links` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `comment_id` varchar(255) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `link` text,
  `network` varchar(255) DEFAULT NULL,
  `object_id` varchar(255) DEFAULT NULL,
  `page_id` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `object` (`network`,`object_id`),
  CONSTRAINT `archived_links_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'contradictions'
CREATE TABLE `contradictions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `comment_id` varchar(255) DEFAULT NULL,
  `end_time` int(255) DEFAULT NULL,
  `fallacy_entry_id` int(11) DEFAULT NULL,
  `media_id` varchar(255) DEFAULT NULL,
  `network` varchar(255) DEFAULT NULL,
  `page_id` varchar(255) DEFAULT NULL,
  `start_time` int(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fallacy_entry_id` (`fallacy_entry_id`),
  CONSTRAINT `contradictions_ibfk_1` FOREIGN KEY (`fallacy_entry_id`) REFERENCES `fallacy_entries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'discussion_conversations'
CREATE TABLE `discussion_conversations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NULL DEFAULT NULL,
  `discussion_id` int(11) DEFAULT NULL,
  `message` text,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `discussion_id` (`discussion_id`),
  CONSTRAINT `discusssion_conversations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `discusssion_conversations_ibfk_3` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'discussion_tags'
CREATE TABLE `discussion_tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `discussion_id` int(11) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `discussion_id` (`discussion_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `discussion_tags_ibfk_1` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`),
  CONSTRAINT `discussion_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'discussions'
CREATE TABLE `discussions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `extra` text,
  `date_created` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `accepted_by` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `accepted_by` (`accepted_by`),
  CONSTRAINT `discussions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `discussions_ibfk_2` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fallacies'
CREATE TABLE `fallacies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'fallacy_comments'
CREATE TABLE `fallacy_comments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fallacy_id` int(11) DEFAULT NULL,
  `message` text,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fallacy_id` (`fallacy_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fallacy_comments_ibfk_1` FOREIGN KEY (`fallacy_id`) REFERENCES `fallacy_entries` (`id`),
  CONSTRAINT `fallacy_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fallacy_conversations'
CREATE TABLE `fallacy_conversations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NULL DEFAULT NULL,
  `fallacy_id` int(11) DEFAULT NULL,
  `message` text,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fallacy_id` (`fallacy_id`),
  CONSTRAINT `fallacy_conversations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fallacy_conversations_ibfk_3` FOREIGN KEY (`fallacy_id`) REFERENCES `fallacy_entries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fallacy_entries'
CREATE TABLE `fallacy_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assigned_by` int(11) DEFAULT NULL,
  `comment_id` varchar(255) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `explanation` text,
  `fallacy_id` int(11) DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT NULL,
  `media_id` varchar(255) DEFAULT NULL,
  `network` varchar(255) DEFAULT NULL,
  `page_id` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `start_time` int(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `view_count` bigint(11) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `fallacy_id` (`fallacy_id`),
  CONSTRAINT `fallacy_entries_ibfk_1` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fallacy_entries_ibfk_2` FOREIGN KEY (`fallacy_id`) REFERENCES `fallacies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fallacy_tags'
CREATE TABLE `fallacy_tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fallacy_id` int(11) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fallacy_id` (`fallacy_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `fallacy_tags_ibfk_1` FOREIGN KEY (`fallacy_id`) REFERENCES `fallacy_entries` (`id`),
  CONSTRAINT `fallacy_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fb_comments'
CREATE TABLE `fb_comments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `comment_id` varchar(255) DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  `left_by` bigint(255) DEFAULT NULL,
  `media_id` bigint(50) unsigned DEFAULT NULL,
  `message` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fb_posts'
CREATE TABLE `fb_posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `attachments` text,
  `created_time` datetime DEFAULT NULL,
  `description` text,
  `link` text,
  `message` text,
  `media_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `page_id` bigint(11) DEFAULT NULL,
  `permalink_url` text,
  `picture` text,
  `source` text,
  `status_type` varchar(255) DEFAULT NULL,
  `title` text,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'fb_users'
CREATE TABLE `fb_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fb_access_token` varchar(255) DEFAULT NULL,
  `fb_id` bigint(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fb_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'pages'
CREATE TABLE `pages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `about` text,
  `is_user` int(11) DEFAULT NULL,
  `is_verified` int(1) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `profile_pic` text,
  `social_media_id` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'tags'
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `text` varchar(11) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'twitter_posts'
CREATE TABLE `twitter_posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `entities` text,
  `extended_entities` text,
  `favorite_count` bigint(11) DEFAULT NULL,
  `full_text` varchar(255) DEFAULT NULL,
  `page_id` bigint(11) DEFAULT NULL,
  `quoted_created_at` datetime DEFAULT NULL,
  `quoted_favorite_count` bigint(11) DEFAULT NULL,
  `quoted_full_text` varchar(255) DEFAULT NULL,
  `quoted_page_id` bigint(11) DEFAULT NULL,
  `quoted_retweet_count` bigint(11) DEFAULT NULL,
  `quoted_status` int(11) DEFAULT NULL,
  `quoted_tweet_id` bigint(50) DEFAULT NULL,
  `retweet_count` bigint(11) DEFAULT NULL,
  `retweeted_created_at` datetime DEFAULT NULL,
  `retweeted_entities` text,
  `retweeted_extended_entities` text,
  `retweeted_favorite_count` bigint(11) DEFAULT NULL,
  `retweeted_full_text` varchar(255) DEFAULT NULL,
  `retweeted_page_id` bigint(11) DEFAULT NULL,
  `retweeted_retweet_count` bigint(11) DEFAULT NULL,
  `retweeted_status` int(11) DEFAULT NULL,
  `retweeted_tweet_id` bigint(50) DEFAULT NULL,
  `tweet_id` bigint(50) DEFAULT NULL,
  `tweet_json` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'twitter_users'
CREATE TABLE `twitter_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `twitter_access_secret` varchar(255) DEFAULT NULL,
  `twitter_access_token` varchar(255) DEFAULT NULL,
  `twitter_id` bigint(50) DEFAULT NULL,
  `twitter_username` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `twitter_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'users'
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_reset` varchar(255) DEFAULT NULL,
  `img` text,
  `bio` text,
  `email` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT NULL,
  `linked_youtube` int(1) DEFAULT NULL,
  `linked_fb` int(1) DEFAULT NULL,
  `linked_twitter` int(1) DEFAULT NULL,
  `verification_code` varchar(255) DEFAULT NULL,
  `bearer` varchar(255) DEFAULT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'youtube_comments'
CREATE TABLE `youtube_comments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `channel_id` varchar(255) DEFAULT NULL,
  `comment_id` varchar(255) DEFAULT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `like_count` bigint(50) DEFAULT NULL,
  `message` text,
  `video_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'youtube_users'
CREATE TABLE `youtube_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_linked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) DEFAULT NULL,
  `youtube_access_token` varchar(255) DEFAULT NULL,
  `youtube_id` varchar(255) DEFAULT NULL,
  `youtube_refresh_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `youtube_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'youtube_videos'
CREATE TABLE `youtube_videos` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `channel_id` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `description` text,
  `dislike_count` bigint(50) DEFAULT NULL,
  `img` text,
  `like_count` bigint(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `video_id` varchar(255) DEFAULT NULL,
  `view_count` bigint(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;