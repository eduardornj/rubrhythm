INSERT INTO User (id, name, email, password, role, verified, createdAt, updatedAt) 
VALUES ('admin_user_001', 'Administrator', 'admin@rubrhythm.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, NOW(), NOW());

SELECT * FROM User WHERE email = 'admin@rubrhythm.com';