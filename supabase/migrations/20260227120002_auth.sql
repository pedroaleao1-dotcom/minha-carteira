-- 4. CRIAÇÃO DE USUÁRIOS AUTH E VÍNCULOS
-- (Cuidado: Se executado multiplas vezes, irá gerar erro de duplicação em auth.users se os emails existirem. Para reset, remova-os do painel do Supabase)

DO $$ 
DECLARE
    uid_mestre UUID;
    uid_arthur UUID;
    uid_alice UUID;
    uid_bob UUID;
BEGIN
    uid_mestre := COALESCE((SELECT id FROM auth.users WHERE email = 'mestre@dreamquest.com'), gen_random_uuid());
    uid_arthur := COALESCE((SELECT id FROM auth.users WHERE email = 'arthur@dreamquest.com'), gen_random_uuid());
    uid_alice := COALESCE((SELECT id FROM auth.users WHERE email = 'alice@dreamquest.com'), gen_random_uuid());
    uid_bob := COALESCE((SELECT id FROM auth.users WHERE email = 'bob@dreamquest.com'), gen_random_uuid());

    -- Mestre Mentor
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid_mestre) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
        VALUES (uid_mestre, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mestre@dreamquest.com', crypt('Mestre123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
        
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), uid_mestre, format('{"sub":"%s","email":"%s"}', uid_mestre::text, 'mestre@dreamquest.com')::jsonb, 'email', uid_mestre::text, now(), now(), now());
    END IF;
    INSERT INTO user_members (user_id, member_id) VALUES 
    (uid_mestre, 'parent_1'), (uid_mestre, 'hero_1'), (uid_mestre, 'hero_2'), (uid_mestre, 'hero_3');

    -- Arthur
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid_arthur) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
        VALUES (uid_arthur, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arthur@dreamquest.com', crypt('Arthur123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
        
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), uid_arthur, format('{"sub":"%s","email":"%s"}', uid_arthur::text, 'arthur@dreamquest.com')::jsonb, 'email', uid_arthur::text, now(), now(), now());
    END IF;
    INSERT INTO user_members (user_id, member_id) VALUES (uid_arthur, 'hero_1');

    -- Alice
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid_alice) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
        VALUES (uid_alice, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@dreamquest.com', crypt('Alice123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
        
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), uid_alice, format('{"sub":"%s","email":"%s"}', uid_alice::text, 'alice@dreamquest.com')::jsonb, 'email', uid_alice::text, now(), now(), now());
    END IF;
    INSERT INTO user_members (user_id, member_id) VALUES (uid_alice, 'hero_2');

    -- Pequeno Bob
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid_bob) THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
        VALUES (uid_bob, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@dreamquest.com', crypt('Bob123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
        
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), uid_bob, format('{"sub":"%s","email":"%s"}', uid_bob::text, 'bob@dreamquest.com')::jsonb, 'email', uid_bob::text, now(), now(), now());
    END IF;
    INSERT INTO user_members (user_id, member_id) VALUES (uid_bob, 'hero_3');
END $$;
