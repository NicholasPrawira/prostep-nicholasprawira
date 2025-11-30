import React from 'react';

interface ImageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    prompt: string;
    clipScore?: number;
}

export default function ImageDetailModal({ isOpen, onClose, imageUrl, prompt, clipScore }: ImageDetailModalProps) {
    if (!isOpen) return null;

    const handleSaveImage = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tigaraksa-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error:', err);
            alert('Gagal menyimpan gambar');
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-in z-50">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-4 md:p-0">
                    <img
                        src={imageUrl}
                        alt={prompt}
                        className="max-w-full max-h-[50vh] md:max-h-full object-contain"
                    />
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-umn-yellow rounded-full"></span>
                            Detail Gambar
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Prompt</p>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {prompt}
                            </p>
                        </div>

                        {clipScore !== undefined && (
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-8">
                                <p className="text-xs text-blue-600 font-medium mb-1">CLIP Score</p>
                                <p className="text-2xl font-bold text-umn-blue">{clipScore.toFixed(3)}</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <button
                            onClick={handleSaveImage}
                            className="w-full py-4 bg-umn-blue hover:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Unduh Gambar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
