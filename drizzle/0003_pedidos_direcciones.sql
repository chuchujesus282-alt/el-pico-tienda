CREATE TABLE "direccion" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"latitud" double precision NOT NULL,
	"longitud" double precision NOT NULL,
	"posicion" integer NOT NULL,
	"elegida" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "direccion_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "pedido" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tasa" numeric(14, 4),
	"total_usd" numeric(14, 2) NOT NULL,
	"total_bs" numeric(18, 2),
	"retiro" text NOT NULL,
	"pago" text NOT NULL,
	"pagos_combinados" text[] DEFAULT '{}'::text[] NOT NULL,
	"direccion" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedido_item" (
	"pedido_id" uuid NOT NULL,
	"posicion" integer NOT NULL,
	"producto_id" text NOT NULL,
	"nombre" text NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_usd" numeric(14, 2) NOT NULL,
	"precio_bs" numeric(18, 2),
	"precio_verificado" boolean NOT NULL,
	CONSTRAINT "pedido_item_pedido_id_posicion_pk" PRIMARY KEY("pedido_id","posicion")
);
--> statement-breakpoint
ALTER TABLE "evento" ADD COLUMN "pedido_codigo" uuid;--> statement-breakpoint
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_item" ADD CONSTRAINT "pedido_item_pedido_id_pedido_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedido"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pedido_user_id_fecha_idx" ON "pedido" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "pedido_item_producto_id_idx" ON "pedido_item" USING btree ("producto_id");