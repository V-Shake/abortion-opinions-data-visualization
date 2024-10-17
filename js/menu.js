// menu.js
export function createDropdownMenu(setGlobalOption) {
	const dropdownContainer = document.createElement("div");
	dropdownContainer.className = "dropdown";

	const dropdownButton = document.createElement("button");
	dropdownButton.className = "dropdown-button";
	dropdownButton.innerHTML = 'any <span class="arrow">&#9662;</span>'; // Unicode-Pfeil hinzufügen

	const dropdownContent = document.createElement("div");
	dropdownContent.className = "dropdown-content";

	const options = [
		"any",
		"rape",
		"defect embryo",
		"no more children",
		"health",
		"poverty",
		"single",
	];

	options.forEach((element) => {
		const optionElement = document.createElement("a");
		optionElement.href = "#";
		optionElement.innerText = element; // Display the option text
		optionElement.addEventListener("click", (e) => {
			e.preventDefault();
			let selectedOption; // Renamed from 'option' to 'selectedOption'
			switch (element) {
				case "any":
					selectedOption = "abany";
					break;
				case "rape":
					selectedOption = "abrape";
					break;
				case "defect embryo":
					selectedOption = "abdefect";
					break;
				case "no more children":
					selectedOption = "abnomore";
					break;
				case "health":
					selectedOption = "abhlth";
					break;
				case "poverty":
					selectedOption = "abpoor";
					break;
				case "single":
					selectedOption = "absingle";
					break;
				default:
					break;
			}
			// Update the global option and the dropdown button display
			setGlobalOption(selectedOption);
			dropdownButton.innerHTML = `${selectedOption} <span class="arrow">&#9662;</span>`; // Update button display
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
