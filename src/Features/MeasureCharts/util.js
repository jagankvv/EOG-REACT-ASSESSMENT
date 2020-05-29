export const xMinutesAgo = minutes => {
  return new Date().getTime() - minutes * 60 * 1000;
};

