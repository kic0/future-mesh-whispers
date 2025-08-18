CREATE DATABASE IF NOT EXISTS survey_db;

USE survey_db;

CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `station_id` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `age` varchar(255) DEFAULT NULL,
  `resident` tinyint(1) DEFAULT NULL,
  `consent_given` tinyint(1) DEFAULT NULL,
  `consent_version` varchar(255) DEFAULT NULL,
  `consent_purpose` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int DEFAULT NULL,
  `question_number` int DEFAULT NULL,
  `question_key` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `storage_path` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `size_bytes` int DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `text_content` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
);
