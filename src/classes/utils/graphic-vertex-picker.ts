import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { Mark } from "@thatopen/components-front";

export class GraphicVertexPicker
    extends OBC.VertexPicker
    implements OBC.Disposable
{
    readonly onDisposed = new OBC.Event();

    marker: Mark | null = null;

    private _className = "default-vertex-picker";

    get className() {
        return this._className;
    }

    set className(name: string) {
        this._className = name;
        if (this.marker) {
            this.marker.three.element.className = name;
        }
    }

    constructor(
        components: OBC.Components,
        config?: Partial<OBC.VertexPickerConfig>
    ) {
        super(components, config);
        this.onEnabled.add((value: boolean) => {
            if (this.marker) {
                this.marker.visible = value;
            }
        });
    }

    /** {@link OBC.Disposable.onDisposed} */
    dispose() {
        if (this.marker) {
            this.marker.dispose();
        }
        super.dispose();
    }

    /**
     * Retrieves the picked vertex from the world and updates the marker's position.
     * If no vertex is picked, the marker is hidden.
     *
     * @param world - The world in which to pick the vertex.
     * @returns The picked vertex, or null if no vertex was picked.
     */
    get(world: OBC.World) {
        const found = super.get(world) as THREE.Vector3 | null;

        if (found) {
            if (!this.marker) {
                this.marker = new Mark(world);
                this.marker.three.element.className = this._className;
                this.marker.three.element.style.width = "2px";
                this.marker.three.element.style.height = "2px";
                // this.marker.three.element.style.border = "0px";
                this.marker.three.element.style.borderRadius = "50%";
                this.marker.three.element.style.backgroundColor = "red";
            }
            if (this.marker.world !== world) {
                this.marker.world = world;

                this.marker.three.removeFromParent();
                world.scene.three.add(this.marker.three);
            }
            this.marker.visible = true;
            this.marker.three.position.copy(found);
        } else if (this.marker) {
            this.marker.visible = false;
        }

        return found;
    }
}
