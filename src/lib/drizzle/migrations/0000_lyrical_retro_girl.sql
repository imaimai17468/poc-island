CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prompt` text NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`status` text DEFAULT 'deployed' NOT NULL,
	`created_at` integer NOT NULL
);
