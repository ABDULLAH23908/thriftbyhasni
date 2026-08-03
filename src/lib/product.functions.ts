import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";

export const markProductsSoldInFile = createServerFn({ method: "POST" })
  .validator((data: { productIds: string[]; sold: boolean }) => data)
  .handler(async ({ data }) => {
    const filePath = path.resolve(process.cwd(), "src/data/products.ts");

    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" };
    }

    let fileContent = fs.readFileSync(filePath, "utf-8");

    for (const id of data.productIds) {
      // Look for the product id string directly
      const idPatternDouble = `id: "${id}"`;
      const idPatternSingle = `id: '${id}'`;

      let matchIndex = fileContent.indexOf(idPatternDouble);
      if (matchIndex === -1) {
        matchIndex = fileContent.indexOf(idPatternSingle);
      }

      // If product ID exists in the file
      if (matchIndex !== -1) {
        const endOfLineIndex = fileContent.indexOf("\n", matchIndex);

        if (endOfLineIndex !== -1) {
          // Look at the lines immediately following the id line
          const nextBlock = fileContent.slice(endOfLineIndex, endOfLineIndex + 150);

          if (nextBlock.includes("sold:")) {
            // Replace existing sold status
            fileContent = fileContent.replace(
              /sold:\s*(true|false),?/,
              `sold: ${data.sold},`
            );
          } else {
            // Insert new sold property directly below the id line
            const before = fileContent.slice(0, endOfLineIndex);
            const after = fileContent.slice(endOfLineIndex);
            fileContent = `${before}\n    sold: ${data.sold},${after}`;
          }
        }
      }
    }

    fs.writeFileSync(filePath, fileContent, "utf-8");
    return { success: true };
  });
