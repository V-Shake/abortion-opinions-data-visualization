import { updateChart } from "./main.js";

export function createDropdownMenu(setGlobalOption) {
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "menu";

    const dropdownItem = document.createElement("div");
    dropdownItem.className = "item";

    const dropdownLink = document.createElement("a");
    dropdownLink.href = "#";
    dropdownLink.className = "link";
    dropdownLink.innerHTML = 'any reason <svg viewBox="0 0 360 360" xml:space="preserve"><g id="SVGRepo_iconCarrier"><path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"></path></g></svg>';

    const dropdownContent = document.createElement("div");
    dropdownContent.className = "submenu";

    const options = [
        "any reason",
        "rape",
        "fetal defect",
        "no more children",
        "health risk",
        "poverty",
        "single woman",
    ];

    options.forEach((element) => {
        const optionElement = document.createElement("div");
        optionElement.className = "submenu-item";
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.className = "submenu-link";
        optionLink.innerText = element;

        optionLink.addEventListener("click", (e) => {
            e.preventDefault();
            let selectedOption; 
            switch (element) {
                case "any reason":
                    selectedOption = "abany";
                    break;
                case "rape":
                    selectedOption = "abrape";
                    break;
                case "fetal defect":
                    selectedOption = "abdefect";
                    break;
                case "no more children":
                    selectedOption = "abnomore";
                    break;
                case "health risk":
                    selectedOption = "abhlth";
                    break;
                case "poverty":
                    selectedOption = "abpoor";
                    break;
                case "single woman":
                    selectedOption = "absingle";
                    break;
                default:
                    break;
            }

            // Update the global option and the dropdown button display
            setGlobalOption(selectedOption);
            dropdownLink.innerHTML = `${element} <svg viewBox="0 0 360 360" xml:space="preserve"><g id="SVGRepo_iconCarrier"><path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"></path></g></svg>`;

            // Get the selected year from the slider
            const selectedYear = parseInt(document.getElementById("selected-year").innerText);
            updateChart(selectedYear, selectedOption); // Call updateChart with the new selected option

            // Remove 'active' class from all options
            document.querySelectorAll('.submenu-link').forEach(link => link.classList.remove('active'));
            // Add 'active' class to the clicked option
            optionLink.classList.add('active');
        });

        optionElement.appendChild(optionLink);
        dropdownContent.appendChild(optionElement);
    });

    dropdownItem.appendChild(dropdownLink);
    dropdownItem.appendChild(dropdownContent);
    dropdownContainer.appendChild(dropdownItem);

    // Add the subtitle to the DOM with the dropdown menu
    const subtitleContainer = document.createElement("div");
    subtitleContainer.id = "subtitle-container";
    const subtitleText = document.createElement("span");
    subtitleText.id = "subtitle-text";
    subtitleText.innerText = "Abortion should be legal for";
    subtitleContainer.appendChild(subtitleText);
    subtitleContainer.appendChild(dropdownContainer);

    document.body.insertBefore(subtitleContainer, document.getElementById("dropdown-container"));

    // Event listener to toggle the dropdown content
    dropdownLink.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle("show");
    });
}
