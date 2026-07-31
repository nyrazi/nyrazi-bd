export default function SearchBar() {
  return (
    <form className="mx-8 hidden flex-1 lg:block">
      <input
        type="search"
        placeholder="Search products..."
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
      />
    </form>
  );
}