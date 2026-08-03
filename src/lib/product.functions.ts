import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin.functions";

/**
 * Toggles the `sold` flag for one or more products directly inside
 * src/data/products.ts. This is the single source of truth used by the
 * homepage and shop grid, so flipping it here immediately shows/hides the
 * "Sold out" state everywhere the product is listed.
 *
 * The edit is scoped to each product's own object literal (from its `id:`
 * line up to the start of the next product or the end of the array), so it
 * can never touch a `sold:` line belonging to a different product — and you
 * can always hand-edit src/data/products.ts yourself; this function just
 * reads and rewrites the same field.
 */
export const markProductsSoldInFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        productIds: z.array(z.string().min(1).max(120)).min(1).max(50),
        sold: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const filePath = path.resolve(process.cwd(), "src/data/products.ts");
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" };
    }

    let fileContent = fs.readFileSync(filePath, "utf-8");
    const notFound: string[] = [];

    for (const id of data.productIds) {
      const idPatternDouble = `id: "${id}"`;
      const idPatternSingle = `id: '${id}'`;

      let matchIndex = fileContent.indexOf(idPatternDouble);
      if (matchIndex === -1) matchIndex = fileContent.indexOf(idPatternSingle);

      if (matchIndex === -1) {
        notFound.push(id);
        continue;
      }

      // Scope the edit to THIS product's object literal only: from the id
      // line up to wherever the next product object starts (a line that is
      // just "  {") or the array's closing "];", whichever comes first.
      const nextObjStart = fileContent.indexOf("\n  {", matchIndex);
      const arrayEnd = fileContent.indexOf("\n];", matchIndex);
      let blockEnd = arrayEnd === -1 ? fileContent.length : arrayEnd;
      if (nextObjStart !== -1 && nextObjStart < blockEnd) blockEnd = nextObjStart;

      const block = fileContent.slice(matchIndex, blockEnd);
      let newBlock: string;

      if (/sold:\s*(true|false)/.test(block)) {
        newBlock = block.replace(/sold:\s*(true|false),?/, `sold: ${data.sold},`);
      } else {
        const endOfLineIndex = block.indexOf("\n");
        newBlock =
          endOfLineIndex === -1
            ? `${block}\n    sold: ${data.sold},`
            : `${block.slice(0, endOfLineIndex)}\n    sold: ${data.sold},${block.slice(endOfLineIndex)}`;
      }

      fileContent = fileContent.slice(0, matchIndex) + newBlock + fileContent.slice(blockEnd);
    }

    fs.writeFileSync(filePath, fileContent, "utf-8");

    if (notFound.length > 0) {
      return { success: true, warning: `Product id(s) not found: ${notFound.join(", ")}` };
    }
    return { success: true };
  });
