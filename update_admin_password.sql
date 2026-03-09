UPDATE User SET password = '$2b$10$xXiTE0SYIW8Iq7rBvLbg5uS2a/KUmeOz/LtjqStgDMCEXJ.un8W5C' WHERE email = 'admin@rubrhythm.com';

SELECT id, email, name, role, verified FROM User WHERE email = 'admin@rubrhythm.com';