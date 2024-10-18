// Function to render the radar chart
export function renderChart(radarDataList,colorMode,opinion) {
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

    const subcategories = radarDataList[0].map(d => d.category);
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
    let labelOffset;
    if (['0-9', '10-15', '16+','18-29', '30-59', '60-89'].includes(subcat)) {
        // Bring these specific categories closer to the graph
        labelOffset = maxValue + 0.6;  // Closer offset for upper categories
    } else {
        // For other categories, use a standard offset
        labelOffset = maxValue + 0.8;  // Further offset for other categories
    }

    const labelCoord = angleToCoord(angle, labelOffset);  // Adjusted the offset based on the category

    // Adjust rotation based on category
    let rotationAngle;
    switch (subcat) {
        case '0-9':
        case '10-15':
        case '16+':
        case '18-29':
        case '30-59':
        case '60-89':
            // These categories should be upright
            rotationAngle = (angle * 180 / Math.PI) + 90;  // Standard rotation
            break;
        default:
            // Default rotation for other categories
            rotationAngle = (angle * 180 / Math.PI) + 90 + 180;  // Flip for other categories
    }

    // Create the text element with the appropriate rotation
    svg.append("text")
        .attr("x", labelCoord.x)
        .attr("y", labelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", colors.subcategoryText) // Set color to grey
        .attr("transform", `rotate(${rotationAngle}, ${labelCoord.x}, ${labelCoord.y})`) // Apply rotation
        .text(subcat);
});

