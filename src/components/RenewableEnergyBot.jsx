import { useEffect, useRef } from 'react';

export default function RenewableEnergyBot({ showBot, onClose }) {
  const webchatRef = useRef(null);

  useEffect(() => {
    if (showBot && webchatRef.current) {
      // Wait for botpress to load if not available yet
      const initBotpress = () => {
        if (window.botpress && !webchatRef.current.hasChildNodes()) {
          // Create the webchat div
          const webchatDiv = document.createElement('div');
          webchatDiv.id = 'webchat';
          webchatDiv.style.width = '100%';
          webchatDiv.style.height = '100%';
          webchatRef.current.appendChild(webchatDiv);

          // Initialize Botpress
          window.botpress.init({
            "botId": "a659d7f6-8ccd-46ca-acd3-44da9fd0f8e4",
            "configuration": {
              "version": "v2",
              "botName": "🌱 Renewable Energy Assistant",
              "botDescription": "I can help you learn about solar, wind, hydro, geothermal, and other renewable energy sources!",
              "website": {},
              "email": {},
              "phone": {},
              "termsOfService": {},
              "privacyPolicy": {},
              "color": "#22c55e",
              "variant": "solid",
              "headerVariant": "glass",
              "themeMode": "light",
              "fontFamily": "inter",
              "radius": 4,
              "feedbackEnabled": true,
              "footer": "[⚡ Powered by Renewable Energy](https://botpress.com/?from=webchat)",
              "soundEnabled": true
            },
            "clientId": "15366923-77da-4310-b16f-b8026c829404",
            "selector": "#webchat"
          });

          // Open the webchat when ready
          window.botpress.on("webchat:ready", () => {
            window.botpress.open();
          });
        } else if (!window.botpress) {
          // Retry after a short delay if botpress isn't loaded yet
          setTimeout(initBotpress, 100);
        }
      };

      initBotpress();
    }
  }, [showBot]);

  if (!showBot) {
    return null;
  }

  return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '380px',
          height: '550px',
          zIndex: 1000,
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          background: 'white'
        }}
      >
        {/* Custom header */}
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '15px 20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '15px 15px 0 0'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🌱 Renewable Energy Assistant
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12px',
              opacity: 0.8,
              marginTop: '2px'
            }}>
              Ask me about clean energy solutions!
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Botpress Webchat Container */}
        <div
          ref={webchatRef}
          style={{
            height: 'calc(100% - 71px)',
            position: 'relative'
          }}
        />
      </div>
  );
}