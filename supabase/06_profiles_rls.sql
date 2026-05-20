-- Bật RLS cho bảng profiles
-- Chạy file này trong Supabase SQL Editor

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users có thể đọc tất cả profiles (cần thiết để hiển thị tên assignee)
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- Mỗi user chỉ tự cập nhật profile của mình
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin có thể cập nhật bất kỳ profile nào (đổi role, status)
CREATE POLICY "Admin can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.get_user_role() = 'admin');
