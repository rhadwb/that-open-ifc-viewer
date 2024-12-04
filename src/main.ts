import { initializeWorld } from "../src/components/WorldScene";
import { loadModel } from "../src/components/IfcLoader";
import { setupSidebarToggle } from "../src/components/Sidebar";
import { createChart } from "../src/components/Chart";
import { setupClipper } from "../src/components/Clipper";
import { setupExploder } from "../src/components/Exploder";
import { fetchIfcFile } from "../src/utils/fetchIfcFile";
import {
    lengthMeasurement,
    setupSurfaceMeasure,
    setupVolumeMeasure,
} from "./components/Measurements";

const container = document.getElementById("container") as HTMLDivElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;

const { components, world } = initializeWorld(container);

setupSidebarToggle(container, sidebar);

async function main() {
    try {
        const ifcUrl =
            "https://thatopen.github.io/engine_components/resources/small.ifc";

        // Fetch and load IFC model
        const ifcBuffer = await fetchIfcFile(ifcUrl);
        const model = await loadModel(ifcBuffer, components, world);

        await createChart(components, model);
        await setupClipper(world, components, container);
        await setupExploder(components, model);
        await lengthMeasurement(components, container, world);
        setupSurfaceMeasure(components, container, world);
        setupVolumeMeasure(components, container, world);
    } catch (error) {}
}

main();
