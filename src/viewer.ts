import * as OBC from "@thatopen/components";
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

// const fragments = new OBC.FragmentsManager(components);
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
  await clipping(world);
  await indexer(model);
}

async function Classifier(model: any) {
  const classifier = new OBC.Classifier(components);
  classifier.byEntity(model);
  const entities = classifier.list.entities;
  // console.log(entities);

  const data = [];

  for (const key in entities) {
    // console.log(entities[key].map);
    const name = entities[key].name;
    const items = entities[key].map;
    let totalItems = 0;
    for (const key in items) {
      totalItems += items[key].size;
    }
    // console.log(`${name} : ${totalItems}`);

    data.push({ name, totalItems });
  }
  console.log(data);

  return data; // [{ name , totalItems }]
}

async function createChart(model: any) {
  const chart = document.createElement("canvas");
  chart.id = "chart";
  const contentArea = document.getElementById("content-area") as HTMLDivElement;
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

async function clipping(world: any) {
  const casters = components.get(OBC.Raycasters);
  casters.get(world);

  let bool = false;

  const toggleClipper = document.getElementById("clipper") as HTMLButtonElement;
  toggleClipper.addEventListener("click", () => {
    bool = bool ? false : true;
    clipper.enabled = bool;
    console.log(bool);
  });

  const clipper = components.get(OBC.Clipper);
  container.ondblclick = () => {
    clipper.create(world);
    clipper.visible = true;
  };
}

async function indexer(model: any) {
  const indexer = components.get(OBC.IfcRelationsIndexer);
  await indexer.process(model);

  const psets = indexer.serializeModelRelations(model);
  console.log(psets);
  const exploder = components.get(OBC.Exploder);
  exploder.set(true);
}
