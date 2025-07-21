import { MessageCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SocialButtons() {
  const handleDiscord = () => {
    window.open('https://discord.gg/wJpZEa8Eh5', '_blank', 'noopener,noreferrer');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/app_le.an/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Discord Button */}
      <div className="flex flex-col items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiscord}
          className="
            transition-all duration-200 flex items-center space-x-2 min-w-[80px]
            hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
            dark:hover:bg-indigo-950 dark:hover:border-indigo-700 dark:hover:text-indigo-400
          "
        >
          <MessageCircle className="w-4 h-4" />
          <span>Join</span>
        </Button>
        <span className="text-xs text-muted-foreground mt-1">Discord</span>
      </div>

      {/* Instagram Button */}
      <div className="flex flex-col items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstagram}
          className="
            transition-all duration-200 flex items-center space-x-2 min-w-[80px]
            hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600
            dark:hover:bg-pink-950 dark:hover:border-pink-700 dark:hover:text-pink-400
          "
        >
          <Instagram className="w-4 h-4" />
          <span>Follow</span>
        </Button>
        <span className="text-xs text-muted-foreground mt-1">Instagram</span>
      </div>
    </div>
  );
}

export function SocialButtonsHorizontal() {
  const handleDiscord = () => {
    window.open('https://discord.gg/wJpZEa8Eh5', '_blank', 'noopener,noreferrer');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/app_le.an/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex space-x-3">
      {/* Discord Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDiscord}
        className="
          transition-all duration-200 flex items-center space-x-2
          hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
          dark:hover:bg-indigo-950 dark:hover:border-indigo-700 dark:hover:text-indigo-400
        "
        title="Join our Discord community"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Discord</span>
      </Button>

      {/* Instagram Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstagram}
        className="
          transition-all duration-200 flex items-center space-x-2
          hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600
          dark:hover:bg-pink-950 dark:hover:border-pink-700 dark:hover:text-pink-400
        "
        title="Follow us on Instagram"
      >
        <Instagram className="w-4 h-4" />
        <span className="hidden sm:inline">Follow</span>
      </Button>
    </div>
  );
} 