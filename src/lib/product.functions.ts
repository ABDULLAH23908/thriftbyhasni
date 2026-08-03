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

    // Loop over each product ID and update/add the `sold: true` or `sold: false` property
    for (const id of data.productIds) {
      const idRegex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?)(sold:\\s*(true|false),?)?([\\s\\S]*?)(?=};|},\\s*{|\\n\\s*];)`, "g");

      fileContent = fileContent.replace(idRegex, (match, p1, p2, p3, p4) => {
        // If 'sold' key exists, update it; otherwise insert it after id
        if (p2) {
          return `${p1}sold: ${data.sold},${p4}`;
        }
        return `${p1}sold: ${data.sold},\n    ${p4.trimStart()}`;
      });
    }

    fs.writeFileSync(filePath, fileContent, "utf-8");
    return { success: true };
  });
