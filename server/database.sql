CREATE DATABASE IF NOT EXISTS survey_db;

USE survey_db;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `stations`;

-- =========================
-- Tabela de estações (totens)
-- =========================
CREATE TABLE `stations` (
  `id` varchar(255) NOT NULL,
  `label` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Seed data for stations
INSERT IGNORE INTO `stations` (`id`, `label`, `active`) VALUES
  ('TOTEM-1', 'Mercado', true),
  ('TOTEM-2', 'Plataforma', true),
  ('TOTEM-3', 'Vila Flor', true),
  ('WEB', 'Web Interface', true);

-- =========================
-- Submissões (demografia + consentimento)
-- =========================
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `station_id` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` ENUM('Masculino','Feminino','Não-binário','Prefiro não responder'),
  `age` ENUM('Até 18', '19-25', '26-35', '36-45', '46-60', '60+'),
  `resident` tinyint(1) DEFAULT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT '1',
  `consent_version` varchar(255) NOT NULL DEFAULT 'v1',
  `consent_purpose` varchar(255) NOT NULL DEFAULT 'academic research',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `submissions_station_id_fkey` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE RESTRICT
);


-- =========================
-- Respostas (texto e áudio)
-- =========================
CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `question_number` smallint NOT NULL CHECK (`question_number` in (1,2,3)),
  `question_key` enum('future_vision','magic_wand','what_is_missing') NOT NULL,
  `type` enum('audio','text') NOT NULL,
  `storage_path` text NOT NULL,
  `mime_type` text,
  `size_bytes` int DEFAULT NULL,
  `duration_seconds` decimal(10,3) DEFAULT NULL,
  `text_content` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `answers_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submission_question_type_unique` UNIQUE (`submission_id`, `question_number`, `type`)
);

-- =========================
-- Índices úteis
-- =========================
CREATE INDEX `idx_submissions_station_created` ON `submissions` (`station_id`, `created_at` DESC);
CREATE INDEX `idx_answers_submission` ON `answers` (`submission_id`);
CREATE INDEX `idx_answers_question` ON `answers` (`question_number`, `type`);
