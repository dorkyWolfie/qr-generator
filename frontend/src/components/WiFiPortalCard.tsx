import React, { useState } from 'react';
import { WiFiPortalData } from '../services/api';

interface WiFiPortalCardProps {
  portal: WiFiPortalData;
  onUpdate: (portalId: string, data: any) => Promise<void>;
  onDelete: (portalId: string) => Promise<void>;
}

const WiFiPortalCard: React.FC<WiFiPortalCardProps> = ({ portal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(portal.title);
  const [ssid, setSsid] = useState(portal.ssid);
  const [password, setPassword] = useState(portal.password || '');
  const [security, setSecurity] = useState(portal.security);
  const [instructions, setInstructions] = useState(portal.instructions || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    // Validate required fields
    if (!title.trim() || !ssid.trim()) {
      setError('Title and SSID are required');
      return;
    }

    if (security !== 'nopass' && !password.trim()) {
      setError('Password is required for secured networks');
      return;
    }

    setLoading(true);

    try {
      await onUpdate(portal.portalId, {
        title: title.trim(),
        ssid: ssid.trim(),
        password: security === 'nopass' ? '' : password,
        security,
        instructions: instructions.trim()
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update portal');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(portal.title);
    setSsid(portal.ssid);
    setPassword(portal.password || '');
    setSecurity(portal.security);
    setInstructions(portal.instructions || '');
    setIsEditing(false);
    setError('');
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      await onUpdate(portal.portalId, { isActive: !portal.isActive });
    } catch (err: any) {
      setError(err.message || 'Failed to update portal status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this WiFi portal?')) {
      setLoading(true);
      try {
        await onDelete(portal.portalId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete portal');
        setLoading(false);
      }
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = portal.qrCodeData;
    link.download = `wifi-portal-${portal.slug}.png`;
    link.click();
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s'
      }}
    >
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #F87171',
          color: '#B91C1C',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        {isEditing ? (
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              Portal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '95%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="e.g., Coffee Shop Guest WiFi"
            />
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
              marginBottom: '4px'
            }}>
              {portal.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0,
              fontFamily: 'monospace'
            }}>
              {portal.ssid}
            </p>
          </div>
        )}
        <div style={{
          padding: '4px 10px',
          backgroundColor: portal.isActive ? '#D1FAE5' : '#FEE2E2',
          color: portal.isActive ? '#065F46' : '#991B1B',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {portal.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* QR Code */}
      <div style={{
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <img
          src={portal.qrCodeData}
          alt={`QR code for ${portal.title}`}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '8px'
          }}
        />
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
          {/* SSID */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              Network Name (SSID) *
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              maxLength={32}
              style={{
                width: '95%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Your WiFi Network Name"
            />
          </div>

          {/* Security */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              Security Type
            </label>
            <select
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

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              Password {security !== 'nopass' ? '*' : '(not needed for open networks)'}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={63}
              disabled={security === 'nopass'}
              style={{
                width: '95%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                backgroundColor: security === 'nopass' ? '#F3F4F6' : 'white',
                cursor: security === 'nopass' ? 'not-allowed' : 'text'
              }}
              placeholder={security === 'nopass' ? 'No password required' : 'WiFi Password'}
            />
          </div>

          {/* Instructions */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              Welcome Message / Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={1000}
              rows={3}
              style={{
                width: '95%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Welcome! Connect to our WiFi network using the credentials below."
            />
          </div>

          {/* Save/Cancel Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#9CA3AF' : '#10B981',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#D1D5DB' : '#6B7280',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              backgroundColor: '#F9FAFB',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                Visits
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                {portal.visits}
              </div>
            </div>
            <div style={{
              backgroundColor: '#F9FAFB',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                Security
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                {portal.security}
              </div>
            </div>
          </div>

          {/* Portal URL */}
          <div style={{
            backgroundColor: '#F3F4F6',
            padding: '10px 12px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#4F46E5',
              fontFamily: 'monospace',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              /wifi/{portal.slug}
            </span>
            <button
              onClick={() => copyToClipboard(portal.portalUrl, 'Portal URL')}
              style={{
                padding: '4px 8px',
                backgroundColor: 'white',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#374151',
                fontWeight: '500'
              }}
            >
              Copy
            </button>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              Edit
            </button>
            <button
              onClick={downloadQRCode}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
            >
              Download QR
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={handleToggleActive}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: portal.isActive ? '#D97706' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Loading...' : (portal.isActive ? 'Deactivate' : 'Activate')}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#B91C1C')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#DC2626')}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      )}

      {/* Created date */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#9CA3AF'
      }}>
        Created: {new Date(portal.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default WiFiPortalCard;
