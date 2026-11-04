import numpy as np, scipy.io.wavfile as w, scipy.signal as sg, sys
sr,x=w.read(sys.argv[1]); x=x.astype(np.float32)/32768
b,a=sg.butter(4,120/(sr/2)); lo=sg.filtfilt(b,a,x)
env=np.convolve(lo**2,np.ones(int(0.01*sr))/int(0.01*sr),'same')
d=np.maximum(0,np.diff(env,prepend=0))
pk,_=sg.find_peaks(d,distance=int(0.35*sr),height=np.percentile(d,99)*0.25)
t=pk/sr
for a0,a1 in [(13,33),(33,54),(0,60)]:
    tt=t[(t>a0)&(t<a1)]
    if len(tt)<6: print(a0,a1,'few',len(tt)); continue
    n=np.round((tt-tt[0])/0.5); A=np.vstack([n,np.ones_like(n)]).T
    (P,c),*_=np.linalg.lstsq(A,tt,rcond=None)
    res=tt-(P*n+c)
    print(f'{a0}-{a1}: kicks {len(tt)} period {P:.5f} ({60/P:.3f} bpm) phase {c%P:.3f} resid {np.abs(res).mean()*1000:.1f}ms first {tt[:3].round(3)}')
