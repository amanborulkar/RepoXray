/**
 * particle-bg.js — React-compatible canvas particle system
 * Exported as a React hook: useParticleBG(canvasRef, initialMode)
 * Modes: 'neural' | 'galaxy' | 'flow'
 */

import { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#22d3ee', '#f59e0b', '#34d399', '#60a5fa'];

class Particle {
  constructor(state, spawnX, spawnY) {
    this._s = state;
    this.reset(true, spawnX, spawnY);
  }
  reset(init, sx, sy) {
    const { W, H, mode } = this._s;
    if (mode === 'neural') {
      this.x = sx ?? Math.random() * W; this.y = sy ?? Math.random() * H;
      this.vx = (Math.random() - .5) * .45; this.vy = (Math.random() - .5) * .45;
      this.r = Math.random() * 3 + 1.5; this.col = COLORS[Math.floor(Math.random() * 3)];
    } else if (mode === 'galaxy') {
      const arm = Math.floor(Math.random() * 3), a = Math.random() * Math.PI * 2;
      const armA = a + arm * (Math.PI * 2 / 3), rad = Math.random() * Math.min(W,H) * .42 + 30;
      this.x = W/2 + Math.cos(armA + rad*.003)*rad; this.y = H/2 + Math.sin(armA + rad*.003)*rad;
      this.vx = Math.sin(armA)*.3; this.vy = -Math.cos(armA)*.3;
      this.r = Math.random()*2+.5; this.col = arm===0?'#10b981':arm===1?'#8b5cf6':'#22d3ee';
    } else {
      this.x = init ? Math.random()*W : 0; this.y = sy ?? Math.random()*H;
      this.vx = Math.random()*1.5+.5; this.vy = (Math.random()-.5)*.3;
      this.r = Math.random()*2.5+.5; this.col = COLORS[Math.floor(Math.random()*COLORS.length)];
    }
    this.baseR = this.r; this.angle = Math.random()*Math.PI*2;
    this.spin = (Math.random()-.5)*.02; this.pulse = 0;
  }
  update(frame) {
    const { W, H, mode, mouse } = this._s;
    this.angle += this.spin;
    this.pulse = Math.sin(frame*.04 + this.angle)*.5+.5;
    const dx=mouse.x-this.x, dy=mouse.y-this.y, d=Math.sqrt(dx*dx+dy*dy);
    if (d<140&&d>0){const f=(140-d)/140*.08; this.vx+=dx/d*f; this.vy+=dy/d*f;}
    if (mode==='flow'){
      this.vy+=Math.sin(this.x*.012+frame*.008)*.015;
      this.vx*=.998; this.vy*=.98;
      if(this.x>W+10) this.reset(false);
    } else if (mode==='galaxy'){
      const dx2=W/2-this.x,dy2=H/2-this.y,d2=Math.sqrt(dx2*dx2+dy2*dy2);
      if(d2>0){this.vx+=(-dy2/d2)*.012; this.vy+=(dx2/d2)*.012;}
      this.vx*=.997; this.vy*=.997;
      if(this.x<-30||this.x>W+30||this.y<-30||this.y>H+30) this.reset(false);
    } else {
      this.vx*=.999; this.vy*=.999;
      if(this.x<0)this.vx+=.05; if(this.x>W)this.vx-=.05;
      if(this.y<0)this.vy+=.05; if(this.y>H)this.vy-=.05;
    }
    this.x+=this.vx; this.y+=this.vy; this.r=this.baseR*(1+this.pulse*.4);
  }
  draw(ctx) {
    const a=.5+this.pulse*.5;
    ctx.save(); ctx.globalAlpha=a;
    ctx.shadowColor=this.col; ctx.shadowBlur=this.r*6;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=this.col; ctx.fill();
    ctx.globalAlpha=a*.22; ctx.shadowBlur=this.r*18;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r*2.8,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

class Pulse {
  constructor(p1,p2){this.p1=p1;this.p2=p2;this.t=0;this.col=p1.col;}
  update(){this.t+=.018; return this.t<1;}
  draw(ctx){
    const x=this.p1.x+(this.p2.x-this.p1.x)*this.t;
    const y=this.p1.y+(this.p2.y-this.p1.y)*this.t;
    const a=Math.sin(this.t*Math.PI);
    ctx.save(); ctx.globalAlpha=a*.9;
    ctx.shadowColor=this.col; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill(); ctx.restore();
  }
}

function initParticles(s) {
  s.particles=[]; s.pulses=[];
  const n=s.mode==='galaxy'?200:s.mode==='flow'?150:130;
  for(let i=0;i<n;i++) s.particles.push(new Particle(s));
}

function tick(s) {
  if(s.dead) return;
  s.raf=requestAnimationFrame(()=>tick(s));
  s.frame++;
  const {ctx,W,H,particles,pulses,mode,mouse,frame}=s;
  ctx.fillStyle='rgba(4,6,14,0.22)'; ctx.fillRect(0,0,W,H);
  // grid
  ctx.save(); ctx.globalAlpha=.03; ctx.strokeStyle='#10b981'; ctx.lineWidth=.5;
  const gs=64;
  for(let x=0;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.restore();
  // halo
  if(mouse.x>=0){
    const r=Math.sin(frame*.05)*10+44;
    ctx.save(); ctx.globalAlpha=.10; ctx.strokeStyle='#10b981'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(mouse.x,mouse.y,r,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=.05;
    ctx.beginPath(); ctx.arc(mouse.x,mouse.y,r*1.7,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
  // connections
  const md=mode==='flow'?90:mode==='galaxy'?70:130;
  for(let i=0;i<particles.length;i++)
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<md){
        ctx.save(); ctx.globalAlpha=(1-d/md)*.42;
        ctx.strokeStyle=particles[i].col; ctx.lineWidth=.6;
        ctx.shadowColor=particles[i].col; ctx.shadowBlur=4;
        ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y);
        ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); ctx.restore();
        if(mode==='neural'&&Math.random()<.0006) pulses.push(new Pulse(particles[i],particles[j]));
      }
    }
  // pulses
  for(let i=pulses.length-1;i>=0;i--){
    pulses[i].draw(ctx);
    if(!pulses[i].update()) pulses.splice(i,1);
  }
  // particles
  for(const p of particles){p.update(frame); p.draw(ctx);}
}

export function useParticleBG(canvasRef, initialMode='neural') {
  const modeRef = useRef(initialMode);
  const stateRef = useRef(null);

  const setMode = useCallback((m) => {
    modeRef.current = m;
    if(stateRef.current){ stateRef.current.mode=m; initParticles(stateRef.current); }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = {
      ctx, dead:false, frame:0, raf:null,
      mode: modeRef.current,
      W:0, H:0,
      particles:[], pulses:[],
      mouse:{x:-1,y:-1},
    };
    stateRef.current = s;

    const resize=()=>{
      s.W=canvas.width=canvas.offsetWidth||window.innerWidth;
      s.H=canvas.height=canvas.offsetHeight||window.innerHeight;
    };
    resize();
    ctx.fillStyle='#04060e'; ctx.fillRect(0,0,s.W,s.H);
    initParticles(s);
    tick(s);

    const onMM=(e)=>{
      const r=canvas.getBoundingClientRect();
      s.mouse.x=e.clientX-r.left; s.mouse.y=e.clientY-r.top;
    };
    const onML=()=>{s.mouse.x=-1;s.mouse.y=-1;};
    const onResize=()=>resize();
    const onClick=(e)=>{
      if(e.target.closest('button,a,input,select,textarea,[role="button"]')) return;
      const r=canvas.getBoundingClientRect();
      const cx=e.clientX-r.left, cy=e.clientY-r.top;
      for(let i=0;i<12;i++){
        const p=new Particle(s,cx,cy);
        p.vx=(Math.random()-.5)*5; p.vy=(Math.random()-.5)*5;
        s.particles.push(p);
      }
      if(s.particles.length>300) s.particles.splice(0,s.particles.length-300);
    };
    window.addEventListener('mousemove',onMM);
    window.addEventListener('mouseleave',onML);
    window.addEventListener('resize',onResize);
    document.addEventListener('click',onClick);
    return ()=>{
      s.dead=true;
      if(s.raf) cancelAnimationFrame(s.raf);
      window.removeEventListener('mousemove',onMM);
      window.removeEventListener('mouseleave',onML);
      window.removeEventListener('resize',onResize);
      document.removeEventListener('click',onClick);
    };
  }, [canvasRef]);

  return { setMode };
}
