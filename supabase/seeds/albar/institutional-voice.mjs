/** Build-time editorial corrections. Visitor questions and CTA labels keep their voice. */
export const institutionalReplacements = [
  ['te asesoro', 'te asesoramos'], ['Te asesoro', 'Te asesoramos'],
  ['te acompaño', 'te acompañamos'], ['Te acompaño', 'Te acompañamos'],
  ['te ayudo', 'te ayudamos'], ['Te ayudo', 'Te ayudamos'],
  ['te ayudaré', 'te ayudaremos'], ['Te ayudaré', 'Te ayudaremos'],
  ['te represento', 'te representamos'], ['Te represento', 'Te representamos'],
  ['y represento ', 'y representamos '],
  ['puedo ayudarte', 'podemos ayudarte'], ['Puedo ayudarte', 'Podemos ayudarte'],
  ['puedo ayudar a tu empresa', 'podemos ayudar a tu empresa'],
  ['puedo representar a tu empresa', 'podemos representar a tu empresa'],
  ['Mi trabajo', 'Nuestro trabajo'], ['mi trabajo es', 'nuestro trabajo es'],
  ['Mi objetivo', 'Nuestro objetivo'], ['mi objetivo es', 'nuestro objetivo es'],
  ['Reviso y actualizo', 'Revisamos y actualizamos'],
  ['Realizo capacitaciones', 'Realizamos capacitaciones'],
  ['Realizo diagnósticos', 'Realizamos diagnósticos'],
  ['Realizo una revisión', 'Realizamos una revisión'],
  ['desarrollo estrategias', 'desarrollamos estrategias'],
  ['Analizo los antecedentes', 'Analizamos los antecedentes'],
  ['Analizo la carta', 'Analizamos la carta'],
  ['Analizo tus antecedentes', 'Analizamos tus antecedentes'],
  ['analizo el procedimiento', 'analizamos el procedimiento'],
  ['preparo e interpongo', 'preparamos e interponemos'],
  ['Analizaré tu situación', 'Analizaremos tu situación'],
  ['ejerceré las acciones', 'ejerceremos las acciones'],
];
export function institutionalVoice(value) {
  if (typeof value === 'string') return institutionalReplacements.reduce((text, [before, after]) => text.replaceAll(before, after), value);
  if (Array.isArray(value)) return value.map(institutionalVoice);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, institutionalVoice(item)]));
  return value;
}
