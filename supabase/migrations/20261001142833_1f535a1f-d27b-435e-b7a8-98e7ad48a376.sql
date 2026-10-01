CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE TABLE public.certificates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid, certificate_number text NOT NULL UNIQUE,
 first_name text NOT NULL, last_name text NOT NULL, birth_date date NOT NULL, birth_country text NOT NULL,
 exam_date date NOT NULL, exam_level text NOT NULL DEFAULT 'B1', result text NOT NULL DEFAULT 'bestanden',
 completed boolean NOT NULL DEFAULT false, email text, email_sent boolean NOT NULL DEFAULT false, email_send_count integer DEFAULT 0,
 examiner_1 text, examiner_2 text, points_hoeren_lesen integer, points_schreiben integer, points_sprechen integer, points_werte integer,
 signed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated; GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER certificates_updated BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_certificate_by_number(_number text) RETURNS SETOF public.certificates LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT * FROM public.certificates WHERE lower(certificate_number) = lower(trim(_number)) LIMIT 1 $$;
GRANT EXECUTE ON FUNCTION public.get_certificate_by_number(text) TO anon, authenticated;

CREATE TABLE public.certificate_verifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), certificate_number text NOT NULL, ip text, country text, region text, city text,
 device_type text, browser text, os text, user_agent text, created_at timestamptz NOT NULL DEFAULT now());
GRANT INSERT ON public.certificate_verifications TO anon; GRANT SELECT, INSERT ON public.certificate_verifications TO authenticated; GRANT ALL ON public.certificate_verifications TO service_role;
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone logs a verification" ON public.certificate_verifications FOR INSERT TO anon, authenticated WITH CHECK (length(certificate_number) BETWEEN 1 AND 100);
CREATE POLICY "Admins read verifications" ON public.certificate_verifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_settings (id integer PRIMARY KEY DEFAULT 1, maintenance_enabled boolean NOT NULL DEFAULT false,
 maintenance_title text NOT NULL DEFAULT 'Wartungsarbeiten', maintenance_message text NOT NULL DEFAULT 'Die Website wird gerade gewartet. Bitte versuchen Sie es später erneut.', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.site_settings TO anon; GRANT SELECT, UPDATE ON public.site_settings TO authenticated; GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.site_settings (id) VALUES (1);