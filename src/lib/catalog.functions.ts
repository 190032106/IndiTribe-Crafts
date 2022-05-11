import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";

import { createPublicServerClient } from "./supabase-public";

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
};

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  rating: number;
  review_count: number;
  image_url: string | null;
  artisan_name: string | null;
  artisan_slug: string | null;
  location: string | null;
  category_name: string | null;
  region_name: string | null;
};

export type ArtisanSummary = {
  id: string;
  slug: string;
  display_name: string;
  community: string | null;
  location: string | null;
  craft_specialization: string | null;
  years_experience: number;
  photo_url: string | null;
  biography: string | null;
  product_count: number;
};

export type RegionSummary = {
  id: string;
  name: string;
  slug: string;
  traditional_craft: string | null;
  description: string | null;
  product_count: number;
  sample_products: { name: string; slug: string; image_url: string | null }[];
};

export type TestimonialSummary = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  product_name: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  compare_at_price: string | number | null;
  stock: number;
  rating: string | number;
  review_count: number;
  category_id: string | null;
  region_id: string | null;
  artisans: { display_name: string; slug: string; location: string | null } | null;
  categories: { name: string } | null;
  regions: { name: string } | null;
  product_images: { image_url: string; sort_order: number }[] | null;
};

const PRODUCT_SELECT = `
  id, slug, name, price, compare_at_price, stock, rating, review_count, category_id, region_id,
  artisans ( display_name, slug, location ),
  categories ( name ),
  regions ( name ),
  product_images ( image_url, sort_order )
`;

export function mapProduct(row: ProductRow): ProductSummary {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
    stock: row.stock,
    rating: Number(row.rating),
    review_count: row.review_count,
    image_url: images[0]?.image_url ?? null,
    artisan_name: row.artisans?.display_name ?? null,
    artisan_slug: row.artisans?.slug ?? null,
    location: row.artisans?.location ?? null,
    category_name: row.categories?.name ?? null,
    region_name: row.regions?.name ?? null,
  };
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicServerClient();

  const [categoriesRes, productsRes, artisansRes, regionsRes, reviewsRes] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description, image_url, sort_order").order("sort_order"),
    supabase.from("products").select(PRODUCT_SELECT).eq("is_featured", true).limit(8),
    supabase
      .from("artisans")
      .select("id, slug, display_name, community, location, craft_specialization, years_experience, photo_url, biography")
      .limit(4),
    supabase.from("regions").select("id, name, slug, traditional_craft, description").order("name"),
    supabase
      .from("reviews")
      .select("id, author_name, rating, comment, products ( name )")
      .gte("rating", 4)
      .limit(6),
  ]);

  const allProductsRes = await supabase.from("products").select(PRODUCT_SELECT);
  const allProducts = ((allProductsRes.data ?? []) as unknown as ProductRow[]).map((row) => ({
    row,
    product: mapProduct(row),
  }));

  const categories: CategorySummary[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    description: (c.description as string) ?? null,
    image_url: (c.image_url as string) ?? null,
    product_count: allProducts.filter((p) => p.row.category_id === c.id).length,
  }));

  const featured: ProductSummary[] = ((productsRes.data ?? []) as unknown as ProductRow[]).map(mapProduct);

  const artisans: ArtisanSummary[] = (artisansRes.data ?? []).map((a) => ({
    id: a.id as string,
    slug: a.slug as string,
    display_name: a.display_name as string,
    community: (a.community as string) ?? null,
    location: (a.location as string) ?? null,
    craft_specialization: (a.craft_specialization as string) ?? null,
    years_experience: (a.years_experience as number) ?? 0,
    photo_url: (a.photo_url as string) ?? null,
    biography: (a.biography as string) ?? null,
    product_count: allProducts.filter((p) => p.product.artisan_slug === a.slug).length,
  }));

  const regions: RegionSummary[] = (regionsRes.data ?? []).map((r) => {
    const matching = allProducts.filter((p) => p.row.region_id === r.id);
    return {
      id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      traditional_craft: (r.traditional_craft as string) ?? null,
      description: (r.description as string) ?? null,
      product_count: matching.length,
      sample_products: matching.slice(0, 3).map((p) => ({
        name: p.product.name,
        slug: p.product.slug,
        image_url: p.product.image_url,
      })),
    };
  });

  const testimonials: TestimonialSummary[] = (reviewsRes.data ?? []).map((r) => {
    const product = r.products as unknown as { name: string } | null;
    return {
      id: r.id as string,
      author_name: r.author_name as string,
      rating: r.rating as number,
      comment: (r.comment as string) ?? null,
      product_name: product?.name ?? null,
    };
  });

  return { categories, featured, artisans, regions, testimonials };
});

export const homeQueryOptions = queryOptions({
  queryKey: ["home-data"],
  queryFn: () => getHomeData(),
  staleTime: 60_000,
});

