import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";

export class Classifier {
    private _components: OBC.Components;

    constructor(components: OBC.Components) {
        this._components = components;
    }

    classifyByEntity(model: FragmentsGroup) {
        const classifier = this._components.get(OBC.Classifier);
        classifier.byEntity(model);
        return classifier;
    }

    async getEntityData(
        model: FragmentsGroup
    ): Promise<{ name: string; totalItems: number }[]> {
        const classifier = this.classifyByEntity(model);
        const entities = classifier.list.entities;
        const classifiedData: { name: string; totalItems: number }[] = [];

        for (const key in entities) {
            const name = entities[key].name;
            const items = entities[key].map;

            let totalItems = 0;
            for (const itemKey in items) {
                totalItems += items[itemKey].size;
            }

            classifiedData.push({ name, totalItems });
        }

        return classifiedData;
    }

    classifyBySpatialStructure(model: FragmentsGroup) {
        const classifier = this._components.get(OBC.Classifier);
        classifier.bySpatialStructure(model);
        return classifier;
    }
}
