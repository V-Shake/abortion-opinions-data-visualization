import { loadData } from './data.js';
import { renderChart } from './chart.js';

function preprocessData(data) {
    return data
        .filter(person => person.party !== 'NA' && person.abany !== 'NA')  // Filter out "NA" in party and abany
        .map(person => {
            // Grouping logic for sex, age, education, party
            const sex = person.gender === 'female' ? 'Female' : 'Male';

            let ageGroup;
            if (person.age >= 18 && person.age <= 30) {
                ageGroup = '18-30';
            } else if (person.age >= 31 && person.age <= 60) {
                ageGroup = '31-60';
            } else if (person.age >= 61 && person.age <= 89) {
                ageGroup = '61-89';
            }

            let educationGroup;
            if (person.educ >= 0 && person.educ <= 5) {
                educationGroup = '0-5';
            } else if (person.educ >= 6 && person.educ <= 10) {
                educationGroup = '6-10';
            } else if (person.educ >= 11 && person.educ <= 15) {
                educationGroup = '11-15';
            } else if (person.educ >= 16 && person.educ <= 20) {
                educationGroup = '16-20';
            }

            let partyGroup;
            if (['Not Str Democrat', 'Strong Democrat', 'Ind,Near Dem'].includes(person.party)) {
                partyGroup = 'Democrat';
            } else if (['Not Str Republican', 'Strong Republican', 'Ind,Near Rep'].includes(person.party)) {
                partyGroup = 'Republican';
            } else if (person.party === 'Independent') {
                partyGroup = 'Independent';
            } else if (person.party === 'Other Party') {
                partyGroup = 'Other';
            }

            return {
                ...person,
                sex,
                ageGroup,
                educationGroup,
                partyGroup,
                support: person.abany === 1 ? 10 : (person.abany === 0 ? 0 : 'NA'),  // Numeric representation for radar chart
                opposition: person.abany === 0 ? 10 : (person.abany === 1 ? 0 : 'NA')  // Numeric representation for radar chart
            };
        });
}


async function initializeApp() {
    // Load data
    const data = await loadData();

    // Preprocess data
    const processedData = preprocessData(data);

    // Render the chart with the processed data
    renderChart(processedData);  // We'll define renderChart() later
}

initializeApp();
