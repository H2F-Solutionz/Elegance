import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  title?: string;
  description?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  title,
  description,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background">
        <DialogClose className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
          <X className="h-5 w-5" />
        </DialogClose>
        <div className="relative">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
        {(title || description) && (
          <div className="p-6">
            {title && (
              <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
            )}
            {description && (
              <p className="font-sans text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
