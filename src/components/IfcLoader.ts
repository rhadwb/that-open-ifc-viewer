import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import * as THREE from "three";
import * as WEBIFC from "web-ifc";

export async function loadModel(
    buffer: Uint8Array,
    components: OBC.Components,
    world: OBC.World
): Promise<FragmentsGroup> {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loading-indicator";
    loadingIndicator.style.position = "absolute";
    loadingIndicator.style.top = "50%";
    loadingIndicator.style.left = "50%";
    loadingIndicator.style.transform = "translate(-50%, -50%)";
    loadingIndicator.style.padding = "1rem";
    loadingIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingIndicator.style.color = "white";
    loadingIndicator.style.borderRadius = "8px";
    loadingIndicator.innerText = "Loading model...";
    document.body.appendChild(loadingIndicator);

    try {
        const fragmentsManager = components.get(OBC.FragmentsManager);
        const fragmentLoader = components.get(OBC.IfcLoader);
        await fragmentLoader.setup();

        const excludedCats = [
            WEBIFC.IFCTENDONANCHOR,
            WEBIFC.IFCREINFORCINGBAR,
            WEBIFC.IFCREINFORCINGELEMENT,
            WEBIFC.IFCSPACE,
        ];

        for (const cat of excludedCats) {
            fragmentLoader.settings.excludedCategories.add(cat);
        }

        fragmentLoader.settings.wasm = {
            path: "https://unpkg.com/web-ifc@0.0.59/",
            absolute: true,
        };

        fragmentLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

        const model = await fragmentLoader.load(buffer);
        world.scene.three.add(model);

        for (const child of model.children) {
            if (child instanceof THREE.Mesh) {
                world.meshes.add(child);
            }
        }

        fragmentsManager.onFragmentsLoaded.add(() => {
            console.log("Fragments loaded!");
        });

        return model;
    } catch (error) {
        console.error("Error loading model:", error);
        throw error;
    } finally {
        // Remove the loading indicator once loading is complete
        if (loadingIndicator) {
            document.body.removeChild(loadingIndicator);
        }
    }
}
