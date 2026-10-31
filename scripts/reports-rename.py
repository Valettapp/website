import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/opentype/inter/Inter-%s.otf'
def font(w,pt): return ImageFont.truetype(F%w, round(pt*2*0.95))
class Page:
    def __init__(s,pn): s.pn=pn; s.im=Image.open(f'p{pn}.png').convert('RGB'); s.orig=s.im.copy(); s.d=ImageDraw.Draw(s.im)
    def px(s,r): return [round(v*2) for v in r]
    def bg(s,r,pad=2):
        x0,y0,x1,y1=s.px(r); a=np.array(s.orig).reshape(-1,3) if False else np.array(s.orig)
        ring=np.concatenate([a[y0-pad-3:y0-pad, x0:x1].reshape(-1,3), a[y1+pad:y1+pad+3, x0:x1].reshape(-1,3), a[y0:y1, x1+pad:x1+pad+3].reshape(-1,3)])
        vals,counts=np.unique(ring,axis=0,return_counts=True); return tuple(int(v) for v in vals[counts.argmax()])
    def ink(s,r):
        x0,y0,x1,y1=s.px(r); a=np.array(s.orig)[y0:y1,x0:x1].reshape(-1,3).astype(int); b=np.array(s.bg(r))
        d=np.abs(a-b).sum(1); top=a[d>=np.percentile(d,94)]; return tuple(int(v) for v in np.median(top,0))
    def erase(s,r,pad=2,color=None):
        x0,y0,x1,y1=s.px(r); c=color or s.bg(r,pad); s.d.rectangle([x0-pad,y0-pad,x1+pad,y1+pad],fill=c); return c
    def text(s,t,x,y,pt,w,color): f=font(w,pt); s.d.text((x*2,(y-0.9)*2),t,font=f,fill=color,anchor='la'); return x+s.d.textlength(t,font=f)/2
    def center(s,t,r,pt,w,color): f=font(w,pt); x0,y0,x1,y1=s.px(r); s.d.text(((x0+x1)/2,(y0+y1)/2),t,font=f,fill=color,anchor='mm')
    def save(s): s.im.save(f'p{s.pn}-edit.png')

p=Page(16)
c=p.ink([306.7,221.9,502,230.9]); p.erase([306.7,221.9,502,230.9]); p.text('Q East 17 · Marquee 11 · Arcadia 9 · One Marina 5 ·',306.7,221.9,9.5,'Regular',c)
c=p.ink([944.4,205.4,976.6,214.4]); p.erase([944.4,205.4,1000,214.4]); p.text('Marquee 5:30',944.4,205.4,10.0,'SemiBold',c)
def avatar(r,t):
    c=p.ink(r); p.erase(r,pad=1); p.center(t,r,9.6,'SemiBold',c)
def row(name_r, sub_r, name, sub, name_y, sub_y):
    cn=p.ink(name_r); cs=p.ink(sub_r); p.erase(name_r); p.erase(sub_r)
    p.text(name,84.7,name_y,10.8,'SemiBold',cn); p.text(sub,84.7,sub_y,9.1,'Regular',cs)
avatar([54.0,468.7,67.4,477.8],'TM'); row([84.7,455.9,141.5,478.2],[84.7,482.5,167.6,490.8],'The Marquee','Dubai · 2 drivers on',462.0,476.2)
avatar([54.3,527.2,67.1,536.2],'AM'); row([84.7,515.2,118.3,524.9],[84.7,529.2,167.1,548.4],'Arcadia Mall','Dubai · 3 drivers on',515.2,529.2)
avatar([54.3,584.8,67.0,593.8],'OM'); c=p.ink([84.7,572.8,120.8,582.5]); p.erase([84.7,572.8,120.8,582.5]); p.text('One Marina',84.7,572.8,10.8,'SemiBold',c)
avatar([53.7,643.3,67.6,652.3],'ML'); row([84.7,630.4,155.6,652.8],[84.7,657.0,163.6,665.3],'Maison Lune','Dubai · standalone',637.0,651.2)
c=p.ink([765.7,516.9,886.4,525.2]); p.erase([765.7,516.9,886.4,525.2]); p.text('Marquee · 2 days · unassigned',765.7,516.9,9.0,'Regular',c)
c=p.ink([948.5,623.2,980.3,632.2]); p.erase([946.6,623.2,1013.2,632.2]); p.text('Marquee — keys',947.2,623.2,10.2,'Regular',c)
p.save()

q=Page(17)
cn=q.ink([301.1,102.7,413.0,112.4]); cg=q.ink([425.1,102.7,478.3,112.4]); q.erase([301.1,102.7,560,112.4])
x=q.text('The Marquee',301.1,102.7,10.8,'Medium',cn); q.text(' · AED 9,600/month recurring',x,102.7,10.8,'Regular',cg)
c=q.ink([757.6,94.0,813.3,103.7]); q.erase([757.6,94.0,813.3,103.7]); q.text('Marquee',757.6,94.0,10.7,'Medium',c)
q.save()

for name,pn in [('network.jpg',16),('residents.jpg',17)]:
    v=np.load(name+'.npy'); M=v[1:].reshape(2,3)
    src=cv2.imread(f'p{pn}-edit.png'); orig=cv2.imread('/home/user/website/src/assets/reports/'+name)
    out=cv2.warpAffine(src,M,(orig.shape[1],orig.shape[0]),flags=cv2.INTER_AREA)
    cv2.imwrite(name,out,[cv2.IMWRITE_JPEG_QUALITY,90])
    o2=cv2.warpAffine(cv2.imread(f'p{pn}.png'),M,(orig.shape[1],orig.shape[0]),flags=cv2.INTER_AREA)
    print(name,'unchanged-area diff vs current asset: %.2f'%np.abs(o2.astype(int)-orig.astype(int)).mean())
