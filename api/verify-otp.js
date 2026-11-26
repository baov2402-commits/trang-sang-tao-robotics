import { createHmac, timingSafeEqual, scryptSync, randomBytes } from 'node:crypto';
const hmac=(v)=>createHmac('sha256',process.env.AUTH_SECRET||'').update(v).digest('hex');
function cookie(email,name){const expires=Math.floor(Date.now()/1000)+604800;const payload=Buffer.from(JSON.stringify({email,name,role:'member',expires})).toString('base64url');return 'robotics_session='+payload+'.'+hmac(payload)+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800';}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
 const url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN,secret=process.env.AUTH_SECRET;
 if(!url||!token||!secret)return res.status(503).json({ok:false,error:'Dịch vụ đăng ký chưa được cấu hình.'});
 const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
 const name=typeof req.body?.name==='string'?req.body.name.trim().slice(0,80):'';
 const password=typeof req.body?.password==='string'?req.body.password:'';
 const code=typeof req.body?.code==='string'?req.body.code.trim():'';
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||name.length<2||password.length<10||!/^\\d{6}$/.test(code))return res.status(400).json({ok:false,error:'Kiểm tra họ tên, email, mật khẩu tối thiểu 10 ký tự và OTP 6 số.'});
 try{
  const key='robotics:otp:'+email; const got=await fetch(url+'/get/'+encodeURIComponent(key),{headers:{Authorization:'Bearer '+token}}); const data=await got.json();
  if(typeof data?.result!=='string')return res.status(400).json({ok:false,error:'Mã đã hết hạn hoặc chưa được gửi.'});
  const a=Buffer.from(data.result),b=Buffer.from(hmac(email+':'+code)); if(a.length!==b.length||!timingSafeEqual(a,b))return res.status(400).json({ok:false,error:'Mã xác thực không đúng.'});
  await fetch(url+'/del/'+encodeURIComponent(key),{headers:{Authorization:'Bearer '+token}});
  const userKey='robotics:user:'+email; const old=await fetch(url+'/get/'+encodeURIComponent(userKey),{headers:{Authorization:'Bearer '+token}}); const oldData=await old.json();
  if(oldData?.result)return res.status(409).json({ok:false,error:'Email đã đăng ký. Hãy đăng nhập.'});
  const salt=randomBytes(16).toString('hex'),passwordHash=scryptSync(password,salt,64).toString('hex');
  const user=JSON.stringify({email,name,salt,passwordHash,createdAt:new Date().toISOString()});
  const saved=await fetch(url+'/set/'+encodeURIComponent(userKey)+'/'+encodeURIComponent(user),{headers:{Authorization:'Bearer '+token}}); const savedData=await saved.json();
  if(savedData?.result!=='OK')return res.status(502).json({ok:false,error:'Không lưu được tài khoản. Vui lòng thử lại.'});
  res.setHeader('Set-Cookie',cookie(email,name)); return res.status(200).json({ok:true,role:'member',name,email});
 }catch{return res.status(502).json({ok:false,error:'Không thể xác minh OTP hoặc tạo tài khoản lúc này.'});}
}
