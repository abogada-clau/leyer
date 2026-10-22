import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {manifest} from '../supabase/seeds/albar/content.mjs';
const root=new URL('../',import.meta.url);
const target=new URL('supabase/seeds/albar/seed.sql',root);
const template=await readFile(new URL('supabase/seeds/albar/import.template.sql',root),'utf8');
const keys=new Set(manifest.entries.map(e=>e.key));
const paths=new Set();
const covered=new Set();
for(const entry of manifest.entries){
 if(paths.has(entry.path))throw Error('Ruta repetida: '+entry.path);paths.add(entry.path);
 if(entry.parent&&!keys.has(entry.parent))throw Error('Padre inexistente: '+entry.key);
 for(const key of entry.relations)if(!keys.has(key))throw Error('Relación inexistente: '+key);
 for(const capture of entry.captures){if(!manifest.captures[capture-1])throw Error('Captura inexistente');covered.add(capture);}
}
if(covered.size!==manifest.captures.length)throw Error('Hay capturas sin contenido asociado.');
const payload=JSON.stringify(manifest,null,2);
if(payload.includes('$ALBAR_PAYLOAD$'))throw Error('El delimitador SQL aparece en el contenido.');
const sql=template.replace('__ALBAR_PAYLOAD__',payload);
const inventory=[
 '# Catálogo editorial ALBAR','',
 '25 contenidos. Cada captura se adapta al modelo de bloques existente; las alternativas de liquidación se conservan como revisiones.','',
 '| Entrada | Ruta | Capturas | Trabajo que ayuda a resolver |','| --- | --- | --- | --- |',
 ...manifest.entries.map(e=>`| ${e.title} | \`${e.path}\` | ${e.captures.join(', ')||'Complementario'} | ${e.strategy.job} |`),
 '','## Correspondencia de capturas','',
 ...manifest.captures.map((name,i)=>`${i+1}. **${name}** → \`${manifest.entries.find(e=>e.captures.includes(i+1)).path}\`${[2,3,4].includes(i+1)?' (variante histórica de liquidación)':''}.`),
 '','## AIDA por contenido','',
 ...manifest.entries.flatMap(e=>[`### ${e.title}`,'',`- **Trabajo:** ${e.strategy.job}`,`- **Atención:** ${e.strategy.attention}`,`- **Interés:** ${e.strategy.interest}`,`- **Deseo:** ${e.strategy.desire}`,`- **Acción:** ${e.strategy.action}`,'']),
].join('\n').trimEnd()+'\n';
const inventoryTarget=new URL('supabase/seeds/albar/contenidos.md',root);
if(process.argv.includes('--check')){
 if(await readFile(target,'utf8')!==sql)throw Error('Regenera seed.sql.');
 if(await readFile(inventoryTarget,'utf8')!==inventory)throw Error('Regenera contenidos.md.');
 console.log('Seed SQL actualizado:',manifest.entries.length,'contenidos,',manifest.captures.length,'capturas.');
}else{await writeFile(target,sql);await writeFile(inventoryTarget,inventory);console.log('Generado:',fileURLToPath(target));}
