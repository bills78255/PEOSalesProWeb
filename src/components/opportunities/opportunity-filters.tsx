import { categoryLabel, listingTypeOptions, remoteTypeOptions } from "@/lib/marketplace";

type OpportunityFiltersProps = {
  selectedListingType?: string;
  selectedCategory?: string;
  selectedRemoteType?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
  categories: string[];
};

export function OpportunityFilters({
  selectedListingType,
  selectedCategory,
  selectedRemoteType,
  featuredOnly,
  searchQuery,
  categories
}: OpportunityFiltersProps) {
  return (
    <form className="marketplace-filters" method="get">
      <label className="marketplace-filter-search">
        Search
        <input
          type="search"
          name="q"
          defaultValue={searchQuery ?? ""}
          placeholder="Search by title or company"
        />
      </label>
      <label>
        Opportunity Type
        <select name="listing_type" defaultValue={selectedListingType ?? ""}>
          <option value="">All types</option>
          {listingTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Category
        <select name="category" defaultValue={selectedCategory ?? ""}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Work Style
        <select name="remote_type" defaultValue={selectedRemoteType ?? ""}>
          <option value="">All work styles</option>
          {remoteTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="marketplace-filter-toggle">
        Featured Only
        <span className="marketplace-filter-checkbox">
          <input type="checkbox" name="featured" value="true" defaultChecked={featuredOnly} />
          <span>Show featured listings only</span>
        </span>
      </label>
      <div className="marketplace-filter-actions">
        <button type="submit">Apply Filters</button>
        <a href="/opportunities" className="ghost-link">
          Reset
        </a>
      </div>
    </form>
  );
}
