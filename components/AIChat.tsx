'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm the Utilyze assistant. I can help with gas/water usage or billing queries.",
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => {
                const input = document.getElementById('chat-input') as HTMLInputElement;
                input?.focus();
            }, 100);
        }
    };

    const sendMessage = async () => {
        const text = inputValue.trim();
        if (!text) return;

        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Call AI API (simplified - you can enhance with actual API call)
            const prompt = `You are a helpful support agent for Utilyze (US Utilities). 
            Answer this customer question: "${text}".
            - Use US English spelling.
            - If asked about billing, say bills are issued quarterly.
            - If asked about emergencies (gas leak), say "Call 911 immediately".
            - Keep it friendly and short.`;

            // Simulate AI response (replace with actual API call)
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const response =
                "Thanks for your question! For specific billing queries, please check your dashboard or contact our support team at support@utilyze.com. Bills are issued quarterly.";

            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, connection issue. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    };

    return (
        <>
            {/* Chat Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleChat}
                    className="bg-slate-900 hover:bg-black text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 w-14 h-14 flex items-center justify-center"
                >
                    <i className="fas fa-comment-dots text-2xl"></i>
                </button>
            </div>

            {/* Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden h-[450px]">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold flex items-center">
                            <span className="mr-2">✨</span> Utilyze Support
                        </h3>
                        <button onClick={toggleChat} className="hover:text-gray-300">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start'
                                    }`}
                            >
                                <div
                                    className={`${message.role === 'user'
                                        ? 'bg-slate-800 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                        } p-3 rounded-lg max-w-[85%] text-sm shadow-sm ai-content`}
                                    dangerouslySetInnerHTML={{
                                        __html: formatMessage(message.content),
                                    }}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="bg-white border border-slate-200 text-slate-800 p-3 rounded-lg rounded-tl-none max-w-[85%] text-sm">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                id="chat-input"
                                placeholder="Ask a question..."
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-500"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-black transition-colors"
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
