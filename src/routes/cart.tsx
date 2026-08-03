{items.map((item) => (
  <li key={item.id} className="flex gap-4 py-5">
    <img src={item.image} alt={item.name} className="h-24 w-24 object-cover" />
    <div className="flex flex-1 flex-col">
      <p className="font-semibold">{item.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.brand} · {item.condition} · {item.size}
      </p>

      {/* Render Add-ons if present */}
      {item.addOns && item.addOns.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Add-ons:</p>
          <ul className="list-inside list-disc">
            {item.addOns.map((addon) => (
              <li key={addon.id}>
                {addon.name} (+PKR {addon.price.toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-bold">
          PKR {(item.price + (item.addOns?.reduce((sum, a) => sum + a.price, 0) ?? 0)).toLocaleString()}
        </span>
        <button
          onClick={() => removeItem(item.id)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </button>
      </div>
    </div>
  </li>
))}
