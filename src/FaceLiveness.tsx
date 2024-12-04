import React from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';

export function LivenessQuickStartReact() {
  const [loading, setLoading] = React.useState(true);
  const [createLivenessApiData, setCreateLivenessApiData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCreateLiveness = async () => {
      try {
        const response = await fetch('http://localhost:3000/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to create liveness session');
        }

        const data = await response.json();
        
        if (data.success) {
          setCreateLivenessApiData({ sessionId: data.sessionId });
        } else {
          throw new Error(data.error || 'Failed to create session');
        }
      } catch (err) {
        console.error('Error creating session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreateLiveness();
  }, []);

  const handleAnalysisComplete = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/session-results/${createLivenessApiData.sessionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get session results');
      }

      const data = await response.json();

      if (data.success) {
        // You can define your own threshold for what constitutes a "live" user
        const isLive = data.confidence > 90; // Example threshold
        
        if (isLive) {
          console.log('User is live', data);
          // Handle successful liveness detection
        } else {
          console.log('User is not live', data);
          // Handle failed liveness detection
        }
      } else {
        throw new Error(data.error || 'Failed to get session results');
      }
    } catch (err) {
      console.error('Error getting session results:', err);
      // Handle error appropriately
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <FaceLivenessDetector
          sessionId={createLivenessApiData.sessionId}
          region="us-east-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={(error) => {
            console.error('Liveness detector error:', error);
            
          }}
        />
      )}
    </ThemeProvider>
  );
}