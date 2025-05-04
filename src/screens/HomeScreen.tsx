import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/HomeScreen.css'; // Импортируем стили

// --- Типизация для истории чатов (добавим) ---
interface ChatHistoryItem {
  id: string; // Уникальный ID чата
  title: string; // Название или краткое содержание чата
  lastMessageTimestamp?: string; // Опционально: время последнего сообщения
}

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

  // --- Состояние для истории чатов (добавили) ---
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  // --- Состояние загрузки (опционально, для UX) ---
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // --- Загрузка истории чатов при монтировании (добавили) ---
  useEffect(() => {
    // --- ЗАГЛУШКА: Замените это на реальный запрос к API ---
    const fetchChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // Имитация запроса к API
        await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки сети
        // Пример данных (потом это будет приходить с бэкенда)
        const fetchedHistory: ChatHistoryItem[] = [
           { id: 'chat1', title: 'Разговор про работу', lastMessageTimestamp: '2024-07-28T10:00:00Z' },
           { id: 'chat2', title: 'Обсуждение тревоги', lastMessageTimestamp: '2024-07-27T15:30:00Z' },
        ];
         // const response = await fetch('/api/chats'); // Пример реального запроса
         // if (!response.ok) throw new Error('Failed to fetch chat history');
         // const fetchedHistory = await response.json();

        setChatHistory(fetchedHistory);
      } catch (error) {
        console.error("Ошибка загрузки истории чатов:", error);
        // Здесь можно обработать ошибку, показать сообщение пользователю
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

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

      {/* --- Новый блок: История разговоров (добавили) --- */}
      {!isLoadingHistory && chatHistory.length > 0 && (
        <div className="history-section">
          <h3>История разговоров</h3>
          <div className="history-list">
            {chatHistory.map((chat) => (
              <Link
                key={chat.id}
                // --- Важно: Навигация должна вести на конкретный чат ---
                // --- Возможно, потребуется изменить роутинг на /chat/:chatId ---
                to={`/chat/${chat.id}`}
                className="history-item"
                style={{ textDecoration: 'none' }}
                // --- Можно передать title в state, если он нужен на экране чата до загрузки ---
                // state={{ chatTitle: chat.title }}
              >
                <span>{chat.title}</span>
                {/* Можно добавить дату/время */}
                {/* {chat.lastMessageTimestamp && <span className="history-item-date">{new Date(chat.lastMessageTimestamp).toLocaleString()}</span>} */}
              </Link>
            ))}
          </div>
        </div>
      )}
       {/* --- Индикатор загрузки (опционально) --- */}
      {isLoadingHistory && (
         <div className="loading-indicator">Загрузка истории...</div>
      )}
    </div>
  );
}

export default HomeScreen; 