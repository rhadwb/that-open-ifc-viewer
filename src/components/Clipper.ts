import * as OBC from "@thatopen/components";
import { showPopUp } from "../utils/showPopUp";

export const setupClipper = async (
    world: OBC.World,
    components: OBC.Components,
    container: HTMLDivElement
): Promise<any> => {
    const clipper = components.get(OBC.Clipper);
    const casters = components.get(OBC.Raycasters);
    casters.get(world);

    let isClippingEnabled = false;

    const toggleClipper = document.getElementById(
        "clipper"
    ) as HTMLButtonElement;
    toggleClipper.addEventListener("click", () => {
        isClippingEnabled = isClippingEnabled ? false : true;
        clipper.enabled = isClippingEnabled;

        showPopUp(
            `Clipper is now ${isClippingEnabled ? "enabled" : "disabled"}`
        );
    });

    container.ondblclick = () => {
        if (isClippingEnabled) {
            clipper.create(world);
            clipper.visible = true;
        }
    };

    window.onkeydown = (event) => {
        if (event.code === "Delete") {
            if (clipper.enabled) {
                clipper.delete(world);
            }
        }
    };
};
