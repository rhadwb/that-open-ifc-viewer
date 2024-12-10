import * as THREE from "three";
import * as OBC from "@thatopen/components";

export interface AreaSelection {
    /**
     * The calculated area of the selection.
     */
    area: number;

    /**
     * The calculated perimeter of the selection.
     */
    perimeter: number;

    /**
     * The 3D mesh representing the selection.
     */
    mesh: THREE.Mesh;
}

export class Selector extends OBC.Component implements OBC.Createable {
    static readonly uuid = "60bd6763-f9ff-4820-a04f-2054922c0297" as const;

    /**
     * An array of AreaSelection objects representing the user's selections.
     * This array is used to store the selected areas, their meshes, and labels.
     */
    selection: AreaSelection[] = [];

    /**
     * A reference to the preview dimension face.
     * This line is used to visualize the measurement while creating it.
     */
    preview = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({
            side: 2,
            depthTest: false,
            transparent: true,
            opacity: 0.25,
            color: "#BCF124",
        })
    );

    /**
     * Represents the material used for the selected area in the FaceMeasurement component.
     * This material is applied to the 3D mesh representing the selected area.
     */
    selectionMaterial = new THREE.MeshBasicMaterial({
        side: 2,
        depthTest: false,
        transparent: true,
        color: "#BCF124",
        opacity: 0.75,
    });

    /**
     * The world in which the measurements are performed.
     */
    world?: OBC.World;

    private _enabled: boolean = false;

    private _currentSelelection: {
        area: number;
        perimeter: number;
    } | null = null;

    /** {@link OBC.Component.enabled} */
    set enabled(value: boolean) {
        if (!this.world) {
            throw new Error("No world given for the Face measurement!");
        }
        this._enabled = value;
        this.setupEvents(value);
        if (value) {
            const scene = this.world.scene.three;
            scene.add(this.preview);
        } else {
            this.preview.removeFromParent();
            this.cancelCreation();
        }
        this.setVisibility(value);
    }

    /** {@link OBC.Component.enabled} */
    get enabled() {
        return this._enabled;
    }

    constructor(components: OBC.Components) {
        super(components);
        this.components.add(Selector.uuid, this);
    }

    /** {@link OBC.Createable.create} */
    create = () => {
        if (!this.world) {
            throw new Error("World not found");
        }

        if (!this.enabled || !this._currentSelelection) return;

        const scene = this.world.scene.three;

        const geometry = new THREE.BufferGeometry();
        const mesh = new THREE.Mesh(geometry, this.selectionMaterial);
        geometry.setAttribute(
            "position",
            this.preview.geometry.attributes.position
        );
        scene.add(mesh);

        geometry.computeBoundingSphere();
        const { area, perimeter } = this._currentSelelection;

        this.selection.push({ area, perimeter, mesh });
    };

    delete = () => {
        if (!this.world) {
            throw new Error("World not found");
        }

        const meshes = this.selection.map((item) => item.mesh);

        const casters = this.components.get(OBC.Raycasters);
        const caster = casters.get(this.world);
        const result = caster.castRay(meshes);
        if (!result || !result.object) {
            return;
        }
        const found = this.selection.find(
            (item) => item.mesh === result.object
        );
        if (!found) return;
        found.mesh.removeFromParent();
        found.mesh.geometry.dispose();
        const index = this.selection.indexOf(found);
        this.selection.splice(index, 1);
    };

    /** {@link OBC.Createable.endCreation} */
    endCreation() {}

    /** {@link OBC.Createable.cancelCreation} */
    cancelCreation() {}

    private setupEvents(active: boolean) {
        if (!this.world) {
            throw new Error("The face measurement needs a world to work!");
        }
        if (this.world.isDisposing) {
            return;
        }
        if (!this.world.renderer) {
            throw new Error(
                "The world of the face measurement needs a renderer!"
            );
        }
        const canvas = this.world.renderer.three.domElement;
        const viewerContainer = canvas.parentElement as HTMLElement;

        viewerContainer.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("keydown", this.onKeydown);

        if (active) {
            viewerContainer.addEventListener("pointermove", this.onMouseMove);
            window.addEventListener("keydown", this.onKeydown);
        }
    }

    private setVisibility(active: boolean) {
        if (!this.world) {
            throw new Error("The face measurement needs a world to work!");
        }
        if (this.world.isDisposing) {
            return;
        }
        const scene = this.world.scene.three;
        for (const item of this.selection) {
            if (active) {
                scene.add(item.mesh);
            } else {
                item.mesh.removeFromParent();
            }
        }
    }

    private onMouseMove = () => {
        if (!this.world) {
            throw new Error("The face measurement needs a world to work!");
        }
        if (!this.enabled) {
            this.unselect();
            return;
        }
        const casters = this.components.get(OBC.Raycasters);
        const caster = casters.get(this.world);
        const result = caster.castRay();
        if (!result || !result.object || !result.faceIndex) {
            this.unselect();
            return;
        }
        const { object, faceIndex } = result;
        if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.InstancedMesh
        ) {
            this.updateSelection(object, faceIndex, result.instanceId);
        } else {
            this.unselect();
        }
    };

    private onKeydown = (_e: KeyboardEvent) => {};

    private unselect() {
        this.preview.removeFromParent();
        this._currentSelelection = null;
    }

    private updateSelection(
        mesh: THREE.Mesh | THREE.InstancedMesh,
        faceIndex: number,
        instance?: number
    ) {
        if (!this.world) {
            throw new Error("The face measurement needs a world to work!");
        }
        const scene = this.world.scene.three;
        scene.add(this.preview);

        const measurements = this.components.get(OBC.MeasurementUtils);
        const result = measurements.getFace(mesh, faceIndex, instance);
        if (result === null) {
            return;
        }

        const area = this.regenerateHighlight(mesh, result.indices, instance);

        let perimeter = 0;
        for (const { distance } of result.edges) {
            perimeter += distance;
        }

        this._currentSelelection = { perimeter, area };
    }

    private regenerateHighlight(
        mesh: THREE.Mesh | THREE.InstancedMesh,
        indices: Iterable<number>,
        instance?: number
    ) {
        const position: number[] = [];
        const index: number[] = [];
        let counter = 0;

        let area = 0;
        const areaTriangle = new THREE.Triangle();

        const measurements = this.components.get(OBC.MeasurementUtils);

        for (const i of indices) {
            const { p1, p2, p3 } = measurements.getVerticesAndNormal(
                mesh,
                i,
                instance
            );

            position.push(p1.x, p1.y, p1.z);
            position.push(p2.x, p2.y, p2.z);
            position.push(p3.x, p3.y, p3.z);

            areaTriangle.set(p1, p2, p3);
            area += areaTriangle.getArea();

            index.push(counter, counter + 1, counter + 2);
            counter += 3;
        }

        this.preview.position.set(0, 0, 0);
        this.preview.rotation.set(0, 0, 0);
        this.preview.scale.set(1, 1, 1);
        this.preview.updateMatrix();

        this.preview.applyMatrix4(mesh.matrixWorld);

        const buffer = new Float32Array(position);
        const attr = new THREE.BufferAttribute(buffer, 3);
        this.preview.geometry.setAttribute("position", attr);
        this.preview.geometry.setIndex(index);

        return area;
    }
}
