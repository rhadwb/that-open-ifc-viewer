export const showPopUp = (message: string) => {
    const popup = document.getElementById("popup") as HTMLDivElement;
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => {
        popup.classList.remove("show");
    }, 3500);
};
