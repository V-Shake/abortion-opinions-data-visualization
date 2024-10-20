import { data } from "./data.js"; 
console.log(data); // Should log your data array
export function renderChart(radarDataList, colorMode, opinion, shouldAnimate = true) {
    const width = 900;
    const height = 900;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = 250; // Maximum radius for the chart
    const maxValue = 9.6;  // Maximum value for data points
    const ticks = [2, 4, 6, 8, 10]; // Tick values for the circles
    const totalCount = radarDataList[0].reduce((sum, d) => sum + d.value, 0); // Assuming radarDataList[0] has the counts for dataset 1

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

    // Draw the gridlines (circles) with animation
    const gridlines = svg.selectAll("circle.gridline")
        .data(ticks)
        .join("circle")
        .attr("class", "gridline") // Add class for potential styling
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("fill", "none")
        .attr("stroke", "#2A2A2A") // Grey
        .attr("r", d => radialScale(d))  // Map tick values to radial distance
        .attr("opacity", shouldAnimate ? 0 : 1); // Start hidden if animating

    if (shouldAnimate) {
        gridlines.transition()
            .duration(1000) // Animation duration
            .delay((d, i) => i * 200) // Stagger the animation for each circle
            .attr("opacity", 1); // Fade in
    }

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

    // Assuming radarDataList contains the counts for both datasets in the format:
// radarDataList[0] = [{category: 'Female', value: 60}, {category: 'Male', value: 40}, ...];
// radarDataList[1] = [{category: 'Female', value: 55}, {category: 'Male', value: 45}, ...];

const totalCountDataset1 = radarDataList[0].reduce((sum, d) => sum + d.value, 0); // Total for dataset 1
const totalCountDataset0 = radarDataList[1].reduce((sum, d) => sum + d.value, 0); // Total for dataset 0

// Create the tooltip
const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background-color", "#353738") // Slightly transparent grey
    .style("color", "white")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("visibility", "hidden");  // Initially hidden

    // Create axes and subcategory labels
    subcategories.forEach((subcat, i) => {
        const angle = angleSlice * i - Math.PI / 2; // Calculate angle for the axis
        const lineCoord = angleToCoord(angle, maxValue); // Full length of the axis to maxValue

        // Create the axis lines
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", lineCoord.x)
            .attr("y2", lineCoord.y)
            .attr("stroke", "#2A2A2A") // Grey color for the lines
            .attr("stroke-width", 1);

    const labelOffset = ['0-9', '10-15', '16+', '18-29', '30-59', '60-89'].includes(subcat) 
            ? maxValue + 0.6  // Closer offset for upper categories
            : maxValue + 0.8; // Further offset for other categories

        const labelCoord = angleToCoord(angle, labelOffset); // Adjusted label coordinates

        // Calculate rotation angle
        const rotationAngle = (angle * 180 / Math.PI) + 90; // Standard rotation for text

    // Create the text element with hover functionality
    svg.append("text")
        .attr("x", labelCoord.x)
        .attr("y", labelCoord.y)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", colors.subcategoryText) // Set color for the text
        .attr("transform", `rotate(${rotationAngle}, ${labelCoord.x}, ${labelCoord.y})`) // Apply rotation
        .text(subcat)
        .style("cursor", "default") // Set cursor style
        .on("mouseover", () => {
            const valueDataset1 = radarDataList[0][i].value; // Actual count for dataset1
            const valueDataset0 = radarDataList[1][i].value; // Actual count for dataset0
    
            // Combine the values to get total counts
            const totalCount = valueDataset1 + valueDataset0;
    
            // Calculate the percentages based on the combined total
            const percentage1 = totalCount > 0 ? ((valueDataset1 / totalCount) * 100).toFixed(0) : 0; // Calculate percentage for dataset1
            const percentage0 = totalCount > 0 ? ((valueDataset0 / totalCount) * 100).toFixed(0) : 0; // Calculate percentage for dataset0
    
            // Assuming 'subcat' represents the educational years category (0-9, 10-15, 16+)
            const category = subcat; // You might adjust this based on your logic
    
            tooltip.style("visibility", "visible");
            if (category === "0-9" || category === "10-15" || category === "16+") {
                tooltip.html( // Use .html() for line breaks
                    `Individuals with ${category} years in education:<br>` +
                    `${percentage1}% support, ${percentage0}% oppose`
                ); // Detailed tooltip for education categories
            } else if (category === "18-29" || category === "30-59" || category === "60-89") {
                tooltip.html(`${subcat} year olds:<br>${percentage1}% support, ${percentage0}% oppose`); // Tooltip for age categories
            } else {
                tooltip.html(`${subcat}s:<br>${percentage1}% support, ${percentage0}% oppose`); // Simpler tooltip for other categories
            }
        })
        .on("mousemove", (event) => {
            const category = subcat; // Get the current category

            // Position tooltip based on category
            if (category === "0-9" || category === "10-15" || category === "16+" || category === "Independent" || category === "Other") {
                tooltip.style("top", (event.pageY + 10) + "px")  // Keep the vertical position the same
                       .style("left", (event.pageX - tooltip.node().getBoundingClientRect().width - 10) + "px"); // Position tooltip to the left
            } else {
                tooltip.style("top", (event.pageY + 10) + "px")  // Offset tooltip position from mouse Y
                       .style("left", (event.pageX + 10) + "px"); // Offset tooltip position from mouse X
            }
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");  // Hide tooltip when not hovering
        });
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

    // Calculate the area of a radar polygon
    function calculateArea(coordinates) {
        let area = 0;
        const n = coordinates.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += coordinates[i].x * coordinates[j].y;
            area -= coordinates[j].x * coordinates[i].y;
        }
        return Math.abs(area) / 2;
    }

    // Calculate areas and store with original index
    const coordinatesWithAreas = radarDataList.map((radarData, index) => {
        const coordinates = getCoordinates(radarData);
        const area = calculateArea(coordinates);
        return { index, coordinates, area };
    });

    // Sort by area in descending order (largest first)
    coordinatesWithAreas.sort((a, b) => b.area - a.area);

    // Render the paths in order from largest to smallest with animation
    if (colorMode == 0) {
        // Render the two blobs
        coordinatesWithAreas.forEach((item) => {
            const isDataset1 = item.index === 0;
            const color = isDataset1 ? colors.dataset1 : colors.dataset0;
            const glowColor = isDataset1 ? colors.glowDataset1 : colors.glowDataset0;
            const gradientId = isDataset1 ? "gradientDataset1" : "gradientDataset0";

            const path = svg.append("path")
                .datum(item.coordinates)
                .attr("d", line([{ x: centerX, y: centerY }])) // Start from center
                .attr("stroke", glowColor)
                .attr("fill", `url(#${gradientId})`)
                .attr("opacity", 0.5)
                .attr("class", shouldAnimate ? "scale-up" : "") // Add CSS class for scaling if animating
                .transition()
                .delay(shouldAnimate ? 1000 : 0)
                .duration(shouldAnimate ? 2000 : 0) // Animation duration in milliseconds
                .attrTween("d", function () {
                    return function (t) {
                        const interpolatedCoordinates = item.coordinates.map(coord => ({
                            x: (coord.x - centerX) * t + centerX,
                            y: (coord.y - centerY) * t + centerY
                        }));
                        return line(interpolatedCoordinates); // Remove the additional parentheses
                    };
                });
        });
    } else {
        // Render all categories
        coordinatesWithAreas.forEach((item) => {
            const color = opinion === "support" ? colors.dataset1 : colors.dataset0;
            const glowColor = opinion === "support" ? colors.glowDataset1 : colors.glowDataset0;
            const gradientId = opinion === "support" ? "gradientDataset1" : "gradientDataset0";

            const path = svg.append("path")
                .datum(item.coordinates)
                .attr("d", line([{ x: centerX, y: centerY }])) // Start from center
                .attr("stroke", glowColor)
                .attr("fill", `url(#${gradientId})`)
                .attr("opacity", 0.15)
                .attr("class", shouldAnimate ? "scale-up" : "") // Add CSS class for scaling if animating
                .transition()
                .delay(shouldAnimate ? 1000 : 0)
                .duration(shouldAnimate ? 2000 : 0) // Animation duration in milliseconds
                .attrTween("d", function () {
                    return function (t) {
                        const interpolatedCoordinates = item.coordinates.map(coord => ({
                            x: (coord.x - centerX) * t + centerX,
                            y: (coord.y - centerY) * t + centerY
                        }));
                        return line(interpolatedCoordinates); // Remove the additional parentheses
                    };
                });
        });
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

    const innerRadius = 299; // Inner radius of the purple band
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
