CREATE TABLE `categories` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=40;


CREATE TABLE `cities` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=69
;

CREATE TABLE `jobs` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`customer_id` INT(11) NULL DEFAULT NULL,
	`title` VARCHAR(150) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`category_id` INT(11) NULL DEFAULT NULL,
	`city_id` INT(11) NULL DEFAULT NULL,
	`status` ENUM('pending','in_progress','completed') NULL DEFAULT 'pending' COLLATE 'utf8mb4_general_ci',
	`selected_master_id` INT(11) NULL DEFAULT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `customer_id` (`customer_id`) USING BTREE,
	INDEX `category_id` (`category_id`) USING BTREE,
	INDEX `city_id` (`city_id`) USING BTREE,
	INDEX `selected_master_id` (`selected_master_id`) USING BTREE,
	CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `jobs_ibfk_3` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `jobs_ibfk_4` FOREIGN KEY (`selected_master_id`) REFERENCES `masters` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;



CREATE TABLE `masters` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`surname` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(150) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`password` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`profile_image` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`city_id` INT(11) NULL DEFAULT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `email` (`email`) USING BTREE,
	INDEX `city_id` (`city_id`) USING BTREE,
	CONSTRAINT `masters_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `master_skills` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`master_id` INT(11) NULL DEFAULT NULL,
	`category_id` INT(11) NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `master_id` (`master_id`) USING BTREE,
	INDEX `category_id` (`category_id`) USING BTREE,
	CONSTRAINT `master_skills_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `masters` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `master_skills_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;



CREATE TABLE `proposals` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`job_id` INT(11) NULL DEFAULT NULL,
	`master_id` INT(11) NULL DEFAULT NULL,
	`price` DECIMAL(10,2) NULL DEFAULT NULL,
	`message` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `job_id` (`job_id`) USING BTREE,
	INDEX `master_id` (`master_id`) USING BTREE,
	CONSTRAINT `proposals_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `proposals_ibfk_2` FOREIGN KEY (`master_id`) REFERENCES `masters` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;



CREATE TABLE `reviews` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`job_id` INT(11) NULL DEFAULT NULL,
	`master_id` INT(11) NULL DEFAULT NULL,
	`customer_id` INT(11) NULL DEFAULT NULL,
	`rating` TINYINT(4) NULL DEFAULT NULL,
	`comment` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `job_id` (`job_id`) USING BTREE,
	INDEX `master_id` (`master_id`) USING BTREE,
	INDEX `customer_id` (`customer_id`) USING BTREE,
	CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`master_id`) REFERENCES `masters` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `users` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`surname` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(150) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`password` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `email` (`email`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;


