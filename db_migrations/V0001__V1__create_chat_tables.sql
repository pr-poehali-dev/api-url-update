
CREATE TABLE t_p79249079_api_url_update.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_initials VARCHAR(4) NOT NULL,
    bio TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p79249079_api_url_update.conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES t_p79249079_api_url_update.users(id),
    user2_id INTEGER REFERENCES t_p79249079_api_url_update.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE t_p79249079_api_url_update.messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES t_p79249079_api_url_update.conversations(id),
    sender_id INTEGER REFERENCES t_p79249079_api_url_update.users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p79249079_api_url_update.users (username, display_name, avatar_initials, bio) VALUES
('alex', 'Александр Петров', 'АП', 'Senior Product Manager · TechCorp'),
('maria', 'Мария Соколова', 'МС', 'Head of Design · Studio X'),
('dmitry', 'Дмитрий Волков', 'ДВ', 'CEO · GrowthLab'),
('igor', 'Игорь Смирнов', 'ИС', 'CTO · CloudBase'),
('anna', 'Анна Морозова', 'АМ', 'Marketing Director · BrandX');

INSERT INTO t_p79249079_api_url_update.conversations (user1_id, user2_id) VALUES (1,2),(1,3),(1,4),(1,5);

INSERT INTO t_p79249079_api_url_update.messages (conversation_id, sender_id, text) VALUES
(1, 2, 'Привет! Рада познакомиться 👋'),
(1, 1, 'Привет, Мария! Взаимно!'),
(1, 2, 'Смотрела твой профиль — интересный опыт в product!'),
(2, 3, 'Добрый день! Договорились на среду в 14:00?'),
(2, 1, 'Да, подтверждаю!'),
(3, 4, 'Вот ссылка на документацию API: https://docs.example.com'),
(4, 5, 'Посмотрела ваш профиль — очень интересно!');
