'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Headset, 
  X, 
  Send, 
  RotateCcw, 
  ExternalLink, 
  ChevronRight
} from 'lucide-react';
import { settingsService } from '../lib/services/settingsService';

export function AgentHelpIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <Headset className={className} />;
}

// Retain WhatsAppIcon alias pointing to Headset for backwards compatibility
export { AgentHelpIcon as WhatsAppIcon };

interface ActionChip {
  id: string;
  label: string;
  query: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  chips?: ActionChip[];
  linkButton?: {
    text: string;
    url: string;
  };
  eventButton?: {
    text: string;
    eventName: string;
  };
}

const INITIAL_CHIPS: ActionChip[] = [
  { id: 'track', label: 'Track Order', query: 'How do I track my order?' },
  { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
  { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
  { id: 'cod', label: 'COD Available?', query: 'Is Cash on Delivery available?' },
  { id: 'custom', label: 'Custom Printing', query: 'Can I print custom name and number?' },
  { id: 'returns', label: 'Returns Policy', query: 'What is your return policy?' },
  { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
];

const getCurrentTime = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function generateBotReply(
  userQuery: string, 
  whatsappNumber: string
): { 
  text: string; 
  chips?: ActionChip[]; 
  linkButton?: { text: string; url: string }; 
  eventButton?: { text: string; eventName: string };
} {
  const q = userQuery.toLowerCase().trim();

  // 1. Human / Live Agent
  if (
    q.includes('human') || 
    q.includes('agent') || 
    q.includes('live') || 
    q.includes('person') || 
    q.includes('whatsapp') || 
    q.includes('call') || 
    q.includes('phone') ||
    q.includes('support team') ||
    q.includes('talk to someone') ||
    q.includes('representative')
  ) {
    return {
      text: "Our dedicated support team is active and ready to assist you.\n\nClick the button below to connect directly with our live support agent for instant one-on-one assistance:",
      linkButton: {
        text: "Chat with Live Agent",
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Jersey Junction Support! I need live agent help with an inquiry.')}`
      },
      chips: [
        { id: 'track', label: 'Track Order', query: 'How do I track my order?' },
        { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
      ]
    };
  }

  // 2. Track Order / Order status
  if (
    q.includes('track') || 
    q.includes('status') || 
    q.includes('where is my') || 
    q.includes('awb') || 
    q.includes('courier') ||
    q.includes('dispatch') ||
    q.includes('order') ||
    /\b(jj-[a-z0-9]+|ord-[a-z0-9]+|\d{4,8})\b/i.test(q)
  ) {
    return {
      text: "**Order Tracking & Updates**:\n\n• Orders are dispatched within **24–48 hours** via express couriers (Delhivery, Bluedart, DTDC, Xpressbees).\n• Once dispatched, your live AWB tracking link is sent via SMS & email.\n• Average delivery takes **3 to 7 business days** across India.\n\nYou can check your order status right here using our live order tracker:",
      eventButton: {
        text: "Open Live Order Tracker",
        eventName: "jj_open_track_modal"
      },
      linkButton: {
        text: "Ask Agent About My Order",
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Jersey Junction Support! Can you please check the status of my order?')}`
      },
      chips: [
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
        { id: 'returns', label: 'Returns Policy', query: 'What is your return policy?' },
        { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
      ]
    };
  }

  // 3. Size & Fit
  if (
    q.includes('size') || 
    q.includes('sizing') || 
    q.includes('fit') || 
    q.includes('chest') || 
    q.includes('measurement') || 
    q.includes('small') || 
    q.includes('medium') || 
    q.includes('large') || 
    q.includes('xl') || 
    q.includes('xxl') || 
    q.includes('player version') || 
    q.includes('fan version')
  ) {
    return {
      text: "**Sizing & Fit Guide**:\n\n• **Fan Version (Stadium)**: Standard regular fit. True to size — select your usual t-shirt size.\n• **Player Version (Match)**: Athletic slim fit with tapered cut. If you prefer a relaxed or regular fit, we recommend going **1 size up**.\n\n**Approximate Chest Sizing:**\n• Small (S): 38 inches\n• Medium (M): 40 inches\n• Large (L): 42 inches\n• X-Large (XL): 44 inches\n• XXL: 46 inches",
      chips: [
        { id: 'custom', label: 'Custom Printing', query: 'Can I print custom name and number?' },
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
        { id: 'human', label: 'Ask Agent for Advice', query: 'I need sizing advice from an agent' },
      ]
    };
  }

  // 4. Delivery & Shipping
  if (
    q.includes('deliver') || 
    q.includes('shipping') || 
    q.includes('how long') || 
    q.includes('time') || 
    q.includes('days') || 
    q.includes('pincode') || 
    q.includes('express') ||
    q.includes('arrive')
  ) {
    return {
      text: "**Shipping & Delivery Timelines**:\n\n• **Processing Time**: 24 to 48 hours for standard & custom printed kits.\n• **Estimated Transit**: 3 to 7 business days across India.\n• **Couriers**: Express air shipping via Bluedart, Delhivery, DTDC & Xpressbees.\n• All orders include SMS & email tracking updates directly to your phone.",
      chips: [
        { id: 'track', label: 'Track Order', query: 'How do I track my order?' },
        { id: 'cod', label: 'COD Available?', query: 'Is Cash on Delivery available?' },
        { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
      ]
    };
  }

  // 5. COD & Payment
  if (
    q.includes('cod') || 
    q.includes('cash on delivery') || 
    q.includes('pay') || 
    q.includes('payment') || 
    q.includes('upi') || 
    q.includes('gpay') || 
    q.includes('phonepe') || 
    q.includes('card') || 
    q.includes('netbanking')
  ) {
    return {
      text: "**Payment Methods & Cash on Delivery**:\n\n• **Cash on Delivery (COD)**: Available on eligible pincodes throughout India.\n• **Prepaid Options**: UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking.\n• 100% secure encrypted checkout with instant digital order confirmation.",
      chips: [
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
        { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
        { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
      ]
    };
  }

  // 6. Customization
  if (
    q.includes('custom') || 
    q.includes('name') || 
    q.includes('number') || 
    q.includes('print') || 
    q.includes('printing') || 
    q.includes('font') || 
    q.includes('patch') || 
    q.includes('badge')
  ) {
    return {
      text: "**Custom Name & Number Printing**:\n\n• We use **official league & club typography** (Premier League, UCL, La Liga, etc.).\n• Premium commercial vinyl heat-pressed onto the jersey, highly resistant to wash wear.\n• You can enter any custom name and up to 2-digit number directly when adding to cart or in the **Custom Studio** lab.",
      chips: [
        { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
        { id: 'human', label: 'Custom Jersey Query', query: 'Can I get custom design help from an agent?' },
      ]
    };
  }

  // 7. Returns & Refunds
  if (
    q.includes('return') || 
    q.includes('refund') || 
    q.includes('exchange') || 
    q.includes('replace') || 
    q.includes('cancel') || 
    q.includes('damaged') || 
    q.includes('defect')
  ) {
    return {
      text: "**Returns & Exchanges Policy**:\n\n• **7-Day Policy**: We exchange or refund items that arrive damaged, defective, or incorrect within 7 days of delivery.\n• Garments must be unworn, unwashed, and in original packaging with tags.\n• *Note: Personalized jerseys with custom names/numbers cannot be returned unless defective.*",
      linkButton: {
        text: "Contact Agent for Return Request",
        url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Jersey Junction Support! I would like to request an exchange or return for my order.')}`
      },
      chips: [
        { id: 'track', label: 'Track Order', query: 'How do I track my order?' },
        { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
        { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
      ]
    };
  }

  // 8. Quality & Authenticity
  if (
    q.includes('quality') || 
    q.includes('material') || 
    q.includes('fabric') || 
    q.includes('original') || 
    q.includes('authentic') || 
    q.includes('replica') || 
    q.includes('embroidery')
  ) {
    return {
      text: "**Fabric & Quality Guarantee**:\n\n• Crafted with 100% breathable, moisture-wicking Dri-FIT polyester.\n• High-definition embroidered club crests, federation crests, and authentic sponsor details.\n• Designed to provide maximum matchday comfort and durability.",
      chips: [
        { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
        { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
        { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
      ]
    };
  }

  // 9. Greeting / Start
  if (
    q.includes('hi') || 
    q.includes('hello') || 
    q.includes('hey') || 
    q.includes('namaste') || 
    q.includes('start') || 
    q.includes('help')
  ) {
    return {
      text: "Hello! Welcome to Jersey Junction.\n\nI am your 24/7 Virtual Support Assistant. How can I help you today? Choose one of the quick topics below or ask any question:",
      chips: INITIAL_CHIPS
    };
  }

  // 10. Fallback
  return {
    text: "Thank you for reaching out. I am here to assist you with anything regarding jerseys, sizing, orders, or delivery.\n\nFeel free to choose a quick topic below, or tap to chat directly with our live support agent:",
    linkButton: {
      text: "Chat with Live Agent",
      url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Jersey Junction Support! I have a question: ' + userQuery)}`
    },
    chips: [
      { id: 'track', label: 'Track Order', query: 'How do I track my order?' },
      { id: 'size', label: 'Size & Fit Guide', query: 'What size should I choose?' },
      { id: 'delivery', label: 'Delivery Timelines', query: 'How long does shipping take?' },
      { id: 'human', label: 'Chat with Human Agent', query: 'I want to talk to a live human agent' },
    ]
  };
}

function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 text-[11.5px] leading-relaxed">
              <span className="text-emerald-400 font-bold leading-tight select-none">•</span>
              <span className="flex-1">{formatted}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[12px] leading-relaxed">
            {formatted}
          </p>
        );
      })}
    </div>
  );
}

export function WhatsAppHelpButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('916001142358');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I am your **Jersey Junction Virtual Assistant**.\n\nHow can I help you today? Choose one of the quick options below or type your question:",
      time: getCurrentTime(),
      chips: INITIAL_CHIPS
    }
  ]);

  useEffect(() => {
    const loadNum = () => {
      const s = settingsService.getSettings();
      const raw = s.storeWhatsapp || s.storePhone || '916001142358';
      const clean = raw.replace(/\D/g, '');
      const withCountry = clean.startsWith('91') ? clean : (clean.length === 10 ? `91${clean}` : clean);
      setWhatsappNumber(withCountry || '916001142358');
    };

    loadNum();
    settingsService.fetchSettingsAsync().then(loadNum);

    const onUpdate = () => loadNum();
    window.addEventListener('jj_store_settings_updated', onUpdate);
    return () => window.removeEventListener('jj_store_settings_updated', onUpdate);
  }, []);

  // Listen for open bot event from anywhere in the app (e.g. Navbar or links)
  useEffect(() => {
    const handleOpenBot = () => {
      setIsOpen(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    };

    window.addEventListener('jj_open_agent_bot', handleOpenBot);
    return () => window.removeEventListener('jj_open_agent_bot', handleOpenBot);
  }, []);

  // Auto-scroll when messages change or typing state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Do not render floating button on admin dashboard pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic bot response delay
    setTimeout(() => {
      const reply = generateBotReply(query, whatsappNumber);
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: reply.text,
        time: getCurrentTime(),
        chips: reply.chips,
        linkButton: reply.linkButton,
        eventButton: reply.eventButton
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: "Hi! I am your **Jersey Junction Virtual Assistant**.\n\nHow can I help you today? Choose one of the quick options below or type your question:",
        time: getCurrentTime(),
        chips: INITIAL_CHIPS
      }
    ]);
  };

  const handleTriggerEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  return (
    <>
      {/* Bot Chat Window Popup */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-6 sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] z-50 flex flex-col rounded-2xl sm:rounded-3xl bg-[#0c0c0c] border border-emerald-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(16,185,129,0.15)] overflow-hidden font-sans select-none animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="Jersey Junction Support Bot"
        >
          {/* Header */}
          <div className="h-16 shrink-0 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-900 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Headset className="w-5 h-5 text-emerald-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-white">Jersey Junction Bot</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Agent Online • Instant Help
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart chat"
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close bot"
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs ${
                      isBot 
                        ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm shadow-md' 
                        : 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-950/40 font-medium'
                    }`}
                  >
                    <FormattedMessageText text={msg.text} />

                    {/* Optional Event Button (e.g. Open Order Tracker) */}
                    {msg.eventButton && (
                      <div className="mt-3 pt-2 border-t border-zinc-800/80">
                        <button
                          onClick={() => handleTriggerEvent(msg.eventButton!.eventName)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                        >
                          <span>{msg.eventButton.text}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Optional Link Button (e.g. Chat with Live Human Agent) */}
                    {msg.linkButton && (
                      <div className="mt-3 pt-2 border-t border-zinc-800/80">
                        <a
                          href={msg.linkButton.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
                        >
                          <Headset className="w-3.5 h-3.5" />
                          <span>{msg.linkButton.text}</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-zinc-500 font-mono mt-1 px-1">
                    {msg.time}
                  </span>

                  {/* Suggestion Chips */}
                  {isBot && msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => handleSendMessage(chip.query)}
                          className="px-2.5 py-1.5 rounded-full bg-zinc-900 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-zinc-900 border border-zinc-800 text-zinc-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-zinc-950/95 border-t border-white/10 shrink-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sizing, delivery, orders..."
                disabled={isTyping}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[9px] text-zinc-500 text-center font-mono">
              Powered by Jersey Junction Assistant • Instant 24/7 answers
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button & Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none font-sans">
        
        {/* Tooltip Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/95 border border-emerald-500/30 text-white text-xs font-bold shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-400 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200">{isOpen ? 'Close Bot' : 'Agent Help'}</span>
        </button>

        {/* Floating Action Circular Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Agent Help' : 'Open Agent Help Bot'}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          {/* Radar ping ring when bot is closed */}
          {!isOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-30 animate-ping" />
          )}
          
          {isOpen ? (
            <X className="w-6 h-6 relative z-10 transition-transform duration-200" />
          ) : (
            <Headset className="w-7 h-7 relative z-10 transition-transform duration-200" />
          )}
        </button>
      </div>
    </>
  );
}
