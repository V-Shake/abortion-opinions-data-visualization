let isPlaying = false; // State to track if animation is running
let intervalId; // Variable to store the interval function

export function initializePlayButton(
	sliderId,
	updateChartFunction,
	startYear = 1977,
	endYear = 2018
) {
	const playButton = document.getElementById("play-button");
	const yearSlider = document.getElementById(sliderId);

	// Play/Pause button click event listener
	playButton.addEventListener("click", function () {
		if (isPlaying) {
			stopAnimation();
		} else {
			startAnimation();
		}
	});

	function startAnimation() {
		isPlaying = true;
		playButton.innerHTML = "⏸"; // Change button text to Pause symbol

		let currentYear = parseInt(yearSlider.value); // Get the current slider value

		// If current year is at the end (e.g., 2018), restart from startYear (1977)
		if (currentYear >= endYear) {
			currentYear = startYear;
		}

		const availableYears = [
			1977, 1978, 1980, 1982, 1983, 1984, 1985, 1987, 1988, 1989, 1990,
			1991, 1993, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010,
			2012, 2014, 2016, 2018,
		]; // List of years with data

		// Play forward through available years
		intervalId = setInterval(function () {
			if (currentYear <= endYear) {
				if (availableYears.includes(currentYear)) {
					yearSlider.value = currentYear; // Update the slider value
					document.getElementById("selected-year").innerText =
						currentYear; // Update the displayed year
					updateChartFunction(currentYear); // Call the updateChart function with the current year
				}
				currentYear =
					availableYears.find((year) => year > currentYear) ||
					endYear + 1; // Move to the next available year
			} else {
				stopAnimation(); // Stop when we reach the end year (2018)
			}
		}, 500); // Adjust the speed (500 ms between years)
	}

	function stopAnimation() {
		isPlaying = false;
		clearInterval(intervalId); // Stop the interval
		playButton.innerHTML = "▶"; // Change button text to Play symbol
	}
}
