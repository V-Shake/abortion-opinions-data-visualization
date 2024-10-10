import { loadData } from './data.js';  // Make sure the path is correct

async function initializeApp() {
    // Load data
    const data = await loadData();
    
    // Now you can use the data for your visualization
    console.log(data);  // Check the data in the console
    
    // After loading the data, you can call functions to render the chart
    // For example: renderChart(data); (you will create renderChart() later)
}

initializeApp();
