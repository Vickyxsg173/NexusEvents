-- Function to allow users to securely delete their own account
create or replace function delete_user()
returns void
language sql security definer
as $$
  delete from auth.users where id = auth.uid();
$$;
