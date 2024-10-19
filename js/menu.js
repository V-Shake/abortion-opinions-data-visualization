// menu.js
export function createDropdownMenu(setGlobalOption) {
	const dropdownContainer = document.createElement("div");
	dropdownContainer.className = "dropdown";

	const dropdownButton = document.createElement("button");
	dropdownButton.className = "dropdown-button";
	dropdownButton.innerHTML = 'Any Reason <span class="arrow">&#9662;</span>'; // Unicode-Pfeil hinzufügen

	const dropdownContent = document.createElement("div");
	dropdownContent.className = "dropdown-content";

	const options = [
		"Any Reason",
		"Rape",
		"Defect Embryo",
		"No More Children",
		"Health",
		"Poverty",
		"Single Woman",
	];

	options.forEach((element) => {
		const optionElement = document.createElement("a");
		optionElement.href = "#";
		optionElement.innerText = element; // Display the option text
		optionElement.addEventListener("click", (e) => {
			e.preventDefault();
			let selectedOption; // Renamed from 'option' to 'selectedOption'
			switch (element) {
				case "Any Reason":
					selectedOption = "abany";
					break;
				case "Rape":
					selectedOption = "abrape";
					break;
				case "Defect Embryo":
					selectedOption = "abdefect";
					break;
				case "No More Children":
					selectedOption = "abnomore";
					break;
				case "Health":
					selectedOption = "abhlth";
					break;
				case "Poverty":
					selectedOption = "abpoor";
					break;
				case "Single Woman":
					selectedOption = "absingle";
					break;
				default:
					break;
			}
			// Update the global option and the dropdown button display
			setGlobalOption(selectedOption);
			dropdownButton.innerHTML = `${element} <span class="arrow">&#9662;</span>`; // Update button display
			updateChart(2018, selectedOption); // Call updateChart with the new selected option
		});
		dropdownContent.appendChild(optionElement);
	});

	dropdownContainer.appendChild(dropdownButton);
	dropdownContainer.appendChild(dropdownContent);

	document
		.getElementById("dropdown-container")
		.appendChild(dropdownContainer);

	// Event listener to toggle the dropdown content
	dropdownButton.addEventListener("click", () => {
		dropdownContent.classList.toggle("show");
	});
}
