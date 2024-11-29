import { Highlighter } from "@thatopen/components-front";

export async function setupHighlighter(
  world: any,
  components: any
): Promise<any> {
  const highlighter = components.get(Highlighter);
  highlighter.setup({ world });
  highlighter.zoomToSelection = true;
}
