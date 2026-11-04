# Builds out/sfx_real.wav: soft keystrokes and clicks at the frame-exact times in out/events.json, plus the tape rewind.
import numpy as np, json, os, scipy.io.wavfile as w
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(D+'/../..')
sr=48000; N=60*sr
ev=json.load(open(ROOT+'/out/events.json'))
keys=np.load(D+'/keys.npy',allow_pickle=True); clicks=np.load(D+'/clicks.npy',allow_pickle=True)
rng=np.random.default_rng(7)
L=np.zeros(N,np.float32); R=np.zeros(N,np.float32)
def put(seg,t,g,pan):
    i=int(round(t*sr)); seg=np.asarray(seg,dtype=np.float32); seg=seg[:max(0,min(len(seg),N-i))]
    a=(pan+1)*np.pi/4; L[i:i+len(seg)]+=seg*g*np.cos(a); R[i:i+len(seg)]+=seg*g*np.sin(a)
for k in ev['keys']:
    put(keys[rng.integers(len(keys))], k['t']-0.004, 0.22*10**(rng.uniform(-2.5,1.5)/20), k['pan'])
for c in ev['clicks']:
    put(clicks[rng.integers(len(clicks))], c['t']-0.006, 0.30, c['pan'])
sr2,rw=w.read(D+'/rewind.wav'); rw=rw.astype(np.float32)/32768; rw=rw[:int(1.05*sr)]
fo=int(0.3*sr); rw[-fo:]*=np.linspace(1,0,fo); rw[:int(0.03*sr)]*=np.linspace(0,1,int(0.03*sr))
rw*=0.05/np.sqrt(np.mean(rw**2))
put(rw, ev['cuts']['problem']-0.04, 1.0, 0)
put(clicks[0], ev['cuts']['problem']+0.92, 0.26, 0)
out=np.stack([L,R],1)
out=np.clip(out,-1,1)
w.write(ROOT+'/out/sfx_real.wav',sr,(out*32767).astype(np.int16))
print('peak',np.abs(out).max())
