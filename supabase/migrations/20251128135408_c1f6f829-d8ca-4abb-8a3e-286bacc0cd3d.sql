-- Fix foreign key relationships to use profiles instead of auth.users
-- First, we need to update the complaints table to reference profiles
ALTER TABLE public.complaints DROP CONSTRAINT complaints_student_id_fkey;
ALTER TABLE public.complaints 
  ADD CONSTRAINT complaints_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update messages table to reference profiles
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;