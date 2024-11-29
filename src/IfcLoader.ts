import { IfcLoader } from "@thatopen/components";

export async function loadModel(
  buffer: Uint8Array,
  components: any,
  world: any
): Promise<any> {
  const fragmentLoader = components.get(IfcLoader);
  await fragmentLoader.setup();

  fragmentLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.59/",
    absolute: true,
  };

  fragmentLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  const model = await fragmentLoader.load(buffer);
  world.scene.three.add(model);
  world.meshes.add(model);

  return model;
}
