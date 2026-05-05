ALTER TABLE public.question_stats
ADD CONSTRAINT question_stats_device_question_unique UNIQUE (device_id, question_id);