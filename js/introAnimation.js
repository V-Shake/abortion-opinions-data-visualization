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

// Initialize the animation with customizable dot counts
export function initIntroAnimation(innerGroupCount = 600, outerGroupCount = 200, callback) {
    
    // Create the central dot
    const centerDot = createDot('center-dot', 20, renderer.clientWidth / 2 - 10, renderer.clientHeight / 2 - 10);
    renderer.appendChild(centerDot);

    // Array to hold all small dots
    const smallDots = [];

    // Create inner group of smaller dots
    for (let i = 0; i < innerGroupCount; i++) {
        // Position them outside (slightly outside the radius for outer group)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let randomX, randomY;

        // Inner group starts slightly outside
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
        // Position them outside (further away)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let randomX, randomY;

        // Outer group starts further outside
        if (side === 0) { // Top
            randomX = Math.random() * renderer.clientWidth;
            randomY = -20; // Above the top edge
        } else if (side === 1) { // Right
            randomX = renderer.clientWidth + 20; // Right outside the right edge
            randomY = Math.random() * renderer.clientHeight;
        } else if (side === 2) { // Bottom
            randomX = Math.random() * renderer.clientWidth;
            randomY = renderer.clientHeight + 20; // Below the bottom edge
        } else { // Left
            randomX = -20; // Left of the left edge
            randomY = Math.random() * renderer.clientHeight;
        }

        const smallDot = createDot('small-dot', 3, randomX, randomY);
        smallDots.push(smallDot);
        renderer.appendChild(smallDot);
    }


// Animation: Move small dots to surround the center dot
    gsap.delayedCall(2, () => {
        smallDots.forEach((dot, index) => {
            // Calculate a random angle to place the dot around the center
            const angle = Math.random() * Math.PI * 2;

            let radius;
            if (index < innerGroupCount) {
                radius = 10 + Math.random() * 80; // Inner group with smaller radius
            } else {
                radius = 110 + Math.random() * 10; // Outer group with larger radius
            }

            const centerX = renderer.clientWidth / 2;
            const centerY = renderer.clientHeight / 2;

            const targetX = centerX + radius * Math.cos(angle) - 2.5; // Adjust for the small dot size
            const targetY = centerY + radius * Math.sin(angle) - 2.5;

            // Animate the dots from outside the renderer to a position around the center
            gsap.to(dot, { x: targetX - parseFloat(dot.style.left), y: targetY - parseFloat(dot.style.top), duration: 3 });
        });
    });

    setTimeout(() => {
        // Wait for a bit before starting the upward movement
        const moveUpDelay = 1.5; // Delay before moving up in seconds
        setTimeout(() => {
            // Move the dots group to the top after the initial animation completes

            // Calculate how much to move up (65% of the renderer's height)
            const moveUpDistance = renderer.clientHeight * 0.65;

            // Get the center coordinates
            const centerX = renderer.clientWidth / 2;
            const centerY = renderer.clientHeight / 2;

            // Animate all dots and the center dot moving upwards
            gsap.to(smallDots.concat(centerDot), {
                y: `-=${moveUpDistance}`, // Move up by 65% of renderer height
                duration: 2, // Duration of the upward movement
                ease: 'power2.out', // Easing for smoother transition
                onUpdate: () => {
                    // Update positions of dots slightly to create a dynamic effect
                    smallDots.forEach((dot, index) => {
                        // Calculate the new position for each dot
                        const radius = (index < innerGroupCount) ? 60 : 120; // Distinguish between inner and outer group
                        const { x, y } = getRandomPosition(centerX, centerY, radius);
                        gsap.set(dot, { x, y }); // Set the new position
                    });
                },
                onComplete: () => {
                    // Call the callback function after the upward animation completes
                    if (callback) {
                        callback();
                    }
                }
            });

            // After the upward movement, start the falling dots
            setInterval(() => {
                // Create the falling dot
                const fallingDot = createDot('falling-dot', 5, renderer.clientWidth / 2 - 2.5, 0); // Start from the middle top
                renderer.appendChild(fallingDot);

                // Animate the falling dot to the center of the renderer
                gsap.to(fallingDot, {
                    y: renderer.clientHeight / 2 - 2.5, // Move to the center of the renderer
                    duration: 1, // Duration of the falling animation
                    ease: 'power2.out' // Easing for smoother transition
                });
            }, 2000); // 1 second interval for falling dot creation

        }, moveUpDelay * 1000); // Convert to milliseconds for setTimeout
    }, 4000); // Total animation duration (initial animation + delay before move up)
}