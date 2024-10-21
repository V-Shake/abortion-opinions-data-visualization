export function startIntroAnimation() {
    return new Promise((resolve) => {
        // Create container for animation
        const container = document.createElement("div");
        container.className = "at-container";

        // Create item for "Opinions on Abortion"
        const item = document.createElement("div");
        item.className = "at-item";
        item.innerText = "Opinions on Abortion";

        container.appendChild(item);
        document.body.appendChild(container);

        // Trigger the fade-in effect for the first text
        setTimeout(() => {
            item.classList.add("text-visible"); // Start fade in

            // Fade out "Opinions on Abortion" after a short time
            setTimeout(() => {
                item.classList.remove("text-visible"); // Start fade out

                // Wait for fade-out to finish before moving to the next text
                setTimeout(() => {
                    // Create a new container for the second text
                    const secondContainer = document.createElement("div");
                    secondContainer.className = "at-container";

                    const secondItem = document.createElement("div");
                    secondItem.className = "at-item sissy-text"; // Class for sissy text
                    secondItem.innerText =
"On September 10, 1977, Frances 'Sissy' Farenthold delivered a powerful speech on abortion, emphasizing women's control over their bodies as vital for equality."                    
                    secondContainer.appendChild(secondItem);
                    document.body.appendChild(secondContainer);

                    // Trigger the fade-in effect for the second text
                    setTimeout(() => {
                        secondItem.classList.add("text-visible"); // Fade in

                        // Wait for 5 seconds to read
                        setTimeout(() => {
                            // Apply a smoother fade-out transition
                            secondItem.style.transition = 'opacity 1s ease, filter 1s ease'; // Smoother fade-out
                            secondItem.classList.remove("text-visible"); // Start fade out
                            
                            // Remove the second container after fade-out completes
                            setTimeout(() => {
                                document.body.removeChild(secondContainer);
                                document.body.removeChild(container);                                
                                resolve(); // Resolve the promise
                            }, 1000); // Wait for fade-out effect to finish (1 second)
                        }, 5000); // Display for 5 seconds
                    }, 100); // Short delay to ensure it's visible before fading in
                }, 1000); // Wait for 1 second for the first text's fade-out to complete
            }, 2900); // 2.9 seconds wait time for first text before fade-out
        }, 100); // Short delay to start fade-in
    });
}
