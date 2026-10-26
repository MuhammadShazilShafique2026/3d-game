from pathlib import Path
import zipfile, textwrap

base = Path("/mnt/data/Indian_Open_World_3D")
base.mkdir(exist_ok=True)

# index.html and style.css were created in the previous step; recreate to ensure complete package.
html = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Indian Open World 3D</title><link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="loading">Loading city...</div>
  <div id="gameUI">
    <header class="topbar">
      <div class="brand">INDIAN <span>OPEN WORLD</span></div>
      <div class="stats">
        <div class="stat"><label>HEALTH</label><div class="bar"><div id="healthFill" class="fill health"></div></div><b id="healthText">100%</b></div>
        <div class="stat"><label>FUEL</label><div class="bar"><div id="fuelFill" class="fill fuel"></div></div><b id="fuelText">100%</b></div>
        <div class="stat"><label>SPEED</label><b><span id="speed">0</span> km/h</b></div>
      </div>
    </header>
    <div class="wantedBox"><span>WANTED</span><div id="wanted">☆☆☆☆☆</div></div>
    <div id="toast" class="toast">Explore the city!</div>
    <div id="policeAlert" class="police-alert">🚨 POLICE ARE CHASING YOU!</div>
    <div class="mission" id="mission">WASD: Move / Drive · E: Enter car · F: Fire</div>
    <button id="helpToggle" class="help-toggle">Controls ?</button>
    <div id="helpContent" class="help-content"><b>Controls</b><br>W A S D — Move / Drive<br>E — Enter or exit car<br>F / Click FIRE — Shoot<br>Shift — Run<br>R — Restart after Game Over</div>
    <div class="vehicle-name" id="vehicleName">ON FOOT</div><div class="crosshair" id="crosshair">+</div>
    <div class="mobile-controls">
      <div class="mobile-pad"><button data-key="w">▲</button><div><button data-key="a">◀</button><button data-key="s">▼</button><button data-key="d">▶</button></div></div>
      <div class="mobile-actions"><button id="mobileE">ENTER / EXIT</button><button id="mobileFire" class="fire-button">FIRE</button></div>
    </div>
  </div>
  <div id="gameOver" class="game-over hidden"><div class="game-over-card">
    <div class="skull">☠</div><p class="eyebrow">MISSION FAILED</p><h1>GAME <span>OVER</span></h1>
    <p id="gameOverReason">You were taken down by the police.</p><button id="playAgain">▶ PLAY AGAIN</button>
    <small>Tip: Keep moving and watch your health and fuel.</small>
  </div></div>
  <script type="module" src="script.js"></script>
