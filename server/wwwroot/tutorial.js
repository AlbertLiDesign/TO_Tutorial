import {locale} from './i18n.js?v=12';
import {lessons} from './textbook.js?v=12';

let chapter=0;
function renderLesson(){
  const lang=locale()==='en-US'?'en':'zh';
  document.querySelector('#lesson-nav').innerHTML=lessons.map((lesson,i)=>`<button type="button" data-lesson="${i}" class="${chapter===i?'selected':''}" aria-pressed="${chapter===i}"><span>${String(i+1).padStart(2,'0')}</span>${lesson[lang][0]}</button>`).join('');
  const lesson=lessons[chapter][lang];
  document.querySelector('#lesson-content').innerHTML=`<h1>${lesson[1]}</h1>${lesson[2]}<a class="try-app" href="#app">${lang==='en'?'Open App →':'打开 App →'}</a>`;
  document.querySelector('#lesson-content').scrollTop=0;
  document.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>{chapter=Number(button.dataset.lesson);renderLesson();});
  document.querySelector('#lesson-page').textContent=`${chapter+1} / ${lessons.length}`;
  document.querySelector('#lesson-prev').disabled=chapter===0;document.querySelector('#lesson-next').disabled=chapter===lessons.length-1;
  document.querySelector('#lesson-prev').setAttribute('aria-label',lang==='en'?'Previous chapter':'上一节');
  document.querySelector('#lesson-next').setAttribute('aria-label',lang==='en'?'Next chapter':'下一节');
}
function navigate(){
  const section=location.hash.startsWith('#tutorial')?'tutorial':'app';
  document.body.dataset.section=section;document.querySelector('#tutorial').hidden=section!=='tutorial';
  document.querySelectorAll('.site-nav a').forEach(a=>{const selected=a.dataset.section===section;a.classList.toggle('selected',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
document.querySelector('#lesson-prev').onclick=()=>{chapter=Math.max(0,chapter-1);renderLesson();};
document.querySelector('#lesson-next').onclick=()=>{chapter=Math.min(lessons.length-1,chapter+1);renderLesson();};
document.addEventListener('languagechange',renderLesson);window.addEventListener('hashchange',navigate);
renderLesson();navigate();
