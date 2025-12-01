import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import ImagePreviewCard from './ImagePreviewCard';
import ImageDetailModal from '../ImageDetailModal';


interface ImageAttachment {
    type: 'image';
    url: string;
    prompt: string;
    clipScore: number;
    ocr_text?: string;
    caption?: string;
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
    const [role, setRole] = useState<'Profesor' | 'Kakak Pintar' | 'Teman Baik' | 'Sang Penjelajah' | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Halo! Aku Atang. Siapa namamu?',
            sender: 'bot',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [activeImage, setActiveImage] = useState<ImageAttachment | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 1. Handle Name Input (First Interaction)
        if (!userName) {
            const name = inputValue.trim();
            setUserName(name);

            const userMsg: Message = {
                id: Date.now().toString(),
                text: name,
                sender: 'user',
            };

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `Salam kenal, ${name}! 👋\nSekarang, pilih teman belajarmu di bawah ini ya!`,
                sender: 'bot',
            };

            setMessages((prev) => [...prev, userMsg, botMsg]);
            setInputValue('');
            return;
        }

        if (!role) return;

        // Check for "end" command
        if (inputValue.trim().toLowerCase() === 'end' || inputValue.trim().toLowerCase() === 'selesai') {
            setActiveImage(null);
            const userMsg: Message = {
                id: Date.now().toString(),
                text: inputValue,
                sender: 'user',
            };
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `Oke ${userName}, kita kembali ke mode diskusi ya. Mau ngobrol apa?`,
                sender: 'bot',
            };
            setMessages((prev) => [...prev, userMsg, botMsg]);
            setInputValue('');
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: role,
                    user_name: userName,
                    message: userMsg.text,
                    selected_image: activeImage ? {
                        caption: activeImage.caption || activeImage.prompt,
                        ocr_text: activeImage.ocr_text || '',
                        prompt: activeImage.prompt
                    } : null
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let botMsgId = (Date.now() + 1).toString();
            let botText = '';
            let fullResponse = '';

            setMessages((prev) => [
                ...prev,
                {
                    id: botMsgId,
                    text: '',
                    sender: 'bot',
                },
            ]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;

                // Check for images
                if (fullResponse.includes('###IMAGES###') && fullResponse.includes('###END_IMAGES###')) {
                    const start = fullResponse.indexOf('###IMAGES###');
                    const end = fullResponse.indexOf('###END_IMAGES###');
                    const jsonStr = fullResponse.substring(start + 12, end);
                    try {
                        const images = JSON.parse(jsonStr);
                        // Remove the image part from text
                        botText = fullResponse.substring(0, start) + fullResponse.substring(end + 16);

                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === botMsgId ? { ...msg, text: botText, attachments: images } : msg
                            )
                        );
                    } catch (e) {
                        console.error("Failed to parse images", e);
                    }
                } else {
                    // Clean up partial tags if any (simple approach: just show text)
                    botText = fullResponse.replace(/###IMAGES###.*?###END_IMAGES###/s, '');

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMsgId ? { ...msg, text: botText } : msg
                        )
                    );
                }
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Maaf, terjadi kesalahan saat menghubungi Si Atang. Coba lagi ya!',
                sender: 'bot',
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageClick = (att: ImageAttachment) => {
        // Activate Image Mode
        setActiveImage(att);

        // Add system message to chat
        const sysMsg: Message = {
            id: Date.now().toString(),
            text: `Oke, kita pakai gambar ini ya.`,
            sender: 'bot',
        };
        setMessages((prev) => [...prev, sysMsg]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        // 0. Handle Internal App Drag (JSON)
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const data = JSON.parse(jsonData);
                if (data.type === 'image') {
                    const droppedImage: ImageAttachment = {
                        type: 'image',
                        url: data.url,
                        prompt: data.prompt,
                        clipScore: data.clipScore,
                        caption: data.caption,
                        ocr_text: data.ocr_text
                    };
                    setActiveImage(droppedImage);

                    const sysMsg: Message = {
                        id: Date.now().toString(),
                        text: `Oke! Kita bahas gambar "${data.prompt}" ini ya. Mau tanya apa?`,
                        sender: 'bot',
                    };
                    setMessages((prev) => [...prev, sysMsg]);
                    return;
                }
            } catch (err) {
                console.error("Failed to parse dropped JSON", err);
            }
        }

        // 1. Handle Files (Upload)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const mockImage: ImageAttachment = {
                type: 'image',
                url: URL.createObjectURL(file),
                prompt: file.name,
                clipScore: 0,
                caption: "Gambar diunggah pengguna",
                ocr_text: ""
            };
            setActiveImage(mockImage);

            const sysMsg: Message = {
                id: Date.now().toString(),
                text: `Siap! Kita pakai gambar "${file.name}" yang kamu upload. Kamu mau belajar bagian mana?`,
                sender: 'bot',
            };
            setMessages((prev) => [...prev, sysMsg]);
            return;
        }

        // 2. Handle HTML Elements (Drag from webpage)
        const html = e.dataTransfer.getData('text/html');
        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const img = doc.querySelector('img');
            if (img && img.src) {
                const src = img.src;
                const alt = img.alt || "Gambar dari web";

                const droppedImage: ImageAttachment = {
                    type: 'image',
                    url: src,
                    prompt: alt,
                    clipScore: 0,
                    caption: alt,
                    ocr_text: ""
                };
                setActiveImage(droppedImage);

                const sysMsg: Message = {
                    id: Date.now().toString(),
                    text: `Oke! Kita bahas gambar "${alt}" ini ya. Mau tanya apa?`,
                    sender: 'bot',
                };
                setMessages((prev) => [...prev, sysMsg]);
                return;
            }
        }

        // 3. Handle Direct URL
        const url = e.dataTransfer.getData('text/uri-list');
        if (url) {
            const droppedImage: ImageAttachment = {
                type: 'image',
                url: url,
                prompt: "Gambar dari URL",
                clipScore: 0,
                caption: "Gambar dari URL",
                ocr_text: ""
            };
            setActiveImage(droppedImage);

            const sysMsg: Message = {
                id: Date.now().toString(),
                text: `Sip! Gambar dari URL sudah masuk. Yuk belajar!`,
                sender: 'bot',
            };
            setMessages((prev) => [...prev, sysMsg]);
        }
    };

    const handleReset = () => {
        setMessages([
            {
                id: '1',
                text: 'Halo! Aku Atang. Siapa namamu?',
                sender: 'bot',
            },
        ]);
        setRole(null);
        setUserName(null);
        setActiveImage(null);
        setSelectedImage(null);
        setInputValue('');
    };

    // Helper to get icon based on role
    const getHeaderIcon = () => {
        switch (role) {
            case 'Profesor': return '/icon profesor.png';
            case 'Kakak Pintar': return '/icon kakak kelas.png';
            case 'Teman Baik': return '/icon teman baik.png';
            case 'Sang Penjelajah': return '/icon sang penjelajah.png';
            default: return '/icon tangerang 3d.png';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className={`fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-24 sm:right-6 sm:h-[500px] sm:w-[340px] sm:rounded-2xl border border-gray-100 overflow-hidden transition-all animate-in slide-in-from-bottom-10 duration-300 ${isDragOver ? 'ring-4 ring-indigo-400' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-umn-blue px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0">
                            <img
                                src={getHeaderIcon()}
                                alt="Si Atang"
                                className="h-full w-full object-contain drop-shadow-sm"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">Si Atang</h3>
                            <p className="text-[10px] text-blue-100 font-medium opacity-90">Online • Siap membantu</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleReset}
                            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                            title="Mulai Chat Baru"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Role Selection or Chat */}
                {!role && userName ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 bg-gray-50 overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Mau belajar sama siapa?</h3>

                        <button
                            onClick={() => setRole('Profesor')}
                            className="w-full py-2.5 px-4 bg-white border-2 border-indigo-100 rounded-xl shadow-sm hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center gap-3 group"
                        >
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-1">
                                <img src="/icon profesor.png" alt="Profesor" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-sm">Profesor</p>
                                <p className="text-[10px] text-gray-500">Terstruktur, logis, rapi</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setRole('Kakak Pintar')}
                            className="w-full py-2.5 px-4 bg-white border-2 border-orange-100 rounded-xl shadow-sm hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-3 group"
                        >
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-1">
                                <img src="/icon kakak kelas.png" alt="Kakak Pintar" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-sm">Kakak Pintar</p>
                                <p className="text-[10px] text-gray-500">Jelas, santai, hangat</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setRole('Teman Baik')}
                            className="w-full py-2.5 px-4 bg-white border-2 border-green-100 rounded-xl shadow-sm hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-3 group"
                        >
                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-1">
                                <img src="/icon teman baik.png" alt="Teman Baik" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-sm">Teman Baik</p>
                                <p className="text-[10px] text-gray-500">Ceria, ramah, ringan</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setRole('Sang Penjelajah')}
                            className="w-full py-2.5 px-4 bg-white border-2 border-yellow-100 rounded-xl shadow-sm hover:border-yellow-500 hover:bg-yellow-50 transition-all flex items-center gap-3 group"
                        >
                            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-1">
                                <img src="/icon sang penjelajah.png" alt="Sang Penjelajah" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-sm">Sang Penjelajah</p>
                                <p className="text-[10px] text-gray-500">Penuh rasa ingin tahu</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 relative">
                            {/* Drag Overlay */}
                            {isDragOver && (
                                <div className="absolute inset-0 z-10 bg-indigo-50/90 flex items-center justify-center border-2 border-dashed border-indigo-400 m-2 rounded-xl">
                                    <p className="text-indigo-600 font-bold">Lepaskan gambar di sini!</p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.sender === 'user'
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
                                                            onClick={() => handleImageClick(att)}
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
                                        <img src="/icon loading.png" alt="Loading..." className="h-5 w-5 animate-spin" />
                                        <span>Sedang mengetik...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t bg-white p-3">
                            <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={userName ? "Ketik pesan..." : "Siapa namamu?"}
                                    className={`max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none ${activeImage ? 'pr-12' : ''}`}
                                    rows={1}
                                    disabled={isTyping}
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex justify-between items-center mt-2 px-1">
                                <div className="flex items-center gap-2">
                                    {role && (
                                        <button
                                            onClick={() => setRole(null)}
                                            className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium"
                                        >
                                            Ganti Peran
                                        </button>
                                    )}
                                    {(activeImage || inputValue.startsWith('/gambar')) && (
                                        <div
                                            onClick={() => activeImage && setSelectedImage(activeImage)}
                                            className={`flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 animate-in fade-in slide-in-from-bottom-1 ${activeImage ? 'cursor-pointer hover:bg-indigo-100' : ''}`}
                                        >
                                            {activeImage && (
                                                <div className="w-4 h-4 rounded overflow-hidden">
                                                    <img src={activeImage.url} alt="Active" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <span className="text-[10px] font-bold text-indigo-600">
                                                Mode Gambar
                                            </span>
                                        </div>
                                    )}
                                    {inputValue.startsWith('/diskusi') && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-bottom-1">
                                            Mode Diskusi
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    AI bisa salah, mohon dicek lagi
                                </p>
                            </div>
                        </div>
                    </>
                )}
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
