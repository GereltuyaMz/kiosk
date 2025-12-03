import { useState, useCallback, useRef } from "react";
import type { ProductDetails } from "@/types/kiosk";

type CacheEntry = {
  data: ProductDetails;
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const productCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<ProductDetails | null>>();

export const useProductDetailsCache = () => {
  const [cachedData, setCachedData] = useState<Map<string, ProductDetails>>(
    new Map()
  );
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchProductDetails = useCallback(
    async (productId: string): Promise<ProductDetails | null> => {
      // Check cache first
      const cached = productCache.get(productId);
      if (cached && isCacheValid(cached.timestamp)) {
        setCachedData((prev) => new Map(prev).set(productId, cached.data));
        return cached.data;
      }

      // Check if request is already pending
      const pending = pendingRequests.get(productId);
      if (pending) {
        return pending;
      }

      // Cancel previous request for this product if any
      const existingController = abortControllers.current.get(productId);
      if (existingController) {
        existingController.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllers.current.set(productId, controller);

      // Fetch new data
      const promise = fetch(`/api/kiosk/products/${productId}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const result = await response.json();
          if (result.success && result.data) {
            const productDetails = result.data as ProductDetails;

            // Update cache
            productCache.set(productId, {
              data: productDetails,
              timestamp: Date.now(),
            });

            // Update state
            setCachedData((prev) =>
              new Map(prev).set(productId, productDetails)
            );

            return productDetails;
          }
          return null;
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return null;
          }
          console.error("Failed to fetch product details:", error);
          return null;
        })
        .finally(() => {
          pendingRequests.delete(productId);
          abortControllers.current.delete(productId);
        });

      pendingRequests.set(productId, promise);
      return promise;
    },
    []
  );

  const prefetchProduct = useCallback(
    (productId: string) => {
      // Only prefetch if not already cached or pending
      const cached = productCache.get(productId);
      if (cached && isCacheValid(cached.timestamp)) {
        return;
      }

      if (pendingRequests.has(productId)) {
        return;
      }

      // Fire and forget prefetch
      fetchProductDetails(productId);
    },
    [fetchProductDetails]
  );

  const getCachedProduct = useCallback((productId: string) => {
    const cached = productCache.get(productId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return cachedData.get(productId) || null;
  }, [cachedData]);

  const clearCache = useCallback(() => {
    productCache.clear();
    pendingRequests.clear();
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();
    setCachedData(new Map());
  }, []);

  return {
    fetchProductDetails,
    prefetchProduct,
    getCachedProduct,
    clearCache,
  };
};
