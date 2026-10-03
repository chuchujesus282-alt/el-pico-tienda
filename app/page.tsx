import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";

// Página principal — responsable: persona A. Ver la distribución en docs/guia-de-estilo.md.
export default function Inicio() {
  return (
    <Contenedor className="py-8 md:py-12">
      <TituloSeccion titulo="Página principal" nivel="h1" />
    </Contenedor>
  );
}
