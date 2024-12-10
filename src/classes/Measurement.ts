import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { SimpleDimensionLine } from "./utils/simple-dimension-line";
import { GraphicVertexPicker } from "./utils/graphic-vertex-picker";
import { newDimensionMark } from "../utils/dimensionMark";

export class Measurement
    extends OBC.Component
    implements OBC.Createable, OBC.Hideable, OBC.Disposable, OBC.Updateable
{
    static readonly uuid = "7f3b6b20-3c5e-4d4c-8b6f-a73f68f67d6e" as const;

    /** {@link OBC.Disposable.onDisposed} */
    readonly onDisposed = new OBC.Event();

    /** {@link OBC.Updateable.onBeforeUpdate} */
    readonly onBeforeUpdate = new OBC.Event<Measurement>();

    /** {@link OBC.Updateable.onAfterUpdate} */
    readonly onAfterUpdate = new OBC.Event<Measurement>();

    /** The minimum distance to force the dimension cursor to a vertex. */
    snapDistance = 0.5;

    list: SimpleDimensionLine[] = [];

    world?: OBC.World;

    private _vertexPicker: GraphicVertexPicker;

    private _lineMaterial = new THREE.LineBasicMaterial({
        color: "#DC2626",
        linewidth: 1,
        depthTest: false,
    });

    private _visible = true;

    private _enabled = false;

    /** Temporary variables for internal operations */
    private _temp = {
        isDragging: false,
        start: new THREE.Vector3(),
        end: new THREE.Vector3(),
        dimension: undefined as SimpleDimensionLine | undefined,
    };

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (!value) {
            this.cancelCreation();
        }
        this._enabled = value;
        this._vertexPicker.enabled = value;
        this.setupEvents(value);
    }

    get visible() {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
        for (const dimension of this.list) {
            dimension.visible = value;
        }
    }

    get color() {
        return this._lineMaterial.color;
    }

    set color(color: THREE.Color) {
        this._lineMaterial.color = color;
    }

    constructor(components: OBC.Components) {
        super(components);
        this.components.add(Measurement.uuid, this);

        this._vertexPicker = new GraphicVertexPicker(components, {
            previewElement: newDimensionMark(),
            snapDistance: this.snapDistance,
        });
    }

    /** {@link OBC.Disposable.dispose} */
    dispose() {
        this.setupEvents(false);
        this.enabled = false;
        for (const measure of this.list) {
            measure.dispose();
        }
        this._lineMaterial.dispose();
        this.list = [];
        this._vertexPicker.dispose();
        this.onDisposed.trigger(Measurement.uuid);
        this.onDisposed.reset();
    }

    /** {@link OBC.Updateable.update} */
    async update(_delta: number) {
        if (this._enabled && this._temp.isDragging) {
            this.drawInProcess();
        }
    }

    create = (data?: any) => {
        let plane;
        if (data instanceof THREE.Object3D) {
            plane = data;
        } else if (data) {
            console.warn(
                "Invalid data type provided. Expected THREE.Object3D."
            );
        }
        if (!this._enabled) return;
        if (!this._temp.isDragging) {
            this.drawStart(plane);
            return;
        }
        this.endCreation();
    };

    createOnPoints(p1: THREE.Vector3, p2: THREE.Vector3) {
        const dimension = this.drawDimension();
        dimension.startPoint = p1;
        dimension.endPoint = p2;
        dimension.createBoundingBox();
        this.list.push(dimension);
    }

    /** {@link OBC.Createable.delete} */
    delete() {
        if (!this.world) {
            throw new Error("World is needed for Length Measurement!");
        }
        if (!this._enabled || this.list.length === 0) return;
        const boundingBoxes = this.getBoundingBoxes();

        const casters = this.components.get(OBC.Raycasters);
        const caster = casters.get(this.world);
        const intersect = caster.castRay(boundingBoxes);

        if (!intersect) return;
        const dimension = this.list.find(
            (dim) => dim.boundingBox === intersect.object
        );

        if (dimension) {
            const index = this.list.indexOf(dimension);
            this.list.splice(index, 1);
            dimension.dispose();
        }
    }

    /** Deletes all the dimensions that have been previously created. */
    deleteAll() {
        for (const dim of this.list) {
            dim.dispose();
        }
        this.list = [];
    }

    /** {@link OBC.Createable.cancelCreation} */
    cancelCreation() {
        if (!this._temp.dimension) return;
        this._temp.isDragging = false;
        this._temp.dimension?.dispose();
        this._temp.dimension = undefined;
    }

    /** {@link OBC.Createable.endCreation} */
    endCreation() {
        if (!this._temp.dimension) return;
        this._temp.dimension.createBoundingBox();
        this.list.push(this._temp.dimension);
        this._temp.dimension = undefined;
        this._temp.isDragging = false;
    }

    private drawStart(plane?: THREE.Object3D) {
        if (!this.world) {
            throw new Error("The length measurement needs a world to work!");
        }
        const items = plane ? [plane as THREE.Mesh] : undefined;
        const casters = this.components.get(OBC.Raycasters);
        const caster = casters.get(this.world);
        const intersects = caster.castRay(items);
        const point = this._vertexPicker.get(this.world);
        if (!(intersects && point)) {
            return;
        }
        this._temp.isDragging = true;
        this._temp.start = plane ? intersects.point : point;
    }

    private drawInProcess() {
        if (!this.world) {
            throw new Error("The length measurement needs a world to work!");
        }
        const casters = this.components.get(OBC.Raycasters);
        const caster = casters.get(this.world);
        const intersects = caster.castRay();
        if (!intersects) return;
        const found = this._vertexPicker.get(this.world);
        if (!found) {
            return;
        }
        this._temp.end = found;
        if (!this._temp.dimension) {
            this._temp.dimension = this.drawDimension();
        }
        this._temp.dimension.endPoint = this._temp.end;
    }

    private drawDimension() {
        if (!this.world) {
            throw new Error("Method not implemented.");
        }
        return new SimpleDimensionLine(this.components, this.world, {
            start: this._temp.start,
            end: this._temp.end,
            lineMaterial: this._lineMaterial,
            endpointElement: newDimensionMark(),
        });
    }

    private getBoundingBoxes() {
        return this.list
            .map((dim) => dim.boundingBox)
            .filter((box) => box !== undefined) as THREE.Mesh[];
    }

    private setupEvents(active: boolean) {
        if (!this.world) {
            throw new Error("Method not implemented.");
        }
        if (!this.world.isDisposing) return;
        if (!this.world.renderer) {
            throw new Error("Method not implemented.");
        }
        const canvas = this.world.renderer.three.domElement;
        const viewerContainer = canvas.parentElement as HTMLElement;
        if (!viewerContainer) return;

        viewerContainer.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("keydown", this.onKeydown);

        if (active) {
            viewerContainer.addEventListener("pointermove", this.onMouseMove);
            window.addEventListener("keydown", this.onKeydown);
        }
    }

    private onMouseMove = () => {
        if (this.world) {
            this._vertexPicker.get(this.world);
        }
    };

    private onKeydown = (e: KeyboardEvent) => {
        if (!this.enabled) return;
        if (e.key === "Escape") {
            this.cancelCreation();
        }
    };
}
