import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type CartLine = {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image_url: string | null;
  artisan_name: string | null;
};

type CartRow = {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    slug: string;
    price: string | number;
    stock: number;
    artisans: { display_name: string } | null;
    product_images: { image_url: string; sort_order: number }[] | null;
  } | null;
};

export function useCart() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cart", user?.id ?? "anonymous"],
    enabled: Boolean(user),
    queryFn: async (): Promise<CartLine[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id, product_id, quantity, products ( name, slug, price, stock, artisans ( display_name ), product_images ( image_url, sort_order ) )",
        )
        .order("created_at");
      if (error) throw error;

      return ((data ?? []) as unknown as CartRow[])
        .filter((row) => row.products)
        .map((row) => {
          const images = [...(row.products?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          return {
            id: row.id,
            product_id: row.product_id,
            quantity: row.quantity,
            name: row.products!.name,
            slug: row.products!.slug,
            price: Number(row.products!.price),
            stock: row.products!.stock,
            image_url: images[0]?.image_url ?? null,
            artisan_name: row.products!.artisans?.display_name ?? null,
          };
        });
    },
  });
}

export function useAddToCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) throw new Error("SIGN_IN_REQUIRED");

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to your bag");
    },
    onError: (error: Error) => {
      if (error.message === "SIGN_IN_REQUIRED") {
        toast.error("Please sign in to start a bag");
        return;
      }
      toast.error("Could not add this item. Please try again.");
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity < 1) {
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Could not update the quantity."),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from your bag");
    },
    onError: () => toast.error("Could not remove this item."),
  });
}

export function useWishlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id ?? "anonymous"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlist_items").select("id, product_id");
      if (error) throw error;
      return (data ?? []) as { id: string; product_id: string }[];
    },
  });
}

export type WishlistLine = {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  artisan_name: string | null;
};

type WishlistRow = {
  id: string;
  product_id: string;
  products: {
    name: string;
    slug: string;
    price: string | number;
    artisans: { display_name: string } | null;
    product_images: { image_url: string; sort_order: number }[] | null;
  } | null;
};

export function useWishlistDetailed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist-detailed", user?.id ?? "anonymous"],
    enabled: Boolean(user),
    queryFn: async (): Promise<WishlistLine[]> => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(
          "id, product_id, products ( name, slug, price, artisans ( display_name ), product_images ( image_url, sort_order ) )",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;

      return ((data ?? []) as unknown as WishlistRow[])
        .filter((row) => row.products)
        .map((row) => {
          const images = [...(row.products?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          return {
            id: row.id,
            product_id: row.product_id,
            name: row.products!.name,
            slug: row.products!.slug,
            price: Number(row.products!.price),
            image_url: images[0]?.image_url ?? null,
            artisan_name: row.products!.artisans?.display_name ?? null,
          };
        });
    },
  });
}

export function useToggleWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("SIGN_IN_REQUIRED");

      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
        if (error) throw error;
        return "removed" as const;
      }

      const { error } = await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(result === "added" ? "Saved to your wishlist" : "Removed from your wishlist");
    },
    onError: (error: Error) => {
      if (error.message === "SIGN_IN_REQUIRED") {
        toast.error("Please sign in to save favourites");
        return;
      }
      toast.error("Could not update your wishlist.");
    },
  });
}
