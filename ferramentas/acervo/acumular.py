import json,sys,os
import os; S=os.path.join(os.path.dirname(os.path.abspath(__file__)),'arquivos.json')
db=json.load(open(S)) if os.path.exists(S) else {}
d=json.load(open(sys.argv[1]))
n=0
for f in d.get('files',[]):
    if f['id'] not in db: n+=1
    db[f['id']]={k:f.get(k) for k in ('id','title','mimeType','parentId','fileExtension','fileSize','createdTime')}
json.dump(db,open(S,'w'),ensure_ascii=False)
print('novos:',n,'total:',len(db))
print('TOKEN', d.get('nextPageToken',''))
