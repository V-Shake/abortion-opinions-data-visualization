export function renderChart(radarData1, radarData0) {
    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 250; // Maximum radius for the chart
    const maxValue = 9.6;  // Maximum value for data points
    const ticks = [2, 4, 6, 8, 10]; // Tick values for the circles
    const colors = {
        dataset1: "#00DDFF", // Light blue
        dataset0: "red",     // Red
        glowDataset1: "#A0F9FF", // Vivid blue for glow effect
        glowDataset0: "#FF4500", // Vivid red for glow effect
    };

    const svg = d3
        .select("#renderChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define gradients
    const defs = svg.append("defs");

    // Gradient for dataset1 (blue)
    defs.append("linearGradient")
        .attr("id", "gradientDataset1")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#003366" }, // Dark blue
            { offset: "100%", color: "#00DDFF" } // Light blue
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Gradient for dataset0 (red)
    defs.append("linearGradient")
        .attr("id", "gradientDataset0")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#660000" }, // Dark red
            { offset: "100%", color: "#FF4500" } // Light red
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Define a filter for the white glow effect
    defs.append("filter")
        .attr("id", "whiteGlow")
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 90) // Adjust the blur radius for the glow effect
        .attr("result", "blur");

    const radialScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([0, maxRadius]);

    // Draw the gridlines (circles)
    svg.selectAll("circle")
        .data(ticks)
        .join("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("fill", "none")
        .attr("stroke", "#2A2A2A") //grey
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
            .attr("stroke", "#2A2A2A") //grey
            .attr("stroke-width", 1);

        // Create the labels
        const labelCoord = angleToCoord(angle, maxValue + 0.5);  // Move the label outside the circle
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "white")
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

    const getCoordinates = (data) =>
        data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const value = clampValue(d.value); // Clamp the value here
          return angleToCoord(angle, value);
        });

    const coordinates1 = getCoordinates(radarData1);
    const coordinates0 = getCoordinates(radarData0);

    const line = d3
    .line()
    .curve(d3.curveCardinalClosed) // Smooth lines with closing curve
    .x((d) => d.x)
    .y((d) => d.y);

     // Define group boundaries
     const groups = {
        "Age": [0, 2],      // 18-30, 31-60, 61-89
        "Gender": [3, 4],   // Female, Male
        "Party": [5, 8],    // Republican, Democrat, Independent, Other
        "Education": [9, 11] // 0-9, 10-15, 16+
    };

    // Draw the glow circle in the background
    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", maxRadius) // Radius for the glow
        .attr("fill", "white") // Color of the glow
        .attr("filter", "url(#whiteGlow)") // Apply the glow filter
        .attr("opacity", 0.02); // Adjust opacity of the glow

    // Draw the radar chart area for the first dataset with glow effect
    svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", colors.glowDataset1) // Glow stroke
        .attr("stroke-width", 1) // Wider stroke for glow effect
        .attr("fill", "none") // No fill for the area
        .attr("opacity", 1); // Opacity for glow effect

    // Draw the radar chart area for the second dataset with glow effect
    svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", colors.glowDataset0) // Glow stroke
        .attr("stroke-width", 1) // Wider stroke for glow effect
        .attr("fill", "none") // No fill for the area
        .attr("opacity", 1); // Opacity for glow effect

    // Draw the radar chart areas for both datasets using gradients
    svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", colors.dataset0)
        .attr("stroke-width", 1)
        .attr("fill", "url(#gradientDataset0)") // Use gradient fill for red area
        .attr("opacity", 0.6); // Semi-transparent fill

    svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", colors.dataset1)
        .attr("stroke-width", 1)
        .attr("fill", "url(#gradientDataset1)") // Use gradient fill for blue area
        .attr("opacity", 0.6); // Semi-transparent fill
}
