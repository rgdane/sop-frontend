export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return '#3c89e8';
    case 'medium':
      return '#e89a3c';
    case 'high':
      return '#e84749';
    default:
      return '#95a5a6';
  }
};