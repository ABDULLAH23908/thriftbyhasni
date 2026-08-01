import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { accessories, type Accessory } from "@/data/accessories";

interface AccessoriesPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function AccessoriesPicker({
  selected,
  onChange,
}: AccessoriesPickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
        Add Accessories
      </h3>
      <div className="space-y-2">
        {accessories.map((item) => (
          <label
            key={item.id}
            htmlFor={`accessory-${item.id}`}
            className="flex cursor-pointer items-center justify-between rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={`accessory-${item.id}`}
                checked={selected.includes(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />
              <Label
                htmlFor={`accessory-${item.id}`}
                className="cursor-pointer text-sm font-medium"
              >
                {item.name}
              </Label>
            </div>
            <span className="text-sm font-semibold text-foreground">
              + Rs {item.price.toLocaleString()}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/** Helper — total price of currently selected accessories. */
export function accessoriesTotal(selectedIds: string[]): number {
  return accessories
    .filter((a: Accessory) => selectedIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
}
