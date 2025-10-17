import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeData, qrAPI } from '../services/api';
import QRCodeCard from './QRCodeCard';
import CreateQRModal from './CreateQRModal';

const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await qrAPI.getMyCodes();
      setQrCodes(response.qrCodes);
    } catch (err: any) {
      setError('Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQR = async (title: string, targetUrl: string, logoFile?: File, customShortId?: string) => {
    try {
      const response = await qrAPI.create(title, targetUrl, logoFile, customShortId);
      setQrCodes([response.qrCode, ...qrCodes]);
      setShowCreateModal(false);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create QR code');
    }
  };

  const handleUpdateQR = async (id: string, data: { title?: string; targetUrl?: string; isActive?: boolean }) => {
    try {
      const response = await qrAPI.update(id, data);
      setQrCodes(qrCodes.map(qr => qr.id === id ? response.qrCode : qr));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update QR code');
    }
  };

  const handleDeleteQR = async (id: string) => {
    try {
      await qrAPI.delete(id);
      setQrCodes(qrCodes.filter(qr => qr.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete QR code');
    }
  };

  if (loading) {
    return (
      <>
        <style>{spinKeyframes}</style>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            borderBottom: '2px solid #4F46E5',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '64px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>QR Generator Dashboard</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{
                color: '#374151'
              }}>Welcome, {user?.username}</span>
              <button
                onClick={() => navigate('/wifi-portals')}
                style={{
                  backgroundColor: '#4F46E5',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
              >
                📶 WiFi Portals
              </button>
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#E5E7EB',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 24px'
      }}>
        <div style={{
          padding: '24px 16px 24px 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>My QR Codes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
            >
              Create New QR Code
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {qrCodes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px'
              }}>No QR codes yet</h3>
              <p style={{
                color: '#4B5563',
                marginBottom: '16px'
              }}>Create your first QR code to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
              >
                Create QR Code
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {qrCodes.map((qrCode) => (
                <QRCodeCard
                  key={qrCode.id}
                  qrCode={qrCode}
                  onUpdate={handleUpdateQR}
                  onDelete={handleDeleteQR}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateQRModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateQR}
        />
      )}
    </div>
  );
};

export default Dashboard;