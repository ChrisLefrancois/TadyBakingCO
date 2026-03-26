function buildPricingLines(cart) {
  const itemMap = cart.reduce((acc, line) => {
    const id = line.item._id;

    if (!acc[id]) {
      acc[id] = {
        item: line.item,
        qty: 0,
      };
    }

    acc[id].qty += line.qty || 0;
    return acc;
  }, {});

  return Object.values(itemMap).flatMap(({ item, qty }) => {
    const tiers = [...(item.pricingTiers || [])].sort(
      (a, b) => b.quantity - a.quantity
    );

    if (!tiers.length) {
      return [
        {
          item,
          qty,
          unitPrice: 0,
          totalPrice: 0,
          tierQuantity: qty,
        },
      ];
    }

    const lines = [];
    let remaining = qty;

    for (const tier of tiers) {
      while (remaining >= tier.quantity) {
        lines.push({
          item,
          qty: tier.quantity,
          unitPrice: tier.price / tier.quantity,
          totalPrice: tier.price,
          tierQuantity: tier.quantity,
        });

        remaining -= tier.quantity;
      }
    }

    return lines;
  });
}
