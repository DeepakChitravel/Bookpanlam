import { Badge } from "@/components/ui/badge";
import Stars from "../Stars";
import { BookingHeaderProps } from "@/types";

const BookingHeader = ({
  badge,
  name,
  amount,
  previousAmount,
  taxType,
}: BookingHeaderProps) => {
  return (
    <div className="bg-gray-50 w-full rounded-xl p-4 flex flex-col md:flex-row gap-7 items-center justify-between mb-10">
      <div>
        {badge && <Badge variant="default">{badge}</Badge>}

        <h1 className="text-3xl font-bold mt-2">{name}</h1>

        <div className="flex items-center gap-2 mt-3">
          <span className="font-bold">4.0</span>
          <Stars />
          <span className="text-gray-500">(5 Reviews)</span>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-end gap-2">
          <span className="text-3xl font-bold">{amount}</span>
          {previousAmount && (
            <span className="line-through text-gray-500">{previousAmount}</span>
          )}
        </div>

        {taxType ? (
          <p className="mt-2 text-green-600">{taxType} of all taxes</p>
        ) : null}
      </div>
    </div>
  );
};

export default BookingHeader;
