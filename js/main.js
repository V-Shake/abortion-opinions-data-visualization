import { data } from "./data.js"; // Ensure this is only declared once
import { renderChart } from "./chart.js"; // Function for rendering radar chart
import { initIntroAnimation } from "./introAnimation.js";
import { initializePlayButton } from "./playButton.js"; // Import the play button logic
import { createDropdownMenu } from "./menu.js"; // Import the dropdown menu function

function preprocessDataForYear(data, year, abanyValue) {
	// Filter data based on the selected year and count individuals with specific 'abany' value
	const filteredData = data.filter(
		(person) => person.year === year && person.abany === abanyValue
	);

	return filteredData.map((person) => {
		let ageGroup;
		if (person.age >= 18 && person.age <= 30) {
			ageGroup = "18-30";
		} else if (person.age >= 31 && person.age <= 60) {
			ageGroup = "31-60";
		} else if (person.age >= 61 && person.age <= 89) {
			ageGroup = "61-89";
		}

		let genderGroup = person.sex === "Female" ? "Female" : "Male";
		let educationGroup;
		const educ = parseInt(person.educ, 10);
		if (educ >= 0 && educ <= 9) {
			educationGroup = "0-9";
		} else if (educ >= 10 && educ <= 15) {
			educationGroup = "10-15";
		} else if (educ > 16) {
			educationGroup = "16+";
		}

		return {
			...person,
			ageGroup,
			genderGroup,
			educationGroup,
		};
	});
}

// Group the data by age categories
function groupByAge(processedData) {
	const ageCounts = {
		"18-30": 0,
		"31-60": 0,
		"61-89": 0,
	};

	processedData.forEach((person) => {
		if (person.ageGroup) {
			ageCounts[person.ageGroup]++;
		}
	});

	return ageCounts;
}

// Group the data by gender categories
function groupByGender(processedData) {
	const genderCounts = {
		Female: 0,
		Male: 0,
	};

	processedData.forEach((person) => {
		if (person.genderGroup) {
			genderCounts[person.genderGroup]++;
		}
	});

	return genderCounts;
}

// Group the data by political party categories
function groupByParty(processedData) {
	const partyCounts = {
		Republican: 0,
		Democrat: 0,
		Independent: 0,
		Other: 0,
	};

	processedData.forEach((person) => {
		if (person.partyid) {
			if (person.partyid.includes("Republican")) {
				partyCounts["Republican"]++;
			} else if (person.partyid.includes("Democrat")) {
				partyCounts["Democrat"]++;
			} else if (person.partyid.includes("Independent")) {
				partyCounts["Independent"]++;
			} else {
				partyCounts["Other"]++;
			}
		} else {
			partyCounts["Other"]++;
		}
	});

	return partyCounts;
}

// Group the data by education categories
function groupByEducation(processedData) {
	const educationCounts = {
		"0-9": 0,
		"10-15": 0,
		"16+": 0,
	};

	processedData.forEach((person) => {
		if (person.educationGroup) {
			educationCounts[person.educationGroup]++;
		}
	});

	return educationCounts;
}

// Normalize counts to fit the radar chart's ticks (2-10)
function normalizeCounts(counts1, counts0) {
	const allCounts = Object.values(counts1).concat(Object.values(counts0));
	const maxCount = Math.max(...allCounts);
	const minTick = 2;
	const maxTick = 10;

	if (maxCount === 0) {
		return Object.fromEntries(
			Object.keys(counts1).map((key) => [key, minTick])
		);
	}

	return Object.fromEntries(
		Object.entries(counts1).map(([key, value]) => [
			key,
			(value / maxCount) * (maxTick - minTick) + minTick,
		])
	);
}

