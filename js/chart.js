export function renderChart(data) {
    // Dimensions and SVG setup
    let width = 600;
    let height = 600;
    let svg = d3.select("#renderer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Radial scale to map values (e.g., counts of supporters/opposers) to radial distances
    let radialScale = d3.scaleLinear()
        .domain([0, 10])  // Domain can be adjusted based on data
        .range([0, 250]);  // 250 is the radius

    // Define tick marks for gridlines
    let ticks = [2, 4, 6, 8, 10];

    // Draw the gridlines (circles) centered in the SVG
    svg.selectAll("circle")
        .data(ticks)
        .join(
            enter => enter.append("circle")
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", d => radialScale(d))  // Radial distance based on tick value
        );

    // Add tick labels for each circle (gridline)
    svg.selectAll(".ticklabel")
        .data(ticks)
        .join(
            enter => enter.append("text")
                .attr("class", "ticklabel")
                .attr("x", width / 2 + 5)  // Offset x slightly to avoid overlap with axis
                .attr("y", d => height / 2 - radialScale(d))  // Adjust for SVG's coordinate system
                .attr("font-size", "10px")
                .attr("fill", "gray")
                .text(d => d.toString())  // The tick value (e.g., 2, 4, 6, 8, 10)
        );

    // Define the 14 subcategories (Sex, Age, Education, Party)
    const subcategories = [
        "Female", "Male",  // Sex
        "18-30", "31-60", "61-89",  // Age
        "0-5", "6-10", "11-15", "16-20",  // Education
        "Democrat", "Republican", "Independent", "Other"  // Party
    ];

    let numAxes = subcategories.length;  // 14 axes
    let angleSlice = (Math.PI * 2) / numAxes;  // Angle between each axis

    // Draw axes from the center
    subcategories.forEach((subcat, i) => {
        let angle = angleSlice * i - Math.PI / 2;  // Calculate angle for each axis
        let lineCoord = angleToCoord(angle, 10);  // Calculate end of the axis line

        // Draw the axis lines
        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Add labels at the end of each axis
        let labelCoord = angleToCoord(angle, 10.5);  // Slightly further than the axis line
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(subcat);
    });

    // Helper function to calculate coordinates for the axes
    function angleToCoord(angle, value) {
        let r = radialScale(value);
        let x = Math.cos(angle) * r + width / 2;
        let y = Math.sin(angle) * r + height / 2;
        return { x: x, y: y };
    }

    // Define colors for supporters and opposers
    let colors = ["darkgreen", "darkred"]; // Green for support, Red for opposition

    // Define the line generator for the paths
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    // Function to get path coordinates
    function getPathCoordinates(data_point) {
        let coordinates = [];
        for (var i = 0; i < subcategories.length; i++) {
            let ft_name = subcategories[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / subcategories.length);
            
            // Get the value for the current feature
            let value = data_point[ft_name];

            // Handle numeric values and NA
            if (value === 10) { // Support
                coordinates.push(angleToCoord(angle, 10)); // Full support
            } else if (value === 0) { // Opposition
                coordinates.push(angleToCoord(angle, 0)); // Full opposition
            } else {
                coordinates.push(angleToCoord(angle, 0)); // Default for 'NA' or invalid data
            }
        }
        return coordinates;
    }


    // Plotting the data
    svg.selectAll("path")
        .data(data) // 'data' should contain your processed data for supporters and opposers
        .join(
            enter => enter.append("path")
                .datum(d => getPathCoordinates(d)) // Get coordinates for each data point
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (_, i) => colors[i]) // Use the defined colors for each data point
                .attr("fill", "none") // Changed to "none" to not fill the area (only outline)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5)
        );
}
