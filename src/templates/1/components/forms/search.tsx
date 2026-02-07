import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <div className="relative">
      <input
        type="text"
        className="h-[56px] w-full bg-white transition border border-transparent focus:border-primary rounded-full outline-none px-5"
        placeholder="Search for a service..."
      />

      <button className="w-11 h-11 bg-primary shadow-inner text-white flex items-center justify-center rounded-full absolute top-[50%] right-2 -translate-y-[50%]">
        <SearchIcon width={22} height={22} />
      </button>
    </div>
  );
};

export default Search;
