import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import * as THREE from "three";

export async function loadModel(
    buffer: Uint8Array,
    components: OBC.Components,
    world: OBC.World
): Promise<FragmentsGroup> {
    const fragmentLoader = components.get(OBC.IfcLoader);
    await fragmentLoader.setup();

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

    return model;
}
