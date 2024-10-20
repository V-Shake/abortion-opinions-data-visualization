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

    // List of years with no data
    const noDataYears = [1979, 1981, 1986, 1992, 1995, 1997, 1999, 2001, 2003, 2005, 2007, 2009, 2011, 2013, 2015, 2017];

    // Calculate the width and create year labels
    const minYear = 1977;
    const maxYear = 2018;
    for (let year = minYear; year <= maxYear; year++) {
        const yearLabel = document.createElement("span");
        yearLabel.innerText = year;
        yearLabel.style.fontSize = "10px";
        yearLabel.style.fontFamily = 'LTUnivers 330 BasicLight', 'Helvetica'; 
        yearLabel.style.position = "absolute"; // Position absolutely inside the container
        yearLabel.style.transform = "rotate(-90deg)"; // Rotate counterclockwise
        yearLabel.style.transformOrigin = "left bottom"; // Set origin for rotation
        yearLabel.style.cursor = "pointer"; // Change cursor to pointer for interactivity
        yearLabel.style.fontWeight = year === 2018 ? "bold" : "normal"; // Set initial weight
        yearLabel.style.color = "white";

        // Check if the year is in the no data list
        if (noDataYears.includes(year)) {
            yearLabel.style.opacity = "0.2"; // Set opacity for years without data
        }

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
			updateChart(year, option, false); // Pass false for shouldAnimate
		});

        yearsContainer.appendChild(yearLabel);
    }

    // Append the years container to the slider wrapper
    sliderWrapper.appendChild(yearsContainer);

    // Append the entire sliderWrapper to the body
    document.body.appendChild(sliderWrapper);

    // Add event listener to update selected year when slider value changes
    slider.addEventListener("input", function (e) {
        const selectedYear = parseInt(e.target.value);
        document.getElementById("selected-year").innerText = selectedYear; // Update display
    
        // Use the current filter option (support, against, or support vs. against)
        updateChart(selectedYear, currentFilterOption, false); // Pass the selected year and the current filter option to updateChart
    
        // Collect and log subcategory values for both "1" and "0"
        const optionValues = ["1", "0"];
        optionValues.forEach(optionValue => {
            const subcategoryValues = collectSubcategoryValues(data, selectedYear, optionValue, currentFilterOption);
            console.log(`Year: ${selectedYear}, Option: ${currentFilterOption}, Option Value: ${optionValue}`);
            console.log(`Age Counts (Year ${selectedYear}, Option ${currentFilterOption}, Option Value ${optionValue}):`, subcategoryValues.ageCounts);
            console.log(`Gender Counts (Year ${selectedYear}, Option ${currentFilterOption}, Option Value ${optionValue}):`, subcategoryValues.genderCounts);
            console.log(`Party Counts (Year ${selectedYear}, Option ${currentFilterOption}, Option Value ${optionValue}):`, subcategoryValues.partyCounts);
            console.log(`Education Counts (Year ${selectedYear}, Option ${currentFilterOption}, Option Value ${optionValue}):`, subcategoryValues.educationCounts);
        });
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