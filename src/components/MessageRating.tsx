import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { rateInteraction } from '@/services/conversationService';

interface MessageRatingProps {
  conversationId: string;
  messageIndex: number;
  existingRating?: number;
  onRatingSubmit?: (rating: number) => void;
}

const MessageRating = ({
  conversationId,
  messageIndex,
  existingRating,
  onRatingSubmit,
}: MessageRatingProps) => {
  const [rating, setRating] = useState<number | undefined>(existingRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (selectedRating: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await rateInteraction(conversationId, {
        messageIndex,
        rating: selectedRating,
      });

      setRating(selectedRating);
      onRatingSubmit?.(selectedRating);

      toast({ description: "Rating submitted!", duration: 2500 });
    } catch (error) {
      console.error('Rating failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit your rating.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoveredRating ?? rating ?? 0);
        return (
          <button
            key={star}
            type="button"
            disabled={isSubmitting}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={() => handleRate(star)}
            className="p-0.5 transition-opacity disabled:opacity-50"
          >
            <Star
              size={12}
              className={
                isActive
                  ? "text-[var(--primary-color)] fill-[var(--primary-color)]"
                  : "text-gray-300"
              }
            />
          </button>
        );
      })}
    </div>
  );
};

export default MessageRating;
