import { data } from './data.js';  // Import the data directly
import { renderChart } from './chart.js';  // Function for rendering radar chart
import { initIntroAnimation } from './introAnimation.js';

function preprocessDataForYear(data, year, abanyValue) {
    // Filter data based on the selected year and count individuals with specific 'abany' value
    const filteredData = data.filter(person => person.year === year && person.abany === abanyValue);

    return filteredData.map(person => {
        let ageGroup;
        if (person.age >= 18 && person.age <= 30) {
            ageGroup = '18-30';
        } else if (person.age >= 31 && person.age <= 60) {
            ageGroup = '31-60';
        } else if (person.age >= 61 && person.age <= 89) {
            ageGroup = '61-89';
        }

        let genderGroup = person.sex === 'Female' ? 'Female' : 'Male';
        let educationGroup;
        const educ = parseInt(person.educ, 10);
        if (educ >= 0 && educ <= 9) {
            educationGroup = '0-9';
        } else if (educ >= 10 && educ <= 18) {
            educationGroup = '10-18';
        } else if (educ > 18) {
            educationGroup = '18+';
        }

        return {
            ...person,
            ageGroup,
            genderGroup,
            educationGroup
        };
    });
}

// Group the data by age categories
function groupByAge(processedData) {
    const ageCounts = {
        '18-30': 0,
        '31-60': 0,
        '61-89': 0
    };

    processedData.forEach(person => {
        if (person.ageGroup) {
            ageCounts[person.ageGroup]++;
        }
    });

    return ageCounts;
}

// Group the data by gender categories
function groupByGender(processedData) {
    const genderCounts = {
        'Female': 0,
        'Male': 0
    };

    processedData.forEach(person => {
        if (person.genderGroup) {
            genderCounts[person.genderGroup]++;
        }
    });

    return genderCounts;
}

// Group the data by political party categories
function groupByParty(processedData) {
    const partyCounts = {
        'Republican': 0,
        'Democrat': 0,
        'Independent': 0,
        'Other': 0
    };

    processedData.forEach(person => {
        if (person.partyid) {
            if (person.partyid.includes("Republican")) {
                partyCounts['Republican']++;
            } else if (person.partyid.includes("Democrat")) {
                partyCounts['Democrat']++;
            } else if (person.partyid.includes("Independent")) {
                partyCounts['Independent']++;
            } else {
                partyCounts['Other']++;
            }
        } else {
            partyCounts['Other']++;
        }
    });

    return partyCounts;
}

// Group the data by education categories
function groupByEducation(processedData) {
    const educationCounts = {
        '0-9': 0,
        '10-18': 0,
        '18+': 0
    };

    processedData.forEach(person => {
        if (person.educationGroup) {
            educationCounts[person.educationGroup]++;
        }
    });

    return educationCounts;
}

// Normalize counts to fit the radar chart's ticks (2-10)
function normalizeCounts(counts) {
    const maxCount = Math.max(...Object.values(counts));
    const minTick = 2;
    const maxTick = 10;

    if (maxCount === 0) {
        return Object.fromEntries(Object.keys(counts).map(key => [key, minTick]));
    }

    return Object.fromEntries(
        Object.entries(counts).map(([key, value]) => [
            key, (value / maxCount) * (maxTick - minTick) + minTick
        ])
    );
}

// Function to update the chart based on the selected year
function updateChart(year) {
    // Preprocess data for abany = "1" for the selected year
    const processedData1 = preprocessDataForYear(data, year, "1");
    const processedData0 = preprocessDataForYear(data, year, "0");

    // Group and normalize the data
    const ageCounts1 = normalizeCounts(groupByAge(processedData1));
    const ageCounts0 = normalizeCounts(groupByAge(processedData0));
    const genderCounts1 = normalizeCounts(groupByGender(processedData1));
    const genderCounts0 = normalizeCounts(groupByGender(processedData0));
    const partyCounts1 = normalizeCounts(groupByParty(processedData1));
    const partyCounts0 = normalizeCounts(groupByParty(processedData0));
    const educationCounts1 = normalizeCounts(groupByEducation(processedData1));
    const educationCounts0 = normalizeCounts(groupByEducation(processedData0));

    // Prepare radar data
    const radarData1 = [
        { category: '18-30', value: ageCounts1['18-30'] },
        { category: '31-60', value: ageCounts1['31-60'] },
        { category: '61-89', value: ageCounts1['61-89'] },
        { category: 'Female', value: genderCounts1['Female'] },
        { category: 'Male', value: genderCounts1['Male'] },
        { category: 'Republican', value: partyCounts1['Republican'] },
        { category: 'Democrat', value: partyCounts1['Democrat'] },
        { category: 'Independent', value: partyCounts1['Independent'] },
        { category: 'Other (Political)', value: partyCounts1['Other'] },
        { category: '0-9', value: educationCounts1['0-9'] },
        { category: '10-18', value: educationCounts1['10-18'] },
        { category: '18+', value: educationCounts1['18+'] }
    ];

    const radarData0 = [
        { category: '18-30', value: ageCounts0['18-30'] },
        { category: '31-60', value: ageCounts0['31-60'] },
        { category: '61-89', value: ageCounts0['61-89'] },
        { category: 'Female', value: genderCounts0['Female'] },
        { category: 'Male', value: genderCounts0['Male'] },
        { category: 'Republican', value: partyCounts0['Republican'] },
        { category: 'Democrat', value: partyCounts0['Democrat'] },
        { category: 'Independent', value: partyCounts0['Independent'] },
        { category: 'Other (Political)', value: partyCounts0['Other'] },
        { category: '0-9', value: educationCounts0['0-9'] },
        { category: '10-18', value: educationCounts0['10-18'] },
        { category: '18+', value: educationCounts0['18+'] }
    ];

    // Clear previous chart after ... seconds and render the updated chart
    setTimeout(() => {
        d3.select("#renderer").select("svg").remove(); // Clear previous chart
        renderChart(radarData1, radarData0); // Render the chart
    }, 8000); // Delay of ... milliseconds (... seconds)

    // d3.select("#renderer").select("svg").remove(); // Clear previous chart
    // renderChart(radarData1, radarData0);
}

updateChart(2018); // Start with the year 2018

document.addEventListener('DOMContentLoaded', () => {
    initIntroAnimation(750, 200, () => {
        // updateChart(2018);
    });
});


// Event listener for the year slider to update the chart
document.getElementById('year-slider').addEventListener('input', function (e) {
    const selectedYear = parseInt(e.target.value);
    document.getElementById('selected-year').innerText = selectedYear;
    updateChart(selectedYear); // Update the chart based on the selected year
    
});

