-- KhataFlow Initial Database Schema & RLS Policies Migration

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Shops Table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(15),
    gst_number VARCHAR(15),
    currency CHAR(3) DEFAULT 'INR',
    plan VARCHAR(20) DEFAULT 'FREE',
    settings JSONB NOT NULL DEFAULT '{"language": "en", "dark_mode": true, "pin_enabled": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    room_id VARCHAR(20),
    photo_url TEXT,
    credit_limit DECIMAL(10,2) DEFAULT 0.00,
    advance_balance DECIMAL(10,2) DEFAULT 0.00,
    outstanding_due DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    family_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT', 'PAYMENT', 'ADVANCE', 'WRITEOFF', 'ADJUSTMENT', 'NOTE')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    items JSONB,
    note TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_disputed BOOLEAN DEFAULT FALSE,
    dispute_note TEXT
);

-- 5. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
    invited_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(shop_id, user_id)
);

-- 6. Reminder Log Table
CREATE TABLE IF NOT EXISTS public.reminder_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    amount_due DECIMAL(10,2),
    message TEXT,
    sent_at TIMESTAMPTZ DEFAULT now(),
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 7. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_customers_shop_name ON public.customers(shop_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_shop_phone ON public.customers(shop_id, phone);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_date ON public.transactions(customer_id, transaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_shop_date ON public.transactions(shop_id, transaction_at DESC);

-- 8. Auto-Updated Trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shops_timestamp BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
-- Shops Policy
CREATE POLICY "Users can access their owned or assigned shops"
ON public.shops FOR ALL
USING (
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.staff WHERE staff.shop_id = shops.id AND staff.user_id = auth.uid())
);

-- Customers Policy
CREATE POLICY "Users can access customers of their shops"
ON public.customers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.shops s
        WHERE s.id = customers.shop_id AND (
            s.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.staff st WHERE st.shop_id = s.id AND st.user_id = auth.uid())
        )
    )
);

-- Transactions Policy
CREATE POLICY "Users can access transactions of their shops"
ON public.transactions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.shops s
        WHERE s.id = transactions.shop_id AND (
            s.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.staff st WHERE st.shop_id = s.id AND st.user_id = auth.uid())
        )
    )
);

-- Staff Policy
CREATE POLICY "Users can view staff of their shops"
ON public.staff FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.shops s
        WHERE s.id = staff.shop_id AND s.owner_id = auth.uid()
    )
);

-- Reminder Log Policy
CREATE POLICY "Users can access reminder logs of their shops"
ON public.reminder_log FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.shops s
        WHERE s.id = reminder_log.shop_id AND (
            s.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.staff st WHERE st.shop_id = s.id AND st.user_id = auth.uid())
        )
    )
);
