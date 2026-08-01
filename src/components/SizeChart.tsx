import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { conditions } from "@/data/products";

// Men's / Women's EURO -> UK/PAK -> US conversion.
const menSizes = [
  { eu: "38", uk: "5.5", us: "6" },
  { eu: "39", uk: "6", us: "6.5" },
  { eu: "40", uk: "6.5", us: "7" },
  { eu: "40-41", uk: "7", us: "7.5" },
  { eu: "41", uk: "7", us: "8" },
  { eu: "41-42", uk: "7.5", us: "8.5" },
  { eu: "42", uk: "8", us: "9" },
  { eu: "42-43", uk: "8.5", us: "9.5" },
  { eu: "43", uk: "9", us: "10" },
  { eu: "43-44", uk: "10", us: "10.5" },
  { eu: "44", uk: "10", us: "11" },
  { eu: "44-45", uk: "10.5", us: "11.5" },
  { eu: "45", uk: "11", us: "12" },
];

const womenSizes = [
  { eu: "35", uk: "2", us: "4" },
  { eu: "35", uk: "2.5", us: "4.5" },
  { eu: "35-36", uk: "3", us: "5" },
  { eu: "36", uk: "3.5", us: "5.5" },
  { eu: "36-37", uk: "4", us: "6" },
  { eu: "37", uk: "4.5", us: "6.5" },
  { eu: "37-38", uk: "5", us: "7" },
  { eu: "38", uk: "5.5", us: "7.5" },
  { eu: "38-39", uk: "6", us: "8" },
  { eu: "39", uk: "6.5", us: "8.5" },
  { eu: "39-40", uk: "7", us: "9" },
  { eu: "40", uk: "7.5", us: "9.5" },
];

export function SizeChart() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border text-foreground"
        >
          <Ruler className="h-4 w-4" />
          Size Chart
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Size &amp; Condition Guide
          </DialogTitle>
        </DialogHeader>

        {/* Condition guide */}
        <div className="mb-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Condition Guide
          </h3>
          <div className="overflow-hidden rounded-md border border-border">
            {conditions.map((c, i) => (
              <div
                key={c.label}
                className={`flex items-center gap-4 px-4 py-3 ${
                  i % 2 === 0 ? "bg-muted/40" : "bg-card"
                }`}
              >
                <span className="shrink-0 rounded bg-highlight px-2 py-1 text-xs font-bold uppercase tracking-wide text-highlight-foreground">
                  {c.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {c.blurb}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Size conversion */}
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Men &amp; Women Shoe Sizes
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <SizeTable title="Men" rows={menSizes} />
            <SizeTable title="Women" rows={womenSizes} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SizeTable({
  title,
  rows,
}: {
  title: string;
  rows: { eu: string; uk: string; us: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="bg-highlight px-3 py-2 text-center font-display text-xs font-bold uppercase tracking-wide text-highlight-foreground">
        {title}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/60 text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium">EURO</th>
            <th className="px-2 py-1.5 text-left font-medium">UK/PAK</th>
            <th className="px-2 py-1.5 text-left font-medium">US</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
            >
              <td className="px-2 py-1.5">{r.eu}</td>
              <td className="px-2 py-1.5">{r.uk}</td>
              <td className="px-2 py-1.5">{r.us}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
