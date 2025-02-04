import { searchUniversityImage as mockSearch } from './mockImageSearch';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;

export async function searchUniversityImage(universityName: string, cityName: string): Promise<string> {
  try {
    const query = `${universityName} ${cityName} university campus building`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=1&imgSize=large`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      console.error('Google API Error:', error);
      return mockSearch(universityName, cityName);
    }

    const data = await response.json();
    if (data.items?.[0]?.link) {
      return data.items[0].link;
    }

    return mockSearch(universityName, cityName);
  } catch (error) {
    console.error('Error fetching university image:', error);
    return mockSearch(universityName, cityName);
  }
}
