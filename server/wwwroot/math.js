import katex from './vendor/katex/katex.mjs';
const options={throwOnError:true,strict:'error',trust:false,output:'htmlAndMathml'};
export function displayMath(tex){
 return `<div class="theory-equation">${katex.renderToString(tex,{...options,displayMode:true})}</div>`;
}
export function inlineMath(tex){return katex.renderToString(tex,options);}
// Explicit notation replacements only; ordinary prose is never parsed as TeX.
const notation={
 'σzz=τxz=τyz=0':String.raw`\sigma_{zz}=\tau_{xz}=\tau_{yz}=0`,
 'εzz=γxz=γyz=0':String.raw`\varepsilon_{zz}=\gamma_{xz}=\gamma_{yz}=0`,
 'εxy=a/2':String.raw`\varepsilon_{xy}=a/2`,'γxy=a':String.raw`\gamma_{xy}=a`,
 'τxy=Ga':String.raw`\tau_{xy}=Ga`,'σV=DpsεV':String.raw`\sigma_V=D_{\mathrm{ps}}\varepsilon_V`,
 'σxx':String.raw`\sigma_{xx}`,'σyy':String.raw`\sigma_{yy}`,'σxy':String.raw`\sigma_{xy}`,
 'εxx':String.raw`\varepsilon_{xx}`,'εyy':String.raw`\varepsilon_{yy}`,'εxy':String.raw`\varepsilon_{xy}`,
 'κout':String.raw`\kappa_{\mathrm{out}}`,'Dps':String.raw`D_{\mathrm{ps}}`,'εV':String.raw`\varepsilon_V`,'σV':String.raw`\sigma_V`,
 'ρmin':String.raw`\rho_{\min}`,'Γfree':String.raw`\Gamma_{\mathrm{free}}`,
 '∫Ω ε(v):𝔻:ε(u) dΩ = ∫Ω v·b dΩ + ∫Γɴ v·t dΓ':String.raw`\int_\Omega\varepsilon(v):\mathbb D:\varepsilon(u)\,\mathrm d\Omega=\int_\Omega v\cdot b\,\mathrm d\Omega+\int_{\Gamma_N}v\cdot t\,\mathrm d\Gamma`
};
const pattern=new RegExp(Object.keys(notation).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
export function inlineProse(html){return html.split(/(<[^>]*>)/g).map(s=>s.startsWith('<')?s:s.replace(pattern,token=>inlineMath(notation[token]))).join('');}
