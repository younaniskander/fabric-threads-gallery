INSERT INTO public.user_roles (user_id, role)
VALUES ('ff03bf3d-d97e-4ad2-8212-2fb19271c88e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;