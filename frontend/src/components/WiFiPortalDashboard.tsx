import React, { useState, useEffect } from 'react';
import { wifiPortalAPI, WiFiPortalData } from '../services/api';
import CreateWiFiPortalModal from './CreateWiFiPortalModal';
import WiFiPortalCard from './WiFiPortalCard';

const WiFiPortalDashboard: React.FC = () => {
  const [portals, setPortals] = useState<WiFiPortalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const fetchPortals = async () => {
    try {
      setLoading(true);
      const response = await wifiPortalAPI.getMyPortals();
      setPortals(response.portals);
      setError('');
    } catch (err: any) {
      setError('Failed to load WiFi portals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortals();
  }, []);

  const handleUpdate = async (portalId: string, data: any) => {
    try {
      await wifiPortalAPI.update(portalId, data);
      fetchPortals();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update WiFi portal');
    }
  };

  const handleDelete = async (portalId: string) => {
    try {
      await wifiPortalAPI.delete(portalId);
      fetchPortals();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete WiFi portal');
    }
  };


  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading WiFi portals...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            marginBottom: '8px'
          }}>
            WiFi Portals
          </h1>
          <p style={{ color: '#6B7280', margin: 0 }}>
            Create and manage dynamic WiFi sharing portals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Create WiFi Portal
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #F87171',
          color: '#B91C1C',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {portals.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px dashed #D1D5DB'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📶</div>
          <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
            No WiFi Portals Yet
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Create your first WiFi portal to start sharing network credentials dynamically
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Your First Portal
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {portals.map((portal) => (
            <WiFiPortalCard
              key={portal.portalId}
              portal={portal}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateWiFiPortalModal
          onClose={() => setShowCreateModal(false)}
          onCreate={fetchPortals}
        />
      )}
    </div>
  );
};

export default WiFiPortalDashboard;
