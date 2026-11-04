# Builds out/music_al.wav: mysterious intro (0-7 s, tape-stop into the rewind), dull hold music for the grey
# "before" part (7.85-17.5 s), then the launch track whose first kick lands on the editor cut (17.5 s).
import numpy as np, scipy.io.wavfile as w, subprocess, os
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(D+'/../..'); os.makedirs(ROOT+'/out',exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',D+'/main.mp3','-ar','48000',ROOT+'/out/_main.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',D+'/before.mp3','-ar','48000','-af','lowpass=3800,highpass=150,pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1',ROOT+'/out/_before.wav'],check=True)
sr,m=w.read(ROOT+'/out/_main.wav'); m=m.astype(np.float32)/32768
_,b=w.read(ROOT+'/out/_before.wav'); b=b.astype(np.float32)/32768
N=60*sr; out=np.zeros((N,2),np.float32)
def rms(v): return np.sqrt(np.mean(v**2))+1e-9
def at(t): return int(round(t*sr))
G=0.07  # kick grid phase in the generated track
# 1) mysterious intro: the bars leading into the first kick, ending in a tape stop at 7.0
intro=m[at(1.0+G):at(8.0+G)].copy()
L=len(intro); ts=at(0.55)
rate=np.ones(L); rate[L-ts:]=np.linspace(1,0,ts)**1.6
pos=np.cumsum(rate)/rate.sum()*0+np.cumsum(rate)-1
pos=np.clip(pos,0,L-1)
intro=np.stack([np.interp(pos,np.arange(L),intro[:,c]) for c in range(2)],1).astype(np.float32)
intro[:at(0.4)]*=np.linspace(0,1,at(0.4))[:,None]
intro[-at(0.05):]*=np.linspace(1,0,at(0.05))[:,None]
intro*=10**(-22/20)/rms(intro[at(1):at(6)])
out[:len(intro)]+=intro
# 2) boring hold music for the grey "before" part
s0,s1=7.85,17.47
bb=b[:at(s1-s0)].copy()
bb[:at(0.35)]*=np.linspace(0,1,at(0.35))[:,None]; bb[-at(0.06):]*=np.linspace(1,0,at(0.06))[:,None]
bb*=10**(-27/20)/rms(bb)
out[at(s0):at(s0)+len(bb)]+=bb
# 3) the lift: first kick lands exactly on the editor cut (17.5)
mm=m[at(8.0+G-0.004):].copy()
mm[:at(0.004)]*=np.linspace(0,1,at(0.004))[:,None]
mm*=10**(-17/20)/rms(mm[at(1):at(30)])
n=min(len(mm),N-at(17.5)); out[at(17.5):at(17.5)+n]+=mm[:n]
out[-at(0.8):]*=np.linspace(1,0,at(0.8))[:,None]
w.write(ROOT+'/out/music_al.wav',sr,(np.clip(out,-1,1)*32767).astype(np.int16))
print('peak',np.abs(out).max())