function updateChart(year) {
	// Preprocess data for both `abany = "1"` and `abany = "0"` for the selected year
	const processedData1 = preprocessDataForYear(data, year, "1");
	const processedData0 = preprocessDataForYear(data, year, "0");

	// Group the data
	const ageCounts1 = groupByAge(processedData1);
	const ageCounts0 = groupByAge(processedData0);
	const genderCounts1 = groupByGender(processedData1);
	const genderCounts0 = groupByGender(processedData0);
	const partyCounts1 = groupByParty(processedData1);
	const partyCounts0 = groupByParty(processedData0);
	const educationCounts1 = groupByEducation(processedData1);
	const educationCounts0 = groupByEducation(processedData0);

	// Log the actual counts for both categories (abany = 1 and 0)
	console.log(`Age counts (Abany 1) for year ${year}:`, ageCounts1);
	console.log(`Gender counts (Abany 1) for year ${year}:`, genderCounts1);
	console.log(`Party counts (Abany 1) for year ${year}:`, partyCounts1);
	console.log(
		`Education counts (Abany 1) for year ${year}:`,
		educationCounts1
	);

	console.log(`Age counts (Abany 0) for year ${year}:`, ageCounts0);
	console.log(`Gender counts (Abany 0) for year ${year}:`, genderCounts0);
	console.log(`Party counts (Abany 0) for year ${year}:`, partyCounts0);
	console.log(
		`Education counts (Abany 0) for year ${year}:`,
		educationCounts0
	);

	// Normalize the counts for radar chart
	const normalizedAgeCounts1 = normalizeCounts(ageCounts1, ageCounts0);
	const normalizedAgeCounts0 = normalizeCounts(ageCounts0, ageCounts1);
	const normalizedGenderCounts1 = normalizeCounts(
		genderCounts1,
		genderCounts0
	);
	const normalizedGenderCounts0 = normalizeCounts(
		genderCounts0,
		genderCounts1
	);
	const normalizedPartyCounts1 = normalizeCounts(partyCounts1, partyCounts0);
	const normalizedPartyCounts0 = normalizeCounts(partyCounts0, partyCounts1);
	const normalizedEducationCounts1 = normalizeCounts(
		educationCounts1,
		educationCounts0
	);
	const normalizedEducationCounts0 = normalizeCounts(
		educationCounts0,
		educationCounts1
	);

	// Prepare radar data
	const radarData1 = [
		{ category: "18-30", value: normalizedAgeCounts1["18-30"] },
		{ category: "31-60", value: normalizedAgeCounts1["31-60"] },
		{ category: "61-89", value: normalizedAgeCounts1["61-89"] },
		{ category: "Female", value: normalizedGenderCounts1["Female"] },
		{ category: "Male", value: normalizedGenderCounts1["Male"] },
		{ category: "Republican", value: normalizedPartyCounts1["Republican"] },
		{ category: "Democrat", value: normalizedPartyCounts1["Democrat"] },
		{
			category: "Independent",
			value: normalizedPartyCounts1["Independent"],
		},
		{
			category: "Other (Political)",
			value: normalizedPartyCounts1["Other"],
		},
		{ category: "0-9", value: normalizedEducationCounts1["0-9"] },
		{ category: "10-15", value: normalizedEducationCounts1["10-15"] },
		{ category: "16+", value: normalizedEducationCounts1["16+"] },
	];

	const radarData0 = [
		{ category: "18-30", value: normalizedAgeCounts0["18-30"] },
		{ category: "31-60", value: normalizedAgeCounts0["31-60"] },
		{ category: "61-89", value: normalizedAgeCounts0["61-89"] },
		{ category: "Female", value: normalizedGenderCounts0["Female"] },
		{ category: "Male", value: normalizedGenderCounts0["Male"] },
		{ category: "Republican", value: normalizedPartyCounts0["Republican"] },
		{ category: "Democrat", value: normalizedPartyCounts0["Democrat"] },
		{
			category: "Independent",
			value: normalizedPartyCounts0["Independent"],
		},
		{
			category: "Other (Political)",
			value: normalizedPartyCounts0["Other"],
		},
		{ category: "0-9", value: normalizedEducationCounts0["0-9"] },
		{ category: "10-15", value: normalizedEducationCounts0["10-15"] },
		{ category: "16+", value: normalizedEducationCounts0["16+"] },
	];

	// Clear previous chart after ... seconds and render the updated chart
	/*  setTimeout(() => {
        d3.select("#renderer").select("svg").remove(); // Clear previous chart
        renderChart(radarData1, radarData0, year); // Pass the new year to chart.js
    }, 8);*/

	d3.select("#renderer").select("svg").remove(); // Clear previous chart
	renderChart(radarData1, radarData0);
}

updateChart(2018); // Start with the year 2018

document.addEventListener("DOMContentLoaded", () => {
	initIntroAnimation(750, 200, () => {
		// updateChart(2018);
	});

	// Initialize play button with slider ID and the updateChart function
	initializePlayButton("year-slider", updateChart);
});

// Event listener for the year slider to update the chart
document.getElementById("year-slider").addEventListener("input", function (e) {
	const selectedYear = parseInt(e.target.value);
	document.getElementById("selected-year").innerText = selectedYear; // Update display
	updateChart(selectedYear); // Pass the selected year to updateChart
});

// Create the dropdown menu
createDropdownMenu();
