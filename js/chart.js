export function renderChart(radarData1, radarData0) {
    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 250; // Maximum radius for the chart
    const maxValue = 9.6;  // Maximum value for data points
    const ticks = [2, 4, 6, 8, 10]; // Tick values for the circles
    const colors = {
        dataset1: "blue",
        dataset0: "red",
    };

    const svg = d3.select("#renderer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const radialScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, maxRadius]);

    // Draw the gridlines (circles)
    svg.selectAll("circle")
        .data(ticks)
        .join("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", d => radialScale(d));  // Map tick values to radial distance

    const subcategories = radarData1.map(d => d.category);
    const numAxes = subcategories.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Create axes and labels
    subcategories.forEach((subcat, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const lineCoord = angleToCoord(angle, maxValue);  // Full length of the axis to maxValue

        // Create the axis lines
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Create the labels
        const labelCoord = angleToCoord(angle, maxValue + 0.5);  // Move the label outside the circle
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(subcat);
    });

    function angleToCoord(angle, value) {
        const r = radialScale(value);
        return {
            x: Math.cos(angle) * r + centerX,
            y: Math.sin(angle) * r + centerY
        };
    }

    // Clamp values to a maximum of 9.6
    function clampValue(value) {
        return Math.min(value, maxValue);
    }

    const getCoordinates = (data) => data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = clampValue(d.value); // Clamp the value here
        return angleToCoord(angle, value);
    });

    const coordinates1 = getCoordinates(radarData1);
    const coordinates0 = getCoordinates(radarData0);

    const line = d3.line()
        .curve(d3.curveCardinalClosed) // Smooth lines with closing curve
        .x(d => d.x)
        .y(d => d.y);

    // Draw the radar chart area for the second dataset
    svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", colors.dataset0)
        .attr("stroke-width", 2)
        .attr("fill", colors.dataset0) // No fill for the area
        .attr("opacity", 0.4);

    svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", colors.dataset1)
        .attr("stroke-width", 2)
        .attr("fill", colors.dataset1) // No fill for the area
        .attr("opacity", 0.4);
}
