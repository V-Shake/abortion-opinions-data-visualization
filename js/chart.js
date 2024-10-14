import { data } from './data.js'; // Import the data

export function renderChart(radarData1, radarData0, selectedYear) {
    const width = 600;
    const height = 600;

    const svg = d3.select("#renderer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    const radialScale = d3.scaleLinear()
        .domain([0, 9.6])  // Set the domain to fit tick values (0-9.6)
        .range([0, 250]);  // Radius size

    const ticks = [2, 4, 6, 8, 10];  // Tick values for the circles (9 is not visible)

    // Draw the gridlines (circles)
    svg.selectAll("circle")
        .data(ticks)
        .join("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", d => radialScale(d));  // Map tick values to radial distance

    const subcategories = radarData1.map(d => d.category);
    const numAxes = subcategories.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Create axes
    subcategories.forEach((subcat, i) => {
        const angle = angleSlice * i - Math.PI / 2;

        // Line coordinates extend to tick 10
        const lineCoord = angleToCoord(angle, 10);  // Full length of the axis to 10

        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Label positioned just outside the tick 10
        const labelCoord = angleToCoord(angle, 10.5);  // Move the label outside the circle for tick 10
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(subcat);
    });

    function angleToCoord(angle, value) {
        const r = radialScale(value);
        const x = Math.cos(angle) * r + width / 2; // Centering x-coordinate
        const y = Math.sin(angle) * r + height / 2; // Centering y-coordinate
        return { x: x, y: y };
    }

    // Clamp values to a maximum of 9.6
    function clampValue(value) {
        return Math.min(value, 9.6);  // Ensure value does not exceed 9.6
    }

    const coordinates1 = radarData1.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = clampValue(d.value); // Clamp the value here

        return angleToCoord(angle, value);
    });

    const coordinates0 = radarData0.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = clampValue(d.value); // Clamp the value here

        return angleToCoord(angle, value);
    });

    const line = d3.line()
        .curve(d3.curveCardinalClosed) // Smooth lines with closing curve
        .x(d => d.x)
        .y(d => d.y);

    // Draw the radar chart area for the first dataset
    svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none") // No fill for the area
        .attr("opacity", 0.5);

    // Draw the radar chart area for the second dataset
    svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none") // No fill for the area
        .attr("opacity", 0.5);

    // Define selectedYear variable

    // Create multiple copies of the blue radar chart shape
    createMultipleCopies(coordinates1, 40, svg, "blue", data, selectedYear, width, height); // Pass the year 2018
}

// Function to create multiple copies of the radar shape
function createMultipleCopies(coordinates, numberOfCopies, svg, color, data, selectedYear, width, height) {
    // Filter data based on the selected year (2018)
    const filteredData = data.filter(person => person.year === selectedYear);

    // Create a group for labels
    const labelGroup = svg.append("g").attr("class", "label-group");

    // Check if there's any data for the selected year
    if (filteredData.length === 0) {
        console.warn(`No data available for the year: ${selectedYear}`);
        return; // Exit if no data is found for the selected year
    }

    for (let i = 1; i <= numberOfCopies; i++) {
        const scaleFactor = (numberOfCopies - i + 1) / numberOfCopies; // Decrease size for each copy
        const scaledCoordinates = coordinates.map(coord => {
            return {
                x: coord.x * scaleFactor,
                y: coord.y * scaleFactor
            };
        });

        // Randomly select a person from the filtered data
        const randomPersonIndex = Math.floor(Math.random() * filteredData.length);
        const person = filteredData[randomPersonIndex]; // Access person's info

        // Draw each scaled path
        const line = d3.line()
            .curve(d3.curveCardinalClosed)
            .x(d => d.x + width / 2 * (1 - scaleFactor)) // Centered with the original center
            .y(d => d.y + height / 2 * (1 - scaleFactor)); // Centered with the original center

        const path = svg.append("path")
            .datum(scaledCoordinates)
            .attr("d", line)
            .attr("stroke", color)
            .attr("stroke-width", 1)
            .attr("fill", "none") // No fill for the area
            .attr("opacity", 0.5);

        // Create a label for the person
        const label = labelGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", color)
            .style("visibility", "hidden") // Initially hidden
            .text(`ID: ${person.id}, Age: ${person.age}, Gender: ${person.sex}, Education: ${person.educ}`);

        // Add hover interaction
        path.on("mouseover", (event) => {
            path.attr("stroke-width", 3); // Increase the stroke width
            label.style("visibility", "visible"); // Show label
            console.log(`ID: ${person.id}, Age: ${person.age}, Gender: ${person.sex}, Education: ${person.educ}`);
        })
        .on("mouseout", () => {
            path.attr("stroke-width", 1); // Reset the stroke width
            label.style("visibility", "hidden"); // Hide label
        })
        .on("mousemove", (event) => {
            const [x, y] = d3.pointer(event); // Get mouse coordinates
            label.attr("x", x + 10) // Offset slightly from the mouse
                 .attr("y", y - 10); // Offset slightly from the mouse
        });
    }
}
