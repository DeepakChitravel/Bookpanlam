import { Category as CategoryProps } from "@/types";
import Category from "../cards/category";
import { uploadsUrl } from "@/config";
const colors = [
  "green",
  "blue",
  "yellow",
  "rose",
  "orange",
  "lime",
  "teal",
  "indigo",
  "cyan",
  "purple",
];

const Categories = ({ categories }: { categories: CategoryProps[] }) => {
  return (
    <section className="lg:py-20 py-8 bg-[#161921]">
      <div className="container">
        <h1 className="lg:text-5xl text-3xl sm:text-4xl font-bold text-center mb-12 lg:mb-20 text-white">
          Browse Our Categories
        </h1>

        <div className="grid lg:grid-cols-4 grid-cols-1 sm:grid-cols-3 gap-6">
          {categories?.map((item, index: number) => (
            <Category
              key={index}
              name={item.name}
              img={uploadsUrl + "/" + item.image}
              itemsCount={item.totalServices}
              color={colors[index % colors.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