</body></html>
'''
(base/"index.html").write_text(html, encoding="utf-8")

css = r'''*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#101923;color:#fff;font-family:Arial,Helvetica,sans-serif}body{user-select:none}canvas{display:block;width:100%;height:100%;outline:none}#loading{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:#101923;font-size:20px;letter-spacing:2px}#gameUI{position:fixed;inset:0;pointer-events:none}.topbar{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px;background:linear-gradient(180deg,rgba(3,9,17,.85),transparent)}.brand{font-size:20px;font-weight:900;letter-spacing:2px;text-shadow:0 2px 8px #000}.brand span{color:#ffb72b}.stats{display:flex;gap:18px;align-items:center}.stat{min-width:100px;display:grid;gap:5px;font-size:12px;text-shadow:0 1px 3px #000}.stat label{font-size:10px;letter-spacing:1.5px;color:#c9d5e2}.bar{width:110px;height:8px;border-radius:10px;background:#29333e;overflow:hidden;border:1px solid #647180}.fill{height:100%;width:100%;transition:width .15s}.health{background:#35e28b}.fuel{background:#ffb52e}.wantedBox{position:absolute;right:24px;top:105px;padding:9px 12px;border-radius:8px;background:rgba(0,0,0,.55);font-weight:800}.wantedBox span{font-size:11px;letter-spacing:2px;color:#ffcc43}.wantedBox div{font-size:22px;letter-spacing:3px;color:#ffce3a}.toast{position:absolute;top:26%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);padding:10px 16px;border-radius:8px;opacity:0;transition:opacity .2s;font-weight:700;text-align:center}.toast.show{opacity:1}.police-alert{position:absolute;top:19%;left:50%;transform:translateX(-50%);font-weight:900;color:#ff3d4d;text-shadow:0 0 12px #f00;opacity:0;animation:flash .8s infinite;white-space:nowrap}.police-alert.active{opacity:1}@keyframes flash{50%{opacity:.35}}.mission{position:absolute;left:22px;bottom:22px;background:rgba(0,0,0,.55);padding:10px 13px;border-radius:8px;font-size:12px;color:#e4edf6}.help-toggle{position:absolute;right:22px;bottom:22px;pointer-events:auto;background:#182b3e;color:#fff;border:1px solid #6b8299;border-radius:8px;padding:10px 14px;cursor:pointer}.help-content{position:absolute;right:22px;bottom:66px;display:none;background:rgba(3,12,22,.9);padding:14px 18px;line-height:1.8;border:1px solid #5e748a;border-radius:10px;font-size:12px}.help-content.open{display:block}.vehicle-name{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);font-size:11px;letter-spacing:2px;color:#fff;background:rgba(0,0,0,.45);padding:7px 12px;border-radius:6px}.crosshair{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px;color:#fff;text-shadow:0 0 6px #000;display:none}.mobile-controls{display:none;position:absolute;left:0;right:0;bottom:15px;justify-content:space-between;align-items:end;padding:0 18px;pointer-events:none}.mobile-pad,.mobile-actions{pointer-events:auto}.mobile-pad button,.mobile-actions button{border:1px solid #b8c7d6;background:rgba(15,28,42,.72);color:#fff;border-radius:12px;min-width:46px;height:45px;font-size:18px;margin:3px;touch-action:none}.mobile-pad>button{display:block;margin:3px auto}.mobile-actions{display:flex;flex-direction:column;align-items:center}.mobile-actions button{font-size:10px;font-weight:bold;padding:0 12px}.mobile-actions .fire-button{background:#a51e2b;border-color:#ff8992;font-size:14px}.game-over{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(3,7,13,.82);backdrop-filter:blur(8px);padding:20px}.hidden{display:none!important}.game-over-card{width:min(430px,100%);padding:35px 25px;text-align:center;background:linear-gradient(145deg,#1b2838,#0a111c);border:1px solid #56687a;border-radius:20px;box-shadow:0 20px 80px #0009}.skull{font-size:42px;color:#ff4b55}.eyebrow{letter-spacing:4px;font-size:11px;color:#ff5d65;font-weight:800}.game-over h1{font-size:42px;letter-spacing:3px;margin:10px 0}.game-over h1 span{color:#ff4b55}.game-over-card>p:not(.eyebrow){color:#c6d1dd;line-height:1.5}.game-over-card button{pointer-events:auto;margin:18px 0 14px;padding:14px 28px;border:0;border-radius:9px;background:linear-gradient(90deg,#ffb52e,#ff6738);color:#141414;font-weight:900;letter-spacing:1px;cursor:pointer;box-shadow:0 7px 25px #ff8c3533}.game-over-card small{display:block;color:#8fa1b4;font-size:11px}@media(max-width:700px){.topbar{padding:12px}.brand{font-size:13px;letter-spacing:1px}.stats{gap:8px}.stat{min-width:62px;font-size:10px}.bar{width:60px;height:7px}.stat label{font-size:8px}.wantedBox{right:12px;top:78px;padding:7px}.wantedBox div{font-size:17px}.wantedBox span{font-size:9px}.mission{left:10px;bottom:10px;max-width:54%;font-size:10px;padding:8px}.help-toggle{right:10px;bottom:10px;padding:8px;font-size:11px}.help-content{right:10px;bottom:52px}.vehicle-name{bottom:155px}.mobile-controls{display:flex}.police-alert{top:17%;font-size:12px}.game-over h1{font-size:34px}}@media(hover:none){.mobile-controls{display:flex}}
'''
(base/"style.css").write_text(css, encoding="utf-8")

js = r'''import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9dc);
scene.fog = new THREE.Fog(0x87b9dc, 75, 260);
const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.insertBefore(renderer.domElement, $('gameUI'));
scene.add(new THREE.HemisphereLight(0xd9edff, 0x526047, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-40,80,30); sun.castShadow=true; scene.add(sun);

const mat = (color, roughness=0.85) => new THREE.MeshStandardMaterial({color, roughness});
const mats = {
  road:mat(0x343b42), line:mat(0xf4d56b), sidewalk:mat(0xb7b8b4),
  grass:mat(0x66834c), building1:mat(0xc8b59a), building2:mat(0xd2d4ce),
  building3:mat(0xb6c5cb), window:mat(0x537b91), dark:mat(0x20252b),
  skin:mat(0xc98e65), shirt:mat(0x2d78b9), pants:mat(0x303846),
  police:mat(0xf1f3f5), red:mat(0xc92f3a), blue:mat(0x2255dd), black:mat(0x141a20)
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
function box(parent, x,y,z, sx,sy,sz, material, cast=true) {
  const m = new THREE.Mesh(boxGeo, material); m.position.set(x,y,z); m.scale.set(sx,sy,sz);
  m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), mats.grass);
ground.rotation.x=-Math.PI/2; ground.position.y=-0.08; ground.receiveShadow=true; scene.add(ground);

// Road grid with sidewalks, lanes and simple city blocks.
for(let k=-4;k<=4;k++){
  const p=k*30;
  box(scene,p,0,0,10,0.06,270,mats.road,false);
  box(scene,0,0,p,270,0.06,10,mats.road,false);
  box(scene,p+6,0.08,0,2,0.16,270,mats.sidewalk,false);
  box(scene,p-6,0.08,0,2,0.16,270,mats.sidewalk,false);
  box(scene,0,0.08,p+6,270,0.16,2,mats.sidewalk,false);
  box(scene,0,0.08,p-6,270,0.16,2,mats.sidewalk,false);
  for(let j=-13;j<=13;j++){
    box(scene,p,0.045,j*10,0.12,0.02,3.5,mats.line,false);
    box(scene,j*10,0.045,p,3.5,0.02,0.12,mats.line,false);
  }
}
for(let x=-4;x<=4;x++) for(let z=-4;z<=4;z++){
  const bx=x*30, bz=z*30;
  if(Math.abs(bx)<15 && Math.abs(bz)<15) continue;
  const count=2+Math.floor(Math.random()*3);
  for(let i=0;i<count;i++){
    const w=5+Math.random()*7, d=5+Math.random()*7, h=7+Math.random()*25;
    const xx=bx+(Math.random()-.5)*15, zz=bz+(Math.random()-.5)*15;
    const colors=[mats.building1,mats.building2,mats.building3];
    box(scene,xx,h/2,zz,w,h,d,colors[Math.floor(Math.random()*colors.length)]);
    for(let yy=3;yy<h-1;yy+=3.2){
      for(let wx=-w/2+1;wx<w/2-0.5;wx+=2){
        box(scene,xx+wx,yy,zz+d/2+0.025,0.85,1.1,0.05,mats.window,false);
      }
    }
  }
}
// Trees around blocks
for(let i=0;i<100;i++){
  const x=(Math.random()-.5)*230, z=(Math.random()-.5)*230;
  if(Math.abs(x%30)<8 || Math.abs(z%30)<8) continue;
  box(scene,x,1.2,z,0.5,2.4,0.5,mat(0x725034));
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,8,7),mat(0x2e783b));
  crown.position.set(x,3,z); crown.castShadow=true; scene.add(crown);
}