// Add main category labels
Object.keys(mainCategoryPositions).forEach(category => {
    const subcatIndices = mainCategoryPositions[category];
    const averageIndex = subcatIndices.reduce((a, b) => a + b) / subcatIndices.length; // Calculate average index
    const angle = angleSlice * averageIndex - Math.PI / 2; // Average angle based on indices
    const labelCoord = angleToCoord(angle, maxValue + 3); // Adjust the offset for main category labels

    // Adjust rotation for main category labels
    let rotationAngle;

    // Flip angles for specific categories
    if (category === "Gender") {
        rotationAngle = -77; // Set rotation angle for Gender
    } else if (category === "Education") {
        rotationAngle = -60; // Set rotation angle for Education
    } else if (averageIndex >= 0 && averageIndex < (subcategories.length / 2)) {
        // For lower half of the circle, keep it upright
        rotationAngle = (angle * 180 / Math.PI) + 90; // Rotate +90 degrees
    } else {
        // For upper half, also keep it upright but can also consider flipping if needed
        rotationAngle = (angle * 180 / Math.PI) + 90 + 180; // Flip for upper half
    }

    svg.append("text")
        .attr("class", "main-category-label") // Add class for main category labels
        .attr("x", labelCoord.x)
        .attr("y", labelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px") // Adjust font size as needed
        .attr("fill", "white")
        .attr("transform", `rotate(${rotationAngle}, ${labelCoord.x}, ${labelCoord.y})`) // Apply rotation
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

    const coordinatesList = []; 
    for (let i = 0; i < radarDataList.length; i++) {
        const radarData = radarDataList[i];
        const coordinates = getCoordinates(radarData);
        coordinatesList.push(coordinates);  // Push the coordinates to the list
    }
    
    const line = d3
    .line()
    .curve(d3.curveCardinalClosed) // Smooth lines with closing curve
    .x((d) => d.x)
    .y((d) => d.y);


    // Draw the glow circle in the background
    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", maxRadius) // Radius for the glow
        .attr("fill", "white") // Color of the glow
        .attr("filter", "url(#whiteGlow)") // Apply the glow filter
        .attr("opacity", 0.01); // Adjust opacity of the glow

if (colorMode == 0){
    console.log("use color mode 1");
    svg.append("path")
        .datum(coordinatesList[1])
        .attr("d", line)
        .attr("stroke", colors.glowDataset0) // Glow stroke
        .attr("fill", "url(#gradientDataset0)") // Fill with gradient
        .attr("opacity", 0.5); // Set opacity for transparency
    svg.append("path")
        .datum(coordinatesList[0])
        .attr("d", line)
        .attr("stroke", colors.glowDataset1) // Glow stroke
        .attr("fill", "url(#gradientDataset1)") // Fill with gradient
        .attr("opacity", 0.5); // Set opacity for transparency   
} else {
    for (let i = 0; i < coordinatesList.length; i++) {
        if (opinion == "support") {
            svg.append("path")
            .datum(coordinatesList[i])
            .attr("d", line)
            .attr("stroke", colors.glowDataset1) // Glow stroke
            .attr("fill", "url(#gradientDataset1)") // Fill with gradient
            .attr("opacity", 0.15); // Set opacity for transparency
        } else {
            svg.append("path")
                .datum(coordinatesList[i])
                .attr("d", line)
                .attr("stroke", colors.glowDataset0) // Glow stroke
                .attr("fill", "url(#gradientDataset0)") // Fill with gradient
                .attr("opacity", 0.15); // Set opacity for transparency
        }
    }
}

    // Define the radius for calculating pixel-to-radian conversion
    const radius = 255; // Midpoint between the inner and outer radius of the purple band

    // Calculate the angular gap for 15 pixels
    const angularGap = (50 / (2 * Math.PI * radius)) * 2 * Math.PI;

    // Define the angles for the categories
    const angleFemale = angleSlice * 3; // Angle for "Female"
    const angleMale = angleSlice * 4.; // Angle for "Male"
    const angleRepublican = angleSlice * 5; // Angle for "Republican"
    const angleOther = angleSlice * 8; // Angle for "Democrat"
    const angle0_9 = angleSlice * 9; // Angle for "Republican"
    const angle16 = angleSlice * 11; // Angle for "Democrat"
    const angle18_30 = angleSlice * 12; // Angle for "Republican"
    const angle61_89 = angleSlice * 14; // Angle for "Democrat"

    const innerRadius = 295; // Inner radius of the purple band
    const outerRadius = 300; // Outer radius of the purple band
    
    // Define the arcs for the purple band with gaps
    const purpleArcForGender = d3.arc()
        .innerRadius(innerRadius) // Use the new inner radius
        .outerRadius(outerRadius) // Use the new outer radius
        .startAngle(angleFemale - angularGap) // Start angle for "Female"
        .endAngle(angleMale + angularGap); // End angle for "Male"
    
    const purpleArcForParty = d3.arc()
        .innerRadius(innerRadius) // Use the new inner radius
        .outerRadius(outerRadius) // Use the new outer radius
        .startAngle(angleRepublican - angularGap) // Start angle for "Republican"
        .endAngle(angleOther + angularGap); // End angle for "Democrat"
    
    const purpleArcForEducation = d3.arc()
        .innerRadius(innerRadius) // Use the new inner radius
        .outerRadius(outerRadius) // Use the new outer radius
        .startAngle(angle0_9 - angularGap) // Start angle for "0-9"
        .endAngle(angle16 + angularGap); // End angle for "16+"
    
    const purpleArcForAge = d3.arc()
        .innerRadius(innerRadius) // Use the new inner radius
        .outerRadius(outerRadius) // Use the new outer radius
        .startAngle(angle18_30 - angularGap) // Start angle for "18-30"
        .endAngle(angle61_89 + angularGap); // End angle for "61-89"
    svg.append("path")
        .attr("d", purpleArcForGender())
        .attr("fill", "white")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center

    svg.append("path")
        .attr("d", purpleArcForParty())
        .attr("fill", "white")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center
        
     svg.append("path")
        .attr("d", purpleArcForEducation())
        .attr("fill", "white")
        .attr("transform", `translate(${centerX}, ${centerY})`); // Move the arc to the center

        svg.append("path")
        .attr("d", purpleArcForAge())
        .attr("fill", "white")
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
