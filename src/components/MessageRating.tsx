
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { rateInteraction } from '@/services/conversationService';
import { cn } from '@/lib/utils';

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
  onRatingSubmit 
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
      if (onRatingSubmit) {
        onRatingSubmit(selectedRating);
      }
      
      toast({
        description: "Response rating submitted successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error rating message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit rating. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isSubmitting}
          className={cn(
            "p-1 rounded-full transition-colors",
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-100 cursor-pointer"
          )}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(null)}
          onClick={() => handleRate(star)}
        >
          <Star
            size={14}
            className={cn(
              "transition-colors",
              star <= (hoveredRating || rating || 0)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      {rating && (
        <span className="text-xs text-gray-500 ml-1">
          {rating}/5
        </span>
      )}
    </div>
  );
};

export default MessageRating;
