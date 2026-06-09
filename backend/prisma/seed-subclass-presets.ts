import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subclassPresets = [
{
id: "barbarian-path-of-the-totem-warrior",
classPresetId: "barbarian",
name: "Path of the Totem Warrior",
source: "Compendio usuario",
description:
"Bárbaro que canaliza espíritus animales para ganar resistencia, movilidad o soporte ofensivo.",
role: "Tanque / Soporte físico / Hostigador",
strength:
"Muy flexible. El tótem del oso destaca por mitigación masiva de daño.",
isSrd: false,
features: [
{
level: 3,
name: "Spirit Seeker",
summary:
"Obtiene utilidad ritual relacionada con animales y percepción bestial.",
},
{
level: 3,
name: "Totem Spirit",
summary:
"Elige un tótem animal. Oso mejora resistencia, águila mejora movilidad y lobo mejora ataques aliados cuerpo a cuerpo.",
},
{
level: 6,
name: "Aspect of the Beast",
summary:
"Gana beneficios de utilidad según el tótem elegido, como fuerza mejorada o exploración superior.",
},
{
level: 10,
name: "Spirit Walker",
summary:
"Obtiene conexión espiritual para exploración y guía natural.",
},
{
level: 14,
name: "Totemic Attunement",
summary:
"Mejora final del tótem. Puede reforzar rol de tanque, movilidad o control de amenaza.",
},
],
},
{
id: "barbarian-path-of-the-ancestral-guardian",
classPresetId: "barbarian",
name: "Path of the Ancestral Guardian",
source: "Compendio usuario",
description:
"Bárbaro protector que usa espíritus ancestrales para defender aliados y castigar enemigos.",
role: "Tanque protector",
strength:
"Excelente para proteger aliados y reducir daño de jefes o enemigos de alto impacto.",
isSrd: false,
features: [
{
level: 3,
name: "Ancestral Protectors",
summary:
"Marca al primer enemigo golpeado durante la furia, dificultando que dañe a tus aliados.",
},
{
level: 6,
name: "Spirit Shield",
summary:
"Usa la reacción para reducir daño recibido por un aliado cercano.",
},
{
level: 10,
name: "Consult the Spirits",
summary:
"Obtiene utilidad espiritual fuera de combate para obtener información.",
},
{
level: 14,
name: "Vengeful Ancestors",
summary:
"Cuando reduces daño con los espíritus, el atacante recibe daño de fuerza.",
},
],
},
{
id: "bard-college-of-lore",
classPresetId: "bard",
name: "College of Lore",
source: "Compendio usuario",
description:
"Bardo enfocado en control, habilidades, interrupción de enemigos y acceso temprano a conjuros externos.",
role: "Control / Soporte / Versátil",
strength:
"Gran control táctico gracias a Cutting Words y Magical Secrets temprano.",
isSrd: true,
features: [
{
level: 3,
name: "Bonus Proficiencies",
summary:
"Gana competencias adicionales en habilidades, aumentando su versatilidad.",
},
{
level: 3,
name: "Cutting Words",
summary:
"Usa inspiración como reacción para reducir ataques, pruebas o daño enemigo.",
},
{
level: 6,
name: "Additional Magical Secrets",
summary:
"Aprende conjuros de cualquier clase antes que otros bardos.",
},
{
level: 14,
name: "Peerless Skill",
summary:
"Puede usar inspiración bárdica en sus propias pruebas de característica.",
},
],
},
{
id: "bard-college-of-eloquence",
classPresetId: "bard",
name: "College of Eloquence",
source: "Compendio usuario",
description:
"Bardo centrado en control social, reducción de salvaciones enemigas y eficiencia de inspiración.",
role: "Control social / Debuff / Soporte",
strength:
"Muy consistente en interacciones sociales y excelente para preparar conjuros de control.",
isSrd: false,
features: [
{
level: 3,
name: "Silver Tongue",
summary:
"Mejora la consistencia en Persuasión y Engaño al evitar resultados bajos.",
},
{
level: 3,
name: "Unsettling Words",
summary:
"Reduce la próxima salvación de una criatura usando inspiración bárdica.",
},
{
level: 6,
name: "Unfailing Inspiration",
summary:
"Si un aliado falla usando inspiración, no pierde el dado.",
},
{
level: 6,
name: "Universal Speech",
summary:
"Permite comunicarse con criaturas que hablen algún idioma.",
},
{
level: 14,
name: "Infectious Inspiration",
summary:
"Permite extender inspiración a otro aliado cuando una inspiración tiene éxito.",
},
],
},
{
id: "cleric-twilight-domain",
classPresetId: "cleric",
name: "Twilight Domain",
source: "Compendio usuario",
description:
"Clérigo defensivo de soporte masivo, especializado en visión, iniciativa, puntos temporales y mitigación.",
role: "Soporte defensivo / Protector",
strength:
"Muy fuerte para sostener al grupo mediante puntos temporales recurrentes.",
isSrd: false,
features: [
{
level: 1,
name: "Eyes of Night",
summary:
"Obtiene visión en la oscuridad excepcional y puede compartirla con aliados.",
},
{
level: 1,
name: "Vigilant Blessing",
summary:
"Otorga ventaja en iniciativa a una criatura.",
},
{
level: 2,
name: "Twilight Sanctuary",
summary:
"Canaliza divinidad para crear un aura que otorga puntos temporales o elimina ciertas condiciones.",
},
{
level: 6,
name: "Steps of Night",
summary:
"Puede volar en luz tenue u oscuridad como acción adicional.",
},
{
level: 8,
name: "Divine Strike",
summary:
"Añade daño radiante a ataques con armas.",
},
{
level: 17,
name: "Twilight Shroud",
summary:
"Mejora el santuario otorgando cobertura defensiva a aliados dentro del aura.",
},
],
},
{
id: "cleric-tempest-domain",
classPresetId: "cleric",
name: "Tempest Domain",
source: "Compendio usuario",
description:
"Clérigo de tormenta enfocado en daño de trueno/relámpago, armadura pesada y control por empuje.",
role: "Daño elemental / Control de zona",
strength:
"Excelente daño explosivo cuando maximiza daño de relámpago o trueno.",
isSrd: true,
features: [
{
level: 1,
name: "Bonus Proficiencies",
summary:
"Gana entrenamiento marcial y defensivo apropiado para primera línea.",
},
{
level: 1,
name: "Wrath of the Storm",
summary:
"Puede dañar con relámpago o trueno a criaturas que lo golpean.",
},
{
level: 2,
name: "Destructive Wrath",
summary:
"Canaliza divinidad para maximizar daño de relámpago o trueno.",
},
{
level: 6,
name: "Thunderbolt Strike",
summary:
"Empuja criaturas cuando les inflige daño de relámpago.",
},
{
level: 8,
name: "Divine Strike",
summary:
"Añade daño de trueno a ataques con armas.",
},
{
level: 17,
name: "Stormborn",
summary:
"Obtiene vuelo en exteriores.",
},
],
},
{
id: "druid-circle-of-the-moon",
classPresetId: "druid",
name: "Circle of the Moon",
source: "Compendio usuario",
description:
"Druida centrado en Forma Salvaje de combate, resistencia física y transformaciones más poderosas.",
role: "Tanque / Combatiente natural",
strength:
"Muy fuerte a niveles bajos y medios por la enorme reserva efectiva de puntos de golpe.",
isSrd: true,
features: [
{
level: 2,
name: "Combat Wild Shape",
summary:
"Usa Forma Salvaje como acción adicional y puede curarse gastando espacios de conjuro transformado.",
},
{
level: 2,
name: "Circle Forms",
summary:
"Accede a formas más fuertes que otros druidas desde niveles bajos.",
},
{
level: 6,
name: "Primal Strike",
summary:
"Los ataques en Forma Salvaje cuentan como mágicos para superar resistencias.",
},
{
level: 10,
name: "Elemental Wild Shape",
summary:
"Puede gastar usos de Forma Salvaje para transformarse en elementales.",
},
{
level: 14,
name: "Thousand Forms",
summary:
"Obtiene transformación menor a voluntad.",
},
],
},
{
id: "druid-circle-of-stars",
classPresetId: "druid",
name: "Circle of Stars",
source: "Compendio usuario",
description:
"Druida versátil que alterna constelaciones para daño, curación o concentración.",
role: "Versátil / Curación / Daño a distancia",
strength:
"Gran flexibilidad de combate y excelente estabilidad en concentración.",
isSrd: false,
features: [
{
level: 2,
name: "Star Map",
summary:
"Obtiene un foco estelar con magia de guía y uso limitado de daño radiante.",
},
{
level: 2,
name: "Starry Form",
summary:
"Adopta constelaciones como Arquero, Cáliz o Dragón para daño, curación o concentración.",
},
{
level: 6,
name: "Cosmic Omen",
summary:
"Usa presagios para sumar o restar a tiradas como reacción.",
},
{
level: 10,
name: "Twinkling Constellations",
summary:
"Mejora las constelaciones y permite cambiar de forma estelar durante su duración.",
},
{
level: 14,
name: "Full of Stars",
summary:
"Gana resistencia defensiva mientras está en Forma Estelar.",
},
],
},
{
id: "fighter-battle-master",
classPresetId: "fighter",
name: "Battle Master",
source: "Compendio usuario",
description:
"Guerrero táctico que usa dados de superioridad para controlar el campo con maniobras.",
role: "Control marcial / Daño táctico",
strength:
"Una de las subclases marciales más versátiles por sus maniobras y control de tiradas.",
isSrd: true,
features: [
{
level: 3,
name: "Combat Superiority",
summary:
"Obtiene dados de superioridad y maniobras para modificar ataques y controlar enemigos.",
},
{
level: 7,
name: "Know Your Enemy",
summary:
"Analiza enemigos fuera de combate para comparar capacidades.",
},
{
level: 10,
name: "Improved Combat Superiority",
summary:
"Mejora el tamaño de los dados de superioridad.",
},
{
level: 15,
name: "Relentless",
summary:
"Recupera capacidad táctica cuando inicia combate sin dados de superioridad.",
},
{
level: 18,
name: "Improved Combat Superiority",
summary:
"Los dados de superioridad alcanzan su máximo potencial.",
},
],
},
{
id: "fighter-echo-knight",
classPresetId: "fighter",
name: "Echo Knight",
source: "Compendio usuario",
description:
"Guerrero que manifiesta un eco temporal para atacar, reposicionarse y controlar espacio.",
role: "Movilidad / Control espacial / Daño explosivo",
strength:
"Excelente movilidad y presión táctica gracias al eco y ataques desde posiciones alternativas.",
isSrd: false,
features: [
{
level: 3,
name: "Manifest Echo",
summary:
"Invoca un eco que permite atacar desde otra posición y reposicionarse.",
},
{
level: 3,
name: "Unleash Incarnation",
summary:
"Permite ataques adicionales desde el eco un número limitado de veces.",
},
{
level: 7,
name: "Echo Avatar",
summary:
"Usa el eco para exploración y percepción remota.",
},
{
level: 10,
name: "Shadow Martyr",
summary:
"Usa el eco para interceptar un ataque dirigido a un aliado.",
},
{
level: 15,
name: "Reclaim Potential",
summary:
"Obtiene protección cuando el eco es destruido.",
},
{
level: 18,
name: "Legion of One",
summary:
"Puede mantener más de un eco y mejora su economía de uso.",
},
],
},
{
id: "paladin-oath-of-vengeance",
classPresetId: "paladin",
name: "Oath of Vengeance",
source: "Compendio usuario",
description:
"Paladín ofensivo centrado en perseguir y eliminar objetivos prioritarios.",
role: "Boss killer / Daño explosivo",
strength:
"Muy fuerte contra enemigos únicos gracias a ventaja consistente y movilidad.",
isSrd: true,
features: [
{
level: 3,
name: "Channel Divinity",
summary:
"Obtiene opciones de juramento orientadas a perseguir y debilitar enemigos.",
},
{
level: 3,
name: "Vow of Enmity",
summary:
"Marca un objetivo prioritario para atacarlo con ventaja durante el encuentro.",
},
{
level: 7,
name: "Relentless Avenger",
summary:
"Se mueve tras ataques de oportunidad para mantener presión sobre enemigos.",
},
{
level: 15,
name: "Soul of Vengeance",
summary:
"Puede atacar como reacción al objetivo de su voto cuando este ataca.",
},
{
level: 20,
name: "Avenging Angel",
summary:
"Transformación final orientada a persecución, presencia y presión ofensiva.",
},
],
},
{
id: "paladin-oath-of-the-ancients",
classPresetId: "paladin",
name: "Oath of the Ancients",
source: "Compendio usuario",
description:
"Paladín protector vinculado a la naturaleza, fuerte contra magia y daño de conjuros.",
role: "Defensor antimagia / Tanque de aura",
strength:
"Excelente para proteger al grupo contra daño mágico y efectos de área.",
isSrd: true,
features: [
{
level: 3,
name: "Channel Divinity",
summary:
"Obtiene opciones de juramento relacionadas con la naturaleza y control.",
},
{
level: 7,
name: "Aura of Warding",
summary:
"Reduce daño de conjuros recibido por aliados cercanos.",
},
{
level: 15,
name: "Undying Sentinel",
summary:
"Puede mantenerse en pie al caer a cero puntos de golpe una vez por descanso.",
},
{
level: 20,
name: "Elder Champion",
summary:
"Transformación final con regeneración, presión mágica y presencia sobrenatural.",
},
],
},
{
id: "wizard-school-of-divination",
classPresetId: "wizard",
name: "School of Divination",
source: "Compendio usuario",
description:
"Mago que manipula el destino reemplazando tiradas críticas con resultados conocidos.",
role: "Control de dados / Control mágico",
strength:
"Portent permite convertir momentos decisivos en éxitos o fallos casi garantizados.",
isSrd: true,
features: [
{
level: 2,
name: "Portent",
summary:
"Tira d20 al final de un descanso largo y puede reemplazar tiradas futuras con esos resultados.",
},
{
level: 6,
name: "Expert Divination",
summary:
"Recupera recursos al lanzar conjuros de adivinación de nivel suficiente.",
},
{
level: 10,
name: "The Third Eye",
summary:
"Activa sentidos especiales como visión mejorada o lectura de idiomas.",
},
{
level: 14,
name: "Greater Portent",
summary:
"Aumenta la cantidad de dados de Portent disponibles.",
},
],
},
{
id: "wizard-chronurgy-magic",
classPresetId: "wizard",
name: "Chronurgy Magic",
source: "Compendio usuario",
description:
"Mago que manipula el tiempo para repetir tiradas, mejorar iniciativa y controlar criaturas.",
role: "Control temporal / Control de dados",
strength:
"Muy flexible al reaccionar a resultados importantes y alterar el flujo del combate.",
isSrd: false,
features: [
{
level: 2,
name: "Chronal Shift",
summary:
"Como reacción puede forzar repetir una tirada cercana de ataque, prueba o salvación.",
},
{
level: 2,
name: "Temporal Awareness",
summary:
"Suma Inteligencia a iniciativa para actuar antes y controlar el combate.",
},
{
level: 6,
name: "Momentary Stasis",
summary:
"Puede incapacitar temporalmente a una criatura que falle una salvación.",
},
{
level: 10,
name: "Arcane Abeyance",
summary:
"Puede almacenar un conjuro en una cuenta para que otra criatura lo libere.",
},
{
level: 14,
name: "Convergent Future",
summary:
"Manipula resultados futuros a cambio de un coste importante.",
},
],
},
];

async function main() {
for (const subclassPreset of subclassPresets) {
const { features, ...subclassData } = subclassPreset;


const existingClass = await prisma.classPreset.findUnique({
  where: {
    id: subclassPreset.classPresetId,
  },
});

if (!existingClass) {
  console.warn(
    `Saltando ${subclassPreset.name}: no existe la clase ${subclassPreset.classPresetId}.`
  );
  continue;
}

await prisma.subclassPreset.upsert({
  where: {
    id: subclassPreset.id,
  },
  update: subclassData,
  create: subclassData,
});

await prisma.subclassFeaturePreset.deleteMany({
  where: {
    subclassPresetId: subclassPreset.id,
  },
});

for (const feature of features) {
  await prisma.subclassFeaturePreset.create({
    data: {
      subclassPresetId: subclassPreset.id,
      level: feature.level,
      name: feature.name,
      summary: feature.summary,
    },
  });
}


}

console.log(`Seed completo: ${subclassPresets.length} subclases cargadas.`);
}

main()
.catch((error) => {
console.error("Error cargando presets de subclases:", error);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
