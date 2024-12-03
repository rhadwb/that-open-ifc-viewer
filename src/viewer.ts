import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import Chart from "chart.js/auto";
import { colors } from "./utils/colors";

const container = document.getElementById("container") as HTMLDivElement;

const components = new OBC.Components();

const worlds = components.get(OBC.Worlds);

const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
>();

const sceneComponent = new OBC.SimpleScene(components);
world.scene = sceneComponent;

const rendererComponent = new OBC.SimpleRenderer(components, container);
world.renderer = rendererComponent;

const cameraComponent = new OBC.SimpleCamera(components);
world.camera = cameraComponent;

components.init();

world.scene.setup();

world.scene.three.background = null;

const fragments = new OBC.FragmentsManager(components);
const fragmentIfcLoader = new OBC.IfcLoader(components);

await fragmentIfcLoader.setup();

fragmentIfcLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.59/",
    absolute: true,
};

fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

const grids = new OBC.Grids(components);
grids.create(world);

// Expand
const toggleSidebar = document.createElement("button");
toggleSidebar.className = "toggle-sidebar";
toggleSidebar.title = "Open Sidebar";
toggleSidebar.innerHTML = `<span class="material-icons">menu</span>`;
container.append(toggleSidebar);

const sidebar = document.getElementById("sidebar") as HTMLDivElement;

toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// Collapse
const closerSidebar = document.getElementById("closer") as HTMLButtonElement;
closerSidebar.innerHTML = `<span class="material-icons">menu</span>`;
closerSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

LoadIfc();

async function LoadIfc() {
    const file = await fetch(
        "https://thatopen.github.io/engine_components/resources/small.ifc"
        // "./public/AdvancedProject.ifc"
    );
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    world.scene.three.add(model);
    world.meshes.add(model);

    await createChart(model);
    await setupClipper(world);
    await Indexer(model);
    await setupExploder(model);
    await setupHighlighter(world);
}

async function Classifier(model: any) {
    const classifier = new OBC.Classifier(components);
    classifier.byEntity(model);
    const entities = classifier.list.entities;

    const data = [];

    for (const key in entities) {
        const name = entities[key].name;
        const items = entities[key].map;
        let totalItems = 0;
        for (const key in items) {
            totalItems += items[key].size;
        }

        data.push({ name, totalItems });
    }
    // console.log(data);

    return data; // [{ name , totalItems }]
}

async function createChart(model: any) {
    const chart = document.createElement("canvas");
    chart.id = "chart";
    const contentArea = document.getElementById(
        "content-area"
    ) as HTMLDivElement;
    contentArea.appendChild(chart);

    const classifierItems = await Classifier(model);
    const labels = classifierItems.map((item) => item.name);
    const values = classifierItems.map((item) => item.totalItems);

    const backgroundColors = colors.slice(0, labels.length);

    new Chart(chart, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Elements",
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: "grey",
                    borderWidth: 0,
                    hoverOffset: 12,
                },
            ],
        },
        options: {
            responsive: true,
            aspectRatio: 0.8,
            layout: {
                padding: {
                    top: 25,
                    bottom: 10,
                },
            },
        },
    });
}

async function setupClipper(world: any) {
    const clipper = components.get(OBC.Clipper);
    let isClippingEnabled = false;

    const toggleClipper = document.getElementById(
        "clipper"
    ) as HTMLButtonElement;
    toggleClipper.addEventListener("click", () => {
        isClippingEnabled = isClippingEnabled ? false : true;
        clipper.enabled = isClippingEnabled;

        showPopup(
            `Clipper is now ${isClippingEnabled ? "enabled" : "disabled"}`
        );
    });

    const container = document.getElementById("container") as HTMLDivElement;
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
}

async function Indexer(model: any) {
    const indexer = components.get(OBC.IfcRelationsIndexer);
    const index = await indexer.process(model);
    // console.log(index);
}

async function setupExploder(model: any) {
    const exploder = components.get(OBC.Exploder);
    let isExploderEnabled = false;

    const classifier = components.get(OBC.Classifier);
    await classifier.bySpatialStructure(model);

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

        showPopup(
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

    document.body.appendChild(slider);
}

async function setupHighlighter(world: any) {
    const highlighter = components.get(OBCF.Highlighter);
    highlighter.setup({ world });
    highlighter.zoomToSelection = true;

    return highlighter;
}

function showPopup(message: any) {
    const popup = document.getElementById("popup") as HTMLDivElement;
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => {
        popup.classList.remove("show");
    }, 3500);
}
