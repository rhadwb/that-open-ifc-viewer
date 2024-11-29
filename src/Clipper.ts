import { Clipper, Raycasters } from "@thatopen/components";

export async function setupClipping(world: any, components: any): Promise<any> {
  const clipper = components.get(Clipper);
  const casters = components.get(Raycasters);
  casters.get(world);

  let isClippingEnabled = false;

  const toggleClipper = document.getElementById("clipper") as HTMLButtonElement;
  toggleClipper.addEventListener("click", () => {
    isClippingEnabled = isClippingEnabled ? false : true;
    clipper.enabled = isClippingEnabled;
    console.log("Clipping enabled:", isClippingEnabled);
  });

  const container = document.getElementById("container") as HTMLDivElement;
  container.ondblclick = () => {
    if (isClippingEnabled) {
      clipper.create(world);
      clipper.visible = true;
    }
    console.log(isClippingEnabled);
  };

  // Delete plane
  window.onkeydown = (event) => {
    if (event.code === "Delete") {
      if (clipper.enabled) {
        clipper.delete(world);
      }
    }
  };
}
