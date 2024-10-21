import { data } from "./data.js"; // Ensure this is only declared once
import { renderChart } from "./chart.js"; // Function for rendering radar chart
import { initIntroAnimation } from "./introAnimation.js";
import { initializePlayButton } from "./playButton.js"; // Import the play button logic
import { createDropdownMenu } from "./menu.js"; // Import the dropdown menu function
import { createAndDesignSlider } from "./slider.js";
import { startIntroAnimation } from "./Intro.js"; // Import the intro animation function

let option = "abany";
let currentFilterOption = "abany";
let currentViewMode = "support vs. against";
let initialAnimationDone = false; // Flag to control if the initial animation has been played

function setGlobalOption(selectedOption) {
    option = selectedOption; // Update the global option variable
    currentFilterOption = selectedOption; // Update the current filter option
    updateChart(1977, option, false); // Call updateChart to update the chart immediately without animation
}

function preprocessDataForYear(data, year, optionValue, option) {
	// Filter data based on the selected year and count individuals with specific 'abany' value

    let filteredData = []; // Initialize filteredData as an empty array

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

export function updateChart(year, option, shouldAnimate = true) {
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

	// Clear previous chart and render the updated chart
	d3.select("#renderer").select("svg").remove(); // Clear previous chart
	const radarDataList = [];
	radarDataList.push(radarData1, radarData0);
	renderChart(radarDataList, 0, null, shouldAnimate);
}

updateChart(1977, option); // Start with the year 1977

document.addEventListener("DOMContentLoaded", async () => {
	const buttonViewModeButton = document.createElement("button-view-mode");
	buttonViewModeButton.id = "button-view-mode";
	buttonViewModeButton.innerText = "support vs. against";
	// Add the active class to the button
	buttonViewModeButton.classList.add("button-common", "active");
	document.body.insertBefore(buttonViewModeButton, document.body.firstChild);

    buttonViewModeButton.addEventListener("click", () => {
        currentFilterOption = "abany"; // Set the current filter option to "support vs. against"
        currentViewMode = "support vs. against"; // Update the current view mode
        const selectedYear = parseInt(document.getElementById("year-slider").value);
        updateChart(selectedYear, currentFilterOption); // Update the chart with the selected year and option without animation
    
        buttonViewModeButton.classList.add("active");
        supportButton.classList.remove("active");
        againstButton.classList.remove("active");

		// Set the dropdown menu and subtitle container to full opacity
        document.getElementById("dropdown-container").style.opacity = "1";
        document.getElementById("subtitle-container").style.opacity = "1";
	});

	// Create support and against buttons
	const supportButton = document.createElement("div");
	supportButton.classList.add("button-common", "button-support");
	supportButton.innerText = "support";
	document.body.appendChild(supportButton);

	const againstButton = document.createElement("div");
	againstButton.classList.add("button-common", "button-against");
	againstButton.innerText = "against";
	document.body.appendChild(againstButton);

	// Event listener for support and against elements
	againstButton.addEventListener("click", () => {
		currentFilterOption = "against";
		currentViewMode = "against"; // Update the current view mode
		const selectedYear = parseInt(document.getElementById("year-slider").value);
		updateChartByCategory(selectedYear, currentFilterOption);

		// Set the dropdown menu and subtitle container to 5% opacity
        document.getElementById("dropdown-container").style.opacity = "0.00";
        document.getElementById("subtitle-container").style.opacity = "0.00";

		buttonViewModeButton.classList.remove("active"); // Remove the active state from the button
		supportButton.classList.remove("active");
		againstButton.classList.add("active");
	});

	supportButton.addEventListener("click", () => {
		currentFilterOption = "support";
		currentViewMode = "support"; // Update the current view mode
		const selectedYear = parseInt(document.getElementById("year-slider").value);
		updateChartByCategory(selectedYear, currentFilterOption);

		// Set the dropdown menu and subtitle container to 5% opacity
        document.getElementById("dropdown-container").style.opacity = "0.00";
        document.getElementById("subtitle-container").style.opacity = "0.00";

		buttonViewModeButton.classList.remove("active"); // Remove the active state from the button 
		againstButton.classList.remove("active");
		supportButton.classList.add("active");
	});


	// Start the intro animation (with animation)
	await startIntroAnimation();

	// Initialize the intro animation
	initIntroAnimation(750, 200, () => {
		const renderChart = document.getElementById("renderChart");
		renderChart.style.opacity = "1"; // Make the renderChart visible
		renderChart.style.display = "flex"; // Ensure it stays in the flex container

		// Create the dropdown menu and pass the setGlobalOption function
		createDropdownMenu(setGlobalOption);

		updateChart(1977, option, true); // Call updateChart WITH animation (first time only)
		initialAnimationDone = true; // Set flag to indicate the animation is done
	});


	// Initialize the play button with the slider and the updateChart function
	console.log("Initializing play button");
	initializePlayButton("year-slider", (year) => updateChart(year, currentFilterOption, false), () => currentFilterOption);
});


const slider = createAndDesignSlider();

slider.addEventListener("input", function (e) {
    const selectedYear = parseInt(e.target.value);
    document.getElementById("selected-year").innerText = selectedYear; // Update display
    
    // Check the current view mode and call the appropriate update function
    if (currentViewMode === "support vs. against") {
        updateChart(selectedYear, option, false); // Disable animation for support vs. against
    } else {
        updateChartByCategory(selectedYear, currentViewMode, false); // Disable animation for categories
    }

	// Collect and log subcategory values for both "1" and "0"
	const optionValues = ["1", "0"];
	optionValues.forEach(optionValue => {
		const subcategoryValues = collectSubcategoryValues(data, selectedYear, optionValue, option);
		console.log(`Year: ${selectedYear}, Option: ${option}, Option Value: ${optionValue}`);
		console.log(`Age Counts (Year ${selectedYear}, Option ${option}, Option Value ${optionValue}):`, subcategoryValues.ageCounts);
		console.log(`Gender Counts (Year ${selectedYear}, Option ${option}, Option Value ${optionValue}):`, subcategoryValues.genderCounts);
		console.log(`Party Counts (Year ${selectedYear}, Option ${option}, Option Value ${optionValue}):`, subcategoryValues.partyCounts);
		console.log(`Education Counts (Year ${selectedYear}, Option ${option}, Option Value ${optionValue}):`, subcategoryValues.educationCounts);
	});
});

function collectSubcategoryValues(data, year, optionValue, option) {
	// Filter data based on the selected year and option value
	let filteredData = preprocessDataForYear(data, year, optionValue, option);

	// Group the data by subcategories
	const ageCounts = groupByAge(filteredData);
	const genderCounts = groupByGender(filteredData);
	const partyCounts = groupByParty(filteredData);
	const educationCounts = groupByEducation(filteredData);

	// Return the grouped data
	return {
		ageCounts,
		genderCounts,
		partyCounts,
		educationCounts
	};
} 
export { collectSubcategoryValues };
