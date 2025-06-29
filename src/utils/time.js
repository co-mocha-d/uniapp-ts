import dayjs from 'dayjs';
/**
 * 获取当前时间所在的季度
 * @returns {number} - 当前季度（1, 2, 3, 4）
 */
export const getCurrentQuarter = () => {
  const currentMonth = dayjs().month(); // 获取当前月份（0 表示 1 月，11 表示 12 月）
  return Math.floor(currentMonth / 3) + 1; // 计算当前季度
};
