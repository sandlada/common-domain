create table if not exists `gender` (
    `value`        varchar(32)  primary key,
    `display_name` varchar(64)  not null,
);

-- reference values (matches Gender._All)
--   ('male',    'Male')
--   ('female',  'Female')
--   ('other',   'Other')
--   ('unknown', 'Unknown')
