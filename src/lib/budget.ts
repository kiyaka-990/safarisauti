export interface Budget { capKes: number; spentKes: number }

export function assertWithinBudget(b: Budget, itemKes: number, label: string): void {
  const projected = b.spentKes + itemKes;
  if (projected > b.capKes) {
    throw new Error(
      `BudgetGuard: "${label}" (KES ${itemKes.toLocaleString()}) would exceed cap ` +
      `(projected KES ${projected.toLocaleString()} > ${b.capKes.toLocaleString()})`
    );
  }
}

export function charge(b: Budget, itemKes: number, label: string): Budget {
  assertWithinBudget(b, itemKes, label);
  return { ...b, spentKes: b.spentKes + itemKes };
}
