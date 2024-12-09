import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import { Classifier } from "../classes/Classifier";
import { FragmentsGroup } from "@thatopen/fragments";

export const initTree = async (
    components: OBC.Components,
    model: FragmentsGroup
) => {
    BUI.Manager.init();
    const contentArea = document.getElementById(
        "content-area"
    ) as HTMLDivElement;
    const classifier = new Classifier(components);

    const [classificationsTree, updateClassificationsTree] =
        CUI.tables.classificationTree({
            components,
            classifications: [],
        });

    classifier.classifyByEntity(model);
    const classifications = [{ system: "entities", label: "Entities" }];

    updateClassificationsTree({ classifications });

    const tree = BUI.Component.create(() => {
        return BUI.html`
        <div>
            ${classificationsTree}
        </div>
            `;
    });

    tree.id = "tree";
    tree.style.display = "none";
    contentArea.appendChild(tree);
};
