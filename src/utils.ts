import { addHours, isAfter } from 'date-fns';

export const getTimingStatus = (lastTiming: Date) => {
  const expirationTime = addHours(lastTiming, 12);
  const now = new Date();
  const isExpired = isAfter(now, expirationTime);
  
  return {
    isExpired,
    expirationTime,
  };
};
