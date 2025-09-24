import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RedirectHandler: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortId) {
        window.location.href = '/dashboard';
        return;
      }

      try {
        // Make a request to backend redirect endpoint
        const response = await fetch(`https://srv.rdr.mk/r/${shortId}`, {
          method: 'GET',
          redirect: 'manual' // Don't follow redirects automatically
        });

        if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
          // Get the redirect URL from headers
          const redirectUrl = response.headers.get('Location');
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            // Fallback: just redirect to the backend endpoint and let it handle it
            window.location.href = `https://srv.rdr.mk/r/${shortId}`;
          }
        } else {
          // If no redirect, just go to the backend URL
          window.location.href = `https://srv.rdr.mk/r/${shortId}`;
        }
      } catch (error) {
        console.error('Redirect error:', error);
        // Fallback: redirect to backend
        window.location.href = `https://srv.rdr.mk/r/${shortId}`;
      }
    };

    handleRedirect();
  }, [shortId]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
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
          fontSize: '16px',
          margin: 0
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