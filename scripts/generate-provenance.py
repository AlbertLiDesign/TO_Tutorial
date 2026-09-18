#!/usr/bin/env python3
"""Record the exact source and binary inputs actually used by this build."""
import argparse, hashlib, json, pathlib, platform
parser=argparse.ArgumentParser()
parser.add_argument('--artifacts', type=pathlib.Path, required=True)
parser.add_argument('--output', type=pathlib.Path, required=True)
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parent.parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files={str(p.relative_to(root)):sha(p) for folder in ['server/Numerics','native/BesoNative','server/Spatial'] for p in sorted((root/folder).rglob('*')) if p.is_file()}
binaries={name:sha(args.artifacts/name) for name in ['BesoNative.dll','MathNet.Numerics.dll','TopTeach.dll']}
data={'source':'https://github.com/AlbertLiDesign/TO_Tutorial','engine':'Top Lab Q4/H8; SIMP, BESO, ESO and Hamilton-Jacobi level set; soft/hard kill BESO','solver':'CHOLMOD; serial assembly','spatialIndex':'Original source implementation; insertion-order distance ties','buildPlatform':platform.system()+' '+platform.machine(),'files':files,'binaries':binaries}
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(json.dumps(data,indent=2)+'\n')
