export const generateDefaultLabels = (scale: number): Record<number, string> => {
  const labels: Record<number, string> = {};
  
  if (scale === 2) {
    labels[1] = 'No';
    labels[2] = 'Yes';
  } else if (scale === 3) {
    labels[1] = 'Low';
    labels[2] = 'Medium';
    labels[3] = 'High';
  } else if (scale === 5) {
    labels[1] = 'Very Poor';
    labels[2] = 'Poor';
    labels[3] = 'Average';
    labels[4] = 'Good';
    labels[5] = 'Excellent';
  } else if (scale === 7) {
    labels[1] = 'Very Low';
    labels[2] = 'Low';
    labels[3] = 'Somewhat Low';
    labels[4] = 'Neutral';
    labels[5] = 'Somewhat High';
    labels[6] = 'High';
    labels[7] = 'Very High';
  } else {
    for (let i = 1; i <= scale; i++) {
      labels[i] = i.toString();
    }
  }
  
  return labels;
};
