# Thiết kế Kiến trúc Supabase - CRM Yến Sào Vĩnh Hưng

Dựa trên PRD và Design Brief, dưới đây là tài liệu thiết kế nền kỹ thuật Supabase đáp ứng đầy đủ các yêu cầu từ cấu trúc bảng, phân quyền (RLS) đến cơ chế xác thực.

---

## 1. Danh sách các bảng (Tables)

1. **`profiles`**: Mở rộng từ `auth.users`, chứa thông tin người dùng (tên, role, trạng thái).
2. **`teams`**: Lưu danh sách các nhóm bán hàng.
3. **`team_members`**: Bảng trung gian liên kết `profiles` với `teams`, xác định ai là trưởng nhóm.
4. **`leads`**: Bảng khách hàng (lẻ, đại lý, VIP).
5. **`lead_tags`**: Danh sách các thẻ/tag để phân loại khách hàng.
6. **`lead_lists`**: Bộ lọc/danh sách khách hàng đã lưu (vd: Đại lý chiến lược miền Nam).
7. **`pipeline_stages`**: Các giai đoạn bán hàng (Mới, Đang tư vấn, Gửi báo giá...).
8. **`opportunities`**: Cơ hội bán hàng (các thẻ Kanban).
9. **`tasks`**: Công việc hàng ngày (gọi điện, gửi báo giá).
10. **`payments`**: Giao dịch thanh toán liên kết với cơ hội chốt đơn.
11. **`subscriptions`**: Các gói mua định kỳ (vd: Yến chưng set tháng).
12. **`activity_logs`**: Nhật ký hệ thống (audit trail) ghi lại thao tác người dùng.

---

## 2. SQL Schema Hoàn chỉnh

