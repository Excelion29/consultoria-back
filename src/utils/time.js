export function addMinutesToTimeString(time, minutesToAdd) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(0, 0, 0, hours, minutes + minutesToAdd);
  return date.toTimeString().substring(0, 5);
}

export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};