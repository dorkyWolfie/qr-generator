import React, { useState, useCallback } from 'react';
import { wifiPortalAPI } from '../services/api';

interface CreateWiFiPortalModalProps {
  onClose: () => void;
  onCreate: () => void;
}

const CreateWiFiPortalModal: React.FC<CreateWiFiPortalModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState('WPA2');
  const [instructions, setInstructions] = useState('Welcome! Connect to our WiFi network using the credentials below.');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkSlugAvailability = useCallback(async (inputSlug: string) => {
    if (!inputSlug.trim()) {
      setSlugStatus('idle');
      return;
    }

    const normalizedSlug = inputSlug.toLowerCase().trim();

    if (!/^[a-z0-9-]{3,50}$/.test(normalizedSlug)) {
      setSlugStatus('invalid');
      return;
    }

    setSlugStatus('checking');

    try {
      const result = await wifiPortalAPI.checkSlug(normalizedSlug);
      setSlugStatus(result.available ? 'available' : 'taken');
    } catch (error) {
      setSlugStatus('invalid');
    }
  }, []);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSlug(value);

    const timeoutId = setTimeout(() => {
      checkSlugAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !slug.trim() || !ssid.trim()) {
      setError('Title, slug, and SSID are required');
      return;
    }

    if (security !== 'nopass' && !password.trim()) {
      setError('Password is required for secured networks');
      return;
    }

    if (slugStatus !== 'available') {
      setError('Please choose a valid and available slug');
      return;
    }

    setLoading(true);

    try {
      await wifiPortalAPI.create({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        ssid: ssid.trim(),
        password: password,
        security,
        instructions: instructions.trim()
      });
      onCreate();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create WiFi portal');
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const generateSlugFromTitle = () => {
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    setSlug(generatedSlug);
    checkSlugAvailability(generatedSlug);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        overflow: 'auto'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        overflow: 'auto',
        maxHeight: '90%',
        maxWidth: '600px',
        margin: '20px auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          marginBottom: '16px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
              marginBottom: '4px'
            }}>Create WiFi Portal</h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0
            }}>Share WiFi credentials via QR code and web portal</p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#9CA3AF',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#4B5563'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Portal Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '98%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="e.g., Coffee Shop Guest WiFi"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Portal URL Slug *
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={handleSlugChange}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${
                    slugStatus === 'available' ? '#10B981' :
                    slugStatus === 'taken' || slugStatus === 'invalid' ? '#EF4444' :
                    '#D1D5DB'
                  }`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="cafe-guest-wifi"
                required
              />
              <button
                type="button"
                onClick={generateSlugFromTitle}
                disabled={!title.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: title.trim() ? '#6366F1' : '#D1D5DB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: title.trim() ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap'
                }}
              >
                Auto-generate
              </button>
            </div>
            {slugStatus !== 'idle' && (
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                color:
                  slugStatus === 'available' ? '#10B981' :
                  slugStatus === 'taken' || slugStatus === 'invalid' ? '#EF4444' :
                  '#6B7280'
              }}>
                {slugStatus === 'checking' && '⏳ Checking availability...'}
                {slugStatus === 'available' && '✅ This slug is available!'}
                {slugStatus === 'taken' && '❌ This slug is already taken'}
                {slugStatus === 'invalid' && '❌ Invalid format. Use 3-50 lowercase letters, numbers, and hyphens'}
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Portal URL: {process.env.REACT_APP_CLIENT_URL || window.location.origin}/wifi/{slug || 'your-slug'}
            </p>
          </div>

          <div style={{
            backgroundColor: '#F9FAFB',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#111827',
              marginTop: 0,
              marginBottom: '12px'
            }}>WiFi Network Details</h3>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="ssid" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Network Name (SSID) *
              </label>
              <input
                id="ssid"
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                maxLength={32}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Your WiFi Network Name"
                required
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Password {security !== 'nopass' ? '*' : '(not needed for open networks)'}
              </label>
              <input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={63}
                disabled={security === 'nopass'}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  backgroundColor: security === 'nopass' ? '#F3F4F6' : 'white',
                  cursor: security === 'nopass' ? 'not-allowed' : 'text'
                }}
                placeholder={security === 'nopass' ? 'No password required' : 'WiFi Password'}
                required={security !== 'nopass'}
              />
            </div>

            <div>
              <label htmlFor="security" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Security Type
              </label>
              <select
                id="security"
                value={security}
                onChange={(e) => setSecurity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="WPA">WPA</option>
                <option value="WPA2">WPA2</option>
                <option value="WPA3">WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="instructions" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Welcome Message / Instructions
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={1000}
              rows={3}
              style={{
                width: '97%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Welcome! Connect to our WiFi network using the credentials below."
            />
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {instructions.length}/1000 characters
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || slugStatus !== 'available'}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: (loading || slugStatus !== 'available') ? '#9CA3AF' : '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (loading || slugStatus !== 'available') ? 'not-allowed' : 'pointer',
                opacity: (loading || slugStatus !== 'available') ? 0.5 : 1
              }}
            >
              {loading ? 'Creating...' : 'Create WiFi Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWiFiPortalModal;
