import subprocess,numpy as np,glob,io,sys,scipy.io.wavfile as w,warnings
warnings.filterwarnings('ignore')
for f in sorted(sys.argv[1:]):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ar','16000','-ac','1','-f','wav','-'],capture_output=True).stdout
    sr,x=w.read(io.BytesIO(raw)); x=x.astype(float)/32768
    e=np.array([20*np.log10(np.sqrt(np.mean(x[i:i+160]**2))+1e-9) for i in range(0,len(x)-160,160)])
    loud=np.where(e>e.max()-38)[0]
    ok=(len(e)-loud[-1])*0.01>0.12 and e[-5:].max()<e.max()-45
    print(f'{f.split("/")[-1]:20s} speech {loud[0]*0.01:4.2f}-{loud[-1]*0.01:5.2f} ({(loud[-1]-loud[0])*0.01:5.2f}s) end-margin {(len(e)-loud[-1])*0.01:4.2f}  {"OK" if ok else "CUT?"}')
