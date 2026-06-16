import fs from "fs/promises";
import path from "path";

// Define the root of components directory
const COMPONENTS_ROOT = path.join(process.cwd(), "src", "components");
const SUBDOMAINS = ["ui", "dashboard", "landing"];

/**
 * Searches for a component folder case-insensitively across ui, dashboard, and landing subdomains,
 * and reads its corresponding markdown documentation file.
 * 
 * @param componentParam The name of the component from the URL (e.g., "loginform" or "sidebar")
 * @param docType The type of documentation requested ("reference" or "explanation")
 * @returns The markdown content as a string, or null if the component/file is not found
 */
export async function getComponentDocContent(
  componentParam: string,
  docType: string
): Promise<string | null> {
  const normalizedParam = componentParam.toLowerCase();

  // Validate docType to prevent directory traversal or invalid reads
  if (docType !== "reference" && docType !== "explanation") {
    return null;
  }

  try {
    for (const subdomain of SUBDOMAINS) {
      const subdomainPath = path.join(COMPONENTS_ROOT, subdomain);

      // Check if subdomain directory exists
      try {
        await fs.access(subdomainPath);
      } catch {
        continue; // Subdomain directory doesn't exist yet, skip
      }

      // Read folders in the subdomain
      const folders = await fs.readdir(subdomainPath);

      // Find a case-insensitive match
      const matchingFolder = folders.find(
        (folder) => folder.toLowerCase() === normalizedParam
      );

      if (matchingFolder) {
        // Build the target documentation file name, respecting PascalCase/Case of the real folder
        const fileName = `${matchingFolder}.${docType}.md`;
        const filePath = path.join(subdomainPath, matchingFolder, fileName);

        // Read and return the content
        try {
          const content = await fs.readFile(filePath, "utf-8");
          return content;
        } catch (readError) {
          console.warn(`Doc file found but could not be read: ${filePath}`, readError);
          return null; // File doesn't exist or is unreadable
        }
      }
    }
  } catch (err) {
    console.error("Error scanning directories in getComponentDocContent:", err);
  }

  return null; // Component not found in any subdomain
}
