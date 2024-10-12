import { data } from './data.js';  // Import the data directly
import { renderChart } from './chart.js';  // Function for rendering radar chart

// Funktion zum Aktualisieren des ausgewählten Jahres im Slider
function updateYearLabel(year) {
    document.getElementById('selected-year').textContent = year;
}

// Preprocess the data by filtering it based on the selected year and abany value
function preprocessData(data, abanyValue, selectedYear) {
    // Filter data based on the selected year and abany value
    const filteredData = data.filter(person => person.year === selectedYear && person.abany === abanyValue);

    return filteredData.map(person => {
        // Grouping people by age categories
        let ageGroup;
        if (person.age >= 18 && person.age <= 30) {
            ageGroup = '18-30';
        } else if (person.age >= 31 && person.age <= 60) {
            ageGroup = '31-60';
        } else if (person.age >= 61 && person.age <= 89) {
            ageGroup = '61-89';
        }

        // Grouping people by gender
        let genderGroup;
        if (person.sex === 'Female') {
            genderGroup = 'Female';
        } else if (person.sex === 'Male') {
            genderGroup = 'Male';
        }

        // Grouping people by education level based on the 'educ' field
        let educationGroup;
        const educ = parseInt(person.educ, 10); // Convert educ string to an integer
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
            educationGroup  // Add the education group to the returned object
        };
    });
}

// Rest of the grouping functions (groupByAge, groupByGender, groupByParty, groupByEducation, normalizeCounts) remain unchanged...

// Funktion zum Initialisieren des Diagramms basierend auf dem aktuellen Jahr und Sliderwert
async function initializeApp(selectedYear) {
    // Preprocess data for abany = "1"
    const processedData1 = preprocessData(data, "1", selectedYear);

    // Preprocess data for abany = "0"
    const processedData0 = preprocessData(data, "0", selectedYear);

    // Group and normalize the data for both groups (age, gender, party, education)
    const ageCounts1 = groupByAge(processedData1);
    const normalizedAgeCounts1 = normalizeCounts(ageCounts1);
    const ageCounts0 = groupByAge(processedData0);
    const normalizedAgeCounts0 = normalizeCounts(ageCounts0);

    const genderCounts1 = groupByGender(processedData1);
    const normalizedGenderCounts1 = normalizeCounts(genderCounts1);
    const genderCounts0 = groupByGender(processedData0);
    const normalizedGenderCounts0 = normalizeCounts(genderCounts0);

    const partyCounts1 = groupByParty(processedData1);
    const normalizedPartyCounts1 = normalizeCounts(partyCounts1);
    const partyCounts0 = groupByParty(processedData0);
    const normalizedPartyCounts0 = normalizeCounts(partyCounts0);

    const educationCounts1 = groupByEducation(processedData1);
    const normalizedEducationCounts1 = normalizeCounts(educationCounts1);
    const educationCounts0 = groupByEducation(processedData0);
    const normalizedEducationCounts0 = normalizeCounts(educationCounts0);

    // Prepare unified data for rendering radar chart
    const radarData1 = [
        { category: '18-30', value: normalizedAgeCounts1['18-30'] },
        { category: '31-60', value: normalizedAgeCounts1['31-60'] },
        { category: '61-89', value: normalizedAgeCounts1['61-89'] },
        { category: 'Female', value: normalizedGenderCounts1['Female'] },
        { category: 'Male', value: normalizedGenderCounts1['Male'] },
        { category: 'Republican', value: normalizedPartyCounts1['Republican'] },
        { category: 'Democrat', value: normalizedPartyCounts1['Democrat'] },
        { category: 'Independent', value: normalizedPartyCounts1['Independent'] },
        { category: 'Other (Political)', value: normalizedPartyCounts1['Other'] },
        { category: '0-9', value: normalizedEducationCounts1['0-9'] },
        { category: '10-18', value: normalizedEducationCounts1['10-18'] },
        { category: '18+', value: normalizedEducationCounts1['18+'] }
    ];

    const radarData0 = [
        { category: '18-30', value: normalizedAgeCounts0['18-30'] },
        { category: '31-60', value: normalizedAgeCounts0['31-60'] },
        { category: '61-89', value: normalizedAgeCounts0['61-89'] },
        { category: 'Female', value: normalizedGenderCounts0['Female'] },
        { category: 'Male', value: normalizedGenderCounts0['Male'] },
        { category: 'Republican', value: normalizedPartyCounts0['Republican'] },
        { category: 'Democrat', value: normalizedPartyCounts0['Democrat'] },
        { category: 'Independent', value: normalizedPartyCounts0['Independent'] },
        { category: 'Other (Political)', value: normalizedPartyCounts0['Other'] },
        { category: '0-9', value: normalizedEducationCounts0['0-9'] },
        { category: '10-18', value: normalizedEducationCounts0['10-18'] },
        { category: '18+', value: normalizedEducationCounts0['18+'] }
    ];

    // Render the radar chart with the new data
    d3.select("#renderer").selectAll("*").remove();  // Clear previous chart
    renderChart(radarData1, radarData0);
}

// Set up the slider event listener
document.getElementById('year-slider').addEventListener('input', (event) => {
    const selectedYear = parseInt(event.target.value, 10);  // Get the current slider value (year)
    updateYearLabel(selectedYear);  // Update the displayed year label
    initializeApp(selectedYear);  // Re-render the chart with the new year
});

// Initial rendering for the year 2018
initializeApp(2018);
