CREATE DATABASE IF NOT EXISTS survey_db;

USE survey_db;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `stations`;

-- Create the stations table
CREATE TABLE `stations` (
  `id` varchar(255) NOT NULL,
  `label` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Create the submissions table
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `station_id` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` varchar(255) DEFAULT NULL,
  `age` varchar(255) DEFAULT NULL,
  `resident` tinyint(1) DEFAULT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT '1',
  `consent_version` text NOT NULL,
  `consent_purpose` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `submissions_station_id_fkey` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`)
);

-- Create the answers table
CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `question_number` smallint NOT NULL CHECK ((`question_number` in (1,2,3))),
  `question_key` enum('future_vision','magic_wand','what_is_missing') NOT NULL,
  `type` enum('audio','text') NOT NULL,
  `storage_path` text NOT NULL,
  `mime_type` text,
  `size_bytes` int DEFAULT NULL,
  `duration_seconds` decimal(10,3) DEFAULT NULL,
  `text_content` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `answers_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
);
