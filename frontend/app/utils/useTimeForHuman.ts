
/**
 * This function can translate a timestamp to a MM:SS:mm Format.
 * @param initialTime the (initial) time to translate
 * @returns 
 */
export const useTimeForHuman = (initialTime: number) : string => {
  
  const timeToConvert = initialTime / 1000

  const min = Math.floor(timeToConvert / 60);

  return min == 0
      ? timeToConvert.toFixed(2)
      : //1min 8sec 20 : 1:08.20
        min +
        ":" +
        (timeToConvert - 60 * min < 10
          ? "0" + (timeToConvert - 60 * min).toFixed(2)
          : (timeToConvert - 60 * min).toFixed(2));
};
