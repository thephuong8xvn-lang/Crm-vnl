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
