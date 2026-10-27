CREATE TYPE "public"."tipo_evento" AS ENUM('producto_visto', 'categoria_vista', 'busqueda', 'carrito', 'favorito', 'pedido_enviado');--> statement-breakpoint
CREATE TABLE "evento" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "evento_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tipo" "tipo_evento" NOT NULL,
	"visitante" uuid NOT NULL,
	"producto_id" text,
	"categoria" text,
	"subcategoria" text,
	"termino" text,
	"resultados" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumen_busqueda_mes" (
	"mes" date NOT NULL,
	"termino" text NOT NULL,
	"cantidad" integer NOT NULL,
	"sin_resultados" integer NOT NULL,
	CONSTRAINT "resumen_busqueda_mes_mes_termino_pk" PRIMARY KEY("mes","termino")
);
--> statement-breakpoint
CREATE TABLE "resumen_evento_mes" (
	"mes" date NOT NULL,
	"tipo" "tipo_evento" NOT NULL,
	"producto_id" text DEFAULT '' NOT NULL,
	"categoria" text DEFAULT '' NOT NULL,
	"subcategoria" text DEFAULT '' NOT NULL,
	"cantidad" integer NOT NULL,
	CONSTRAINT "resumen_evento_mes_mes_tipo_producto_id_categoria_subcategoria_pk" PRIMARY KEY("mes","tipo","producto_id","categoria","subcategoria")
);
--> statement-breakpoint
CREATE TABLE "visitante_cuenta" (
	"visitante" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visitante_cuenta" ADD CONSTRAINT "visitante_cuenta_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evento_visitante_fecha_idx" ON "evento" USING btree ("visitante","created_at");--> statement-breakpoint
CREATE INDEX "evento_fecha_brin_idx" ON "evento" USING brin ("created_at");--> statement-breakpoint
CREATE INDEX "visitante_cuenta_user_id_idx" ON "visitante_cuenta" USING btree ("user_id");