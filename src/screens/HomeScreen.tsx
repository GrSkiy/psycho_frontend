import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/HomeScreen.css'; // Импортируем стили

// Данные для тем (потом можно будет вынести или получать откуда-то)
const topics = [
  { id: 1, name: 'Отношения', illustration: '❤️' }, // Используем эмодзи как заглушки
  { id: 2, name: 'Здоровье', illustration: '🩺' },
  { id: 3, name: 'Родители', illustration: '👨‍👩‍👧‍👦' },
  { id: 4, name: 'Работа', illustration: '💼' }, 
  { id: 5, name: 'Самооценка', illustration: '✨' },
  { id: 6, name: 'Тревога', illustration: '😥' },
  { id: 7, name: 'Поиск себя', illustration: '🤔' },
];

function HomeScreen() {
  // Тексты для кнопок
  const buttonTexts = {
    talk: "Просто поговорить",
    amy: "Написать Эми", // Предполагаем, что Эми - это имя бота или специфический режим?
    help: "Я попал(а) в тяжелую ситуацию"
  };

  return (
    <div className="home-screen">

      <div className="header">
        <div className="header-title">
          <h1>nora</h1>
        </div>
        <div className="header-subtitle">
          <h2>Привет! Как я могу тебе помочь сегодня?</h2>
        </div>
      </div>
      <div className="main-actions">
        <Link 
          to="/chat" 
          className="action-button green" 
          state={{ initialMessage: buttonTexts.talk }}
        >
          {buttonTexts.talk}
        </Link>
        <div className="action-button-low-container">
          <Link 
            to="/chat" 
            className="action-button pink" 
            state={{ initialMessage: buttonTexts.amy }}
          >
            {buttonTexts.amy}
          </Link>
          <Link 
            to="/chat" 
            className="action-button purple" 
            state={{ initialMessage: buttonTexts.help }}
          >
            {buttonTexts.help}
          </Link>
        </div>
      </div>

      <div className="topics-section">
        <h3>Темы для разговора</h3>
        <div className="topics-list">
          {topics.map((topic) => (
            <Link 
              key={topic.id} 
              to="/chat"
              className="topic-item"
              state={{ initialMessage: topic.name }}
              style={{ textDecoration: 'none' }}
            >
              <div className="topic-circle">{topic.illustration}</div>
              <span>{topic.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen; 