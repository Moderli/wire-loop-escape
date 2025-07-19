export const trackVisit = (): { isNew: boolean; count: number } => {
  let visits = parseInt(localStorage.getItem('visitor_count') || '0', 10);
  const isNewVisitor = !localStorage.getItem('has_visited');

  if (isNewVisitor) {
    visits += 1;
    localStorage.setItem('visitor_count', visits.toString());
    localStorage.setItem('has_visited', 'true');
  }

  return { isNew: isNewVisitor, count: visits };
};

export const startTimeTracking = () => {
  const startTime = Date.now();
  sessionStorage.setItem('session_start_time', startTime.toString());
};

export const getTimeSpent = (): number => {
  const startTime = parseInt(sessionStorage.getItem('session_start_time') || Date.now().toString(), 10);
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  let accumulatedTime = parseInt(localStorage.getItem('total_time_spent') || '0', 10);
  accumulatedTime += totalSeconds;
  localStorage.setItem('total_time_spent', accumulatedTime.toString());

  return accumulatedTime;
};

export const getMetrics = (): { visitors: number; timeSpent: number } => {
  const visitors = parseInt(localStorage.getItem('visitor_count') || '0', 10);
  const timeSpent = parseInt(localStorage.getItem('total_time_spent') || '0', 10);
  return { visitors, timeSpent };
}; 