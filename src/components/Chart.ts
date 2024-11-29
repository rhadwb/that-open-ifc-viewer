import Chart from "chart.js/auto";
import { colors } from "../utils/colors";
import { Classifier } from "../Classifier";

export async function createChart(model: any, components: any) {
  const chart = document.createElement("canvas");
  chart.id = "chart";
  const contentArea = document.getElementById("content-area") as HTMLDivElement;
  contentArea.appendChild(chart);

  const classifier = new Classifier(components);
  const classifierItems = await classifier.classify(model);

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
}
