import IconoTienda from "./IconoTienda";
import IconoMoto from "./IconoMoto";
import IconoCamion from "./IconoCamion";
import IconoBilletes from "./IconoBilletes";
import IconoPagoMovil from "./IconoPagoMovil";
import IconoBanco from "./IconoBanco";
import IconoCuotas from "./IconoCuotas";
import IconoCombinado from "./IconoCombinado";
import IconoBloques from "./IconoBloques";
import IconoMezcladora from "./IconoMezcladora";
import IconoLlana from "./IconoLlana";
import IconoMalla from "./IconoMalla";
import IconoRodillo from "./IconoRodillo";
import IconoBaldosas from "./IconoBaldosas";
import IconoRegla from "./IconoRegla";
import IconoLamina from "./IconoLamina";
import IconoManto from "./IconoManto";
import IconoDrywall from "./IconoDrywall";
import IconoCinta from "./IconoCinta";
import IconoLista from "./IconoLista";
import IconoCarritoEnvio from "./IconoCarritoEnvio";
import IconoCalculadora from "./IconoCalculadora";
import IconoCorazon from "./IconoCorazon";
import IconoUsuario from "./IconoUsuario";
import IconoCarrito from "./IconoCarrito";
import IconoUbicacion from "./IconoUbicacion";
import IconoLupa from "./IconoLupa";
import IconoMensaje from "./IconoMensaje";
import IconoSello from "./IconoSello";
import IconoReloj from "./IconoReloj";
import IconoEscudo from "./IconoEscudo";
import IconoTelefono from "./IconoTelefono";
import IconoCorreo from "./IconoCorreo";
import IconoRuta from "./IconoRuta";
import IconoRayo from "./IconoRayo";
import IconoTaladro from "./IconoTaladro";
import IconoTornillo from "./IconoTornillo";
import IconoCandado from "./IconoCandado";
import IconoBombillo from "./IconoBombillo";
import IconoTuberia from "./IconoTuberia";
import IconoPala from "./IconoPala";
import IconoCasco from "./IconoCasco";
import IconoLlanta from "./IconoLlanta";
import IconoZelle from "./IconoZelle";
import IconoUsdt from "./IconoUsdt";
import type { ComponenteIcono } from "@/types/icono";

export type FichaIcono = { nombre: string; grupo: string; descripcion: string; Componente: ComponenteIcono };

