// src/utils/loadLocalData.js
export const loadLocalData = async () => {
    try {
        const response = await fetch('/datastore/statData.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading local data:', error);
        return null;
    }
};
