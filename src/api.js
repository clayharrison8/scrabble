export const fetchPreviousWords = async () => {
    try {
      const response = await fetch('https://testapi.sail-dev.com/api/data/getworddata');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching API data:', error);
      throw error;
    }
  };
  