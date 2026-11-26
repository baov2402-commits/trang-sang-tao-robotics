import { randomInt, createHmac } from 'node:crypto';
const hash = (v) => createHmac('sha256', process.env.AUTH_SECRET || '').update(v).digest('hex');
export default async function handler(req,res) {
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
 const url=process.env.KV_REST_API_URL, token=process.env.KV_REST_API_TOKEN;
 const mailKey=process.env.RESEND_API_KEY, from=process.env.RESEND_FROM_EMAIL;
 if(!url||!token||!mailKey||!from||!process.env.AUTH_SECRET) return res.status(503).json({ok:false,error:'Dịch vụ đăng ký chưa được cấu hình đầy đủ trên máy chủ.'});
 const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
 const name=typeof req.body?.name==='string'?req.body.name.trim().slice(0,80):'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:'Email không hợp lệ.'});
 const code=String(randomInt(100000,1000000)), key='robotics:otp:'+email, cooldown='robotics:otp-cooldown:'+email;
 try {
  const old=await fetch(url+'/get/'+encodeURIComponent(key),{headers:{Authorization:'Bearer '+token}}); const oldData=await old.json();
  if(oldData?.result) return res.status(429).json({ok:false,error:'Mã vừa được gửi. Vui lòng chờ 60 giây.'});
  const saved=await fetch(url+'/set/'+encodeURIComponent(key)+'/'+hash(email+':'+code)+'/ex/600/nx',{headers:{Authorization:'Bearer '+token}}); const savedData=await saved.json();
  if(savedData?.result!=='OK') return res.status(429).json({ok:false,error:'Không thể tạo mã lúc này.'});
  const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+mailKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:'Mã xác thực đăng ký Robotics',text:'Xin chào '+(name||'bạn')+', mã xác thực của bạn là '+code+'. Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.'})});
  if(!sent.ok){await fetch(url+'/del/'+encodeURIComponent(key),{headers:{Authorization:'Bearer '+token}});return res.status(502).json({ok:false,error:'Không gửi được email. Hãy kiểm tra cấu hình email.'});}
  return res.status(200).json({ok:true,message:'Đã gửi mã xác thực đến email. Mã có hiệu lực trong 10 phút.'});
 } catch { return res.status(502).json({ok:false,error:'Dịch vụ email hoặc lưu trữ OTP hiện không khả dụng.'}); }
}
