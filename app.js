import {categories, createOracle} from './predictions.js';

const $=id=>document.getElementById(id);
const oracle=createOracle();
let current=null, busy=false, soundEnabled=false, audio=null, toastTimer;
const footerText='Предсказание выдано тёмными силами ООО «Ваша Безопасность». Обжалованию не подлежит!';
const disclaimer='Все совпадения случайны. Ведьмы ответственности не несут. 🎃';

function cardArt(i) {
  const colors=[['#3f213c','#c07a91'],['#3d3022','#d8b56f'],['#312248','#ae8dce']][i];
  const star=(x,y,s=4)=>`<path d="M${x} ${y-s}Q${x} ${y} ${x+s} ${y}Q${x} ${y} ${x} ${y+s}Q${x} ${y} ${x-s} ${y}Q${x} ${y} ${x} ${y-s}Z"/>`;
  const constellation=[[40,70,3],[166,84,4],[50,205,3],[157,226,3],[67,93,2],[149,56,2],[40,255,2],[175,175,2],[48,145,2],[150,193,2],[74,238,2],[170,119,2],[68,59,2]].map(p=>star(...p)).join('');
  const ornaments=`<g fill="none" stroke="#b69863" stroke-width=".65"><path d="M27 69V35Q27 26 37 26H79M183 69V35Q183 26 173 26H131M27 237V271Q27 280 37 280H79M183 237V271Q183 280 173 280H131"/><path d="M21 53Q40 53 40 34M21 42Q32 42 32 23M189 53Q170 53 170 34M189 42Q178 42 178 23M21 253Q40 253 40 272M21 264Q32 264 32 283M189 253Q170 253 170 272M189 264Q178 264 178 283"/><path d="M54 35Q47 49 35 55M156 35Q163 49 175 55M54 271Q47 257 35 251M156 271Q163 257 175 251"/></g>`;
  const frame=`<rect x="8" y="8" width="194" height="290" rx="8" fill="none" stroke="#bc9b62" stroke-width="1"/><rect x="15" y="15" width="180" height="276" rx="5" fill="none" stroke="#ac8b5860" stroke-width=".65"/><path d="M24 76Q105 21 186 76M24 230Q105 285 186 230" fill="none" stroke="#9f7d4b70" stroke-width=".6"/>`;
  const rays=Array.from({length:48},(_,n)=>{const a=n*Math.PI/24;const r=n%2?49:45;return `<path d="M${105+Math.cos(a)*r} ${149+Math.sin(a)*r}L${105+Math.cos(a)*57} ${149+Math.sin(a)*57}"/>`;}).join('');
  const symbols=[
    `<path d="M105 168C68 145 79 121 94 127Q103 127 105 135Q108 126 118 127C135 129 140 147 105 168Z" fill="url(#accent${i})" stroke="#e2b39d" stroke-width="1"/><path d="M105 171V187M96 181Q100 176 105 178Q112 171 118 175" fill="none" stroke="#b78c71"/><path d="M82 115Q105 98 128 115M80 180Q105 199 130 180" fill="none" stroke="#c391a0" stroke-width="1"/>`,
    `<circle cx="105" cy="149" r="25" fill="url(#accent${i})" stroke="#dec68b"/><path d="M76 149Q105 118 134 149Q105 180 76 149Z" fill="#271c24" stroke="#e4c485" stroke-width="1.2"/><circle cx="105" cy="149" r="10" fill="#d7b16b"/><circle cx="105" cy="149" r="4" fill="#2b1a25"/>${star(105,112,5)}${star(105,186,5)}`,
    `<circle cx="105" cy="149" r="31" fill="url(#accent${i})" stroke="#c6a8e0" stroke-width=".6"/><path d="M114 120a31 31 0 1 0 18 42a31 31 0 0 1-18-42Z" fill="#dfc18a"/><path d="M116 123a31 31 0 0 0 17 36a31 31 0 0 0-17-36Z" fill="#2b1c3c"/>${star(125,139,7)}${star(99,111,4)}${star(80,181,3)}`
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 306" aria-hidden="true"><defs><radialGradient id="bg${i}"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="#1a1226"/></radialGradient><radialGradient id="accent${i}"><stop stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[0]}"/></radialGradient><pattern id="p${i}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="#d8b56f" stroke-opacity=".055" stroke-width=".5"/></pattern></defs><rect width="210" height="306" rx="12" fill="url(#bg${i})"/><rect width="210" height="306" fill="url(#p${i})"/>${frame}${ornaments}<g fill="#ba9d69">${constellation}</g><path d="M105 44L110 51L105 58L100 51Z" fill="none" stroke="#d9bb7d" stroke-width=".7"/><text x="105" y="80" text-anchor="middle" fill="#bca67e" font-family="Georgia,serif" font-size="10" letter-spacing="3">${categories[i].arcana}</text><g stroke="#be9b64" stroke-width=".6" opacity=".6">${rays}</g><circle cx="105" cy="149" r="61" fill="none" stroke="#c2a572" stroke-width=".7"/><circle cx="105" cy="149" r="66" fill="none" stroke="#be9b6440" stroke-width=".7"/>${symbols[i]}<path d="M55 213Q72 235 105 231Q138 235 155 213M61 219Q69 202 74 221M70 225Q80 209 84 229M149 219Q141 202 136 221M140 225Q130 209 126 229" fill="none" stroke="#b69863" stroke-width=".7"/><path d="M105 247L110 254L105 261L100 254Z" fill="none" stroke="#bfa36f" stroke-width=".7"/><g fill="#bfa36f">${star(84,254,2)}${star(126,254,2)}</g><path d="M62 286H92M118 286H148" stroke="#bba06b" stroke-width=".5"/></svg>`;
}

categories.forEach((category,i)=>{
  const button=document.createElement('button');
  button.type='button';button.className='card-option';button.setAttribute('aria-label',`Карта ${i+1}: ${category.title}. Узнать предсказание`);
  button.innerHTML=`<span class="card-float"><span class="card-inner"><span class="card-face card-back">${cardArt(i)}</span><span class="card-face card-front" aria-hidden="true"><span>${category.symbol}</span><strong>${category.title}</strong><small>СУДЬБА РЕШЕНА</small></span></span></span><span class="card-meta"><span class="card-index">КАРТА ${category.arcana}</span><strong class="card-title">${category.title}</strong><span class="card-description">${category.subtitle}</span></span>`;
  button.addEventListener('click',()=>reveal(i,button));$('deck').append(button);
});

for(let i=0;i<44;i++){
  const star=document.createElement('i');star.className='star';
  const size=i%4===0?2:1;star.style.cssText=`left:${(i*37.7)%100}%;top:${(i*23.3)%100}%;width:${size}px;height:${size}px;--time:${3+i%5}s;animation-delay:-${i%7}s`;
  $('stars').append(star);
}

function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function getAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio&&!audio) audio=new Audio();if(audio?.state==='suspended')audio.resume().catch(()=>{});}catch{}return audio;}
function bell(rare){if(!soundEnabled)return;const ctx=getAudio();if(!ctx)return;try{[523.25,783.99,1046.5,...(rare?[1567.98]:[])].forEach((frequency,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+i*.10;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.09,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+1.5);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+1.6);});}catch{}}
$('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('sound').setAttribute('aria-pressed',String(soundEnabled));$('sound').setAttribute('aria-label',soundEnabled?'Выключить звук':'Включить звук');$('sound').querySelector('span').textContent=soundEnabled?'Звук вкл.':'Звук выкл.';$('sound').querySelector('path').setAttribute('d',soundEnabled?'M11 5L6 9H3v6h3l5 4zM16 8a6 6 0 010 8M19 5a10 10 0 010 14':'M11 5L6 9H3v6h3l5 4zM16 9l5 6m0-6l-5 6');if(soundEnabled){getAudio();bell(false);}});
$('soul-name').addEventListener('input',()=>{$('name-error').textContent='';$('soul-name').removeAttribute('aria-invalid');});
$('soul-name').addEventListener('keydown',event=>{if(event.key==='Enter'){$('deck').querySelector('button').focus();}});

async function reveal(index,button){
  if(busy)return;
  const name=$('soul-name').value.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,'').trim();
  if(!name){$('name-error').textContent='Даже тёмные силы должны знать, кого проклинать!';$('soul-name').setAttribute('aria-invalid','true');$('soul-name').focus();return;}
  busy=true;current={...oracle(index),name};$('soul-name').disabled=true;
  if(soundEnabled)getAudio();
  document.querySelectorAll('.card-option').forEach(b=>b.disabled=true);button.classList.add('selected');
  setTimeout(()=>{$('reading').hidden=false;},500);
  await new Promise(resolve=>setTimeout(resolve,2500));
  $('result-name').textContent=name;$('result-category').textContent=current.category.title;$('result-text').textContent=current.text;$('result-symbol').textContent=current.category.symbol;
  $('fortune-card').style.setProperty('--result-color',current.category.color);$('fortune-card').style.setProperty('--result-glow',current.category.color+'22');$('fortune-card').classList.toggle('rare',current.rare);$('rare-label').hidden=!current.rare;
  $('ritual').hidden=true;$('reading').hidden=true;$('result').hidden=false;
  bell(current.rare);busy=false;$('result-name').focus({preventScroll:true});$('result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}

$('again').addEventListener('click',()=>{
  if(busy)return;$('result').hidden=true;$('ritual').hidden=false;$('soul-name').disabled=false;
  document.querySelectorAll('.card-option').forEach(b=>{b.classList.remove('selected');b.disabled=false;});
  current=null;$('deck').querySelector('button').focus({preventScroll:true});$('ritual').scrollIntoView({behavior:'smooth',block:'nearest'});
});

function predictionText(){if(!current)return '';return `${current.rare?'✦ Великое пророчество ✦':'🔮 Три карты судьбы'}\n${current.name} · ${current.category.title}\n31 октября — 1 ноября 2026\n\n${current.text}\n\n${footerText}\n${disclaimer}`;}
async function copyPrediction(){const text=predictionText();if(!text)return;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);}else{const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;opacity:0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw new Error('copy unavailable');}toast('Пророчество скопировано. Неси его в мир!');}catch{$('share-text').value=text;if(!$('share-dialog').open)$('share-dialog').showModal();$('share-text').focus();$('share-text').select();toast('Выдели текст и скопируй его вручную');}}
$('copy').addEventListener('click',copyPrediction);$('dialog-copy').addEventListener('click',copyPrediction);
$('share').addEventListener('click',async()=>{if(!current)return;const data={title:'Три карты судьбы — Хэллоуин 2026',text:predictionText()};if(navigator.share){try{await navigator.share(data);return;}catch(error){if(error.name==='AbortError')return;}}$('share-text').value=data.text;$('share-dialog').showModal();});
document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
$('show-qr').addEventListener('click',()=>$('qr-dialog').showModal());

