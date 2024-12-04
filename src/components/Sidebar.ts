export function setupSidebarToggle(
    container: HTMLDivElement,
    sidebar: HTMLDivElement
): void {
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-sidebar";
    toggleButton.title = "Toggle Sidebar";
    toggleButton.innerHTML = `<span class="material-icons">menu</span>`;
    container.append(toggleButton);

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    const closeButton = document.getElementById("closer") as HTMLButtonElement;
    closeButton.innerHTML = `<span class="material-icons">menu</span>`;
    closeButton.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
}
