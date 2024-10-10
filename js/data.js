export async function loadData() {
  const response = await fetch('data/abortionData.json'); 
  const data = await response.json();
  
  
  // Format or preprocess the data if necessary (optional)
  return data;
}