/** Todos los íconos propios, en el orden en que se muestran en /dev/iconos. */
export const ICONOS_PICO: FichaIcono[] = [
  { nombre: "Tienda", grupo: "Entrega", descripcion: "Pick-up: fachada de la ferretería con toldo a rayas (rayas en rojo) que se mece.", Componente: IconoTienda },
  { nombre: "Moto", grupo: "Entrega", descripcion: "Delivery: moto de reparto de perfil con la caja trasera en rojo; avanza y deja líneas de velocidad.", Componente: IconoMoto },
  { nombre: "Camion", grupo: "Entrega", descripcion: "Flete: camión de estacas cargado con sacos de cemento y cabillas; la carga rebota.", Componente: IconoCamion },
  { nombre: "Billetes", grupo: "Pago", descripcion: "Divisas: dos billetes de dólar en abanico; el de atrás se abre.", Componente: IconoBilletes },
  { nombre: "PagoMovil", grupo: "Pago", descripcion: "Pago móvil: teléfono con la moneda del pago en rojo y ondas que salen.", Componente: IconoPagoMovil },
  { nombre: "Banco", grupo: "Pago", descripcion: "Transferencia bancaria: fachada de banco con flechas de ida (roja) y vuelta.", Componente: IconoBanco },
  { nombre: "Cuotas", grupo: "Pago", descripcion: "Cashea: círculo dividido en cuatro cuotas; la primera, en rojo, ya pagada.", Componente: IconoCuotas },
  { nombre: "Combinado", grupo: "Pago", descripcion: "Pago combinado: dos caminos que se unen en un punto rojo y siguen juntos.", Componente: IconoCombinado },
  { nombre: "Bloques", grupo: "Calculadoras", descripcion: "Bloques para paredes: pared con juntas de mortero; el bloque rojo cae en su sitio.", Componente: IconoBloques },
  { nombre: "Mezcladora", grupo: "Calculadoras", descripcion: "Concreto para vaciados: trompo mezclador con su franja roja; el tambor se mece.", Componente: IconoMezcladora },
  { nombre: "Llana", grupo: "Calculadoras", descripcion: "Friso de paredes: llana con su asa y la mezcla roja que va dejando.", Componente: IconoLlana },
  { nombre: "Malla", grupo: "Calculadoras", descripcion: "Cabillas para losas: malla de cabillas que se dibuja, con los amarres en rojo.", Componente: IconoMalla },
  { nombre: "Rodillo", grupo: "Calculadoras", descripcion: "Pintura: rodillo con una gota roja; al pasar el mouse pinta una franja.", Componente: IconoRodillo },
  { nombre: "Baldosas", grupo: "Calculadoras", descripcion: "Cerámica y porcelanato: cuatro baldosas con el separador rojo en la junta.", Componente: IconoBaldosas },
  { nombre: "Regla", grupo: "Calculadoras", descripcion: "Contrapiso: regla de nivelar con su burbuja roja, deslizándose sobre el piso.", Componente: IconoRegla },
  { nombre: "Lamina", grupo: "Calculadoras", descripcion: "Techo con láminas: lámina ondulada con su tornillo rojo, que gira al fijarse.", Componente: IconoLamina },
  { nombre: "Manto", grupo: "Calculadoras", descripcion: "Impermeabilización: rollo de manto asfáltico desenrollándose y la llama roja del soplete.", Componente: IconoManto },
  { nombre: "Drywall", grupo: "Calculadoras", descripcion: "Drywall: lámina de yeso con sus tornillos rojos y el perfil metálico al lado.", Componente: IconoDrywall },
  { nombre: "Cinta", grupo: "Pasos", descripcion: "Mide tu obra: cinta métrica con la cinta roja que se estira.", Componente: IconoCinta },
  { nombre: "Lista", grupo: "Pasos", descripcion: "Ve el material: lista de materiales en su tablilla, con el check rojo que se dibuja.", Componente: IconoLista },
  { nombre: "CarritoEnvio", grupo: "Pasos", descripcion: "Pide en un clic: carrito con la flecha roja de envío.", Componente: IconoCarritoEnvio },
  { nombre: "Calculadora", grupo: "Tienda", descripcion: "Calculadoras: calculadora con la tecla de igual en rojo.", Componente: IconoCalculadora },
  { nombre: "Corazon", grupo: "Tienda", descripcion: "Favoritos: corazón con un destello rojo; late al pasar el mouse.", Componente: IconoCorazon },
  { nombre: "Usuario", grupo: "Tienda", descripcion: "Mi cuenta: cliente con casco de obra rojo, que se lo acomoda.", Componente: IconoUsuario },
  { nombre: "Carrito", grupo: "Tienda", descripcion: "Carrito: carrito con una caja roja adentro que rebota.", Componente: IconoCarrito },
  { nombre: "Ubicacion", grupo: "Tienda", descripcion: "Ubicación: pin con el centro rojo que da un saltito.", Componente: IconoUbicacion },
  { nombre: "Lupa", grupo: "Tienda", descripcion: "Buscar: lupa con el mango rojo; se inclina como quien busca.", Componente: IconoLupa },
  { nombre: "Mensaje", grupo: "Tienda", descripcion: "Escríbenos: globo de chat con tres puntos rojos, como quien escribe.", Componente: IconoMensaje },
  { nombre: "Sello", grupo: "Tienda", descripcion: "Confirmado: sello con el check rojo que se dibuja.", Componente: IconoSello },
  { nombre: "Reloj", grupo: "Tienda", descripcion: "Horario: reloj con el centro rojo; las agujas dan la vuelta.", Componente: IconoReloj },
  { nombre: "Escudo", grupo: "Tienda", descripcion: "Privacidad: escudo con el check rojo que se dibuja.", Componente: IconoEscudo },
  { nombre: "Telefono", grupo: "Tienda", descripcion: "Llámanos: auricular de teléfono con el timbre rojo sonando.", Componente: IconoTelefono },
  { nombre: "Correo", grupo: "Tienda", descripcion: "Correo: sobre con el sello rojo que late.", Componente: IconoCorreo },
  { nombre: "Ruta", grupo: "Tienda", descripcion: "Cómo llegar: ruta roja que se dibuja desde un punto hasta el pin.", Componente: IconoRuta },
  { nombre: "Rayo", grupo: "Tienda", descripcion: "Comprar ahora: rayo rojo, directo al pedido.", Componente: IconoRayo },
  { nombre: "Taladro", grupo: "Categorías", descripcion: "Herramientas: taladro con la broca roja, que vibra.", Componente: IconoTaladro },
  { nombre: "Tornillo", grupo: "Categorías", descripcion: "Tornillería: tornillo con la ranura roja en la cabeza; gira.", Componente: IconoTornillo },
  { nombre: "Candado", grupo: "Categorías", descripcion: "Cerrajería: candado con el ojo de la llave rojo; el arco salta como al abrirse.", Componente: IconoCandado },
  { nombre: "Bombillo", grupo: "Categorías", descripcion: "Electricidad: bombillo con el filamento rojo encendido y sus rayos.", Componente: IconoBombillo },
  { nombre: "Tuberia", grupo: "Categorías", descripcion: "Plomería: codo de tubería con la llave de paso roja que gira.", Componente: IconoTuberia },
  { nombre: "Pala", grupo: "Categorías", descripcion: "Hogar y jardín: pala con la hoja roja que cava.", Componente: IconoPala },
  { nombre: "Casco", grupo: "Categorías", descripcion: "Seguridad industrial: casco de obra con la cresta roja.", Componente: IconoCasco },
  { nombre: "Llanta", grupo: "Categorías", descripcion: "Vehículos: llanta con su rin y el centro rojo; da la vuelta.", Componente: IconoLlanta },
  { nombre: "Zelle", grupo: "Pago", descripcion: "Zelle: logo oficial (zelle.com/press), monocromo en reposo y morado al elegirlo.", Componente: IconoZelle },
  { nombre: "USDT", grupo: "Pago", descripcion: "USDT: espacio reservado hasta tener el logo oficial de Tether.", Componente: IconoUsdt },
];

export {
  IconoTienda,
  IconoMoto,
  IconoCamion,
  IconoBilletes,
  IconoPagoMovil,
  IconoBanco,
  IconoCuotas,
  IconoCombinado,
  IconoBloques,
  IconoMezcladora,
  IconoLlana,
  IconoMalla,
  IconoRodillo,
  IconoBaldosas,
  IconoRegla,
  IconoLamina,
  IconoManto,
  IconoDrywall,
  IconoCinta,
  IconoLista,
  IconoCarritoEnvio,
  IconoCalculadora,
  IconoCorazon,
  IconoUsuario,
  IconoCarrito,
  IconoUbicacion,
  IconoLupa,
  IconoMensaje,
  IconoSello,
  IconoReloj,
  IconoEscudo,
  IconoTelefono,
  IconoCorreo,
  IconoRuta,
  IconoRayo,
  IconoTaladro,
  IconoTornillo,
  IconoCandado,
  IconoBombillo,
  IconoTuberia,
  IconoPala,
  IconoCasco,
  IconoLlanta,
  IconoZelle,
  IconoUsdt,
};
