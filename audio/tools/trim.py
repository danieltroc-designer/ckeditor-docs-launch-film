# Trim a take to its speech, never inside a word; squeeze long pauses. usage: trim.py in.mp3 out.wav [maxgap]
import sys, subprocess, numpy as np, scipy.io.wavfile as w
src,dst=sys.argv[1],sys.argv[2]; maxgap=float(sys.argv[3]) if len(sys.argv)>3 else 0.42
tmp=dst+'.raw.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',src,'-ar','48000','-ac','1',tmp],check=True)
sr,x=w.read(tmp); x=x.astype(np.float32)/32768
hop=int(0.01*sr); n=len(x)//hop
env=np.array([20*np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-9) for i in range(n)])
thr=env.max()-38
loud=np.where(env>thr)[0]
a=max(0,loud[0]-4)
# the take ends with a throw-away "Thanks." after a pause: cut in that pause, so the real last word is never clipped
q0=env<thr; runs=[]; i=loud[0]
while i<loud[-1]:
    if q0[i]:
        j=i
        while j<n and q0[j]: j+=1
        runs.append((i,j)); i=j
    else: i+=1
gaps=[r for r in runs if (r[1]-r[0])>=18 and r[0]>loud[0]+int(0.6*(loud[-1]-loud[0]))]
tail_len=(loud[-1]-gaps[-1][1])*0.01 if gaps else 0
if gaps and 0.15<tail_len<1.2:
    g0,g1=gaps[-1]; b=min(g0+16,(g0+g1)//2)
    note=f'cut before throw-away ({tail_len:.2f}s)'
else:
    b=min(n,loud[-1]+14); note='NO THROW-AWAY FOUND'
# pauses: runs of quiet frames inside the speech
q=env<thr; segs=[]; i=a; cur=a
while i<b:
    if q[i]:
        j=i
        while j<b and q[j]: j+=1
        if (j-i)*0.01>maxgap:
            keep=int(maxgap/0.01/2)
            segs.append((cur,i+keep)); cur=j-keep
        i=j
    else: i+=1
segs.append((cur,b))
X=int(0.008*sr); y=None
for s0,s1 in segs:
    p=x[s0*hop:s1*hop]
    y=p if y is None else np.concatenate([y[:-X],y[-X:]*(1-np.linspace(0,1,X))+p[:X]*np.linspace(0,1,X),p[X:]])
fi=int(0.01*sr); fo=int(0.06*sr); y=y.copy(); y[:fi]*=np.linspace(0,1,fi); y[-fo:]*=np.linspace(1,0,fo)
w.write(tmp,sr,(np.clip(y,-1,1)*32767).astype(np.int16))
subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af','loudnorm=I=-18:TP=-2:LRA=9:linear=true','-ar','48000','-ac','2',dst],check=True)
subprocess.run(['rm',tmp])
tail=20*np.log10(np.sqrt(np.mean(y[-int(0.1*sr):-fo]**2))+1e-9)
print(f'{src.split("/")[-1]:24s} {len(y)/sr:5.2f}s  squeezed {len(segs)-1}  {note}')
