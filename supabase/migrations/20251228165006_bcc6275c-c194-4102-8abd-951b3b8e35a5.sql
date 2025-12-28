-- Create app_role enum for admin/moderator access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled');

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create orders table to track purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table with strict constraints
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(review_text) >= 10 AND char_length(review_text) <= 1000),
  is_visible BOOLEAN DEFAULT true,
  is_verified_purchase BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- One review per user per product
  UNIQUE (user_id, product_id)
);

-- Create review_logs table for abuse monitoring
CREATE TABLE public.review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user can review a product (purchased and delivered/completed)
CREATE OR REPLACE FUNCTION public.can_review_product(_user_id UUID, _product_id TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.orders
  WHERE user_id = _user_id
    AND product_id = _product_id
    AND status IN ('delivered', 'completed')
  LIMIT 1
$$;

-- Function to check if user already reviewed a product
CREATE OR REPLACE FUNCTION public.has_reviewed_product(_user_id UUID, _product_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reviews
    WHERE user_id = _user_id
      AND product_id = _product_id
  )
$$;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Orders RLS policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews RLS policies
CREATE POLICY "Anyone can view visible reviews"
  ON public.reviews FOR SELECT
  USING (is_visible = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Verified buyers can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT public.is_user_blocked(auth.uid())
    AND public.can_review_product(auth.uid(), product_id) IS NOT NULL
    AND NOT public.has_reviewed_product(auth.uid(), product_id)
  );

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND NOT public.is_user_blocked(auth.uid()));

CREATE POLICY "Users can delete their own reviews or admin can delete any"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Review logs RLS policies (only admins can view)
CREATE POLICY "Only admins can view review logs"
  ON public.review_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert review logs"
  ON public.review_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_orders_user_product ON public.orders(user_id, product_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_review_logs_user ON public.review_logs(user_id);
CREATE INDEX idx_review_logs_created ON public.review_logs(created_at);