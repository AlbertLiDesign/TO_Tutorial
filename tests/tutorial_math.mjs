import assert from 'node:assert/strict';
import {lessons} from '../server/wwwroot/textbook.js';
assert.equal(lessons.length,12);
let count=0;
for(const [index,chapter] of lessons.entries()){
 const equations={};
 for(const lang of ['en','zh']){
  const html=chapter[lang][2];
  assert(!html.includes('katex-error'));
  assert(html.includes('lesson-guide'));
  const blocks=[...html.matchAll(/<div class="theory-equation">([\s\S]*?)<\/div>/g)];
  equations[lang]=blocks.map(([_,body])=>{
   assert(body.includes('class="katex-display"'));
   const tex=body.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/)?.[1];
   assert(tex,`Missing mathematical source in chapter ${index+1}`);
   count++;return tex;
  });
 }
 assert.deepEqual(equations.en,equations.zh,`Bilingual equations differ in chapter ${index+1}`);
}
assert.equal(count,106);
console.log(`Passed: ${count} display equations across 24 localized chapters; bilingual sources match.`);
