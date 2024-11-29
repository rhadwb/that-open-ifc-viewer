import { setupSidebarToggle } from "./components/Sidebar";
import { createChart } from "./components/Chart";
import { setupClipping } from "./Clipper";
import { setupHighlighter } from "./Higlighter";
import { fetchIfcFile } from "./utils/fetchIfcFile";
import { initializeWorld } from "./WorldScene";
import { loadModel } from "./IfcLoader";

import "./style.css";

const container = document.getElementById("container") as HTMLDivElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;

const { components, world } = initializeWorld(container);

setupSidebarToggle(container, sidebar);

async function main() {
  try {
    // IFC file URL
    const ifcUrl =
      "https://thatopen.github.io/engine_components/resources/small.ifc";

    // Fetch and load IFC model
    const ifcBuffer = await fetchIfcFile(ifcUrl);
    const model = await loadModel(ifcBuffer, components, world);

    // Additional features: chart, clipping, indexing
    await createChart(model, components);
    await setupClipping(world, components);
    await setupHighlighter(world, components);

    console.log("Application initialized successfully.");
  } catch (error) {
    console.error("Error initializing the application:", error);
  }
}

main();
