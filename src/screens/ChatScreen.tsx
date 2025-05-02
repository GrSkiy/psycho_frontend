import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // Импортируем useLocation
import '../assets/styles/ChatScreen.css'; // Импортируем стили

// Интерфейс сообщения (ID может быть числом из БД или timestamp)
interface Message {
    id: number | string; // Позволяем ID быть строкой, если БД использует UUID
    sender: 'user' | 'bot';
    text: string;
    // timestamp?: number; // Раскомментируйте, если есть поле timestamp
}

// URL твоего WebSocket бэкенда (замени на свой!)
const WEBSOCKET_URL = 'ws://localhost:8000/chat';

// Переименовываем функцию в ChatScreen
function ChatScreen() {
    const location = useLocation(); // Получаем объект location
    const initialMessageFromState = location.state?.initialMessage as string | undefined;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    // Флаг: начальное сообщение отправлено ИЛИ уже было в истории
    // Инициализируем useRef сразу значением false
    const initialMessageSentOrLoaded = useRef(false);

    // useEffect для сброса флага ТОЛЬКО при монтировании или изменении initialMessageFromState
    useEffect(() => {
        console.log("ChatScreen mounted or initialMessage changed. Resetting initialMessageSentOrLoaded flag.");
        initialMessageSentOrLoaded.current = false;
        // Если вам нужно очистить сообщения при смене initialMessage, добавьте сюда:
        // setMessages([]);
        // setIsBotTyping(false);
    }, [initialMessageFromState]); // Зависимость от initialMessageFromState (если он может меняться без размонтирования)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isBotTyping]);

    const sendMessage = useCallback((textToSend: string, senderType: 'user' | 'bot' = 'user', shouldSetTyping = true) => {
        if (textToSend.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
            const newMessage: Message = {
                id: `temp_${Date.now()}_${Math.random()}`,
                sender: senderType,
                text: textToSend,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            if (senderType === 'user') {
                ws.current.send(JSON.stringify({ text: textToSend }));
                if (shouldSetTyping) {
                    setIsBotTyping(true);
                }
                setInputValue('');
            }
        } else if (senderType === 'user') {
            console.log('Cannot send message: WebSocket not connected or input is empty.');
            // Возможно, добавить сообщение для пользователя?
        }
    }, []); // Убрали initialMessageSentOrLoaded из зависимостей sendMessage, т.к. он используется через ref

    const handleIncomingMessage = useCallback((event: MessageEvent) => {
        setIsBotTyping(false);
        try {
            const receivedData = JSON.parse(event.data);
            console.log("Received:", receivedData);

            if (receivedData.type === 'history' && Array.isArray(receivedData.messages)) {
                console.log("Loading history:", receivedData.messages);
                let historyMessages: Message[] = receivedData.messages.map((msg: any) => ({
                    id: String(msg.id ?? `history_${Date.now()}_${Math.random()}`),
                    sender: String(msg.sender).toLowerCase() === 'user' ? 'user' : 'bot',
                    text: msg.text,
                    // timestamp: msg.timestamp // Раскомментируйте, если есть
                }));

                // Сортируем/разворачиваем
                // historyMessages.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
                historyMessages = historyMessages.reverse();

                setMessages(historyMessages);

                const initialMessageAlreadyInHistory = historyMessages.some(m => m.text === initialMessageFromState && m.sender === 'user');

                // Используем проверку initialMessageSentOrLoaded.current
                if (initialMessageFromState && !initialMessageSentOrLoaded.current && !initialMessageAlreadyInHistory) {
                    console.log('Sending initial message after history load:', initialMessageFromState);
                    sendMessage(initialMessageFromState, 'user', true);
                    initialMessageSentOrLoaded.current = true; // Устанавливаем флаг
                } else if (initialMessageAlreadyInHistory) {
                     // Если сообщение уже есть в истории, просто устанавливаем флаг
                    console.log('Initial message found in history.');
                    initialMessageSentOrLoaded.current = true;
                } else if (initialMessageFromState && initialMessageSentOrLoaded.current) {
                    console.log('Initial message already processed.');
                }

            }
            else if (receivedData.sender === 'bot' && receivedData.text) {
                const newMessage: Message = {
                    id: String(receivedData.id ?? `bot_${Date.now()}_${Math.random()}`),
                    sender: 'bot',
                    text: receivedData.text,
                };
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            } else if (receivedData.type !== 'history') {
               console.warn('Received unexpected data format or type:', receivedData);
            }
        } catch (e) {
            console.error('Failed to parse message or invalid format:', event.data, e);
        }
    // Добавляем initialMessageFromState и sendMessage в зависимости, так как они используются
    }, [initialMessageFromState, sendMessage]);

    // useEffect для WebSocket соединения
    useEffect(() => {
        // НЕ сбрасываем флаг initialMessageSentOrLoaded здесь
        console.log("Attempting to establish WebSocket connection...");
        ws.current = new WebSocket(WEBSOCKET_URL);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
            console.log('Requesting history...');
            ws.current?.send(JSON.stringify({ type: 'get_history' }));
            // НЕ отправляем initialMessage здесь
        };

        ws.current.onclose = (event) => {
            console.log(`WebSocket Disconnected: code=${event.code}, reason=${event.reason}`);
            setIsConnected(false);
            setIsBotTyping(false);
            // Можно добавить логику повторного подключения здесь при необходимости
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
            setIsBotTyping(false);
        };

        ws.current.onmessage = handleIncomingMessage; // Используем useCallback версию

        // Функция очистки при размонтировании компонента ИЛИ перед следующим запуском эффекта
        const wsCurrent = ws.current; // Сохраняем ссылку для cleanup функции
        return () => {
            console.log("Closing WebSocket connection...");
            wsCurrent?.close();
            // Сбрасываем состояние подключения при закрытии
            setIsConnected(false);
            setIsBotTyping(false);
        };
    // Зависимость от handleIncomingMessage остается.
    // Если initialMessageFromState изменится, этот эффект тоже перезапустится
    // (и handleIncomingMessage будет новой функцией), что кажется правильным.
    }, [handleIncomingMessage]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSendMessageClick = () => {
        sendMessage(inputValue, 'user');
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage(inputValue, 'user');
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        {msg.sender === 'bot' && <div className="message-sender">Bot</div>}
                        {msg.text}
                    </div>
                ))}
                {isBotTyping && (
                    <div className="message bot typing-indicator">
                        <div className="message-sender">Bot</div>
                        <span>Печатает...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Введите сообщение..." : "Подключение..."}
                    disabled={!isConnected}
                />
                <button onClick={handleSendMessageClick} disabled={!isConnected || !inputValue.trim()}>
                    Отправить
                </button>
            </div>
        </div>
    );
}

export default ChatScreen; 