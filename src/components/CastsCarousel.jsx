import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function CastsCarousel({ casts, loading }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#373A40] rounded-lg">
        <div className="text-[#909296]">Loading casts...</div>
      </div>
    );
  }

  if (!casts?.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-[#373A40] rounded-lg">
        <div className="text-[#909296]">No matching casts found</div>
      </div>
    );
  }

  const nextCast = () => {
    setCurrentIndex((prev) => (prev + 1) % casts.length);
  };

  const previousCast = () => {
    setCurrentIndex((prev) => (prev - 1 + casts.length) % casts.length);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="relative bg-[#373A40] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#C1C2C5] text-sm">
          Cast {currentIndex + 1} of {casts.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={previousCast}
            className="p-2 rounded-full bg-[#25262b] hover:bg-[#2C2D31] transition-colors"
            aria-label="Previous cast"
          >
            <ChevronLeftIcon className="w-4 h-4 text-[#C1C2C5]" />
          </button>
          <button
            onClick={nextCast}
            className="p-2 rounded-full bg-[#25262b] hover:bg-[#2C2D31] transition-colors"
            aria-label="Next cast"
          >
            <ChevronRightIcon className="w-4 h-4 text-[#C1C2C5]" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="bg-[#25262b] rounded-lg p-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                {casts[currentIndex].author?.avatar_url && (
                  <img
                    src={casts[currentIndex].author.avatar_url}
                    alt={`${casts[currentIndex].author.display_name || casts[currentIndex].author.fname}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#C1C2C5] truncate">
                      {casts[currentIndex].author?.display_name || casts[currentIndex].author?.fname}
                    </span>
                    <span className="text-[#909296] text-sm">
                      @{casts[currentIndex].author?.fname}
                    </span>
                  </div>
                  <div className="text-[#909296] text-xs">
                    {formatDate(casts[currentIndex].timestamp)}
                  </div>
                </div>
              </div>

              <div className="text-[#C1C2C5] whitespace-pre-wrap break-words">
                {casts[currentIndex].text}
              </div>

              {casts[currentIndex].embeds?.length > 0 && (
                <div className="space-y-2">
                  {casts[currentIndex].embeds.map((embed, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {embed.url && (
                        <a
                          href={embed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm break-all"
                        >
                          {embed.url}
                        </a>
                      )}
                      {embed.image_url && (
                        <img
                          src={embed.image_url}
                          alt="Cast attachment"
                          className="mt-2 rounded-lg max-h-48 w-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-[#909296]">
                {casts[currentIndex].reactions?.count > 0 && (
                  <span>❤️ {casts[currentIndex].reactions.count}</span>
                )}
                {casts[currentIndex].recasts?.count > 0 && (
                  <span>🔄 {casts[currentIndex].recasts.count}</span>
                )}
                {casts[currentIndex].replies?.count > 0 && (
                  <span>💬 {casts[currentIndex].replies.count}</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 