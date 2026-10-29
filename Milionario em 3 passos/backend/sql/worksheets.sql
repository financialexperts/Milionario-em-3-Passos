-- A tabela das folhas preenchidas pelos alunos, no Supabase do login (o
-- projeto xorqsuqjmvkyzgagdxfz, o mesmo do Fluxo de Caixa, das Escolhas da
-- Vanessa e da Karine e da Teoria das caixas). Rode este arquivo uma vez,
-- no painel do Supabase: SQL Editor -> New query -> cole tudo -> Run. Rodar
-- de novo não estraga nada.
--
-- Uma linha por aluno e por folha, como a game_scores dos jogos: a coluna
-- sheet separa as folhas (o Milionário em 3 passos usa
-- "milionario-3-passos"). Outra folha preenchível pode usar a mesma tabela,
-- com outro nome em sheet.
--
--   user_id      quem preencheu (a conta do login)
--   sheet        qual folha
--   player_name  o nome que o aluno cadastrou no login (pra achar no painel)
--   data         o que o aluno escreveu: { "id do campo": "texto" }
--   updated_at   quando a folha mudou pela última vez
--
-- Cada aluno só lê, grava e apaga as próprias folhas (RLS).

create table if not exists public.worksheets (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  sheet       text        not null,
  player_name text,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, sheet)
);

alter table public.worksheets enable row level security;

drop policy if exists "worksheets: ler as proprias" on public.worksheets;
create policy "worksheets: ler as proprias" on public.worksheets
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "worksheets: criar as proprias" on public.worksheets;
create policy "worksheets: criar as proprias" on public.worksheets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "worksheets: mudar as proprias" on public.worksheets;
create policy "worksheets: mudar as proprias" on public.worksheets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "worksheets: apagar as proprias" on public.worksheets;
create policy "worksheets: apagar as proprias" on public.worksheets
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.worksheets to authenticated;
