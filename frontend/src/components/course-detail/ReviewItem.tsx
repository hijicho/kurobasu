import { User } from 'lucide-react';

interface ReviewItemProps {
  text: string;
}

export function ReviewItem({ text }: ReviewItemProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <User className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-1">{text}</p>
    </div>
  );
}
