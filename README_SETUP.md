# Guía de Instalación y Despliegue 24/7

Para tener tu aplicación funcionando 24/7 y con login, sigue estos pasos:

## 1. Configurar Base de Datos (Supabase)

1.  Entra a [Supabase.com](https://supabase.com/) y crea una cuenta gratuita.
2.  Crea un "New Project".
3.  Ve a **Project Settings > API** y copia:
    *   Project URL
    *   anon public key
4.  Crea un archivo `.env` en este proyecto (copia el `.env.example`) y pega tus claves.

### Crear Tablas (SQL)

Ve al "SQL Editor" en Supabase y ejecuta este código para crear las tablas necesarias:

```sql
-- Tabla de Perfiles (Usuarios y Roles)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user'
);

-- Tabla de Timings (Datos de la app)
create table timings (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  photo_url text,
  last_timing timestamptz,
  created_at timestamptz default now()
);

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Habilitar Realtime
alter publication supabase_realtime add table timings;
```

### Políticas de Seguridad (RLS)

Ejecuta esto para definir quién puede hacer qué:

```sql
-- Habilitar RLS
alter table profiles enable row level security;
alter table timings enable row level security;

-- Políticas de Perfiles
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Políticas de Timings
-- Todos pueden ver
create policy "Timings are viewable by everyone." on timings for select using ( true );
-- Solo Admins pueden insertar/editar (basado en perfil)
create policy "Admins can insert timings" on timings for insert 
with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );
create policy "Admins can update timings" on timings for update 
with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );
```

## 2. Desplegar en Vercel (Hosting Gratuito)

1.  Sube este código a GitHub.
2.  Entra a [Vercel.com](https://vercel.com/) y conecta tu cuenta de GitHub.
3.  Importa el repositorio.
4.  En la configuración de "Environment Variables" en Vercel, agrega las mismas variables de tu `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
5.  Dale a "Deploy". ¡Tu app estará online 24/7!

## 3. Primer Usuario Admin

Por defecto, los usuarios son 'user'. Para hacerte admin:
1.  Regístrate en tu app.
2.  Ve a la tabla `profiles` en Supabase.
3.  Cambia la columna `role` de tu usuario a `admin`.
4.  Recarga la app y verás el panel de administración.
