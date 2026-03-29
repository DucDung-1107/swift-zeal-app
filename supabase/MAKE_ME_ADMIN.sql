-- CHẠY ĐOẠN LỆNH SAU TRONG SQL EDITOR ĐỂ ĐƯA TÀI KHOẢN VỪA TẠO LÊN LÀM ADMIN
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@phucvinhsolar.vn'
ON CONFLICT (user_id, role) DO NOTHING;
