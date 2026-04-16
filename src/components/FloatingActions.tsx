import { MessageCircle, Phone } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface FloatingActionsProps {
  onChatClick?: () => void;
  zaloHref?: string;
  phoneHref?: string;
}

const FloatingActions = ({ onChatClick, zaloHref, phoneHref }: FloatingActionsProps) => {
  const { config } = useSiteConfig();
  const phone = phoneHref || `tel:${config.phone || "0866121617"}`;
  const zalo = zaloHref || `https://zalo.me/${config.zalo_number || "0866121617"}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a
        href={phone}
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Gọi điện"
      >
        <Phone className="h-5 w-5" />
      </a>
      {onChatClick && (
        <button
          onClick={onChatClick}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Chat"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
      <a
        href={zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="h-12 w-12 rounded-full bg-blue-500 text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat Zalo"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
};

export default FloatingActions;
