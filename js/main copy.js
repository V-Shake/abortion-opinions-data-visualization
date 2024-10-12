import { data } from './data.js';  // Import the data directly
import { renderChart } from './chart.js';  // Function for rendering radar chart

function preprocessData(data, abanyValue) {
    // Filter and count individuals based on the specified abany value
    const filteredData = data.filter(person => person.year === 2018 && person.abany === abanyValue);

    // Log the count of individuals with the specified abany value
    console.log(`Count of individuals with abany = ${abanyValue}:`, filteredData.length);

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
        'Male': 0 // Removed "Other" category
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
        'Other': 0 // Keep "Other" for political parties
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
                partyCounts['Other']++; // Count all other parties as "Other"
            }
        } else {
            partyCounts['Other']++; // If there's no partyid, count as "Other"
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
    const maxCount = Math.max(...Object.values(counts));  // Get the maximum count
    const minTick = 2;
    const maxTick = 10;

    // If maxCount is 0 (in case of no data for any group), return minimum values
    if (maxCount === 0) {
        return Object.fromEntries(Object.keys(counts).map(key => [key, minTick]));
    }

    // Normalize the counts to fit between tick 2 and tick 10
    return Object.fromEntries(
        Object.entries(counts).map(([key, value]) => [
            key, (value / maxCount) * (maxTick - minTick) + minTick
        ])
    );
}

async function initializeApp() {
    // Preprocess data for abany = "1"
    const processedData1 = preprocessData(data, "1");

    // Preprocess data for abany = "0"
    const processedData0 = preprocessData(data, "0");

    // Group and normalize the data by age for both groups
    const ageCounts1 = groupByAge(processedData1);
    const normalizedAgeCounts1 = normalizeCounts(ageCounts1);
    const ageCounts0 = groupByAge(processedData0);
    const normalizedAgeCounts0 = normalizeCounts(ageCounts0);

    // Group and normalize the data by gender for both groups
    const genderCounts1 = groupByGender(processedData1);
    const normalizedGenderCounts1 = normalizeCounts(genderCounts1);
    const genderCounts0 = groupByGender(processedData0);
    const normalizedGenderCounts0 = normalizeCounts(genderCounts0);

    // Group and normalize the data by political party for both groups
    const partyCounts1 = groupByParty(processedData1);
    const normalizedPartyCounts1 = normalizeCounts(partyCounts1);
    const partyCounts0 = groupByParty(processedData0);
    const normalizedPartyCounts0 = normalizeCounts(partyCounts0);

    // Group and normalize the data by education for both groups
    const educationCounts1 = groupByEducation(processedData1);
    const normalizedEducationCounts1 = normalizeCounts(educationCounts1);
    const educationCounts0 = groupByEducation(processedData0);
    const normalizedEducationCounts0 = normalizeCounts(educationCounts0);

    // Log counts to the console for both groups
    console.log("Counts of Political Parties (abany = 1):");
    console.log("Republican:", partyCounts1.Republican);
    console.log("Democrat:", partyCounts1.Democrat);
    console.log("Independent:", partyCounts1.Independent);
    console.log("Other:", partyCounts1.Other);

    console.log("Counts of Political Parties (abany = 0):");
    console.log("Republican:", partyCounts0.Republican);
    console.log("Democrat:", partyCounts0.Democrat);
    console.log("Independent:", partyCounts0.Independent);
    console.log("Other:", partyCounts0.Other);

    console.log("Counts of Genders (abany = 1):");
    console.log("Female:", genderCounts1.Female);
    console.log("Male:", genderCounts1.Male);

    console.log("Counts of Genders (abany = 0):");
    console.log("Female:", genderCounts0.Female);
    console.log("Male:", genderCounts0.Male);

    console.log("Counts of Age Categories (abany = 1):");
    console.log("18-30:", ageCounts1['18-30']);
    console.log("31-60:", ageCounts1['31-60']);
    console.log("61-89:", ageCounts1['61-89']);

    console.log("Counts of Age Categories (abany = 0):");
    console.log("18-30:", ageCounts0['18-30']);
    console.log("31-60:", ageCounts0['31-60']);
    console.log("61-89:", ageCounts0['61-89']);

    console.log("Counts of Education Categories (abany = 1):");
    console.log("0-9:", educationCounts1['0-9']);
    console.log("10-18:", educationCounts1['10-18']);
    console.log("18+:", educationCounts1['18+']);

    console.log("Counts of Education Categories (abany = 0):");
    console.log("0-9:", educationCounts0['0-9']);
    console.log("10-18:", educationCounts0['10-18']);
    console.log("18+:", educationCounts0['18+']);

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

    // Combine radar data and call renderChart with the combined data
    renderChart(radarData1, radarData0);
}

// Initialize the application
initializeApp();