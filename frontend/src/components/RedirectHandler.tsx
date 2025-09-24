import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RedirectHandler: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortId) {
      // Redirect to the backend endpoint which handles the actual redirect
      window.location.href = `/r/${shortId}`;
    }
  }, [shortId]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7fafc',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1 style={{
            color: '#e53e3e',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            Error
          </h1>
          <p style={{
            color: '#4a5568',
            fontSize: '16px'
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3182ce',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{
          color: '#4a5568',
          fontSize: '16px'
        }}>
          Redirecting...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default RedirectHandler;