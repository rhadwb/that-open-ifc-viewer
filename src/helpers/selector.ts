import * as OBC from "@thatopen/components";
import { Selector } from "../classes/Selector";

export function setupSelector(components: OBC.Components, world: OBC.World) {
    const selector = components.get(Selector);
    selector.world = world;
    selector.enabled = true;
}
