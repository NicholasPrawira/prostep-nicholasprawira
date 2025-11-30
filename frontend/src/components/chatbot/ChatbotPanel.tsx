import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import ImagePreviewCard from './ImagePreviewCard';
import ImageDetailModal from '../ImageDetailModal';
import axios from 'axios';

interface ImageAttachment {
    type: 'image';
    url: string;
    prompt: string;
    clipScore: number;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    attachments?: ImageAttachment[];
}

interface ChatbotPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hai! Aku Atang! Mau cari gambar apa hari ini? Bilang aja, nanti aku cariin yang pas buat belajar',
            sender: 'bot',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Call backend API
            const response = await axios.get(`${API_BASE_URL}/search`, {
                params: { q: userMsg.text },
            });

            const results = response.data.results;

            if (results && results.length > 0) {
                const attachments: ImageAttachment[] = results.slice(0, 3).map((res: any) => ({
                    type: 'image',
                    url: res.image_url,
                    prompt: res.prompt,
                    clipScore: res.clipscore,
                }));

                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `Berikut adalah ${results.length > 3 ? 'beberapa' : ''} gambar yang saya temukan untuk "${userMsg.text}":`,
                    sender: 'bot',
                    attachments: attachments,
                };
                setMessages((prev) => [...prev, botMsg]);
            } else {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: 'Maaf, saya tidak menemukan gambar yang cocok dengan deskripsi tersebut.',
                    sender: 'bot',
                };
                setMessages((prev) => [...prev, botMsg]);
            }

        } catch (error) {
            console.error('Error fetching images:', error);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Maaf, terjadi kesalahan saat mencari gambar. Pastikan server backend berjalan.',
                sender: 'bot',
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-24 sm:right-6 sm:h-[500px] sm:w-[340px] sm:rounded-2xl border border-gray-100 overflow-hidden transition-all animate-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between bg-umn-blue px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0">
                            <img
                                src="/icon tangerang 3d.png"
                                alt="Si Atang"
                                className="h-full w-full object-contain drop-shadow-sm"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">Si Atang</h3>
                            <p className="text-[10px] text-blue-100 font-medium opacity-90">Online • Siap membantu</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                    }`}
                            >
                                <p>{msg.text}</p>
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 snap-x">
                                        {msg.attachments.map((att, idx) => (
                                            <div key={idx} className="min-w-[200px] snap-center">
                                                <ImagePreviewCard
                                                    thumbnailUrl={att.url}
                                                    title={att.prompt}
                                                    onClick={() => setSelectedImage(att)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-500 shadow-sm border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Sedang mencari...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t bg-white p-3">
                    <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan..."
                            className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                            rows={1}
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-gray-400">
                        AI kadang membuat kesalahan. Selalu cek ulang hasilnya, ya!
                    </p>
                </div>
            </div>

            {/* Image Modal */}
            <ImageDetailModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage?.url || ''}
                prompt={selectedImage?.prompt || ''}
                clipScore={selectedImage?.clipScore}
            />
        </>
    );
}
