-- 1. Private schema for internal helpers
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.owns_artisan(_artisan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.artisans a WHERE a.id = _artisan_id AND a.user_id = auth.uid())
$$;

-- 2. Drop policies that reference the public helpers
DROP POLICY IF EXISTS "Admins delete artisans" ON public.artisans;
DROP POLICY IF EXISTS "Artisans read own record" ON public.artisans;
DROP POLICY IF EXISTS "Artisans update own record" ON public.artisans;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Order items visible to owner artisan admin" ON public.order_items;
DROP POLICY IF EXISTS "Users and admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
DROP POLICY IF EXISTS "Payments visible to order owner or admin" ON public.payments;
DROP POLICY IF EXISTS "Artisans manage own product images" ON public.product_images;
DROP POLICY IF EXISTS "Artisans create own products" ON public.products;
DROP POLICY IF EXISTS "Artisans delete own products" ON public.products;
DROP POLICY IF EXISTS "Artisans read own products" ON public.products;
DROP POLICY IF EXISTS "Artisans update own products" ON public.products;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage regions" ON public.regions;
DROP POLICY IF EXISTS "Users delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users read own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.owns_artisan(uuid);

-- 3. Recreate policies using the private helpers
CREATE POLICY "Admins delete artisans" ON public.artisans FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans read own record" ON public.artisans FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans update own record" ON public.artisans FOR UPDATE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Order items visible to owner artisan admin" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  OR private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users and admins update orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Payments visible to order owner or admin" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND o.user_id = auth.uid())
  OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Artisans manage own product images" ON public.product_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND (private.owns_artisan(p.artisan_id) OR private.has_role(auth.uid(), 'admin')))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND (private.owns_artisan(p.artisan_id) OR private.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Artisans create own products" ON public.products FOR INSERT TO authenticated WITH CHECK (private.owns_artisan(artisan_id));
CREATE POLICY "Artisans delete own products" ON public.products FOR DELETE TO authenticated USING (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans read own products" ON public.products FOR SELECT TO authenticated USING (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans update own products" ON public.products FOR UPDATE TO authenticated USING (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin')) WITH CHECK (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage regions" ON public.regions FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.owns_artisan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.owns_artisan(uuid) TO authenticated, anon, service_role;

-- 4. Move artisan contact/payout details out of the publicly readable table
CREATE TABLE IF NOT EXISTS public.artisan_private (
  artisan_id uuid PRIMARY KEY REFERENCES public.artisans(id) ON DELETE CASCADE,
  phone text,
  payout_details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.artisan_private (artisan_id, phone, payout_details)
SELECT id, phone, payout_details FROM public.artisans
WHERE phone IS NOT NULL OR payout_details IS NOT NULL
ON CONFLICT (artisan_id) DO NOTHING;

ALTER TABLE public.artisans DROP COLUMN IF EXISTS phone;
ALTER TABLE public.artisans DROP COLUMN IF EXISTS payout_details;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.artisan_private TO authenticated;
GRANT ALL ON public.artisan_private TO service_role;
ALTER TABLE public.artisan_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisan owners and admins manage private details" ON public.artisan_private FOR ALL TO authenticated
USING (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.owns_artisan(artisan_id) OR private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER artisan_private_updated_at BEFORE UPDATE ON public.artisan_private
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();