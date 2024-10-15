// Funktion zum Erstellen des Dropdown-Menüs
export function createDropdownMenu() {
	const dropdownContainer = document.createElement("div");
	dropdownContainer.className = "dropdown";

	const dropdownButton = document.createElement("button");
	dropdownButton.className = "dropdown-button";
	dropdownButton.innerHTML = 'any <span class="arrow">&#9662;</span>'; // Unicode-Pfeil hinzufügen

	const dropdownContent = document.createElement("div");
	dropdownContent.className = "dropdown-content";

	const options = [
		"rape",
		"defect embryo",
		"no more children",
		"health",
		"poverty",
		"single",
	];

	options.forEach((option) => {
		const optionElement = document.createElement("a");
		optionElement.href = "#";
		optionElement.innerText = option;
		optionElement.addEventListener("click", (e) => {
			e.preventDefault();
			dropdownButton.innerHTML = `${option} <span class="arrow">&#9662;</span>`; // Unicode-Pfeil beibehalten
			// Hier können Sie eine Funktion aufrufen, um das Diagramm basierend auf der ausgewählten Option zu aktualisieren
			updateChartWithOption(option);
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

// Funktion zum Aktualisieren des Diagramms basierend auf der ausgewählten Option
function updateChartWithOption(option) {
	// Hier können Sie die Logik zum Aktualisieren des Diagramms basierend auf der ausgewählten Option hinzufügen
	console.log(`Selected option: ${option}`);
}
