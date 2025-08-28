import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

interface SearchInterfaceProps {
  onSearch: (query: string, type: "name" | "phone") => void;
  isSearching?: boolean;
  phoneToSearch?: string;
}

export default function SearchInterface({ onSearch, isSearching, phoneToSearch }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState(phoneToSearch || "");
  const [searchMode, setSearchMode] = useState<"phone" | "name">(phoneToSearch ? "phone" : "phone");
  const [countryCode, setCountryCode] = useState("+2");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const countries = [
    { code: "+966", name: "السعودية", flag: "🇸🇦" },
    { code: "+2", name: "مصر", flag: "🇪🇬" },
    { code: "+971", name: "الإمارات", flag: "🇦🇪" },
    { code: "+965", name: "الكويت", flag: "🇰🇼" },
    { code: "+974", name: "قطر", flag: "🇶🇦" },
    { code: "+973", name: "البحرين", flag: "🇧🇭" },
    { code: "+968", name: "عمان", flag: "🇴🇲" },
    { code: "+962", name: "الأردن", flag: "🇯🇴" },
    { code: "+961", name: "لبنان", flag: "🇱🇧" },
    { code: "+963", name: "سوريا", flag: "🇸🇾" },
    { code: "+964", name: "العراق", flag: "🇮🇶" },
    { code: "+967", name: "اليمن", flag: "🇾🇪" },
  ];

  const searchTypes = [
    { value: "phone", label: "ابحث بواسطة رقم" },
    { value: "name", label: "ابحث بواسطة اسم" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const fullQuery = searchMode === "phone" ? `${countryCode}${searchQuery.trim()}` : searchQuery.trim();
      onSearch(fullQuery, searchMode);
    }
  };

  // Update search query when phoneToSearch prop changes
  useEffect(() => {
    if (phoneToSearch) {
      setSearchQuery(phoneToSearch);
      setSearchMode("phone");
    }
  }, [phoneToSearch]);

  const currentCountry = countries.find(c => c.code === countryCode) || countries[1];
  const currentSearchType = searchTypes.find(s => s.value === searchMode) || searchTypes[0];

  return (
    <section className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 p-2 gap-2">
            
            {/* Country Code Selector */}
            {searchMode === "phone" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  data-testid="button-country-selector"
                >
                  <span className="text-lg">{currentCountry.flag}</span>
                  <span className="font-medium text-gray-700">{currentCountry.code}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(country.code);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-right"
                        data-testid={`option-country-${country.code}`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="font-medium">{country.code}</span>
                        <span className="text-gray-600">{country.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Input */}
            <div className="flex-1">
              <input
                type={searchMode === "phone" ? "tel" : "text"}
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  // التحقق من صحة الإدخال حسب نوع البحث
                  if (searchMode === "phone") {
                    // للبحث بالرقم: السماح بالأرقام والرموز + فقط
                    const phoneRegex = /^[\d+]*$/;
                    if (phoneRegex.test(value) || value === '') {
                      setSearchQuery(value);
                    }
                  } else {
                    // للبحث بالاسم: السماح بالحروف والمسافات فقط
                    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]*$/;
                    if (nameRegex.test(value) || value === '') {
                      setSearchQuery(value);
                    }
                  }
                }}
                placeholder={searchMode === "phone" ? "ادخل رقم الهاتف" : "ادخل الاسم"}
                className="w-full px-4 py-3 bg-transparent text-lg placeholder-gray-400 focus:outline-none"
                data-testid="input-search"
                disabled={isSearching}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
              <span>ابحث</span>
            </button>

            {/* Search Type Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                data-testid="button-search-type-selector"
              >
                <span className="text-gray-700">{currentSearchType.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showSearchDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                  {searchTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        const newSearchMode = type.value as "phone" | "name";
                        setSearchMode(newSearchMode);
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                        // Trigger search type change to show appropriate results
                        onSearch("", newSearchMode);
                      }}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50 transition-colors"
                      data-testid={`option-search-type-${type.value}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}