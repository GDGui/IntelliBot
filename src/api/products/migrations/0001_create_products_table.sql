-- Migration inicial para tabela products
-- Comentarios em PT-BR sem acentuacao

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price_cents numeric not null default 0,
  image_url text not null,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_products_title on public.products using gin (to_tsvector('simple', title));
create index if not exists idx_products_active on public.products (active);
create index if not exists idx_products_created_at on public.products (created_at desc);

-- trigger simples para updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();

