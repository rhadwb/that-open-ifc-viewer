import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import { Classifier } from "../classes/Classifier";
import { showPopUp } from "../utils/showPopUp";

export const setupExploder = async (
    components: OBC.Components,
    model: FragmentsGroup
) => {
    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);
    const classifier = new Classifier(components);
    classifier.classifyBySpatialStructure(model);
    const exploder = components.get(OBC.Exploder);

    let isExploderEnabled = false;

    // Slider
    const slider = document.createElement("input");
    slider.className = "slider";
    slider.type = "range";
    slider.max = "20";
    slider.value = exploder.height.toString();
    slider.style.position = "fixed";
    slider.style.bottom = "20px";
    slider.style.left = "50%";
    slider.style.transform = "translateX(-50%)";
    slider.style.width = "300px";
    slider.style.height = "20px";
    slider.style.display = "none";
    document.body.appendChild(slider);

    // Toggle Exploder
    const toggleExploder = document.getElementById(
        "exploder"
    ) as HTMLButtonElement;
    toggleExploder.addEventListener("click", () => {
        isExploderEnabled = isExploderEnabled ? false : true;
        exploder.set(isExploderEnabled);
        exploder.enabled = isExploderEnabled;
        slider.style.display =
            slider.style.display === "none" ? "block" : "none";

        showPopUp(
            `Exploder is now ${isExploderEnabled ? "enabled" : "disabled"}`
        );
    });

    slider.addEventListener("change", () => {
        exploder.set(false);
        exploder.dispose();
        const newHeight = parseFloat(slider.value);
        if (!isNaN(newHeight) && exploder.height !== newHeight) {
            exploder.height = newHeight;
            console.log("Exploder height set to:", exploder.height);
        }
        exploder.set(true);
    });
};
