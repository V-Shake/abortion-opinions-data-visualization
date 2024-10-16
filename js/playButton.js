let isPlaying = false;  // State to track if animation is running
let intervalId;  // Variable to store the interval function

export function initializePlayButton(sliderId, updateChartFunction, startYear = 1972, endYear = 2018) {
    const playButton = document.getElementById('play-button');
    const yearSlider = document.getElementById(sliderId);

    playButton.addEventListener('click', function () {
        if (isPlaying) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    function startAnimation() {
        isPlaying = true;
        playButton.innerText = "Pause";  // Change button text to 'Pause'

        let currentYear = startYear;  // Start from the beginning year (1972)

        // Play forward from 1972 to 2018
        intervalId = setInterval(function () {
            if (currentYear <= endYear) {
                yearSlider.value = currentYear;  // Update the slider value
                document.getElementById('selected-year').innerText = currentYear;  // Update the displayed year
                updateChartFunction(currentYear);  // Call the updateChart function with the current year
                currentYear++;  // Move forward
            } else {
                stopAnimation();  // Stop when we reach the end year (2018)
            }
        }, 500);  // Adjust the speed (500 ms between years)
    }

    function stopAnimation() {
        isPlaying = false;
        clearInterval(intervalId);  // Stop the interval
        playButton.innerText = "Play";  // Change button text to 'Play'
    }
}
