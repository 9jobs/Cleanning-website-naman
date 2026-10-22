import {verifyThrive4Account} from '../src/lib/invoices/stripe';
import {getPaymentDocument} from '../src/lib/payments/documents';
import {paymentPdf} from '../src/lib/payments/pdf';
import {mkdir,writeFile} from 'node:fs/promises';
async function main(){
 await verifyThrive4Account();
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions?limit=30',{headers:{Authorization:'Bearer '+process.env.THRIVE4_STRIPE_SECRET_KEY}});
 const list=await r.json();
 const session=list.data?.find((s:{metadata?:{app?:string};payment_status:string})=>s.metadata?.app==='thrive4-pricing-checkout'&&s.payment_status==='paid');
 if(!session)throw Error('No paid Thrive4 pricing session available; no documents generated.');
 const data=await getPaymentDocument({sessionId:session.id});
 await mkdir('.local-admin/pdf-qa',{recursive:true});
 await writeFile('.local-admin/pdf-qa/document-data.json',JSON.stringify(data,null,2));
 for(const kind of ['invoice','receipt'] as const)await writeFile(`.local-admin/pdf-qa/${kind}.pdf`,await paymentPdf(data,kind));
 await writeFile('.local-admin/pdf-qa/reference.json',JSON.stringify({sessionId:session.id}));
 console.log(JSON.stringify({verifiedPaid:true,sessionId:session.id,service:data.service,hours:data.hours,amount:data.amount,pdfs:['invoice.pdf','receipt.pdf']}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
