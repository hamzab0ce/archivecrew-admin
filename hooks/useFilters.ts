import { useSearchStore } from "@/stores/filterStore";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useFilters() {
  const selected = useSearchStore((state) => state.selectedPlatforms);
  const setSelected = useSearchStore((state) => state.setSelectedPlatforms);
  const handleChange = (platform: string) => {
    setSelected(platform);
  };

  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState("Todos");
  const router = useRouter();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setSelectedOption(categoryParam || "Todos");
  }, [searchParams]);

  const handleCategory = (option: string) => {
    setSelectedOption(option);
    if (option === "Todos") {
      router.push("/");
    } else {
      router.push(`/?category=${option}`);
    }
  };

  return {
    selected,
    handleChange,
    selectedOption,
    handleCategory,
  };
}