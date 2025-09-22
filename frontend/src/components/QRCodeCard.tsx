import React, { useState } from 'react';
import { QRCodeData } from '../services/api';

interface QRCodeCardProps {
  qrCode: QRCodeData;
  onUpdate: (id: string, data: { title?: string; targetUrl?: string; isActive?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrCode, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(qrCode.title);
  const [targetUrl, setTargetUrl] = useState(qrCode.targetUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoverStates, setHoverStates] = useState<{[key: string]: boolean}>({});
  const [focusStates, setFocusStates] = useState<{[key: string]: boolean}>({});

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      await onUpdate(qrCode.id, { title, targetUrl });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(qrCode.title);
    setTargetUrl(qrCode.targetUrl);
    setIsEditing(false);
    setError('');
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      await onUpdate(qrCode.id, { isActive: !qrCode.isActive });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      setLoading(true);
      try {
        await onDelete(qrCode.id);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `${qrCode.title}.png`;
    link.href = qrCode.qrCodeData;
    link.click();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '24px'
    }}>
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

      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <img
          src={qrCode.qrCodeData}
          alt="QR Code"
          style={{
            margin: '0 auto',
            width: '128px',
            height: '128px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px'
          }}
        />
        {qrCode.hasLogo && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: '50%',
            transform: 'translateX(64px) translateY(-4px)',
            backgroundColor: '#3B82F6',
            color: 'white',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '9999px'
          }}>
            📷 Logo
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocusStates({...focusStates, titleInput: true})}
              onBlur={() => setFocusStates({...focusStates, titleInput: false})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: focusStates.titleInput ? '1px solid #6366F1' : '1px solid #D1D5DB',
                borderRadius: '6px',
                outline: 'none',
                boxShadow: focusStates.titleInput ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Target URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onFocus={() => setFocusStates({...focusStates, urlInput: true})}
              onBlur={() => setFocusStates({...focusStates, urlInput: false})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: focusStates.urlInput ? '1px solid #6366F1' : '1px solid #D1D5DB',
                borderRadius: '6px',
                outline: 'none',
                boxShadow: focusStates.urlInput ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={handleSave}
              disabled={loading}
              onMouseEnter={() => setHoverStates({...hoverStates, saveBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, saveBtn: false})}
              style={{
                flex: '1',
                backgroundColor: hoverStates.saveBtn && !loading ? '#059669' : '#10B981',
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
              onMouseEnter={() => setHoverStates({...hoverStates, cancelBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, cancelBtn: false})}
              style={{
                flex: '1',
                backgroundColor: hoverStates.cancelBtn && !loading ? '#4B5563' : '#6B7280',
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '4px'
            }}>{qrCode.title}</h3>
            <p style={{
              fontSize: '14px',
              color: '#4B5563',
              wordBreak: 'break-all'
            }}>{qrCode.targetUrl}</p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: qrCode.isActive ? '#D1FAE5' : '#FEE2E2',
              color: qrCode.isActive ? '#065F46' : '#991B1B'
            }}>
              {qrCode.isActive ? 'Active' : 'Inactive'}
            </span>
            <span>{qrCode.clicks} clicks</span>
          </div>

          <div style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '16px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Redirect URL
              </label>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={qrCode.redirectUrl}
                  readOnly
                  style={{
                    flex: '1',
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #D1D5DB',
                    borderTopLeftRadius: '6px',
                    borderBottomLeftRadius: '6px',
                    backgroundColor: '#F9FAFB',
                    borderRight: 'none'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(qrCode.redirectUrl)}
                  onMouseEnter={() => setHoverStates({...hoverStates, copyBtn: true})}
                  onMouseLeave={() => setHoverStates({...hoverStates, copyBtn: false})}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: hoverStates.copyBtn ? '#D1D5DB' : '#E5E7EB',
                    border: '1px solid #D1D5DB',
                    borderLeft: 'none',
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setIsEditing(true)}
              onMouseEnter={() => setHoverStates({...hoverStates, editBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, editBtn: false})}
              style={{
                flex: '1',
                backgroundColor: hoverStates.editBtn ? '#1D4ED8' : '#2563EB',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button
              onClick={downloadQR}
              onMouseEnter={() => setHoverStates({...hoverStates, downloadBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, downloadBtn: false})}
              style={{
                flex: '1',
                backgroundColor: hoverStates.downloadBtn ? '#4338CA' : '#4F46E5',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Download
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={handleToggleActive}
              disabled={loading}
              onMouseEnter={() => setHoverStates({...hoverStates, toggleBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, toggleBtn: false})}
              style={{
                flex: '1',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                backgroundColor: qrCode.isActive
                  ? (hoverStates.toggleBtn && !loading ? '#B45309' : '#D97706')
                  : (hoverStates.toggleBtn && !loading ? '#059669' : '#10B981'),
                color: 'white'
              }}
            >
              {loading ? 'Loading...' : (qrCode.isActive ? 'Deactivate' : 'Activate')}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              onMouseEnter={() => setHoverStates({...hoverStates, deleteBtn: true})}
              onMouseLeave={() => setHoverStates({...hoverStates, deleteBtn: false})}
              style={{
                flex: '1',
                backgroundColor: hoverStates.deleteBtn && !loading ? '#B91C1C' : '#DC2626',
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
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#9CA3AF'
      }}>
        Created: {new Date(qrCode.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default QRCodeCard;