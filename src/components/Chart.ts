import Chart from "chart.js/auto";
import { Classifier } from "../classes/Classifier";
import { colors } from "../utils/colors";
import { FragmentsGroup } from "@thatopen/fragments";
import { Components } from "@thatopen/components";

export const createChart = async (
    components: Components,
    model: FragmentsGroup
) => {
    const contentArea = document.getElementById(
        "content-area"
    ) as HTMLDivElement;
    const chart = document.createElement("canvas");
    chart.id = "chart";
    chart.style.display = "none";
    contentArea.appendChild(chart);

    const classifier = new Classifier(components);
    const classifierItems = await classifier.getEntityData(model);

    const labels = classifierItems.map((item) => item.name);
    const values = classifierItems.map((item) => item.totalItems);
    const backgroundColors = colors.slice(0, labels.length);

    new Chart(chart, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    label: "Total Elements",
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: "grey",
                    borderWidth: 0,
                    hoverOffset: 12,
                },
            ],
        },
        options: {
            responsive: true,
            aspectRatio: 0.8,
            layout: {
                padding: {
                    top: 25,
                    bottom: 10,
                },
            },
        },
    });
};
