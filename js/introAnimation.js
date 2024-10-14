// Select the renderer
const renderer = document.getElementById('renderer');

// Function to create a black dot
function createDot(className, size, x, y) {
    const dot = document.createElement('div');
    dot.classList.add('dot', className);
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    return dot;
}

// Function to calculate a position on a circular path
function getCircularPosition(centerX, centerY, radius, angle) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y }; // Return the new position
}

// Animation for continuous circular motion
function startCircularMotion(smallDots, innerGroupCount, outerGroupCount, centerX, centerY) {
    // Store initial angles and radii for each dot
    const angles = smallDots.map(() => Math.random() * Math.PI * 2);

    // Randomize the speed of rotation for each dot
    const angleIncrements = smallDots.map(() => 0.002 + Math.random() * 0.0012); // Random increments 

    const radii = smallDots.map((_, index) => {
        return (index < innerGroupCount) ? (10 + Math.random() * 80) : (110 + Math.random() * 20); // Inner group radius (10 to 95) and outer group radius (110 to 130)
    });

    // Animate the dots continuously
    const animateDots = () => {
        smallDots.forEach((dot, index) => {
            const radius = radii[index]; // Get the defined radius for this dot
            const { x, y } = getCircularPosition(centerX, centerY, radius, angles[index]);

            // Update position and angle for the next iteration
            angles[index] += angleIncrements[index]; // Increment the angle with the dot-specific speed

            // Update the dot's position
            gsap.to(dot, {
                x: x - parseFloat(dot.style.left),
                y: y - parseFloat(dot.style.top),
                duration: 0.1,
                ease: 'none'
            }); // Smoothly update the dot position
        });

        requestAnimationFrame(animateDots); // Call the animation function recursively
    };

    animateDots(); // Start the animation
}




export function initIntroAnimation(innerGroupCount, outerGroupCount, callback) {
    
    // Create the central dot
    const centerDot = createDot('center-dot', 20, renderer.clientWidth / 2 - 10, renderer.clientHeight / 2 - 10);
    renderer.appendChild(centerDot);

    // Array to hold all small dots
    const smallDots = [];

    // Create inner group of smaller dots
    for (let i = 0; i < innerGroupCount; i++) {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let randomX, randomY;

        if (side === 0) { // Top
            randomX = Math.random() * renderer.clientWidth;
            randomY = -5; // Slightly above the top edge
        } else if (side === 1) { // Right
            randomX = renderer.clientWidth + 5; // Slightly outside the right edge
            randomY = Math.random() * renderer.clientHeight;
        } else if (side === 2) { // Bottom
            randomX = Math.random() * renderer.clientWidth;
            randomY = renderer.clientHeight + 5; // Slightly below the bottom edge
        } else { // Left
            randomX = -5; // Slightly outside the left edge
            randomY = Math.random() * renderer.clientHeight;
        }

        const smallDot = createDot('small-dot', 3, randomX, randomY);
        smallDots.push(smallDot);
        renderer.appendChild(smallDot);
    }

    // Create outer group of smaller dots
    for (let i = 0; i < outerGroupCount; i++) {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let randomX, randomY;

        if (side === 0) { // Top
            randomX = Math.random() * renderer.clientWidth;
            randomY = -20; // Further above the top edge
        } else if (side === 1) { // Right
            randomX = renderer.clientWidth + 20; // Further outside the right edge
            randomY = Math.random() * renderer.clientHeight;
        } else if (side === 2) { // Bottom
            randomX = Math.random() * renderer.clientWidth;
            randomY = renderer.clientHeight + 20; // Further below the bottom edge
        } else { // Left
            randomX = -20; // Further outside the left edge
            randomY = Math.random() * renderer.clientHeight;
        }

        const smallDot = createDot('small-dot', 3, randomX, randomY);
        smallDots.push(smallDot);
        renderer.appendChild(smallDot);
    }

    // Move small dots to surround the center dot initially
    gsap.delayedCall(2, () => {
        const centerX = renderer.clientWidth / 2;
        const centerY = renderer.clientHeight / 2;

        smallDots.forEach((dot, index) => {
            const angle = Math.random() * Math.PI * 2;

            let radius;
            if (index < innerGroupCount) {
                radius = 10 + Math.random() * 85; // Inner group with smaller radius
            } else {
                radius = 110 + Math.random() * 20; // Outer group with slightly varied radius (110 to 130)
            }

            const targetX = centerX + radius * Math.cos(angle) - 2.5; // Adjust for the small dot size
            const targetY = centerY + radius * Math.sin(angle) - 2.5;

            gsap.to(dot, { x: targetX - parseFloat(dot.style.left), y: targetY - parseFloat(dot.style.top), duration: 3 });
        });
    });
    
    setTimeout(() => {
        // Wait for a bit before starting the upward movement
        const moveUpDelay = 0.5; // Delay before moving up in seconds
        setTimeout(() => {
            const moveUpDistance = renderer.clientHeight * 0.65; // 65% of the renderer height

            const centerX = renderer.clientWidth / 2;
            const centerY = renderer.clientHeight / 2;

            // Animate all dots and the center dot moving upwards
            smallDots.concat(centerDot).forEach((dot, index) => {
                const randomXOffset = (Math.random() - 0.5) * 20; // Random x offset to create dynamic movement
                const dotMoveUpDuration = 3 + Math.random(); // Random duration for upward movement between 2s and 3s
                const randomRotationSpeed = 360 * Math.random(); // Random rotation value (0 to 360 degrees)

                gsap.to(dot, {
                    x: `+=${randomXOffset}`, // Apply random x offset
                    y: `-=${moveUpDistance}`, // Move up by 65% of renderer height
                    rotation: randomRotationSpeed, // Apply random rotation
                    duration: dotMoveUpDuration, // Vary the duration of the upward movement
                    ease: 'power2.out', // Easing for smoother transition
                    onComplete: () => {
                        // Define the new center after moving up
                        const newCenterY = centerY - moveUpDistance;

                        // Start the circular motion at the new center
                        if (dot === centerDot) {
                            startCircularMotion(smallDots, innerGroupCount, outerGroupCount, centerX, newCenterY);
                        }
                    }
                });
            });
        }, moveUpDelay * 800); // Convert to milliseconds for setTimeout
    }, 5000); // Total animation duration (initial animation + delay before move up)
}
