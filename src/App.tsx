import React, { useState, useEffect, useRef } from 'react';
import { analyzeSymptoms, getHospitalRecommendation } from './utils/symptom_analyzer';
import type { AnalysisResult, DiseaseMatch } from './utils/symptom_analyzer';
import type { Hospital } from './data/hospitals';
import { hospitals } from './data/hospitals';
import './index.css';

type Lang = 'en' | 'hi' | 'mr';
type MessageType = 'welcome' | 'text' | 'hospital' | 'alert' | 'booking-form' | 'booking-confirm' | 'map-direction' | 'condition-card' | 'emergency-card';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  type?: MessageType;
  data?: any;
}

const T = {
  en: {
    placeholder: 'Describe symptoms or ask anything...',
    language: 'LANGUAGE',
    marqueeAlert: 'Nagpur Region: High mosquito activity reported this week',
    marqueeTips: '💧 Drink 8 glasses of water daily · 🤲 Wash hands 20 sec before eating · 🦟 Use mosquito nets at night · 🩺 Report lingering fever immediately'
  },
  hi: {
    placeholder: 'लक्षण बताएं या कुछ भी पूछें...',
    language: 'भाषा',
    marqueeAlert: 'नागपुर क्षेत्र: इस सप्ताह मच्छरों की उच्च गतिविधि',
    marqueeTips: '💧 रोज 8 गिलास पानी पिएं · 🤲 खाने से पहले 20 सेकंड हाथ धोएं · 🦟 रात में मच्छरदानी का प्रयोग करें'
  },
  mr: {
    placeholder: 'लक्षणे सांगा किंवा काहीही विचारा...',
    language: 'भाषा',
    marqueeAlert: 'नागपूर विभाग: या आठवड्यात डासांचा प्रादुर्भाव वाढला आहे',
    marqueeTips: '💧 दररोज 8 ग्लास पाणी प्या · 🤲 जेवण्यापूर्वी 20 सेकंद हात धुवा · 🦟 रात्री मच्छरदाणी वापरा'
  }
};

const getIconForDisease = (name: string) => {
  if(name.includes('Dengue') || name.includes('Malaria')) return '🦟';
  if(name.includes('Flu')) return '🤧';
  if(name.includes('Migraine')) return '🧠';
  return '🦠';
};

