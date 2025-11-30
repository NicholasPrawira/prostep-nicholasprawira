'use client';

import React, { useState } from 'react';
import { } from 'lucide-react';
import ChatbotPanel from './ChatbotPanel';

export default function ChatbotButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Periodic animation trigger
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                setIsAnimating(true);
                // Stop animation after 3 seconds
                setTimeout(() => setIsAnimating(false), 3000);
            }
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <>
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center">
                    {/* Tooltip Popup */}
                    <div
                        className={`mr-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 transition-all duration-500 transform origin-right ${isAnimating ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
                            }`}
                    >
                        <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Kalau kamu pusing, tanya Atang yuk 👋
                        </p>
                        {/* Arrow */}
                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white transform -translate-y-1/2 rotate-45 border-t border-r border-gray-100"></div>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className={`flex h-14 w-14 items-center justify-center rounded-full bg-umn-blue text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-110 hover:bg-blue-800 active:scale-95 ${isAnimating ? 'animate-bounce' : ''
                            }`}
                        aria-label="Open Chat"
                    >
                        <img
                            src="/icon tangerang 3d.png"
                            alt="Chatbot Logo"
                            className="h-10 w-10 object-contain drop-shadow-md"
                        />
                    </button>
                </div>
            )}

            <ChatbotPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
