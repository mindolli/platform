-- ============================================
-- Greenhouse Platform - Database Schema
-- ============================================
-- Supabase Dashboard → SQL Editor 에서 실행하세요.

-- 1. 과제 테이블
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  author_name text,
  links text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. 파일 첨부 테이블
create table if not exists public.assignment_files (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz default now() not null
);

-- 3. RLS (Row Level Security) 활성화
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;

-- 4. 과제 정책
-- 모든 사용자: 과제 읽기 가능 (비로그인 포함)
create policy "Anyone can view assignments"
  on public.assignments for select
  to public
  using (true);

-- 본인만: 과제 생성
create policy "Users can create own assignments"
  on public.assignments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인만: 과제 수정
create policy "Users can update own assignments"
  on public.assignments for update
  to authenticated
  using (auth.uid() = user_id);

-- 본인만: 과제 삭제
create policy "Users can delete own assignments"
  on public.assignments for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. 파일 정책
-- 모든 사용자: 파일 메타데이터 읽기 가능 (비로그인 포함)
create policy "Anyone can view files"
  on public.assignment_files for select
  to public
  using (true);

-- 본인 과제의 파일만 추가 가능
create policy "Users can add files to own assignments"
  on public.assignment_files for insert
  to authenticated
  with check (
    exists (
      select 1 from public.assignments
      where id = assignment_id and user_id = auth.uid()
    )
  );

-- 본인 과제의 파일만 삭제 가능
create policy "Users can delete files from own assignments"
  on public.assignment_files for delete
  to authenticated
  using (
    exists (
      select 1 from public.assignments
      where id = assignment_id and user_id = auth.uid()
    )
  );

-- 6. updated_at 자동 업데이트 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_assignment_updated
  before update on public.assignments
  for each row execute procedure public.handle_updated_at();

-- 7. Storage 버킷 생성 (파일 업로드용)
insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict (id) do nothing;

-- Storage 정책: 인증된 사용자 업로드 가능
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'assignments');

-- Storage 정책: 모든 사용자 파일 읽기 가능 (비로그인 포함)
create policy "Anyone can view uploaded files"
  on storage.objects for select
  to public
  using (bucket_id = 'assignments');

-- Storage 정책: 본인 파일 삭제 가능
create policy "Users can delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text);
