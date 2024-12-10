import * as OBC from "@thatopen/components";
import { Measurement } from "../classes/Measurement";
import { showPopUp } from "../utils/showPopUp";

export function setupMeasurement(
    components: OBC.Components,
    world: OBC.World,
    container: HTMLDivElement
) {
    const measurement = components.get(Measurement);
    measurement.world = world;
    measurement.snapDistance = 1;

    let isMeasurementEnabled = false;

    const toggleMeasure = document.getElementById(
        "measurement"
    ) as HTMLButtonElement;
    toggleMeasure.addEventListener("click", () => {
        isMeasurementEnabled = isMeasurementEnabled ? false : true;
        measurement.enabled = isMeasurementEnabled;
        measurement.visible = isMeasurementEnabled;

        if (isMeasurementEnabled === false) {
            measurement.deleteAll();
        }

        showPopUp(
            `Measurement is now ${
                isMeasurementEnabled ? "enabled" : "disabled"
            }`
        );
    });

    container.addEventListener("dblclick", () => {
        if (isMeasurementEnabled === true) {
            measurement.create();
        }
    });
}
