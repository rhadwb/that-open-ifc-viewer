import { initializeWorld } from "../src/components/WorldScene";
import { loadModel } from "../src/components/IfcLoader";
import { setupSidebarToggle } from "../src/components/Sidebar";
import { createChart } from "../src/components/Chart";
import { setupClipper } from "../src/components/Clipper";
import { setupExploder } from "../src/components/Exploder";
import { fetchIfcFile } from "../src/utils/fetchIfcFile";
import { initTree } from "./components/ClassificationTree";
import { showPopUp } from "./utils/showPopUp";
import { Selector } from "./classes/Selector";
import { setupSelector } from "./helpers/selector";

const container = document.getElementById("container") as HTMLDivElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;

const { components, world } = initializeWorld(container);

setupSidebarToggle(container, sidebar);

async function main() {
    try {
        const ifcUrl =
            // "https://thatopen.github.io/engine_components/resources/small.ifc";
            "../public/Ifc2x3_SampleCastle.ifc";

        // Fetch and load IFC model
        const ifcBuffer = await fetchIfcFile(ifcUrl);
        const model = await loadModel(ifcBuffer, components, world);

        await createChart(components, model);
        await initTree(components, model);

        const toggleChart = document.getElementById(
            "btn-chart"
        ) as HTMLButtonElement;
        const toggleTree = document.getElementById(
            "btn-tree"
        ) as HTMLButtonElement;

        const chart = document.getElementById("chart") as HTMLCanvasElement;
        const tree = document.getElementById("tree") as HTMLDivElement;

        toggleChart.addEventListener("click", () => {
            chart.style.display =
                chart.style.display === "none" ? "block" : "none";
            tree.style.display = "none";

            const isChartEnabled = chart.style.display === "block";
            showPopUp(
                `Chart is now ${isChartEnabled ? "enabled" : "disabled"}`
            );
        });
        toggleTree.addEventListener("click", () => {
            tree.style.display =
                tree.style.display === "none" ? "block" : "none";
            chart.style.display = "none";

            const isTreeEnabled = tree.style.display === "block";
            showPopUp(`Tree is now ${isTreeEnabled ? "enabled" : "disabled"}`);
        });

        await setupClipper(world, components, container);
        await setupExploder(components, model);

        setupSelector(components, world);
    } catch (error) {}
}

main();
