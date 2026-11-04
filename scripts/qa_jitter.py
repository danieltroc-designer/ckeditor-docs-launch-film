# QA: scans every frame of a rendered film for back-and-forth jumps (shake) between consecutive frames.
# usage: python3 scripts/qa_jitter.py out/CKEditor-Docs-launch-film.mp4
import sys, subprocess, numpy as np
F=sys.argv[1]; W,H=640,360
p=subprocess.Popen(['ffmpeg','-v','error','-i',F,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],stdout=subprocess.PIPE)
def shift(a,b):
    A=np.fft.fft2(a-a.mean()); B=np.fft.fft2(b-b.mean()); R=A*np.conj(B); R/=np.abs(R)+1e-9
    r=np.fft.ifft2(R).real; i,j=np.unravel_index(r.argmax(),r.shape)
    return (j-W if j>W/2 else j),(i-H if i>H/2 else i)
prev=None; sh=[]; n=0
while True:
    buf=p.stdout.read(W*H)
    if len(buf)<W*H: break
    a=np.frombuffer(buf,np.uint8).astype(float).reshape(H,W)
    if prev is not None: sh.append((n,)+shift(a,prev))
    prev=a; n+=1
bad=[s[0] for s,t in zip(sh,sh[1:]) if any(u*v<0 and abs(u)>=1 and abs(v)>=1 for u,v in ((s[1],t[1]),(s[2],t[2])))]
print(f'{n} frames; possible shake at:', ', '.join(f'{b/60:.2f}s' for b in bad) or 'none')
