#!/bin/bash
# sheet.sh dir cols rows tilewidth -> dir/sheet_N.jpg with frame labels
d=$1; c=${2:-3}; r=${3:-3}; w=${4:-640}
cd $d; rm -f sheet_*.jpg; n=$((c*r)); files=(f*.jpg); i=0; s=0
while [ $i -lt ${#files[@]} ]; do
  args=(); for ((k=0;k<n && i<${#files[@]};k++,i++)); do f=${files[$i]}; fr=${f#f}; fr=$((10#${fr%.jpg})); args+=(-i "$f"); lab+=("$fr"); done
  cnt=$(( ${#args[@]}/2 ))
  fc=""; for ((k=0;k<cnt;k++)); do fr=${lab[$((s*n+k))]}; t=$(awk "BEGIN{printf \"%.2f\", $fr/60}"); fc+="[$k]scale=$w:-1,drawtext=text='$fr  ${t}s':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v$k];"; done
  lay=""; for ((k=0;k<cnt;k++)); do lay+="[v$k]"; done
  pos=""; th=$((w*9/16)); for ((k=0;k<cnt;k++)); do x=$(( (k%c)*w )); y=$(( (k/c)*th )); pos+="${x}_${y}|"; done
  ffmpeg -v error "${args[@]}" -filter_complex "${fc}${lay}xstack=inputs=$cnt:layout=${pos%|}:fill=gray" sheet_$s.jpg -y
  s=$((s+1))
done
ls sheet_*.jpg | wc -l
