// src/utils/loadLocalData.js
export const loadLocalData = async () => {
  try {
    const response = await fetch('/datastore/statData.json');

    if (!response.ok) {
      // Handle HTTP errors explicitly
      console.error('HTTP error loading data:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Catch network errors or JSON parsing issues
    console.error('Error loading local data:', error);
    return null;
  }
};
