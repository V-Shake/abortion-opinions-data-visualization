export function renderChart(radarData1, radarData0) {
    let width = 600;
    let height = 600;
    let svg = d3.select("#renderer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let radialScale = d3.scaleLinear()
        .domain([0, 9.6])  // Set the domain to fit tick values (0-9)
        .range([0, 250]);  // Radius size

    let ticks = [2, 4, 6, 8, 10];  // Tick values for the circles (9 is not visible)

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
    let numAxes = subcategories.length;
    let angleSlice = (Math.PI * 2) / numAxes;

    // Create axes
    subcategories.forEach((subcat, i) => {
        let angle = angleSlice * i - Math.PI / 2;

        // Line coordinates extend to tick 10
        let lineCoord = angleToCoord(angle, 10);  // Full length of the axis to 10

        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Label positioned just outside the tick 10
        let labelCoord = angleToCoord(angle, 10.5);  // Move the label outside the circle for tick 10
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(subcat);
    });

    function angleToCoord(angle, value) {
        let r = radialScale(value);
        let x = Math.cos(angle) * r + width / 2;
        let y = Math.sin(angle) * r + height / 2;
        return { x: x, y: y };
    }

    // Clamp values to a maximum of 9
    function clampValue(value) {
        return Math.min(value, 9.6);  // Ensure value does not exceed 9
    }

    let coordinates1 = radarData1.map((d, i) => {
        let angle = angleSlice * i - Math.PI / 2;
        let value = clampValue(d.value); // Clamp the value here

        return angleToCoord(angle, value);
    });

    let coordinates0 = radarData0.map((d, i) => {
        let angle = angleSlice * i - Math.PI / 2;
        let value = clampValue(d.value); // Clamp the value here

        return angleToCoord(angle, value);
    });

    let line = d3.line()
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
}
