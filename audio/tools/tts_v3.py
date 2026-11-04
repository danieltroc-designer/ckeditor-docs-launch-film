# Per-line eleven_v3 takes with emotion tags. usage: ELEVENLABS_API_KEY=... python3 audio/tools/tts_v3.py VOICE_ID take_name 0.5 [line ids...]
# Each line gets a throw-away "Thanks." after a pause; trim.py cuts in that pause so the real last word is never clipped.
import json, sys, subprocess, urllib.request, concurrent.futures as cf
import os
D=os.path.dirname(os.path.abspath(__file__)); VO=os.path.abspath(D+'/../vo'); os.makedirs(VO+'/takes',exist_ok=True)
voice, name, stab = sys.argv[1], sys.argv[2], float(sys.argv[3]); ids=sys.argv[4:]
key=os.environ['ELEVENLABS_API_KEY']
lines=[l for l in json.load(open(VO+'/lines.json')) if not ids or l[0] in ids]
def go(l):
    sid,text=l
    text=text+" [pause] ... Thanks."
    body={"text":text,"model_id":"eleven_v3","voice_settings":{"stability":stab,"similarity_boost":0.8,"style":0.6,"use_speaker_boost":True}}
    r=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192",data=json.dumps(body).encode(),headers={"xi-api-key":key,"Content-Type":"application/json"})
    try:
        open(f'{VO}/takes/{name}_{sid}.mp3','wb').write(urllib.request.urlopen(r).read())
    except urllib.error.HTTPError as e:
        return sid, 'ERR '+e.read().decode()[:300]
    out=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f'{VO}/takes/{name}_{sid}.mp3'],capture_output=True,text=True).stdout.strip()
    return sid,out
with cf.ThreadPoolExecutor(4) as ex:
    for sid,res in ex.map(go,lines): print(name,sid,res)
