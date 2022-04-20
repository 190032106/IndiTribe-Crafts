-- ENUMS
CREATE TYPE public.app_role AS ENUM ('customer', 'artisan', 'admin');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- UPDATED AT HELPER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'customer'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REGIONS
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  traditional_craft TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO anon, authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions are public" ON public.regions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage regions" ON public.regions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ARTISANS
CREATE TABLE public.artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  community TEXT,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  location TEXT,
  craft_specialization TEXT,
  years_experience INT NOT NULL DEFAULT 0,
  biography TEXT,
  photo_url TEXT,
  phone TEXT,
  payout_details TEXT,
  id_verified BOOLEAN NOT NULL DEFAULT false,
  status public.approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX artisans_region_idx ON public.artisans(region_id);
CREATE INDEX artisans_status_idx ON public.artisans(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artisans TO authenticated;
GRANT SELECT ON public.artisans TO anon;
GRANT ALL ON public.artisans TO service_role;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved artisans are public" ON public.artisans FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Artisans read own record" ON public.artisans FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans create own record" ON public.artisans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Artisans update own record" ON public.artisans FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete artisans" ON public.artisans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER artisans_updated_at BEFORE UPDATE ON public.artisans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_artisan(_artisan_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.artisans a WHERE a.id = _artisan_id AND a.user_id = auth.uid())
$$;

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  craft_story TEXT,
  materials TEXT,
  production_method TEXT,
  cultural_significance TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status public.approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_artisan_idx ON public.products(artisan_id);
CREATE INDEX products_region_idx ON public.products(region_id);
CREATE INDEX products_status_idx ON public.products(status, is_active);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved products are public" ON public.products FOR SELECT TO anon, authenticated USING (status = 'approved' AND is_active = true);
CREATE POLICY "Artisans read own products" ON public.products FOR SELECT TO authenticated USING (public.owns_artisan(artisan_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans create own products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.owns_artisan(artisan_id));
CREATE POLICY "Artisans update own products" ON public.products FOR UPDATE TO authenticated USING (public.owns_artisan(artisan_id) OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.owns_artisan(artisan_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Artisans delete own products" ON public.products FOR DELETE TO authenticated USING (public.owns_artisan(artisan_id) OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT ON public.product_images TO anon;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are public" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Artisans manage own product images" ON public.product_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.owns_artisan(p.artisan_id) OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (public.owns_artisan(p.artisan_id) OR public.has_role(auth.uid(), 'admin'))));

-- CART ITEMS
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WISHLIST
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ADDRESSES
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('ITC-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 8))),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  shipping_address JSONB,
  delivery_method TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and admins update orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  image_url TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
CREATE INDEX order_items_artisan_idx ON public.order_items(artisan_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items visible to owner artisan admin" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.owns_artisan(artisan_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'simulated',
  provider_reference TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments visible to order owner or admin" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  avatar_url TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  photo_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published reviews are public" ON public.reviews FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Users read own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- SEED: REGIONS
INSERT INTO public.regions (id, name, slug, traditional_craft, description) VALUES
('11111111-0000-4000-8000-000000000001','Odisha','odisha','Dongria shawls & Pattachitra','Handloom weaving and scroll painting traditions of the Eastern Ghats.'),
('11111111-0000-4000-8000-000000000002','Chhattisgarh','chhattisgarh','Bastar Dhokra brass casting','Lost-wax metal casting practised by Ghadwa families of Bastar.'),
('11111111-0000-4000-8000-000000000003','Jharkhand','jharkhand','Santhal terracotta & Sohrai art','Clay and wall-painting traditions of the Santhal and Kurmi communities.'),
('11111111-0000-4000-8000-000000000004','Madhya Pradesh','madhya-pradesh','Gond painting','Dot-and-line storytelling art of the Gond people.'),
('11111111-0000-4000-8000-000000000005','Rajasthan','rajasthan','Bhil mirror craft & blue pottery','Desert craft traditions in clay, thread and mirror.'),
('11111111-0000-4000-8000-000000000006','Gujarat','gujarat','Rabari embroidery','Mirror-work embroidery of pastoral communities of Kutch.'),
('11111111-0000-4000-8000-000000000007','Maharashtra','maharashtra','Warli painting','Ritual wall painting of the Warli tribe of Palghar.'),
('11111111-0000-4000-8000-000000000008','Telangana','telangana','Cheriyal scrolls & bamboo craft','Narrative scroll painting and natural fibre weaving.'),
('11111111-0000-4000-8000-000000000009','Andhra Pradesh','andhra-pradesh','Etikoppaka wood craft','Lacquered wooden toys coloured with vegetable dyes.'),
('11111111-0000-4000-8000-000000000010','Northeast India','northeast-india','Cane, bamboo & Naga weaving','Bamboo craft and backstrap loom weaving across the seven states.');

-- SEED: CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order) VALUES
('22222222-0000-4000-8000-000000000001','Handicrafts','handicrafts','Signature handmade pieces from tribal workshops','/images/products/dhokra-figurine.jpg',1),
('22222222-0000-4000-8000-000000000002','Home Décor','home-decor','Warm, handmade objects for everyday spaces','/images/products/terracotta-set.jpg',2),
('22222222-0000-4000-8000-000000000003','Jewellery','jewellery','Beads, brass and heirloom adornment','/images/products/beaded-necklace.jpg',3),
('22222222-0000-4000-8000-000000000004','Textiles','textiles','Handloom weaves in natural fibres and dyes','/images/products/tribal-shawl.jpg',4),
('22222222-0000-4000-8000-000000000005','Pottery','pottery','Wheel-thrown and hand-built earthenware','/images/products/terracotta-set.jpg',5),
('22222222-0000-4000-8000-000000000006','Baskets & Natural Fiber','baskets-natural-fiber','Cane, bamboo and sabai grass weaving','/images/products/tribal-shawl.jpg',6),
('22222222-0000-4000-8000-000000000007','Paintings & Art','paintings-art','Warli, Gond and Pattachitra artworks','/images/products/warli-wall-art.jpg',7),
('22222222-0000-4000-8000-000000000008','Wood Crafts','wood-crafts','Carved and lacquered woodwork','/images/products/dhokra-elephant.jpg',8),
('22222222-0000-4000-8000-000000000009','Tribal Foods','tribal-foods','Forest honey, millets and hand-ground spices','/images/products/terracotta-set.jpg',9),
('22222222-0000-4000-8000-000000000010','Gifts','gifts','Curated handmade gifts with a story','/images/products/dhokra-elephant.jpg',10);

-- SEED: ARTISANS
INSERT INTO public.artisans (id, slug, display_name, community, region_id, location, craft_specialization, years_experience, biography, photo_url, id_verified, status) VALUES
('33333333-0000-4000-8000-000000000001','sita-devi-bariha','Sita Devi Bariha','Dongria Kondh','11111111-0000-4000-8000-000000000001','Rayagada, Odisha','Handloom weaving',22,'Sita learned the Kapdaganda weave from her mother and now leads a collective of fourteen women weaving shawls on pit looms with hand-spun cotton and natural dyes.','/images/artisans/sita-devi.jpg',true,'approved'),
('33333333-0000-4000-8000-000000000002','ramesh-netam','Ramesh Netam','Gond','11111111-0000-4000-8000-000000000002','Kondagaon, Bastar, Chhattisgarh','Dhokra lost-wax brass casting',18,'A third-generation Ghadwa metalsmith, Ramesh shapes every figure in beeswax thread before casting it in bell metal — a technique unchanged for four thousand years.','/images/artisans/ramesh-netam.jpg',true,'approved'),
('33333333-0000-4000-8000-000000000003','jivya-waghmare','Jivya Waghmare','Warli','11111111-0000-4000-8000-000000000007','Dahanu, Palghar, Maharashtra','Warli painting',30,'Jivya paints harvest and marriage rituals with rice paste and a chewed bamboo twig, carrying forward wall paintings once made only by married women of the village.','/images/artisans/jivya-waghmare.jpg',true,'approved'),
('33333333-0000-4000-8000-000000000004','phulmani-murmu','Phulmani Murmu','Santhal','11111111-0000-4000-8000-000000000003','Dumka, Jharkhand','Terracotta pottery',15,'Phulmani digs her own river clay, throws each vessel on a hand-turned wheel and fires it in an open pit kiln fed with rice husk.','/images/artisans/phulmani-murmu.jpg',true,'approved');

-- SEED: PRODUCTS
INSERT INTO public.products (id, slug, name, description, craft_story, materials, production_method, cultural_significance, price, compare_at_price, stock, category_id, artisan_id, region_id, rating, review_count, is_featured, status) VALUES
('44444444-0000-4000-8000-000000000001','warli-hand-painted-wall-art','Warli Hand-Painted Wall Art','A hand-painted Warli scene of a village harvest dance on handmade cotton-rag paper.','Painted with rice-paste white on an earth-toned base, each figure is drawn freehand with a chewed bamboo twig, exactly as Warli walls have been decorated for centuries.','Handmade cotton-rag paper, rice paste, natural earth pigment','Freehand painting with bamboo twig brush, sun-dried between layers','Warli paintings were ritual art made for weddings and harvests, never for sale — today they carry the same blessings into modern homes.',2450,3200,12,'22222222-0000-4000-8000-000000000007','33333333-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000007',4.8,2,true,'approved'),
('44444444-0000-4000-8000-000000000002','bastar-dhokra-brass-figurine','Bastar Dhokra Brass Figurine','A lost-wax cast brass figure of a tribal woman, finished with fine wax-thread texture.','Ramesh winds hair-thin beeswax threads around a clay core, encases it in clay and pours molten bell metal — the mould is broken once, so no two pieces are alike.','Bell metal brass, beeswax, river clay','Traditional lost-wax (cire perdue) casting, hand-finished','Dhokra figures were made as household deities and dowry gifts across Bastar for generations.',3890,4600,8,'22222222-0000-4000-8000-000000000001','33333333-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000002',4.9,1,true,'approved'),
('44444444-0000-4000-8000-000000000003','handwoven-tribal-cotton-shawl','Handwoven Tribal Cotton Shawl','A soft pit-loom shawl in hand-spun cotton with natural-dye stripes.','Woven over eleven days on a pit loom, with madder root and indigo dyes prepared in the courtyard by the weaving collective.','Hand-spun cotton, madder and indigo natural dyes','Pit-loom weaving with hand-spun yarn','The Kapdaganda shawl is embroidered by Dongria Kondh women as a token of affection and identity.',2990,3500,20,'22222222-0000-4000-8000-000000000004','33333333-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001',4.7,1,true,'approved'),
('44444444-0000-4000-8000-000000000004','terracotta-tribal-pottery-set','Terracotta Tribal Pottery Set','A set of three hand-thrown terracotta vessels with painted tribal motifs.','Thrown from river clay on a hand-turned wheel, painted with iron-oxide motifs and fired slowly in an open pit kiln.','River clay, iron-oxide pigment','Hand-thrown, pit-fired with rice husk','Santhal households keep such vessels for grain and water; the motifs echo Sohrai harvest wall paintings.',1890,2400,15,'22222222-0000-4000-8000-000000000005','33333333-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000003',4.6,1,true,'approved'),
('44444444-0000-4000-8000-000000000005','dokra-elephant-sculpture','Dokra Elephant Sculpture','A bell-metal elephant with detailed wax-thread ornamentation.','Cast in a single pour after two weeks of wax work, then burnished by hand to a soft antique glow.','Bell metal brass, beeswax','Lost-wax casting, hand burnishing','The elephant is a symbol of prosperity and memory in Bastar folk narratives.',4750,NULL,6,'22222222-0000-4000-8000-000000000008','33333333-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000002',4.9,1,true,'approved'),
('44444444-0000-4000-8000-000000000006','tribal-beaded-necklace','Tribal Beaded Necklace','A statement necklace of hand-rolled clay beads with brass spacers.','Every bead is rolled, dried and polished by hand, then strung on cotton cord with brass elements cast in the same workshop.','Terracotta clay beads, brass, cotton cord','Hand-rolled beads, kiln-fired, hand-strung','Beadwork marks life events across tribal communities — birth, marriage and harvest.',1290,1650,25,'22222222-0000-4000-8000-000000000003','33333333-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001',4.5,1,true,'approved');

-- SEED: PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('44444444-0000-4000-8000-000000000001','/images/products/warli-wall-art.jpg','Warli hand-painted wall art with white figures on ochre background',0),
('44444444-0000-4000-8000-000000000002','/images/products/dhokra-figurine.jpg','Bastar Dhokra brass figurine of a tribal woman',0),
('44444444-0000-4000-8000-000000000003','/images/products/tribal-shawl.jpg','Folded handwoven tribal cotton shawl with earthy stripes',0),
('44444444-0000-4000-8000-000000000004','/images/products/terracotta-set.jpg','Set of three painted terracotta tribal pots',0),
('44444444-0000-4000-8000-000000000005','/images/products/dhokra-elephant.jpg','Dhokra brass elephant sculpture',0),
('44444444-0000-4000-8000-000000000006','/images/products/beaded-necklace.jpg','Tribal necklace of clay and brass beads',0);

-- SEED: REVIEWS
INSERT INTO public.reviews (product_id, author_name, rating, comment) VALUES
('44444444-0000-4000-8000-000000000001','Ananya Rao',5,'The brushwork is astonishing up close. It arrived with a note about the artisan — that made it special.'),
('44444444-0000-4000-8000-000000000001','Karthik Menon',5,'Beautifully packed and even better in person. The ochre is warmer than the photos.'),
('44444444-0000-4000-8000-000000000002','Meera Joshi',5,'Weighty, detailed and clearly handmade. You can see the wax threads in the brass.'),
('44444444-0000-4000-8000-000000000003','Rohit Sharma',5,'Incredibly soft and light. Knowing fourteen women wove it makes it worth every rupee.'),
('44444444-0000-4000-8000-000000000004','Divya Nair',5,'Perfectly imperfect — exactly what you want from hand-thrown pottery.'),
('44444444-0000-4000-8000-000000000005','Sanjay Gupta',5,'A conversation piece in our living room. Superb finish.'),
('44444444-0000-4000-8000-000000000006','Priya Venkatesh',4,'Lovely earthy beads, sits well. Slightly heavier than expected.');