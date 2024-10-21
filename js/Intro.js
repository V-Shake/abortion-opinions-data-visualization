export function startIntroAnimation() {
	return new Promise((resolve) => {
		const container = document.createElement("div");
		container.className = "at-container";

		const item = document.createElement("div");
		item.className = "at-item";
		item.innerText = "Opinions on Abortion";

		container.appendChild(item);
		document.body.appendChild(container);

		// Start the animation by adding the class
		item.classList.add("at-item");

		// Remove the animation after 3 seconds and call the callback function
		setTimeout(() => {
			document.body.removeChild(container);
			resolve();
		}, 5900); // 1 second for animation + 3 seconds wait time
	});
}
