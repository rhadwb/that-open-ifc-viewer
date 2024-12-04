import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { showPopUp } from "../utils/showPopUp";

export const lengthMeasurement = async (
    components: OBC.Components,
    container: HTMLDivElement,
    world: OBC.World
) => {
    const lengthDimensions = components.get(OBCF.LengthMeasurement);
    lengthDimensions.world = world;
    lengthDimensions.enabled = true;

    let isLengthMeasureEnabled = false;

    const toggleMeasurement = document.getElementById(
        "measurement"
    ) as HTMLButtonElement;
    toggleMeasurement.addEventListener("click", () => {
        isLengthMeasureEnabled = isLengthMeasureEnabled ? false : true;
        lengthDimensions.enabled = isLengthMeasureEnabled;

        showPopUp(
            `Measurement is now ${
                isLengthMeasureEnabled ? "enabled" : "disabled"
            }`
        );
    });

    container.addEventListener("dblclick", () => {
        if (isLengthMeasureEnabled) {
            lengthDimensions.create();
        }
    });
};

export const setupSurfaceMeasure = (
    components: OBC.Components,
    container: HTMLDivElement,
    world: OBC.World
) => {
    const surfaceDimensions = components.get(OBCF.FaceMeasurement);
    surfaceDimensions.world = world;

    let isSurfaceMeasureEnabled = false;

    const toggleMeasurement = document.getElementById(
        "temp"
    ) as HTMLButtonElement;
    toggleMeasurement.addEventListener("click", () => {
        isSurfaceMeasureEnabled = isSurfaceMeasureEnabled ? false : true;
        surfaceDimensions.enabled = isSurfaceMeasureEnabled;

        showPopUp(
            `Surface Measurement is now ${
                isSurfaceMeasureEnabled ? "enabled" : "disabled"
            }`
        );
    });

    container.addEventListener("dblclick", () => {
        if (isSurfaceMeasureEnabled) {
            surfaceDimensions.create();
        }
    });
};

export const setupVolumeMeasure = (
    components: OBC.Components,
    container: HTMLDivElement,
    world: OBC.World
) => {
    const volumeDimensions = components.get(OBCF.VolumeMeasurement);
    volumeDimensions.world = world;

    let isVolumeMeasureEnabled = false;

    const toggleMeasurement = document.getElementById(
        "volume"
    ) as HTMLButtonElement;
    toggleMeasurement.addEventListener("click", () => {
        isVolumeMeasureEnabled = isVolumeMeasureEnabled ? false : true;
        volumeDimensions.enabled = isVolumeMeasureEnabled;

        showPopUp(
            `Volume Measurement is now ${
                isVolumeMeasureEnabled ? "enabled" : "disabled"
            }`
        );

        const highlighter = components.get(OBCF.Highlighter);
        highlighter.setup({ world });

        highlighter.events.select.onHighlight.add((event) => {
            const volume = volumeDimensions.getVolumeFromFragments(event);
            console.log(volume);
        });

        highlighter.events.select.onClear.add(() => {
            volumeDimensions.clear();
        });
    });

    container.addEventListener("dblclick", () => {
        if (isVolumeMeasureEnabled) {
            volumeDimensions.create();
        }
    });
};
