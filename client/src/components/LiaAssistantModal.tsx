import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';

export default function LiaAssistantModal({
  isOpen,
  onClose,
  hotspotCount = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  hotspotCount?: number;
}) {
  const [messages, setMessages] = useState<Array<{ sender: 'lia' | 'user'; text: string; time: string }>>([
    {
      sender: 'lia',
      text: `Hello! I am LIA, your FIREWEAVE Wildfire Intelligence AI Assistant. We currently have ${hotspotCount.toLocaleString()} active thermal hotspots ingested from NASA FIRMS satellites. How can I assist with wildfire spread projections, risk assessment, or evacuation routes?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user' as const, text: userText, time: 'Just now' }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let reply = 'Intelligence data is being processed through the predictive risk engine.';
      const lower = userText.toLowerCase();

      if (lower.includes('hotspot') || lower.includes('fire') || lower.includes('nasa')) {
        reply = `NASA FIRMS feeds (VIIRS & MODIS) indicate severe thermal radiative power concentrations over peatland vegetation. Ground containment teams and aerial water bombers have been assigned.`;
      } else if (lower.includes('evacuat') || lower.includes('route') || lower.includes('safe')) {
        reply = `Active evacuation corridors are directed through the western safe sector. Designated assembly shelters are situated > 5 km outside the danger perimeter.`;
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('wind')) {
        reply = `Average regional rainfall is 12.4mm with soil moisture at 67.2%. Sustained wind speeds of 14 km/h may accelerate smoke dispersion south-westward.`;
      } else if (lower.includes('status') || lower.includes('system')) {
        reply = `System operational status: Normal. Active satellites: Terra, Aqua, Suomi-NPP, NOAA-20, NOAA-21. Ground sensor health is 179/180 online.`;
      } else {
        reply = `Instruction received: Spatial wildfire risk parameters and regional response matrices have been updated across FIREWEAVE command modules.`;
      }

      setMessages((prev) => [...prev, { sender: 'lia', text: reply, time: 'Just now' }]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '1.5rem', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid var(--border-app)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', height: '520px', maxHeight: '90vh', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'var(--bg-navy-hero)', color: '#ffffff', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 800, fontSize: '0.875rem' }}>
                <span>Ask LIA</span>
                <span className="pulse-dot-green" />
              </div>
              <div style={{ fontSize: '0.625rem', color: 'rgba(255, 255, 255, 0.75)' }}>Wildfire Intelligence AI</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', border: 'none', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat message stream */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  borderRadius: '1rem',
                  padding: '0.75rem 0.875rem',
                  fontSize: '0.75rem',
                  lineHeight: 1.45,
                  backgroundColor: msg.sender === 'user' ? 'var(--text-navy)' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-app)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {msg.text}
              </div>
              <span style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '2px', padding: '0 4px' }}>{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Input box */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-app)', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about wildfire risk, satellites, or evacuation..."
            style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid var(--border-app)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#1e293b', outline: 'none' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            style={{ width: '2rem', height: '2rem', borderRadius: '0.75rem', backgroundColor: 'var(--bg-navy-hero)', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
