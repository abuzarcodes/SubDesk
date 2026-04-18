import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RangeSelectorProps {
  range: "7d" | "30d" | "90d";
  onRangeChange: (range: "7d" | "30d" | "90d") => void;
}

export function RangeSelector({ range, onRangeChange }: RangeSelectorProps) {
  return (
    <Select value={range} onValueChange={onRangeChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">7 Days</SelectItem>
        <SelectItem value="30d">30 Days</SelectItem>
        <SelectItem value="90d">90 Days</SelectItem>
      </SelectContent>
    </Select>
  );
}
