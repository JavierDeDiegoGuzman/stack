CREATE TABLE IF NOT EXISTS "todos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "todos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" varchar(255) NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL
);