function linesFor(ctx,text,maxWidth){
  const words=text.split(/\s+/);const lines=[];let line='';
  for(const word of words){const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue;}if(line){lines.push(line);line='';}if(ctx.measureText(word).width<=maxWidth){line=word;continue;}for(const letter of word){if(ctx.measureText(line+letter).width>maxWidth&&line){lines.push(line);line='';}line+=letter;}}
  if(line)lines.push(line);return lines;
}

export async function renderPNG(fortune){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,fortune.rare?'#372620':'#33213e');bg.addColorStop(1,'#120c1d');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
  const glow=ctx.createRadialGradient(540,440,0,540,440,650);glow.addColorStop(0,fortune.rare?'#bd8a342b':'#a771b72b');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(0,0,1080,1350);
  ctx.strokeStyle=fortune.rare?'#edcb88':'#b89761';ctx.lineWidth=2;ctx.strokeRect(38,38,1004,1274);ctx.strokeStyle='#b8976160';ctx.lineWidth=1;ctx.strokeRect(51,51,978,1248);
  ctx.fillStyle='#c3a26b';for(let i=0;i<45;i++){const x=70+(i*173)%940,y=70+(i*269)%1210;ctx.globalAlpha=.2+(i%4)*.1;ctx.beginPath();ctx.arc(x,y,i%3===0?2:1,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.fillStyle='#d8b77d';ctx.font='18px Arial';ctx.fillText('ВАША БЕЗОПАСНОСТЬ · HALLOWEEN 2026',540,110);
  ctx.font='54px Georgia';ctx.fillStyle='#f0e1c9';ctx.fillText('Три карты судьбы',540,195);
  ctx.font='22px Georgia';ctx.fillStyle='#bda8cc';ctx.fillText('Гадальная лавка офисной нечисти',540,239);
  ctx.font='100px Georgia';ctx.fillStyle=fortune.rare?'#edcb88':fortune.category.color;ctx.fillText(fortune.category.symbol,540,380);
  ctx.font='17px Arial';ctx.fillStyle=fortune.rare?'#edcb88':'#b5a0c3';ctx.fillText(fortune.rare?'✦ ВЕЛИКОЕ ПРОРОЧЕСТВО ✦':'ЗАВЕСА ПРИОТКРЫТА ДЛЯ ТЕБЯ,',540,440);
  let nameSize=58;ctx.font=`${nameSize}px Georgia`;while(ctx.measureText(fortune.name).width>850&&nameSize>27){nameSize--;ctx.font=`${nameSize}px Georgia`;}
  ctx.fillStyle='#f6e8d2';ctx.fillText(fortune.name,540,516);
  ctx.font='28px Georgia';ctx.fillStyle=fortune.category.color;ctx.fillText(fortune.category.title,540,565);
  ctx.fillStyle='#bea16f';ctx.font='24px Georgia';ctx.fillText('✦',540,620);
  let size=41,lines;do{ctx.font=`${size}px Georgia`;lines=linesFor(ctx,fortune.text,830);if(lines.length*size*1.5<=340)break;size--;}while(size>25);
  ctx.fillStyle='#f0e2d7';const lineHeight=size*1.5;const top=680+(340-lines.length*lineHeight)/2;lines.forEach((line,i)=>ctx.fillText(line,540,top+i*lineHeight));
  ctx.fillStyle='#bba4ca';ctx.font='21px Arial';ctx.fillText('31 октября — 1 ноября 2026',540,1060);
  ctx.strokeStyle='#b8976160';ctx.beginPath();ctx.moveTo(260,1100);ctx.lineTo(820,1100);ctx.stroke();
  ctx.fillStyle='#beacc8';ctx.font='18px Arial';ctx.fillText('Предсказание выдано тёмными силами ООО «Ваша Безопасность».',540,1152);ctx.fillText('Обжалованию не подлежит!',540,1182);
  ctx.fillStyle='#9a85aa';ctx.font='17px Arial';ctx.fillText('Все совпадения случайны. Ведьмы ответственности не несут. 🎃',540,1240);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG unavailable')),'image/png'));
}

$('save').addEventListener('click',async()=>{
  if(!current)return;const button=$('save');button.disabled=true;
  try{const blob=await renderPNG(current);const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='three-cards-halloween-2026.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Карточка готова. Проверь загрузки браузера.');}catch{toast('Не удалось сохранить PNG. Попробуй ещё раз или скопируй текст.');}finally{button.disabled=false;}
});
