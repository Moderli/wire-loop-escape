export const startTimeTracking = () => {
  sessionStorage.setItem('session_start_time', Date.now().toString());
};

export const updateTimeSpent = async () => {
  const startTime = parseInt(sessionStorage.getItem('session_start_time') || Date.now().toString(), 10);
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  if (timeSpent > 0) {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent }),
    });
    // Reset the start time after updating
    startTimeTracking();
  }
};

export const getMetrics = async (): Promise<{ visitors: number; timeSpent: number }> => {
  const response = await fetch('/api/metrics');
  if (!response.ok) {
    console.error('Failed to get metrics');
    return { visitors: 0, timeSpent: 0 };
  }
  return response.json();
}; 