const getColorForScore = (score: number) => {
  if(score >= 80) return '#EF4444'; // Red
  if(score >= 50) return '#F59E0B'; // Orange
  return '#10B981'; // Green
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: '', type: 'welcome' }
  ]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [bookingData, setBookingData] = useState({ name: '', phone: '', date: '', dept: 'General OPD', hospitalInfo: null as Hospital | null });
  const [desktopView, setDesktopView] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = T[lang];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const botReply = (text: string, type: MessageType = 'text', data?: any, delay = 1000) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text, type, data }]);
    }, delay);
  };

  const handleSend = (overrideInput?: string) => {
    const textToProcess = overrideInput || input.trim();
    if (!textToProcess) return;

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: textToProcess, type: 'text' }]);
    setInput('');

    const result = analyzeSymptoms(textToProcess);

    if (result.matches.length > 0) {
      botReply("", 'condition-card', result, 800);
      const sorted = getHospitalRecommendation(hospitals);
      botReply('', 'hospital', sorted, result.riskLevel === 'High' ? 2000 : 1600);
    } else {
      botReply("I couldn't identify the condition. Try saying: 'fever and headache'", 'text', null, 1000);
    }
  };

  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      botReply("⚠️ Speech recognition is not supported in this browser. Please use Chrome/Edge.", "text");
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';
    recognition.onstart = () => { setIsListening(true); setInput(''); };
    recognition.onresult = (e: any) => { 
      const transcript = e.results[0][0].transcript;
      setInput(transcript); 
      setIsListening(false);
      handleSend(transcript);
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      botReply(`⚠️ Mic Error: ${e.error}. Please check Windows Privacy Settings or plug in a microphone.`, "text");
    };
    recognition.onend = () => setIsListening(false);
    try { recognition.start(); } catch (e) {
      setIsListening(false);
      botReply(`⚠️ Could not start microphone.`, "text");
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'symptom') handleSend("fever ache");
    else if (action === 'hospital') botReply('', 'hospital', getHospitalRecommendation(hospitals), 500);
    else if (action === 'disease') botReply("Dengue is currently high risk in Nagpur.", "text", null, 500);
    else if (action === 'book') handleBookNow(hospitals[0]);
  };

  const handleBookNow = (hospital: Hospital) => {
    setBookingData({ ...bookingData, hospitalInfo: hospital });
    botReply('', 'booking-form', hospital, 200);
  };

  const handleNavigate = (hospital: Hospital) => {
    botReply(`Get directions to ${hospital.name}`, 'map-direction', hospital, 100);
    // Wait briefly for the UI to show the message, then open Google Maps
    setTimeout(() => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`, '_blank');
    }, 1200);
  };

  const handleConfirmBooking = () => {
    setMessages(prev => prev.map(m => m.type === 'booking-form' ? { ...m, type: 'text', text: "📝 Booking form submitted." } : m));
    botReply(`✅ **Appointment Confirmed!**\n\nHospital: ${bookingData.hospitalInfo?.name}\nName: ${bookingData.name}\nTime: ${bookingData.date}`, 'text', null, 500);
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'welcome') {
      return (
        <div className="welcome-card">
          <h2>🙏 Namaste! I'm ArogyaBot</h2>
          <p className="welcome-desc">Your <strong>AI-powered public health assistant</strong> for Nagpur & Maharashtra. I speak English, Hindi & Marathi. How can I help you?</p>
          <div className="action-grid">
            <div className="action-card" onClick={() => handleQuickAction('symptom')}>
              <span className="icon-placeholder">🩺</span><span>Symptom Check</span>
            </div>
            <div className="action-card" onClick={() => handleQuickAction('hospital')}>
              <span className="icon-placeholder">🏥</span><span>Find Hospital</span>
            </div>
            <div className="action-card" onClick={() => handleQuickAction('disease')}>
              <span className="icon-placeholder">📚</span><span>Disease Info</span>
            </div>
            <div className="action-card" onClick={() => handleQuickAction('book')}>
              <span className="icon-placeholder">📅</span><span>Book Appointment</span>
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === 'condition-card') {
      const res: AnalysisResult = msg.data;
      const top = res.topMatch!;
      return (
        <div className="condition-card">
          <div className="condition-header" style={{background: res.riskLevel === 'High' ? '#034f40' : '#0369A1'}}>
            <span>🔴 Possible Conditions</span>
            <span className="risk-pill" style={{color: res.riskLevel === 'High' ? '#BE123C' : '#0369A1', background: res.riskLevel === 'High' ? '#FFE4E6' : '#E0F2FE'}}>
              {res.riskLevel.toUpperCase()}
            </span>
          </div>
          <div className="condition-list">
            {res.matches.slice(0, 4).map((m: DiseaseMatch, i) => (
              <div key={i} className="condition-item">
                <div className="cond-info">
                  <span>{getIconForDisease(m.disease.name.en)}</span>
                  <span>{m.disease.name[lang]}</span>
                </div>
                <div className="cond-progress-wrap">
                  <span className="cond-pct" style={{color: getColorForScore(m.probability)}}>{m.probability}%</span>
                  <div className="cond-bar-bg">
                    <div className="cond-bar-fill" style={{width: `${m.probability}%`, background: getColorForScore(m.probability)}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="top-match-card">
            <div className="tm-title">TOP MATCH · {top.name.en.toUpperCase()}</div>
            <div className="tm-desc">{top.description[lang]}</div>
            <div className="tm-prevent">🛡️ {top.prevention[lang]}</div>
          </div>
          {res.riskLevel === 'High' && (
            <div className="high-risk-alert">
              <div className="hr-icon">🚨</div>
              <div>
                <div className="hr-title">High Risk Detected!</div>
                <div className="hr-desc">Visit hospital immediately. Free ambulance: <strong>108</strong></div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (msg.type === 'hospital') {
      const hData: Hospital[] = msg.data;
      return (
        <div style={{width: '100%'}}>
          <div className="hospital-list-header">🏥 Nearby Hospitals <span className="hl-sub">(govt-first · distance)</span></div>
          {hData.slice(0, 2).map((h, i) => (
            <div key={h.id} className="hosp-card">
              <div className="hosp-top">
                <div className="hosp-num">{i + 1}</div>
                <div>
                  <div className="hosp-name">{h.name}</div>
                  <div className="hosp-stats">
                    <span>📍 {h.distance} km</span>
                    <span>⭐ {h.rating}</span>
                    <span>🛏️ {h.beds} beds</span>
                  </div>
                  <div className="hosp-badges">
                    {h.type === 'Government' && <span className="h-badge-gov">🏛 GOVT</span>}
                    <span className="h-badge-cost">✓ LOW COST</span>
                  </div>
                </div>
              </div>
              <div className="hosp-features">
                💰 {h.priceInfo} · 🩺 {h.facilities}
              </div>
              <div className="hosp-actions">
                <button className="h-btn nav" onClick={() => handleNavigate(h)}>🧭 Navigate</button>
                <button className="h-btn book" onClick={() => handleBookNow(h)}>📅 Book</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (msg.type === 'map-direction') {
      const h: Hospital = msg.data;
      return (
        <div className="directions-bubble" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`, '_blank')} style={{cursor: 'pointer'}}>
          <div className="dir-top">
            <div className="dir-pin">📍</div>
            <div className="dir-text">
              <h4>{h.name}</h4>
              <p>Tap to open turn-by-turn navigation</p>
            </div>
            <div className="dir-arrow">→</div>
          </div>
          <div className="dir-bottom">
            🚗 Estimated {Math.round(h.distance * 3)}-{Math.round(h.distance * 5)} min by car
          </div>
        </div>
      );
    }

    if (msg.type === 'emergency-card') {
      return (
        <div className="emergency-card">
          <div className="ec-title">🚨 Emergency Services</div>
          <div className="ec-item"><span className="ec-icon">🚑</span><span className="ec-label">Ambulance:</span><a href="tel:108" className="ec-number">108</a></div>
          <div className="ec-sub">(Free)</div>
          <div className="ec-divider" />
          <div className="ec-item"><span className="ec-icon">🚓</span><span className="ec-label">Police:</span><a href="tel:100" className="ec-number">100</a></div>
          <div className="ec-divider" />
          <div className="ec-item"><span className="ec-icon">🚒</span><span className="ec-label">Fire:</span><a href="tel:101" className="ec-number">101</a></div>
          <div className="ec-divider" />
          <div className="ec-item"><span className="ec-icon">☎</span><span className="ec-label">Health Helpline:</span><a href="tel:1800111565" className="ec-number">1800-111-565</a></div>
        </div>
      );
    }

    if (msg.type === 'booking-form') {
      const h: Hospital = msg.data;
      return (
        <div className="booking-form">
          <div className="bf-title">📅 Book Appointment</div>
          <div className="bf-hosp-info">
            <h4>{h.name}</h4>
            <p>🏢 {h.type} · 💰 {h.priceInfo} · 🩺 {h.facilities}</p>
          </div>
          
          <div className="form-group">
            <div className="form-label">👤 FULL NAME</div>
            <input className="form-input" placeholder="Your full name" value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <div className="form-label">📱 PHONE NUMBER</div>
            <input className="form-input" placeholder="+91 XXXXX XXXXX" value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <div className="form-label">🕑 DATE & TIME</div>
            <input type="datetime-local" className="form-input" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <div className="form-label">🩺 DEPARTMENT</div>
            <select className="form-input" value={bookingData.dept} onChange={e => setBookingData({...bookingData, dept: e.target.value})}>
              <option>General OPD</option>
              <option>Emergency</option>
              <option>Fever Clinic</option>
            </select>
          </div>
          
          <button className="bf-submit" onClick={handleConfirmBooking}>✓ Confirm Appointment</button>
        </div>
      );
    }

    return <span dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />;
  };

  return (
    <>
      <div className="view-toggle-container">
        <button className={`view-btn ${!desktopView ? 'active' : ''}`} onClick={() => setDesktopView(false)}>📱 Mobile View</button>
        <button className={`view-btn ${desktopView ? 'active' : ''}`} onClick={() => setDesktopView(true)}>💻 Desktop View</button>
      </div>

      <div className={`app-shell ${desktopView ? 'desktop-view' : 'mobile-view'}`}>
        
        {desktopView && (
          <div className="desktop-sidebar">
            <h2 style={{ color: '#034f40', fontSize: '1.5rem', fontWeight: 800 }}>ArogyaBot Panel</h2>
            <p style={{ color: '#64748B', marginTop: '10px', fontSize: '0.9rem' }}>Desktop view expands the app, providing a two-column layout perfect for clinical or wide-screen monitoring.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
          
          {/* HEADER */}
          <header className="arogya-header">
            <div className="header-top">
              <div className="logo-section">
                <div className="app-icon">🏥</div>
                <div className="brand-info">
                  <h1>ArogyaBot</h1>
                  <div className="bot-status"><span className="status-dot"></span> AI Public Health Assistant · Active</div>
                  <div className="badge-row">
                    <span className="header-badge">⚡ AI POWERED</span>
                    <span className="header-badge" style={{color: '#93C5FD', borderColor: 'rgba(147, 197, 253, 0.4)', background: 'rgba(147, 197, 253, 0.1)'}}>🌐 {lang.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="header-actions">
                <div className="icon-circle call">📞</div>
                <div className="icon-circle">⋮</div>
              </div>
            </div>

            <div className="lang-bar">
              <span className="lang-label">{t.language}</span>
              <div className="lang-pills">
                <button className={`lang-pill ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
                <button className={`lang-pill ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिं</button>
                <button className={`lang-pill ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मرا</button>
              </div>
            </div>

            <div className="alert-marquee">
              <span className="alert-pill">⚠ ALERT</span>
              <div className="alert-marquee-container">
                <div className="alert-marquee-content">{t.marqueeAlert}</div>
              </div>
            </div>
            
            <div className="tips-marquee">
              <span>💡</span>
              <div className="tips-marquee-container">
                <div className="tips-marquee-content">{t.marqueeTips}</div>
              </div>
            </div>
          </header>

          {/* CHAT BODY */}
          <main className="chat-body">
            <div className="timestamp-pill">Today, 9:00 AM</div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={['condition-card', 'hospital', 'booking-form', 'map-direction', 'welcome', 'emergency-card'].includes(msg.type || '') ? '' : `msg-wrap ${msg.sender}`} style={['condition-card', 'hospital', 'booking-form', 'map-direction', 'welcome', 'emergency-card'].includes(msg.type || '') ? {width: '100%'} : {}}>
                {['condition-card', 'hospital', 'booking-form', 'map-direction', 'welcome', 'emergency-card'].includes(msg.type || '') ? (
                  renderMessageContent(msg)
                ) : (
                  <div className={`bubble ${msg.sender}`}>
                    {msg.sender === 'bot' && <div className="bot-tiny-avatar">🏥</div>}
                    {renderMessageContent(msg)}
                  </div>
                )}
                {!['condition-card', 'hospital', 'booking-form', 'map-direction', 'welcome', 'emergency-card'].includes(msg.type || '') && (
                  <span className="msg-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>

          {/* FLOATING EMERGENCY */}
          <button className="floating-emergency" onClick={() => botReply('', 'emergency-card', null, 100)}>
            <div className="pulsing-dot"></div> 🚨 EMERGENCY
          </button>

          {/* FOOTER */}
          <footer className="chat-footer">
            <div className="input-pill">
              <button className="attach-btn">📎</button>
              <input className="chat-input" placeholder={t.placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button className="emoji-btn">😊</button>
            </div>
            
            {input.trim() ? (
               <button className="mic-btn" onClick={() => handleSend()}>➤</button>
            ) : (
               <button className="mic-btn" onClick={startListening} style={isListening ? { background: '#F0444D', animation: 'pulse 1s infinite' } : {}}>
                 {isListening ? '🔴' : '🎤'}
               </button>
            )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
