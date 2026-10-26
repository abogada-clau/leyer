-- Presentation belongs to each revision's JSON, while binary media stays in revision_assets.
-- Extend validation without changing immutable published snapshots or tenant permissions.
create function private.validate_block_presentation() returns trigger
language plpgsql set search_path = '' as $$
declare k text; item jsonb; icons text[] := array['none','heart-handshake','message-circle','book-open-check','wallet-cards','users','coins','house','file-text','scale','file-check','arrow-up-right','arrow-right','check'];
begin
 foreach k in array array['lead','note','aria_label','eyebrow','attribution'] loop
  if new.data ? k and jsonb_typeof(new.data->k) <> 'string' then raise check_violation using message='Presentation text must be a string'; end if;
 end loop;
 if new.data ? 'hidden' and jsonb_typeof(new.data->'hidden') <> 'boolean' then raise check_violation using message='Hidden must be boolean'; end if;
 if new.data ? 'visual' and (jsonb_typeof(new.data->'visual')<>'string' or new.data->>'visual' not in ('none','image','brand','requirements')) then raise check_violation using message='Invalid visual'; end if;
 if new.data ? 'tone' and (jsonb_typeof(new.data->'tone')<>'string' or new.data->>'tone' not in ('default','ivory','sage','sand','primary','terracotta')) then raise check_violation using message='Invalid tone'; end if;
 if new.data ? 'layout' and (jsonb_typeof(new.data->'layout')<>'string' or new.data->>'layout' not in ('reading','intro','columns')) then raise check_violation using message='Invalid layout'; end if;
 if new.data ? 'columns' and (jsonb_typeof(new.data->'columns')<>'string' or new.data->>'columns' not in ('auto','1','2','3','4')) then raise check_violation using message='Invalid columns'; end if;
 if new.data ? 'note_icon' and (jsonb_typeof(new.data->'note_icon')<>'string' or not (new.data->>'note_icon'=any(icons))) then raise check_violation using message='Invalid note icon'; end if;
 if jsonb_typeof(new.data->'items')='array' then
  for item in select value from jsonb_array_elements(new.data->'items') loop
   if item ? 'icon' and (jsonb_typeof(item->'icon')<>'string' or not (item->>'icon'=any(icons))) then raise check_violation using message='Invalid item icon'; end if;
   foreach k in array array['asset_slot','link_label'] loop
    if item ? k and jsonb_typeof(item->k)<>'string' then raise check_violation using message='Invalid item presentation text'; end if;
   end loop;
  end loop;
 end if;
 if jsonb_typeof(new.data->'actions')='array' then
  for item in select value from jsonb_array_elements(new.data->'actions') loop
   if item ? 'icon' and (jsonb_typeof(item->'icon')<>'string' or not (item->>'icon'=any(icons))) then raise check_violation using message='Invalid action icon'; end if;
   if item ? 'style' and (jsonb_typeof(item->'style')<>'string' or item->>'style' not in ('primary','secondary','text')) then raise check_violation using message='Invalid action style'; end if;
  end loop;
 end if;
 return new;
end;
$$;
create trigger validate_block_presentation before insert or update on public.content_blocks for each row execute function private.validate_block_presentation();
revoke all on function private.validate_block_presentation() from public;
