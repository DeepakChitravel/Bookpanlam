import { convertToReadableText } from "@/lib/utils";
import { BookingStep3Props } from "@/types";

const Step3 = ({ details, service }: BookingStep3Props) => {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-gray-100 p-4">
        <h4 className="font-bold text-lg mb-5">Details</h4>

        <ul className="space-y-4">
          {Object.keys(details).map(
            (item, index) =>
              details[item] && (
                <li
                  key={index}
                  className="font-medium text-gray-500 flex items-center justify-between"
                >
                  {convertToReadableText(item)}:{" "}
                  <span className="text-right">{details[item]}</span>
                </li>
              )
          )}
        </ul>
      </div>

      <div className="bg-gray-100 p-4">
        <h4 className="font-bold text-lg mb-5">Service Information</h4>

        <ul className="space-y-4">
          {Object.keys(service).map(
            (item, index) =>
              service[item] && (
                <li
                  key={index}
                  className="font-medium text-gray-500 flex items-center justify-between"
                >
                  {convertToReadableText(item)}:{" "}
                  <span className="text-right">{service[item]}</span>
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step3;