function makeCar(color=0x2872c8, police=false){
  const g=new THREE.Group();
  box(g,0,0.62,0,2.1,0.75,4.0,mat(color));
  box(g,0,1.18,-0.15,1.55,0.72,1.95,mat(police?0xe9edf2:0x5d7b8d));
  box(g,0,0.2,2.05,1.7,0.2,0.15,mat(0xf7f0d4));
  box(g,0,0.2,-2.05,1.7,0.2,0.15,mat(0xb51e29));
  for(const x of [-1.08,1.08]) for(const z of [-1.25,1.25]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.24,12),mat(0x151719));
    wheel.rotation.z=Math.PI/2; wheel.position.set(x,0.38,z); g.add(wheel);
  }
  if(police){
    box(g,-0.42,1.62,0,0.55,0.18,0.25,mat(0x1767ff));
    box(g,0.42,1.62,0,0.55,0.18,0.25,mat(0xff263d));
  }
  g.userData={police, speed:0}; scene.add(g); return g;
}
function makePerson(color=0x2d78b9){
  const g=new THREE.Group();
  box(g,0,1.15,0,0.55,0.85,0.35,mat(color));
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,8),mats.skin);head.position.y=1.78;head.castShadow=true;g.add(head);
  box(g,-0.16,0.48,0,0.16,0.55,0.18,mats.pants);
  box(g,0.16,0.48,0,0.16,0.55,0.18,mats.pants);
  return g;
}
const player=makePerson(0x2585b9); player.position.set(0,0,4); scene.add(player);
let health=100, fuel=100, wanted=0, inCar=false, gameEnded=false, currentCar=null, playerSpeed=0;
const keys={w:false,a:false,s:false,d:false,shift:false};
const cars=[], npcs=[], policeUnits=[];
for(let i=0;i<12;i++){
  const car=makeCar([0xc33d35,0x2677c7,0xe4e5e2,0x2d9a65,0x292d33][i%5]);
  car.position.set((i%2?1:-1)*(15+Math.random()*65),0,(Math.floor(i/2)-3)*25);
  car.rotation.y=i%2?Math.PI/2:0; cars.push(car);
}
for(let i=0;i<24;i++){
  const npc=makePerson([0x2585b9,0xd48a32,0x7a4bb4,0x3c985e,0xb44d55][i%5]);
  npc.position.set((Math.random()-.5)*180,0,(Math.random()-.5)*180); npcs.push(npc); scene.add(npc);
}
const policeMaterial=mat(0xf4f5f6);
let lastShot=0, lastPlayerDamage=0, lastPoliceSpawn=0, toastTimer=0;
function say(msg){
  $('toast').textContent=msg; $('toast').classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2300);
}
function updateWanted(){
  $('wanted').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);
  $('policeAlert').classList.toggle('active',wanted>0);
}
function raiseWanted(n=1){
  wanted=Math.min(5,Math.max(wanted,n)); updateWanted();
  if(!policeUnits.length) spawnPolice();
}
function spawnPolice(){
  const now=performance.now();
  if(now-lastPoliceSpawn<2500 || gameEnded) return;
  lastPoliceSpawn=now;
  const car=makeCar(0xf4f5f6,true);
  const target=inCar&&currentCar?currentCar.position:player.position;
  car.position.set(target.x+(Math.random()<.5?-1:1)*18,0,target.z-22-Math.random()*8);
  car.rotation.y=Math.atan2(target.x-car.position.x,target.z-car.position.z);
  const officer=makePerson(0x202c44); officer.visible=false; scene.add(officer);
  policeUnits.push({car,officer,mode:'car',shootAt:performance.now()+1800,fireAt:0});
}
function exitPolice(unit){
  if(unit.mode!=='car') return;
  unit.mode='foot'; unit.officer.visible=true;
  unit.officer.position.copy(unit.car.position);
  unit.officer.position.x+=2.3; unit.officer.position.y=0;
  say('Police officer got out and is firing!');
}
function endGame(reason){
  if(gameEnded) return; gameEnded=true; playerSpeed=0;
  $('gameOverReason').textContent=reason;
  $('gameOver').classList.remove('hidden');
}
function restartGame(){
  health=100;fuel=100;wanted=0;inCar=false;currentCar=null;playerSpeed=0;gameEnded=false;
  player.position.set(0,0,4);player.rotation.y=0;player.visible=true;
  cars.forEach((c,i)=>{c.position.set((i%2?1:-1)*(15+(i%4)*8),(0),(Math.floor(i/2)-3)*25);c.rotation.y=i%2?Math.PI/2:0;c.visible=true;});
  policeUnits.forEach(p=>{scene.remove(p.car);scene.remove(p.officer);});policeUnits.length=0;
  npcs.forEach((n,i)=>{n.visible=true;n.position.set((i%6-3)*12,0,(Math.floor(i/6)-2)*18);});
  $('gameOver').classList.add('hidden');$('crosshair').style.display='none';updateWanted();updateHUD();
  say('Game restarted!'); 
}
function updateHUD(){
  $('healthFill').style.width=health+'%';$('healthText').textContent=Math.ceil(health)+'%';
  $('fuelFill').style.width=fuel+'%';$('fuelText').textContent=Math.ceil(fuel)+'%';
  $('speed').textContent=Math.round(Math.abs(playerSpeed)*22);
  $('vehicleName').textContent=inCar?'CITY CAR':'ON FOOT';
  $('crosshair').style.display=(!inCar&&!gameEnded)?'block':'none';
}
function enterExitCar(){
  if(gameEnded)return;
  if(inCar){
    player.position.copy(currentCar.position);player.position.x+=2.5;player.position.y=0;
    player.visible=true;inCar=false;currentCar=null;say('You left the car.');
  }else{
    let nearest=null,dist=5;
    for(const c of cars){const d=c.position.distanceTo(player.position);if(d<dist){dist=d;nearest=c;}}
    if(nearest){currentCar=nearest;inCar=true;player.visible=false;playerSpeed=0;say('You entered the car. Fuel is decreasing!');}
    else say('Move close to a car first.');
  }
  updateHUD();
}
function fireWeapon(){
  if(gameEnded||inCar)return;
  const now=performance.now();if(now-lastShot<420)return;lastShot=now;
  raiseWanted(1);
  const origin=player.position.clone();origin.y+=1.4;
  const direction=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y)).normalize();
  const end=origin.clone().add(direction.clone().multiplyScalar(28));
  const points=[origin,end];const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xffdc70}));
  scene.add(line);setTimeout(()=>{scene.remove(line);line.geometry.dispose();line.material.dispose();},100);
  let hit=null,best=4;
  for(const npc of npcs){if(!npc.visible)continue;const d=npc.position.distanceTo(end);const to=npc.position.clone().sub(origin);const along=to.dot(direction);const side=to.clone().sub(direction.clone().multiplyScalar(along)).length();if(along>0&&along<28&&side<1.4&&along<best+24){hit=npc;best=along;}}
  if(hit){hit.visible=false;say('Target hit! Police are alerted.');setTimeout(()=>{if(!gameEnded){hit.position.set((Math.random()-.5)*150,0,(Math.random()-.5)*150);hit.visible=true;}},9000);}
}
function keyDown(e){
  const k=e.key.toLowerCase();
  if(['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
  if(k in keys)keys[k]=true;if(k==='shift')keys.shift=true;
  if(k==='e')enterExitCar();if(k==='f'||k===' ')fireWeapon();
  if(k==='r'&&gameEnded)restartGame();
}
function keyUp(e){const k=e.key.toLowerCase();if(k in keys)keys[k]=false;if(k==='shift')keys.shift=false;}
addEventListener('keydown',keyDown);addEventListener('keyup',keyUp);
$('mobileE').addEventListener('click',enterExitCar);$('mobileFire').addEventListener('click',fireWeapon);
document.querySelectorAll('[data-key]').forEach(btn=>{
  const k=btn.dataset.key;
  btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>keys[k]=false));
});
$('helpToggle').addEventListener('click',()=>$('helpContent').classList.toggle('open'));
$('playAgain').addEventListener('click',restartGame);

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.04);
  if(!gameEnded){
    const move=(keys.w?1:0)-(keys.s?1:0);
    const turn=(keys.a?1:0)-(keys.d?1:0);
    if(inCar&&currentCar){
      if(fuel>0){
        playerSpeed+=(move*14*dt);playerSpeed*=Math.pow(0.975,dt*60);playerSpeed=THREE.MathUtils.clamp(playerSpeed,-7,20);
        currentCar.rotation.y+=turn*dt*(playerSpeed>=0?1:-1)*1.65;
        const forward=new THREE.Vector3(Math.sin(currentCar.rotation.y),0,Math.cos(currentCar.rotation.y));
        currentCar.position.addScaledVector(forward,playerSpeed*dt);
        fuel=Math.max(0,fuel-dt*(0.13+Math.abs(playerSpeed)*0.018));
      }else{playerSpeed=0;say('Fuel empty! Leave the car.');}
      if(Math.abs(playerSpeed)>0.7&&Math.random()<dt*0.035)raiseWanted(1);
    }else{
      playerSpeed=0;
      const speed=keys.shift?8:4.4;
      if(move!==0||turn!==0){
        if(move!==0)player.rotation.y+=turn*dt*2.2;
        const dir=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));
        player.position.addScaledVector(dir,move*speed*dt);
      }
    }
    const playerPos=inCar&&currentCar?currentCar.position:player.position;
    // Police car pursuit, then officer exits nearby and fires at the player.
    for(const unit of policeUnits){
      const target=playerPos.clone();target.y=0;
      const dist=unit.car.position.distanceTo(target);
      if(unit.mode==='car'){
        const angle=Math.atan2(target.x-unit.car.position.x,target.z-unit.car.position.z);
        let diff=angle-unit.car.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));
        unit.car.rotation.y+=THREE.MathUtils.clamp(diff,-dt*1.2,dt*1.2);
        const fwd=new THREE.Vector3(Math.sin(unit.car.rotation.y),0,Math.cos(unit.car.rotation.y));
        unit.car.position.addScaledVector(fwd,Math.min(9,3+wanted*1.1)*dt);
        if(dist<10)exitPolice(unit);
      }else{
        const to=target.clone().sub(unit.officer.position);to.y=0;
        const d=to.length();
        if(d>2.2){to.normalize();unit.officer.position.addScaledVector(to,Math.min(3.3, d)*dt);unit.officer.rotation.y=Math.atan2(to.x,to.z);}
        if(d<18&&performance.now()>unit.fireAt){
          unit.fireAt=performance.now()+850; // firing cadence
          const hitChance=inCar?0.24:0.42;
          if(Math.random()<hitChance){
            health=Math.max(0,health-(inCar?5:9));say('You were hit by police fire!');
            if(health<=0)endGame('The police took you down. Try again!');
          }
        }
      }
    }
    // Keep player inside the playable city and avoid going under ground.
    player.position.x=THREE.MathUtils.clamp(player.position.x,-130,130);
    player.position.z=THREE.MathUtils.clamp(player.position.z,-130,130);
    if(inCar&&currentCar){currentCar.position.x=THREE.MathUtils.clamp(currentCar.position.x,-130,130);currentCar.position.z=THREE.MathUtils.clamp(currentCar.position.z,-130,130);}
    // Camera follows from behind.
    const focus=playerPos.clone();focus.y+=1.2;
    const yaw=inCar&&currentCar?currentCar.rotation.y:player.rotation.y;
    const camOffset=new THREE.Vector3(-Math.sin(yaw)*9,5.3,-Math.cos(yaw)*9);
    camera.position.lerp(focus.clone().add(camOffset),1-Math.pow(0.001,dt));
    camera.lookAt(focus);
    if(wanted>0&&policeUnits.length===0)spawnPolice();
    updateHUD();
  }
  renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
