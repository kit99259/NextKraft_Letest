/**
 * Format estimated duration as whole minutes only (no seconds).
 * Partial minutes round up so ETA is never understated.
 *
 * @param {number|null|undefined} seconds
 * @returns {string|null}
 */
const formatEstimatedTimeInMinutes = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return null;
  }

  const totalSeconds = Math.max(0, Number(seconds));
  const minutes = totalSeconds === 0 ? 0 : Math.max(1, Math.ceil(totalSeconds / 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

module.exports = {
  formatEstimatedTimeInMinutes,
};
