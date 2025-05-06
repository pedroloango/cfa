
// Generic function to get data from localStorage
export function getLocalData<T>(key: string, defaultValue: T): T {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData) as T;
    } catch (error) {
      console.error(`Error parsing localStorage data for key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

// Generic function to save data to localStorage
export function saveLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage for key "${key}":`, error);
  }
}
