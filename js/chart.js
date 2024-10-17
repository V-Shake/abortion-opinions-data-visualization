// Function to render the radar chart
export function renderChart(radarData1, radarData0) {
    const width = 900;
    const height = 900;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 250; // Maximum radius for the chart
    const maxValue = 9.6;  // Maximum value for data points
    const ticks = [2, 4, 6, 8, 10]; // Tick values for the circles

    // Define colors
    const colors = {
        dataset1: "#00DDFF", // Light blue
        dataset0: "red",     // Red
        glowDataset1: "#A0F9FF", // Vivid blue for glow effect
        glowDataset0: "#FF4500", // Vivid red for glow effect
        subcategoryText: "grey", // Color for subcategory labels
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
        .attr("stdDeviation", 30) // Adjust the blur radius for the glow effect
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
        .attr("stroke", "#2A2A2A") // Grey
        .attr("r", d => radialScale(d));  // Map tick values to radial distance

    const subcategories = radarData1.map(d => d.category);
    const numAxes = subcategories.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Define main categories and their positions
    const mainCategories = ['Age', 'Gender', 'Party', 'Education'];
    const mainCategoryPositions = {
        'Age': [0, 1, 2], // 18-30, 31-60, 61-89
        'Gender': [3, 4], // Female, Male
        'Party': [5, 6, 7, 8], // Republican, Democrat, Independent, Other
        'Education': [9, 10, 11] // 0-9, 10-15, 16+
    };

    // Create axes and subcategory labels
    subcategories.forEach((subcat, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const lineCoord = angleToCoord(angle, maxValue);  // Full length of the axis to maxValue

        // Create the axis lines
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "#2A2A2A") // Grey
            .attr("stroke-width", 1);

        // Create the labels for subcategories
        const labelCoord = angleToCoord(angle, maxValue + 1.3);  // Adjust the offset for subcategory labels
        svg.append("text")
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", colors.subcategoryText) // Set color to grey
            .text(subcat);
    });

    // Add main category labels
    Object.keys(mainCategoryPositions).forEach(category => {
        const subcatIndices = mainCategoryPositions[category];
        const averageIndex = subcatIndices.reduce((a, b) => a + b) / subcatIndices.length; // Calculate average index
        const angle = angleSlice * averageIndex - Math.PI / 2; // Average angle based on indices
        const labelCoord = angleToCoord(angle, maxValue + 3); // Adjust the offset for main category labels

        svg.append("text")
            .attr("class", "main-category-label") // Add class for main category labels
            .attr("x", labelCoord.x)
            .attr("y", labelCoord.y)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px") // Adjust font size as needed
            .attr("fill", "white")
            .text(category);
    });

    // Convert angle to coordinates
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

    // Get coordinates for the radar chart
    const getCoordinates = (data) =>
        data.map((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const value = clampValue(d.value); // Clamp the value here
            return angleToCoord(angle, value);
        });

    const coordinates0 = getCoordinates(radarData0);
    const coordinates1 = getCoordinates(radarData1);

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
        .attr("opacity", 0.01); // Adjust opacity of the glow

    // Draw the radar chart area for the second dataset
    svg.append("path")
        .datum(coordinates0)
        .attr("d", line)
        .attr("stroke", colors.glowDataset0) // Glow stroke
        .attr("fill", "url(#gradientDataset0)") // Fill with gradient
        .attr("opacity", 0.6); // Set opacity for transparency
        
    svg.append("path")
        .datum(coordinates1)
        .attr("d", line)
        .attr("stroke", colors.glowDataset1) // Glow stroke
        .attr("fill", "url(#gradientDataset1)") // Fill with gradient
        .attr("opacity", 0.6); // Set opacity for transparency



    // Define the radius for calculating pixel-to-radian conversion
    const radius = 255; // Midpoint between the inner and outer radius of the purple band

    // Calculate the angular gap for 15 pixels
    const angularGap = (15 / (2 * Math.PI * radius)) * 2 * Math.PI;

    // Define the angles for the categories
    const angleFemale = angleSlice * 3; // Angle for "Female"
    const angleMale = angleSlice * 4.; // Angle for "Male"
    const angleRepublican = angleSlice * 5; // Angle for "Republican"
    const angleOther = angleSlice * 8; // Angle for "Democrat"
    const angle0_9 = angleSlice * 9; // Angle for "Republican"
    const angle16 = angleSlice * 11; // Angle for "Democrat"
    const angle18_30 = angleSlice * 12; // Angle for "Republican"
    const angle61_89 = angleSlice * 14; // Angle for "Democrat"

    // Define the arcs for the purple band with gaps
    const purpleArcForGender = d3.arc()
        .innerRadius(250) // Inner radius of the purple band
        .outerRadius(255) // Outer radius of the purple band
        .startAngle(angleFemale - angularGap) // Start angle for "Female"
        .endAngle(angleMale + angularGap); // End angle for "Male"

    const purpleArcForParty = d3.arc()
        .innerRadius(250) // Inner radius of the purple band
        .outerRadius(255) // Outer radius of the purple band
        .startAngle(angleRepublican - angularGap) // Start angle for "Republican"
        .endAngle(angleOther + angularGap); // End angle for "Democrat"

const purpleArcForEducation = d3.arc()
        .innerRadius(250) // Inner radius of the purple band
        .outerRadius(255) // Outer radius of the purple band
        .startAngle(angle0_9 - angularGap) // Start angle for "Republican"
        .endAngle(angle16 + angularGap); // End angle for "Democrat"    svg.append("path")
 const purpleArcForAge = d3.arc()
        .innerRadius(250) // Inner radius of the purple band
        .outerRadius(255) // Outer radius of the purple band
        .startAngle(angle18_30 - angularGap) // Start angle for "Republican"
        .endAngle(angle61_89 + angularGap); // End angle for "Democrat"    svg.append("path")

    svg.append("path")
        .attr("d", purpleArcForGender())
        .attr("fill", "purple")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center

    svg.append("path")
        .attr("d", purpleArcForParty())
        .attr("fill", "purple")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center
        
     svg.append("path")
        .attr("d", purpleArcForEducation())
        .attr("fill", "purple")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center

        svg.append("path")
        .attr("d", purpleArcForAge())
        .attr("fill", "purple")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center

    const genderLabelCoord = angleToCoord((angleFemale + angleMale) / 2, maxValue + 4); // Midpoint for Gender arc
    svg.append("text")
        .attr("x", genderLabelCoord.x)
        .attr("y", genderLabelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px") // Adjust font size as needed
        .attr("fill", "white")

    const partyLabelCoord = angleToCoord((angleRepublican + angleOther) / 2, maxValue + 4); // Midpoint for Party arc
    svg.append("text")
        .attr("x", partyLabelCoord.x)
        .attr("y", partyLabelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px") // Adjust font size as needed
        .attr("fill", "white")


const educationLabelCoord = angleToCoord((angle0_9 + angle16) / 2, maxValue + 4); // Midpoint for Party arc
    svg.append("text")
        .attr("x", educationLabelCoord.x)
        .attr("y", educationLabelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px") // Adjust font size as needed
        .attr("fill", "white")

const ageLabelCoord = angleToCoord((angle18_30 + angle61_89) / 2, maxValue + 4); // Midpoint for Party arc
    svg.append("text")
        .attr("x", ageLabelCoord.x)
        .attr("y", ageLabelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px") // Adjust font size as needed
        .attr("fill", "white")
}
