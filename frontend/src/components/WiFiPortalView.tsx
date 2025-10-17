import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface WiFiPortalData {
  title: string;
  ssid: string;
  password: string;
  security: string;
  instructions: string;
  slug: string;
}

const WiFiPortalView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [portal, setPortal] = useState<WiFiPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wifi-portal/public/${slug}`);
        if (response.data.success) {
          setPortal(response.data.portal);
        } else {
          setError('Portal not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load WiFi portal');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPortal();
    }
  }, [slug]);

  const copyPassword = async () => {
    if (portal?.password) {
      try {
        await navigator.clipboard.writeText(portal.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '18px',
          color: 'white',
          textAlign: 'center'
        }}>
          Loading WiFi information...
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>❌</div>
          <h2 style={{ color: '#EF4444', marginBottom: '12px' }}>Portal Not Found</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* WiFi Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <svg
            style={{ width: '80px', height: '80px', margin: '0 auto', color: '#4F46E5' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          {portal.title}
        </h1>

        {/* Instructions */}
        <p style={{
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          {portal.instructions}
        </p>

        {/* Network Information */}
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          {/* Network Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Network Name (SSID)
            </label>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              fontFamily: 'monospace'
            }}>
              {portal.ssid}
            </div>
          </div>

          {/* Password */}
          {portal.security !== 'nopass' && portal.password && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  flex: 1,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {portal.password}
                </div>
                <button
                  onClick={copyPassword}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: copied ? '#10B981' : '#4F46E5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {portal.security === 'nopass' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#10B981',
                fontStyle: 'italic'
              }}>
                No password required - Open Network
              </div>
            </div>
          )}

          {/* Security Type */}
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: '#E0E7FF',
            color: '#4F46E5',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {portal.security}
          </div>
        </div>

        {/* Connection Instructions Button */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showInstructions ? '16px' : '0'
          }}
        >
          <span>📱 How to Connect</span>
          <span style={{ fontSize: '18px' }}>{showInstructions ? '▲' : '▼'}</span>
        </button>

        {/* Connection Instructions (Expandable) */}
        {showInstructions && (
          <div style={{
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            padding: '20px',
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.8'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#111827', display: 'block', marginBottom: '8px' }}>📱 iOS / iPhone:</strong>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Go to Settings → WiFi</li>
                <li>Select "{portal.ssid}"</li>
                {portal.security !== 'nopass' && <li>Enter the password shown above</li>}
                <li>Tap "Join"</li>
              </ol>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#111827', display: 'block', marginBottom: '8px' }}>📱 Android:</strong>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Go to Settings → WiFi</li>
                <li>Select "{portal.ssid}"</li>
                {portal.security !== 'nopass' && <li>Enter the password shown above</li>}
                <li>Tap "Connect"</li>
              </ol>
            </div>

            <div>
              <strong style={{ color: '#111827', display: 'block', marginBottom: '8px' }}>💻 Windows / Mac:</strong>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Click WiFi icon in taskbar/menu bar</li>
                <li>Select "{portal.ssid}"</li>
                {portal.security !== 'nopass' && <li>Enter the password</li>}
                <li>Click "Connect"</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            margin: 0
          }}>
            Need help? Contact staff for assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default WiFiPortalView;
