export function createAndDesignSlider() {
	// Create a container that will hold the slider and year labels
	const sliderWrapper = document.createElement("div");
	sliderWrapper.style.position = "absolute";
	sliderWrapper.style.top = "90%";
	sliderWrapper.style.left = "50%";
	sliderWrapper.style.transform = "translateX(-50%)"; // Center it horizontally
	sliderWrapper.style.width = "60%"; // Make it responsive
	sliderWrapper.style.overflow = "visible"; // Allow overflow to show year labels
	sliderWrapper.style.display = "flex";
	sliderWrapper.style.flexDirection = "column";
	sliderWrapper.style.alignItems = "center";

	// Create the label for displaying the selected year
	const label = document.createElement("label");
	const selectedYearSpan = document.createElement("span");
	selectedYearSpan.id = "selected-year";
	selectedYearSpan.style.display = "none";
	selectedYearSpan.style.fontWeight = "bold";
	selectedYearSpan.innerText = "2018"; // Initialize selected year
	label.innerHTML = ``;
	label.appendChild(selectedYearSpan); // Append span to label

	// Create the input (slider)
	const slider = document.createElement("input");
	slider.type = "range";
	slider.id = "year-slider";
	slider.min = "1977";
	slider.max = "2018";
	slider.step = "1";
	slider.value = "2018";
	slider.style.width = "100%"; // Take full width of the container
	slider.style.marginTop = "1.8em"; // Space between label and slider
	slider.style.appearance = "none"; // Remove default styling
	slider.style.height = "5px"; // Set the height of the slider
	slider.style.borderRadius = "5px"; // Round the edges
	slider.style.outline = "none"; // Remove the outline
	slider.style.background = "transparent";

	// Append the label and slider to the sliderWrapper
	sliderWrapper.appendChild(label);
	sliderWrapper.appendChild(slider);

	// Add year labels container
	const yearsContainer = document.createElement("div");
	yearsContainer.style.position = "relative";
	yearsContainer.style.width = "99.6%";
	yearsContainer.style.height = "30px"; // Give it a fixed height
	yearsContainer.style.marginTop = "1%"; // Space above the labels

	// Calculate the width and create year labels
	const minYear = 1977;
	const maxYear = 2018;
	for (let year = minYear; year <= maxYear; year++) {
		const yearLabel = document.createElement("span");
		yearLabel.innerText = year;
		yearLabel.style.fontSize = "9px";
		yearLabel.style.position = "absolute"; // Position absolutely inside the container
		yearLabel.style.transform = "rotate(-90deg)"; // Rotate counterclockwise
		yearLabel.style.transformOrigin = "left bottom"; // Set origin for rotation
		yearLabel.style.cursor = "pointer"; // Change cursor to pointer for interactivity
		yearLabel.style.fontWeight = year === 2018 ? "bold" : "normal"; // Set initial weight
		yearLabel.style.color = "white";
        yearLabel.style.fontFamily = 'LTUnivers 330 BasicLight', 'sans-serif'; // Set font family to Univers Light

		// Calculate position as a percentage and adjust for rotation
		const positionPercent = ((year - minYear) / (maxYear - minYear)) * 100;

		// Adjust `left` property to account for label size and rotation
		const labelAdjustment = -5; // You can fine-tune this value based on label size
		yearLabel.style.left = `calc(${positionPercent}% - ${labelAdjustment}px)`; // Adjust left to center labels

		// Add click event listener for interaction
		yearLabel.addEventListener("click", () => {
			selectedYearSpan.innerText = year; // Update selected year display
			slider.value = year; // Set the slider value
			updateYearLabels(year); // Update bold label
			slider.dispatchEvent(new Event("input")); // Trigger slider's input event
		});

		yearsContainer.appendChild(yearLabel);
	}

	// Append the years container to the slider wrapper
	sliderWrapper.appendChild(yearsContainer);

	// Append the entire sliderWrapper to the body
	document.body.appendChild(sliderWrapper);

	// Add event listener to update selected year when slider value changes
	slider.addEventListener("input", () => {
		const selectedYear = slider.value;
		selectedYearSpan.innerText = selectedYear; // Update the display
		updateYearLabels(selectedYear); // Update bold label
		// Call the chart update function here to update the chart plot
		updateChart(selectedYear); // You need to implement this function in your chart logic
	});

	// Function to update year labels
	function updateYearLabels(year) {
		const allLabels = yearsContainer.querySelectorAll("span");
		allLabels.forEach((label) => {
			label.style.fontWeight = "normal"; // Reset font weight
			if (label.innerText === year) {
				label.style.fontWeight = "bold"; // Make the corresponding label bold
			}
		});
	}

	// Return the slider element
	return slider;
}
