export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 mt-6 text-center border rounded-xl bg-card text-card-foreground">
      <h3 className="text-xl font-semibold mb-2">No analytics data available</h3>
      <p className="text-muted-foreground w-[min(100%,400px)]">
        There is no analytics data available for the selected time range. Try changing the range or check back later.
      </p>
    </div>
  );
}
