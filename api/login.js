import { createHmac, timingSafeEqual, scryptSync } from 'node:crypto';
const sign=(v)=>createHmac('sha256',process.env.AUTH_SECRET||'').update(v).digest('hex');
function cookie(email,name){const expires=Math.floor(Date.now()/1000)+604800;const payload=Buffer.from(JSON.stringify({email,name,role:'member',expires})).toString('base64url');return 'robotics_session='+payload+'.'+sign(payload)+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800';}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
 const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';const password=typeof req.body?.password==='string'?req.body.password:'';
 if(!email||!password)return res.status(400).json({ok:false,error:'Vui lòng nhập email và mật khẩu.'});
 if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD&&process.env.ADMIN_SESSION_SECRET&&email===process.env.ADMIN_EMAIL.trim().toLowerCase()){
  const a=Buffer.from(password),b=Buffer.from(process.env.ADMIN_PASSWORD);if(a.length===b.length&&timingSafeEqual(a,b)){const expires=Math.floor(Date.now()/1000)+28800;const payload=String(expires);const token=payload+'.'+createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(payload).digest('hex');res.setHeader('Set-Cookie','robotics_admin_session='+token+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800');return res.status(200).json({ok:true,role:'admin',name:'Quản trị viên',email});}
 }
 const url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN;if(!url||!token||!process.env.AUTH_SECRET)return res.status(503).json({ok:false,error:'Đăng nhập thành viên chưa được cấu hình.'});
 try{const response=await fetch(url+'/get/'+encodeURIComponent('robotics:user:'+email),{headers:{Authorization:'Bearer '+token}});const data=await response.json();if(!data?.result)return res.status(401).json({ok:false,error:'Email hoặc mật khẩu không đúng.'});const user=JSON.parse(data.result);const actual=scryptSync(password,user.salt,64),expected=Buffer.from(user.passwordHash,'hex');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return res.status(401).json({ok:false,error:'Email hoặc mật khẩu không đúng.'});res.setHeader('Set-Cookie',cookie(email,user.name));return res.status(200).json({ok:true,role:'member',name:user.name,email});}catch{return res.status(502).json({ok:false,error:'Dịch vụ tài khoản tạm thời không khả dụng.'});}
}
