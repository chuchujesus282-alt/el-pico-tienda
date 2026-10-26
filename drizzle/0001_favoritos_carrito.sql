CREATE TABLE "carrito_item" (
	"user_id" text NOT NULL,
	"producto_id" text NOT NULL,
	"cantidad" integer NOT NULL,
	"posicion" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carrito_item_user_id_producto_id_pk" PRIMARY KEY("user_id","producto_id")
);
--> statement-breakpoint
CREATE TABLE "favorito" (
	"user_id" text NOT NULL,
	"producto_id" text NOT NULL,
	"posicion" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorito_user_id_producto_id_pk" PRIMARY KEY("user_id","producto_id")
);
--> statement-breakpoint
ALTER TABLE "carrito_item" ADD CONSTRAINT "carrito_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;