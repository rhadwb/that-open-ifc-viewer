import * as OBC from "@thatopen/components";

export class Classifier {
  private components: any;

  constructor(components: any) {
    this.components = components;
  }

  async classify(model: any): Promise<{ name: string; totalItems: number }[]> {
    const classifier = new OBC.Classifier(this.components);
    classifier.byEntity(model);

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
}
