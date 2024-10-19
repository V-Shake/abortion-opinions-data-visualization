import { data } from "./data.js"; // Ensure this is only declared once
import { renderChart } from "./chart.js"; // Function for rendering radar chart
import { initIntroAnimation } from "./introAnimation.js";
import { initializePlayButton } from "./playButton.js"; // Import the play button logic
import { createDropdownMenu } from "./menu.js"; // Import the dropdown menu function
import { createAndDesignSlider } from "./slider.js";
import { startIntroAnimation } from "./Intro.js"; // Import the intro animation function

let option = "abany";

// Function to set global option
function setGlobalOption(selectedOption) {
	option = selectedOption; // Update the global option variable
	updateChart(2018, option); // Call updateChart to update the chart immediately
}

function preprocessDataForYear(data, year, optionValue, option) {
	// Filter data based on the selected year and count individuals with specific 'abany' value

	let filteredData;

	switch (option) {
		case "abany":
			filteredData = data.filter(
				(person) => person.year === year && person.abany === optionValue
			);
			break;
		case "abdefect":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.abdefect === optionValue
			);
			break;
		case "abnomore":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.abnomore === optionValue
			);
			break;
		case "abhlth":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.abhlth === optionValue
			);
			break;
		case "abpoor":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.abpoor === optionValue
			);
			break;
		case "abrape":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.abrape === optionValue
			);
			break;
		case "absingle":
			filteredData = data.filter(
				(person) =>
					person.year === year && person.absingle === optionValue
			);
			break;
		default:
			break;
	}

	return filteredData.map((person) => {
		let ageGroup;
		if (person.age >= 18 && person.age <= 29) {
			ageGroup = "18-29";
		} else if (person.age >= 30 && person.age <= 59) {
			ageGroup = "30-59";
		} else if (person.age >= 60 && person.age <= 89) {
			ageGroup = "60-89";
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
		"18-29": 0,
		"30-59": 0,
		"60-89": 0,
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

function normalizeCountsAlt(countsList) {
	// Flatten all count values from the list of count objects into one array
	const allCounts = countsList.flatMap((counts) => Object.values(counts));
	const maxCount = Math.max(...allCounts);

	const minTick = 2;
	const maxTick = 10;

	if (maxCount === 0) {
		// If maxCount is 0, return minTick for all keys in each counts object
		return countsList.map((counts) =>
			Object.fromEntries(Object.keys(counts).map((key) => [key, minTick]))
		);
	}

	// Normalize each counts object based on the maxCount
	return countsList.map((counts) =>
		Object.fromEntries(
			Object.entries(counts).map(([key, value]) => [
				key,
				(value / maxCount) * (maxTick - minTick) + minTick,
			])
		)
	);
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

function updateChartByCategory(year, opinion, shouldAnimate = true) {
	// List of categories to process
	const categories = [
		"abany",
		"abdefect",
		"abnomore",
		"abhlth",
		"abpoor",
		"abrape",
		"absingle",
	];
	// Prepare radar data for each category
	const dataList = [];
	const radarDataList = [];
	const normalizedAgeCountsList = [];
	const normalizedGenderCountsList = [];
	const normalizedPartyCountsList = [];
	const normalizedEducationCountsList = [];
	// Iterate through each category
	categories.forEach((category) => {
		// Preprocess data for both category = "1" and category = "0" for the selected year
		let processedData;
		if (opinion == "support") {
			processedData = preprocessDataForYear(data, year, "1", category);
		} else {
			processedData = preprocessDataForYear(data, year, "0", category);
		}
		dataList.push(processedData);
		// Group the data
		const ageCounts = groupByAge(processedData);
		console.log(ageCounts);
		const genderCounts = groupByGender(processedData);
		const partyCounts = groupByParty(processedData);
		const educationCounts = groupByEducation(processedData);

		// Log the actual counts for both categories
		console.log(`Age counts (${category} 0) for year ${year}:`, ageCounts);
		console.log(
			`Gender counts (${category} 0) for year ${year}:`,
			genderCounts
		);
		console.log(
			`Party counts (${category} 0) for year ${year}:`,
			partyCounts
		);
		console.log(
			`Education counts (${category} 0) for year ${year}:`,
			educationCounts
		);

		normalizedAgeCountsList.push(ageCounts);
		normalizedGenderCountsList.push(genderCounts);
		normalizedPartyCountsList.push(partyCounts);
		normalizedEducationCountsList.push(educationCounts);
	});
	// Normalize the counts for radar chart
	const normalizedAgeCounts = normalizeCountsAlt(normalizedAgeCountsList);
	const normalizedGenderCounts = normalizeCountsAlt(
		normalizedGenderCountsList
	);
	const normalizedPartyCounts = normalizeCountsAlt(normalizedPartyCountsList);
	const normalizedEducationCounts = normalizeCountsAlt(
		normalizedEducationCountsList
	);
	for (let i = 0; i < dataList.length; i++) {
		// Prepare radar data for this category (0)
		console.log(normalizedAgeCounts);
		const radarData = [
			{ category: "18-29", value: normalizedAgeCounts[i]["18-29"] },
			{ category: "30-59", value: normalizedAgeCounts[i]["30-59"] },
			{ category: "60-89", value: normalizedAgeCounts[i]["60-89"] },
			{ category: "Female", value: normalizedGenderCounts[i]["Female"] },
			{ category: "Male", value: normalizedGenderCounts[i]["Male"] },
			{
				category: "Republican",
				value: normalizedPartyCounts[i]["Republican"],
			},
			{
				category: "Democrat",
				value: normalizedPartyCounts[i]["Democrat"],
			},
			{
				category: "Independent",
				value: normalizedPartyCounts[i]["Independent"],
			},
			{ category: "Other", value: normalizedPartyCounts[i]["Other"] },
			{ category: "0-9", value: normalizedEducationCounts[i]["0-9"] },
			{ category: "10-15", value: normalizedEducationCounts[i]["10-15"] },
			{ category: "16+", value: normalizedEducationCounts[i]["16+"] },
		];

		// Push both 1 and 0 data for each category
		radarDataList.push(radarData);
	}

	// Clear previous chart and render the updated chart with all category data
	d3.select("#renderer").select("svg").remove(); // Clear previous chart
	renderChart(radarDataList, 1, opinion, shouldAnimate); // Pass the radar data list to render function
}

function updateChart(year, option, shouldAnimate = true) {
	// Preprocess data for both abany = "1" and abany = "0" for the selected year
	const processedData1 = preprocessDataForYear(data, year, "1", option);
	const processedData0 = preprocessDataForYear(data, year, "0", option);

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
		{ category: "18-29", value: normalizedAgeCounts1["18-29"] },
		{ category: "30-59", value: normalizedAgeCounts1["30-59"] },
		{ category: "60-89", value: normalizedAgeCounts1["60-89"] },
		{ category: "Female", value: normalizedGenderCounts1["Female"] },
		{ category: "Male", value: normalizedGenderCounts1["Male"] },
		{ category: "Republican", value: normalizedPartyCounts1["Republican"] },
		{ category: "Democrat", value: normalizedPartyCounts1["Democrat"] },
		{
			category: "Independent",
			value: normalizedPartyCounts1["Independent"],
		},
		{
			category: "Other",
			value: normalizedPartyCounts1["Other"],
		},
		{ category: "0-9", value: normalizedEducationCounts1["0-9"] },
		{ category: "10-15", value: normalizedEducationCounts1["10-15"] },
		{ category: "16+", value: normalizedEducationCounts1["16+"] },
	];

	const radarData0 = [
		{ category: "18-29", value: normalizedAgeCounts0["18-29"] },
		{ category: "30-59", value: normalizedAgeCounts0["30-59"] },
		{ category: "60-89", value: normalizedAgeCounts0["60-89"] },
		{ category: "Female", value: normalizedGenderCounts0["Female"] },
		{ category: "Male", value: normalizedGenderCounts0["Male"] },
		{ category: "Republican", value: normalizedPartyCounts0["Republican"] },
		{ category: "Democrat", value: normalizedPartyCounts0["Democrat"] },
		{
			category: "Independent",
			value: normalizedPartyCounts0["Independent"],
		},
		{
			category: "Other",
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
	const radarDataList = [];
	radarDataList.push(radarData1, radarData0);
	renderChart(radarDataList, 0, null, shouldAnimate);
}

updateChart(2018, option); // Start with the year 2018

document.addEventListener("DOMContentLoaded", async () => {
	await startIntroAnimation(); // Start the intro animation
	// Initialisiere die Animation
	initIntroAnimation(750, 200, () => {
		const renderChart = document.getElementById("renderChart");
		renderChart.style.opacity = "1"; // Mache den renderChart sichtbar
		renderChart.style.display = "flex"; // Stelle sicher, dass es im Flex-Container bleibt

		// Create the dropdown menu and pass the setGlobalOption function
		createDropdownMenu(setGlobalOption);

		// Optional: Chart aktualisieren
		updateChart(2018, option);
	});

	// Initialisiere den Play-Button mit dem Slider und der updateChart-Funktion
	initializePlayButton("year-slider", (year) => updateChart(year, option, false));
});

// Event listener for support and against elements
document.querySelector(".against").addEventListener("click", () => {
	const currentFilterOption = "against";
	const selectedYear = parseInt(document.getElementById("year-slider").value);
	updateChartByCategory(selectedYear, currentFilterOption);
});

document.querySelector(".support").addEventListener("click", () => {
	const currentFilterOption = "support";
	const selectedYear = parseInt(document.getElementById("year-slider").value);
	updateChartByCategory(selectedYear, currentFilterOption);
});

// // Call the function to create and design the slider
const slider = createAndDesignSlider();

// Event listener for the year slider to update the chart
slider.addEventListener("input", function (e) {
	const selectedYear = parseInt(e.target.value);
	document.getElementById("selected-year").innerText = selectedYear; // Update display
	updateChart(selectedYear, option, false); // Pass the selected year to updateChart
});
