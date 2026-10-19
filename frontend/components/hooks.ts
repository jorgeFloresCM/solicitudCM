"use client";

import { useEffect, useState } from "react";
import { Boleta, getBoletas, saveBoletas } from "@/lib/data";

export function useBoletas() {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBoletas(getBoletas());
    setLoaded(true);
  }, []);

  const update = (next: Boleta[]) => {
    setBoletas(next);
    saveBoletas(next);
  };

  return { boletas, update, loaded };
}
