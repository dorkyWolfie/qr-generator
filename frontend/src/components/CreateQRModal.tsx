import React, { useState, useCallback } from 'react';
import { qrAPI } from '../services/api';

interface CreateQRModalProps {
  onClose: () => void;
  onCreate: (title: string, targetUrl: string, logoFile?: File, customShortId?: string) => Promise<void>;
}

const CreateQRModal: React.FC<CreateQRModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [customShortId, setCustomShortId] = useState('');
  const [shortIdStatus, setShortIdStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkShortIdAvailability = useCallback(async (shortId: string) => {
    if (!shortId.trim()) {
      setShortIdStatus('idle');
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(shortId)) {
      setShortIdStatus('invalid');
      return;
    }

    setShortIdStatus('checking');

    try {
      const result = await qrAPI.checkShortId(shortId);
      setShortIdStatus(result.available ? 'available' : 'taken');
    } catch (error) {
      setShortIdStatus('invalid');
    }
  }, []);

  const handleShortIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomShortId(value);

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      checkShortIdAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !targetUrl.trim()) {
      setError('Both title and URL are required');
      return;
    }

    if (!isValidUrl(targetUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    if (customShortId.trim() && shortIdStatus !== 'available') {
      setError('Please choose a valid and available short ID');
      return;
    }

    setLoading(true);

    try {
      await onCreate(title.trim(), targetUrl.trim(), logoFile || undefined, customShortId.trim() || undefined);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for security
        setError('Logo file size must be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
        maxHeight: '80%',
        maxWidth: '60%',
        margin: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>Create New QR Code</h2>
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
              Title
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
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter a title for your QR code"
              required
            />
          </div>

          <div>
            <label htmlFor="targetUrl" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Target URL
            </label>
            <input
              id="targetUrl"
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              style={{
                width: '98%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="customShortId" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Custom Short ID (Optional)
            </label>
            <input
              id="customShortId"
              type="text"
              value={customShortId}
              onChange={handleShortIdChange}
              style={{
                width: '98%',
                padding: '8px 12px',
                border: `1px solid ${
                  shortIdStatus === 'available' ? '#10B981' :
                  shortIdStatus === 'taken' || shortIdStatus === 'invalid' ? '#EF4444' :
                  '#D1D5DB'
                }`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                if (shortIdStatus === 'idle' || shortIdStatus === 'checking') {
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (shortIdStatus === 'idle' || shortIdStatus === 'checking') {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }
              }}
              placeholder="my-custom-link (3-20 characters, letters, numbers, -, _)"
            />
            {shortIdStatus !== 'idle' && (
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                color:
                  shortIdStatus === 'available' ? '#10B981' :
                  shortIdStatus === 'taken' || shortIdStatus === 'invalid' ? '#EF4444' :
                  '#6B7280'
              }}>
                {shortIdStatus === 'checking' && '⏳ Checking availability...'}
                {shortIdStatus === 'available' && '✅ This short ID is available!'}
                {shortIdStatus === 'taken' && '❌ This short ID is already taken'}
                {shortIdStatus === 'invalid' && '❌ Invalid format. Use 3-20 characters (letters, numbers, -, _)'}
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Logo (Optional)
            </label>

            {!logoPreview ? (
              <div style={{
                border: '2px dashed #D1D5DB',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                padding: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ color: '#6B7280' }}>
                    <svg style={{ width: '150px', height: '150px', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{ fontSize: '14px', margin: '8px 0' }}>Click to upload logo</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>PNG, JPG up to 2MB</p>
                  </div>
                </label>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB'
                  }}
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#4338CA';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#4F46E5';
              }}
            >
              {loading ? 'Creating...' : 'Create QR Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQRModal;