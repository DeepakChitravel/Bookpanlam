import { CategoryCard } from "@/types";
import Image from "next/image";

const Category = ({ name, img, itemsCount, color }: CategoryCard) => {
  let bgColor = "";
  switch (color) {
    case "green":
      bgColor = "bg-green-50";
      break;

    case "blue":
      bgColor = "bg-blue-50";
      break;

    case "yellow":
      bgColor = "bg-yellow-50";
      break;

    case "rose":
      bgColor = "bg-rose-50";
      break;

    case "orange":
      bgColor = "bg-orange-50";
      break;

    case "lime":
      bgColor = "bg-lime-50";
      break;

    case "teal":
      bgColor = "bg-teal-50";
      break;

    case "indigo":
      bgColor = "bg-indigo-50";
      break;

    case "cyan":
      bgColor = "bg-cyan-50";
      break;

    case "purple":
      bgColor = "bg-purple-50";
      break;

    default:
      bgColor = "bg-primary/10";
      break;
  }

  return (
    <div className="bg-white rounded-xl py-5 px-4 flex items-center gap-3">
      <div
        className={
          "w-11 h-11 flex items-center justify-center rounded-xl " + bgColor
        }
      >
        <Image src={img} alt="" width={24} height={24} />
      </div>

      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-gray-500 text-xs mt-1">
          {itemsCount} Services available
        </p>
      </div>
    </div>
  );
};

export default Category;