```sql
-- 1. ENUMS (Kiểu dữ liệu)
CREATE TYPE user_role AS ENUM ('admin', 'team_lead', 'sales');
CREATE TYPE lead_segment AS ENUM ('Khách lẻ', 'Đại lý', 'VIP');
CREATE TYPE task_priority AS ENUM ('Thấp', 'Trung bình', 'Cao');
CREATE TYPE task_status AS ENUM ('Mới', 'Đang làm', 'Hoàn thành', 'Quá hạn');
CREATE TYPE payment_status AS ENUM ('Chưa thanh toán', 'Đã thanh toán', 'Hoàn tiền');

-- 2. TABLES

-- Bảng Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'sales',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Team Members
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, profile_id)
);

-- Bảng Leads (Khách hàng)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone_1 TEXT,
    phone_2 TEXT,
    email TEXT,
    address TEXT,
    segment lead_segment,
    product_interest TEXT[], -- Array chứa: Yến thô, Yến chưng, Yến tinh chế
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL, -- Lưu team_id để tối ưu Query RLS
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Tags
CREATE TABLE public.lead_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Lists (Segment/Filter)
CREATE TABLE public.lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    criteria JSONB, -- Lưu bộ lọc dưới dạng JSON (vd: segment="VIP")
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Pipeline Stages
CREATE TABLE public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Cơ hội bán hàng
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
    expected_value NUMERIC DEFAULT 0,
    expected_close_date DATE,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Công việc (Tasks)
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    priority task_priority DEFAULT 'Trung bình',
    status task_status DEFAULT 'Mới',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Thanh toán (Payments)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status payment_status DEFAULT 'Chưa thanh toán',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Mua định kỳ (Subscriptions)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    plan_name TEXT, 
    amount NUMERIC,
    cycle TEXT, -- monthly, weekly
    start_date DATE,
    end_date DATE,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Activity Logs (Lịch sử)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- lead, opportunity, task
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Quan hệ giữa các bảng

1. **Một - Nhiều (1-N)**: 
   - `profiles` 1-N `leads` (Một sales giữ nhiều khách hàng)
   - `leads` 1-N `opportunities` (Một khách có nhiều đơn hàng/cơ hội)
   - `leads` 1-N `tasks` (Một khách có nhiều lịch hẹn/công việc)
2. **Nhiều - Nhiều (N-N)**: 
   - `profiles` và `teams` thông qua `team_members` (Một người có thể thuộc nhóm, một nhóm có nhiều người). Trưởng nhóm được đánh dấu bằng `is_leader = true`.

---

## 4. Indexes Cần Tạo (Tối ưu truy vấn)

```sql
CREATE INDEX idx_leads_assignee ON public.leads(assignee_id);
CREATE INDEX idx_leads_team ON public.leads(team_id);
CREATE INDEX idx_opportunities_assignee ON public.opportunities(assignee_id);
CREATE INDEX idx_opportunities_team ON public.opportunities(team_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_team_members_profile ON public.team_members(profile_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

---

## 5. Trigger Tự động tạo Profile

Để đồng bộ giữa `auth.users` (bảng Auth mặc định của Supabase) và `public.profiles`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Unknown User'),
    'sales', -- Mặc định là Sales, Admin sẽ đổi role sau
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

> **Mẹo tự động map Team**:
> Để RLS chạy nhanh và không cần join bảng phức tạp, ta dùng trigger tự động gán `team_id` cho `leads` và `opportunities` mỗi khi `assignee_id` thay đổi.

```sql
CREATE OR REPLACE FUNCTION public.set_team_id_from_assignee()
RETURNS trigger AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL THEN
    SELECT team_id INTO NEW.team_id FROM public.team_members WHERE profile_id = NEW.assignee_id LIMIT 1;
  ELSE
    NEW.team_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_team_id_leads
BEFORE INSERT OR UPDATE OF assignee_id ON public.leads
FOR EACH ROW EXECUTE PROCEDURE public.set_team_id_from_assignee();

CREATE TRIGGER trg_set_team_id_opportunities
BEFORE INSERT OR UPDATE OF assignee_id ON public.opportunities
FOR EACH ROW EXECUTE PROCEDURE public.set_team_id_from_assignee();
```

---

## 6. Cách lưu Role và Quản lý Phân quyền

- Role được lưu ở cột `role` trong bảng `public.profiles` (`admin`, `team_lead`, `sales`).
- Để tối ưu performance trong Row Level Security (RLS) mà không bị "infinite loop" khi gọi lại bảng profiles, tạo một function Helper:

```sql
CREATE OR REPLACE FUNCTION auth.get_user_role() RETURNS text AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 7. Row Level Security (RLS) Policies

Bật RLS cho tất cả dữ liệu nghiệp vụ:

```sql
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
```

**Chính sách cho bảng `leads` (Tương tự cho Opportunities, Tasks, và Payments):**

```sql
-- 1. ADMIN: Xem và chỉnh sửa toàn bộ
CREATE POLICY "Admin full access leads" ON public.leads
FOR ALL TO authenticated
USING (auth.get_user_role() = 'admin');

-- 2. TEAM LEAD: Xem và sửa dữ liệu của nhóm mình
CREATE POLICY "Team lead access team leads" ON public.leads
FOR ALL TO authenticated
USING (
  auth.get_user_role() = 'team_lead' AND 
  team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid() AND is_leader = true)
);

-- 3. SALES: Chỉ xem và sửa dữ liệu do mình phụ trách
CREATE POLICY "Sales access own leads" ON public.leads
FOR ALL TO authenticated
USING (
  auth.get_user_role() = 'sales' AND 
  assignee_id = auth.uid()
);
```

---

## 8. Flow Xác thực & Xử lý trùng tài khoản (Identity Linking)

### 8.1 Mô tả Flow
1. **Đăng ký (Email/Password)**: User điền Email, Tên, Mật khẩu. Khi form submit, ứng dụng gọi Supabase API. Sau khi tạo xong, Trigger `handle_new_user` tự sinh Profile vào `public.profiles`.
2. **Xác nhận Email**: Supabase gửi email xác nhận. Người dùng click vào link để verify account (nếu cấu hình yêu cầu).
3. **Đăng nhập (Google OAuth)**: User bấm "Login with Google". Supabase xử lý OAuth flow và trả về session. 
4. **Quên mật khẩu**: User nhập email -> Supabase gửi link Reset -> Đặt lại mật khẩu.

### 8.2 Logic Identity Linking (Chống trùng tài khoản)
- **Vấn đề**: User dùng `abc@gmail.com` tạo tài khoản Email/Password, hôm sau bấm "Login via Google" cũng dùng chính email đó.
- **Giải pháp**:
  - Dùng tính năng **Automatic Identity Linking** tích hợp sẵn của Supabase.
  - Cấu hình trong Dashboard (Authentication > Providers > Email & Google). Bật **"Link identities unconditionally"** (hoặc yêu cầu xác thực).
  - Khi User đăng nhập bằng Google OAuth và trùng email, Supabase sẽ map provider `google` vào chung `auth.users.id` hiện tại. Bảng `profiles` vẫn chỉ có 1 row duy nhất. 
  - Do cơ chế Role và RLS phân quyền theo ID của `auth.users` nên dù user đăng nhập bằng cách nào cũng có quyền truy cập như nhau, không lo bị tách luồng.

---

## 9. Seed Data Mẫu (Dựa theo Design Brief)

```sql
-- Thêm Pipeline Stages
INSERT INTO public.pipeline_stages (name, order_index) VALUES 
('Mới', 1), ('Đang tư vấn', 2), ('Gửi báo giá', 3), ('Đàm phán', 4), ('Chốt đơn', 5), ('Thất bại', 6);

-- Mock Data Khách hàng
INSERT INTO public.leads (name, phone_1, email, segment, product_interest, expected_value) VALUES
('Nguyễn Thùy Linh (Hương Việt)', '0901111111', 'linh@huongviet.com', 'Đại lý', '{"Yến tinh chế", "Yến chưng"}', 280000000),
('Trần Minh Quân (An Phát)', '0902222222', 'quan@anphat.vn', 'Đại lý', '{"Yến thô", "Yến tinh chế"}', 450000000),
('Lê Bảo Anh', '0903333333', 'baoanh@gmail.com', 'VIP', '{"Yến chưng", "Yến tinh chế"}', 65000000),
('Phạm Ngọc Hưng (Sài Gòn Event)', '0904444444', 'hung@saigonevent.com', 'Đại lý', '{"Yến chưng", "Yến tinh chế"}', 320000000),
('Vũ Thu Trang (An Nhiên)', '0905555555', 'trang@annhien.vn', 'Đại lý', '{"Yến thô", "Yến chưng"}', 210000000),
('Đặng Quốc Khánh', '0906666666', 'khanhdq@gmail.com', 'Khách lẻ', '{"Yến chưng", "Yến tinh chế"}', 35000000);

-- Note: Seed data sẽ gán thêm assignee_id và team_id bằng application code sau khi đã có user cụ thể.
```