$('loading').style.display='none';updateWanted();updateHUD();say('Welcome! Find a car and press E.');
animate();
'''
(base/"script.js").write_text(js, encoding="utf-8")

server = r'''"""Tiny local server for Indian Open World 3D.
Run: python server.py
Then open http://localhost:8000 in your browser.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
from pathlib import Path

PORT = 8000
os.chdir(Path(__file__).resolve().parent)
print(f"Indian Open World 3D is running at http://localhost:{PORT}")
print("Press Ctrl+C to stop the server.")
ThreadingHTTPServer(("0.0.0.0", PORT), SimpleHTTPRequestHandler).serve_forever()
'''
(base/"server.py").write_text(server, encoding="utf-8")
(base/"run_game.bat").write_text('@echo off\r\ncd /d "%~dp0"\r\npy server.py\r\npause\r\n', encoding="utf-8")
readme = r'''INDIAN OPEN WORLD 3D

FILES
- index.html: game interface
- style.css: game styling and mobile controls
- script.js: Three.js game logic (loads Three.js from a CDN)
- server.py: local Python web server
- run_game.bat: Windows shortcut to start the game

RUN ON WINDOWS
1. Install Python if needed.
2. Double-click run_game.bat, or open a terminal in this folder and run:
   py server.py
3. Open http://localhost:8000 in Chrome.
4. Internet is required for the Three.js CDN import.

CONTROLS
W/A/S/D: walk or drive
E: enter/exit a nearby car
F or Space: fire (on foot)
Shift: run
R: restart after game over

GAMEPLAY
- Driving slowly consumes fuel.
- When wanted, police chase you. Close to you, an officer exits and fires.
- Police fire can reduce health. At zero health, the Game Over screen appears.
- Use Play Again to restart.

GITHUB / VERCEL
Upload index.html, style.css, script.js, server.py, run_game.bat, and README.txt to the repository root.
For Vercel, this is a static site; Python is only used for local hosting and is not executed by Vercel in this setup.
'''
(base/"README.txt").write_text(readme, encoding="utf-8")

zip_path = Path("/mnt/data/Indian_Open_World_3D_with_Python.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for f in base.iterdir():
        if f.is_file():
            z.write(f, arcname=f"Indian_Open_World_3D/{f.name}")
print("Created project files:")
for f in sorted(base.iterdir()):
    if f.is_file():
        print(f"- {f.name} ({f.stat().st_size} bytes)")
print(f"\nZIP: {zip_path}")

