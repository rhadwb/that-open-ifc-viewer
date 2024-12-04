export async function fetchIfcFile(url: string): Promise<Uint8Array> {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `Failed to fetch IFC file: ${response.statusText} `
            );
        return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
        console.error("Error fetching IFC file:", error);
        throw error;
    }
}
