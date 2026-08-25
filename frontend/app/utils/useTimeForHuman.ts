
/**
 * With this Util timer.vue can show proprely a timer.
 * @param initialTime 
 * @returns 
 */
export const useTimeForHuman = (initialTime: number) : string => {
  const currentTime = Date.now();
  const timeForHuman = (currentTime - initialTime) / 1000;
  const min = Math.floor(timeForHuman / 60);

  return min == 0
      ? timeForHuman.toFixed(2)
      : //1min 8sec 20 : 1:08.20
        min +
        ":" +
        (timeForHuman - 60 * min < 10
          ? "0" + (timeForHuman - 60 * min).toFixed(2)
          : (timeForHuman - 60 * min).toFixed(2));
};