export type CatalogData = {
  products: ProductSummary[];
  categories: { id: string; name: string; slug: string; description: string | null; image_url: string | null; product_count: number }[];
  regions: { id: string; name: string; slug: string; traditional_craft: string | null }[];
  artisans: ArtisanSummary[];
};

export const getCatalogData = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogData> => {
  const supabase = createPublicServerClient();

  const [productsRes, categoriesRes, regionsRes, artisansRes] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, description, image_url, sort_order").order("sort_order"),
    supabase.from("regions").select("id, name, slug, traditional_craft").order("name"),
    supabase
      .from("artisans")
      .select("id, slug, display_name, community, location, craft_specialization, years_experience, photo_url, biography")
      .order("display_name"),
  ]);

  const products = ((productsRes.data ?? []) as unknown as ProductRow[]).map(mapProduct);
  const rows = (productsRes.data ?? []) as unknown as ProductRow[];

  return {
    products,
    categories: (categoriesRes.data ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      slug: c.slug as string,
      description: (c.description as string) ?? null,
      image_url: (c.image_url as string) ?? null,
      product_count: rows.filter((r) => r.category_id === c.id).length,
    })),
    regions: (regionsRes.data ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      traditional_craft: (r.traditional_craft as string) ?? null,
    })),
    artisans: (artisansRes.data ?? []).map((a) => ({
      id: a.id as string,
      slug: a.slug as string,
      display_name: a.display_name as string,
      community: (a.community as string) ?? null,
      location: (a.location as string) ?? null,
      craft_specialization: (a.craft_specialization as string) ?? null,
      years_experience: (a.years_experience as number) ?? 0,
      photo_url: (a.photo_url as string) ?? null,
      biography: (a.biography as string) ?? null,
      product_count: products.filter((p) => p.artisan_slug === a.slug).length,
    })),
  };
});

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalogData(),
  staleTime: 60_000,
});

export type ProductDetail = ProductSummary & {
  description: string | null;
  craft_story: string | null;
  materials: string | null;
  production_method: string | null;
  cultural_significance: string | null;
  images: { image_url: string; alt_text: string | null }[];
  artisan: ArtisanSummary | null;
  reviews: { id: string; author_name: string; rating: number; comment: string | null; photo_url: string | null; created_at: string }[];
  related: ProductSummary[];
};

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const supabase = createPublicServerClient();

    const { data: row } = await supabase
      .from("products")
      .select(
        `${PRODUCT_SELECT}, description, craft_story, materials, production_method, cultural_significance,
         artisans ( id, slug, display_name, community, location, craft_specialization, years_experience, photo_url, biography )`,
      )
      .eq("slug", data.slug)
      .maybeSingle();

    if (!row) return null;

    const typedRow = row as unknown as ProductRow & {
      description: string | null;
      craft_story: string | null;
      materials: string | null;
      production_method: string | null;
      cultural_significance: string | null;
      product_images: { image_url: string; sort_order: number; alt_text?: string | null }[] | null;
      artisans:
        | (ProductRow["artisans"] & {
            id: string;
            community: string | null;
            craft_specialization: string | null;
            years_experience: number;
            photo_url: string | null;
            biography: string | null;
          })
        | null;
    };

    const summary = mapProduct(typedRow);

    const [reviewsRes, relatedRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("id, author_name, rating, comment, photo_url, created_at")
        .eq("product_id", summary.id)
        .order("created_at", { ascending: false }),
      supabase.from("products").select(PRODUCT_SELECT).neq("slug", data.slug).limit(4),
    ]);

    const artisanRow = typedRow.artisans;

    return {
      ...summary,
      description: typedRow.description,
      craft_story: typedRow.craft_story,
      materials: typedRow.materials,
      production_method: typedRow.production_method,
      cultural_significance: typedRow.cultural_significance,
      images: [...(typedRow.product_images ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({ image_url: image.image_url, alt_text: image.alt_text ?? summary.name })),
      artisan: artisanRow
        ? {
            id: artisanRow.id,
            slug: artisanRow.slug,
            display_name: artisanRow.display_name,
            community: artisanRow.community,
            location: artisanRow.location,
            craft_specialization: artisanRow.craft_specialization,
            years_experience: artisanRow.years_experience,
            photo_url: artisanRow.photo_url,
            biography: artisanRow.biography,
            product_count: 0,
          }
        : null,
      reviews: (reviewsRes.data ?? []).map((r) => ({
        id: r.id as string,
        author_name: r.author_name as string,
        rating: r.rating as number,
        comment: (r.comment as string) ?? null,
        photo_url: (r.photo_url as string) ?? null,
        created_at: r.created_at as string,
      })),
      related: ((relatedRes.data ?? []) as unknown as ProductRow[]).map(mapProduct),
    };
  });

export function productQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });
}
