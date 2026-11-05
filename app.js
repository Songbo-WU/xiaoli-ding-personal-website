'use strict';
const pubs=window.PUBLICATIONS||[];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menu=document.querySelector('.menu-toggle');
if(menu){const nav=document.querySelector('#navigation');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.focus()}})}
function pubURL(p){if(p.url)return p.url;if(p.doi)return 'https://doi.org/'+p.doi;return 'https://scholar.google.com/scholar?q='+encodeURIComponent(p.title||p.citation)}
function renderPub(publication, compact = false) {
  const url = esc(pubURL(publication));
  const type = compact ? '' : `<span class="pub-type">${esc(publication.type)}</span>`;
  const authors = esc(publication.authors).replace(/X\. Ding/g, '<strong>X. Ding</strong>');
  const venue = publication.journal ? `<p class="pub-journal">${esc(publication.journal)}</p>` : '';
  const linkLabel = publication.url ? 'Scholar record' : publication.doi ? 'DOI' : 'Find on Scholar';
  const provenance = compact ? '' : `<p class="pub-provenance">${esc(publication.source)} · <a href="${url}" target="_blank" rel="noopener">${linkLabel} ↗</a></p>`;
  const title = esc(publication.title);
  return `<article class="pub-item">
    <div class="pub-year">${publication.year}${type}</div>
    <div>
      <h3><a href="${url}" target="_blank" rel="noopener">${title}</a></h3>
      <p class="pub-authors">${authors}</p>
      ${venue}
      ${provenance}
    </div>
    <a class="pub-arrow" href="${url}" target="_blank" rel="noopener" aria-label="Open publication: ${title}">↗</a>
  </article>`;
}
const recent=document.querySelector('#recent-publications');if(recent)recent.innerHTML=pubs.filter(p=>p.source.startsWith('Google Scholar')&&p.year===2026).slice(0,5).map(p=>renderPub(p,true)).join('');
const results=document.querySelector('#publication-results');
if(results){const q=document.querySelector('#pub-search'),year=document.querySelector('#pub-year'),type=document.querySelector('#pub-type'),count=document.querySelector('#result-count'),prev=document.querySelector('#prev-page'),next=document.querySelector('#next-page'),indicator=document.querySelector('#page-indicator');let page=1;const size=15;const params=new URLSearchParams(location.search);q.value=params.get('q')||'';[...new Set(pubs.map(p=>p.year))].sort((a,b)=>b-a).forEach(y=>{const opt=document.createElement('option');opt.value=y;opt.textContent=y;year.appendChild(opt)});if([...year.options].some(o=>o.value===params.get('year')))year.value=params.get('year');if([...type.options].some(o=>o.value===params.get('type')))type.value=params.get('type');
const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[‐‑–—]/g,'-');
function update(scroll=false){const terms=normalize(q.value.trim()).split(/\s+/).filter(Boolean);const rows=pubs.filter(p=>(year.value==='all'||String(p.year)===year.value)&&(type.value==='all'||p.type===type.value)&&terms.every(term=>normalize(p.citation).includes(term)));const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);const start=(page-1)*size;results.innerHTML=rows.length?rows.slice(start,start+size).map(p=>renderPub(p)).join(''):'<div class="empty"><h3>No publications found.</h3><p>Try a broader keyword, select another year, or clear the filters.</p></div>';count.textContent=rows.length?`${start+1}–${Math.min(start+size,rows.length)} of ${rows.length} publications`:'0 publications';prev.disabled=page===1;next.disabled=page>=pages;indicator.textContent=`Page ${page} of ${pages}`;const state=new URLSearchParams();if(q.value.trim())state.set('q',q.value.trim());if(year.value!=='all')state.set('year',year.value);if(type.value!=='all')state.set('type',type.value);try{history.replaceState(null,'',location.pathname+(state.toString()?'?'+state:'')+location.hash)}catch{}if(scroll)document.querySelector('.result-toolbar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
q.addEventListener('input',()=>{page=1;update()});[year,type].forEach(el=>el.addEventListener('change',()=>{page=1;update()}));document.querySelector('#publication-filters').addEventListener('submit',e=>{e.preventDefault();page=1;update()});document.querySelector('#reset-filters').addEventListener('click',()=>{q.value='';year.value='all';type.value='all';page=1;update();q.focus()});prev.addEventListener('click',()=>{page--;update(true)});next.addEventListener('click',()=>{page++;update(true)});update()}
const print=document.querySelector('#print-cv');if(print)print.addEventListener('click',()=>window.print());
