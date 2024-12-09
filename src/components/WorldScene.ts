import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

export const initializeWorld = (container: HTMLDivElement) => {
    const components = new OBC.Components();

    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBCF.PostproductionRenderer
    >();

    const sceneComponent = new OBC.SimpleScene(components);
    world.scene = sceneComponent;

    const rendererComponent = new OBCF.PostproductionRenderer(
        components,
        container
    );
    world.renderer = rendererComponent;

    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;

    components.init();

    world.scene.setup();

    world.scene.three.background = null;

    const grids = components.get(OBC.Grids);
    grids.create(world);

    container.addEventListener("resize", () => {
        rendererComponent.resize();
        cameraComponent.updateAspect();
    });

    return { components, world };
};
