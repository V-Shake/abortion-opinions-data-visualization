export function renderChart(radarData1, radarData0) {
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
        .join("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", d => radialScale(d));  // Radial distance based on tick value

    // Define the subcategories based on the unified radar data
    const subcategories = radarData1.map(d => d.category);
    let numAxes = subcategories.length;  // 6 axes (3 for age, 3 for gender)
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

    // Prepare path coordinates for the blue blob
    let coordinates1 = radarData1.map((d, i) => {
        let angle = angleSlice * i - Math.PI / 2;
        return angleToCoord(angle, d.value);
    });

    // Prepare path coordinates for the red blob
    let coordinates0 = radarData0.map((d, i) => {
        let angle = angleSlice * i - Math.PI / 2;
        return angleToCoord(angle, d.value);
    });

    // Create a line generator with smooth edges using d3.curveCardinal
    let line = d3.line()
        .curve(d3.curveCardinal)  // Use Cardinal curve for smoothing
        .x(d => d.x)
        .y(d => d.y);

        svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "red")
        .attr("opacity", 0.5);

        svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "blue")
        .attr("opacity", 0.5);

    }