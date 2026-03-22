import { MessageCircle, Phone } from "lucide-react";

const FloatingActions = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a
        href="tel:0982557664"
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Gọi điện"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href="https://zalo.me/355051011908138298"
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
