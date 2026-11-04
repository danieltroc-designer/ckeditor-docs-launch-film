# Places the final per-line clips (audio/vo/clips/f_<id>.wav) at their offsets -> out/vo2.wav (60 s, 48 kHz stereo).
import json, os, numpy as np, scipy.io.wavfile as w
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(D+'/../..'); os.makedirs(ROOT+'/out',exist_ok=True)
off=json.load(open(D+'/offsets.json')); sr=48000; out=np.zeros((60*sr,2),np.float32)
for sid,ms in off.items():
    if sid.startswith('_'): continue
    r,x=w.read(f'{D}/clips/f_{sid}.wav'); assert r==sr; x=x.astype(np.float32)/32768
    if x.ndim==1: x=np.stack([x,x],1)
    i=int(ms*sr/1000); n=min(len(x),len(out)-i); out[i:i+n]+=x[:n]
    print(f'{sid:8s} {ms/1000:6.2f}s -> {(ms/1000+len(x)/sr):6.2f}s')
w.write(ROOT+'/out/vo2.wav',sr,(np.clip(out,-1,1)*32767).astype(np.int16))
