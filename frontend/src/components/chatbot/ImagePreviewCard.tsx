import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePreviewCardProps {
    thumbnailUrl: string;
    title: string;
    onClick: () => void;
}

export default function ImagePreviewCard({ thumbnailUrl, title, onClick }: ImagePreviewCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:scale-95"
        >
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    <span className="truncate">{title}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Klik untuk melihat detail</p>
            </div>
        </div>
    );
}
