import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Globe, Database, Zap, Save, Bot, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { COMPANY, PAYROLL_RULES, financialYearLabel, formatINR } from '@/utils/india';

const TABS = [
  { id:'general',      label:'General',       icon: Settings },
  { id:'payroll',      label:'Payroll & Compliance', icon: IndianRupee },
  { id:'ai',           label:'AI / Gemini',   icon: Bot      },
  { id:'security',     label:'Security',      icon: Shield   },
  { id:'notifications',label:'Notifications', icon: Bell     },
];

export default function SystemSettings() {
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Settings saved!'); }, 1000);
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure SmartHR Nexus platform settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-xs">
          {saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : <><Save className="w-3.5 h-3.5"/>Save Changes</>}
        </button>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${tab===t.id?'bg-primary-600 text-white':'btn-secondary'}`}>
            <t.icon className="w-3.5 h-3.5"/>{t.label}
          </button>
        ))}
      </div>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card p-6">
        {tab==='general' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-primary-400"/>General Configuration</h3>
            {[
              { label:'Company Name',       placeholder:'Company Pvt. Ltd.',           defaultVal:COMPANY.name               },
              { label:'Registered Address', placeholder:'Street, City, State PIN',     defaultVal:COMPANY.address            },
              { label:'Company Website',    placeholder:'https://company.in',          defaultVal:'https://nexusinfotech.demo'},
              { label:'Support Email',      placeholder:'hr@company.in',               defaultVal:COMPANY.email              },
              { label:'Phone',              placeholder:'+91 79 0000 0000',            defaultVal:COMPANY.phone              },
              { label:'GSTIN',              placeholder:'24ABCDE1234F1Z5',             defaultVal:COMPANY.gstin              },
              { label:'Company PAN',        placeholder:'ABCDE1234F',                  defaultVal:COMPANY.pan                },
              { label:'Default Timezone',   placeholder:'Asia/Kolkata',                defaultVal:COMPANY.timezone           },
              { label:'Date Format',        placeholder:'DD/MM/YYYY',                  defaultVal:'DD/MM/YYYY'               },
              { label:'Currency',           placeholder:'INR (₹)',                     defaultVal:COMPANY.currency           },
              { label:'Financial Year',     placeholder:'April – March',               defaultVal:`${COMPANY.financialYear} (current: ${financialYearLabel()})` },
              { label:'Working Hours',      placeholder:'09:30 – 18:30',               defaultVal:'09:30 – 18:30 IST'        },
              { label:'Working Days',       placeholder:'Mon – Fri',                   defaultVal:COMPANY.workWeek           },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input className="input-field text-sm" placeholder={f.placeholder} defaultValue={f.defaultVal}/>
              </div>
            ))}
          </div>
        )}

        {tab==='payroll' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary-400"/>Payroll &amp; Statutory Compliance (India)</h3>
            {[
              { label:'Income Tax (TDS) Regime',  defaultVal:PAYROLL_RULES.regime, note:`Standard deduction ${formatINR(PAYROLL_RULES.standardDeduction)}; no tax up to ${formatINR(PAYROLL_RULES.rebateLimit)} taxable income (Sec. 87A rebate). ${PAYROLL_RULES.cess}.` },
              { label:'Provident Fund (PF)',      defaultVal:'Employee 12% · Employer 12% of basic', note:PAYROLL_RULES.pf },
              { label:'PF Wage Ceiling (₹/month)', defaultVal:'15000', note:`Statutory ceiling ${formatINR(15000)} per month` },
              { label:'ESI Contribution',         defaultVal:'Employee 0.75% · Employer 3.25%', note:PAYROLL_RULES.esi },
              { label:'ESI Wage Limit (₹/month)', defaultVal:'21000', note:`ESI applies when gross pay is ${formatINR(21000)} per month or less` },
              { label:'Professional Tax (Gujarat)', defaultVal:'₹200 / month', note:'Deducted when monthly salary is ₹12,000 or more' },
              { label:'Payroll Cycle',            defaultVal:'Monthly · salary credited on the last working day', note:`Financial year ${COMPANY.financialYear} (${financialYearLabel()})` },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input className="input-field text-sm" type={f.type||'text'} placeholder={f.placeholder} defaultValue={f.defaultVal}/>
                {f.note && <p className="text-[10px] text-slate-500 mt-1">{f.note}</p>}
              </div>
            ))}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Automation</p>
              {[
                { label:'Auto-calculate TDS (new regime)', desc:'Monthly TDS projected on annual taxable income',  on:true  },
                { label:'PF ECR File Generation',          desc:'Monthly Electronic Challan-cum-Return for EPFO',   on:true  },
                { label:'ESI Contribution Filing',         desc:'Monthly ESIC contribution for eligible employees', on:true  },
                { label:'Form 16 Generation',              desc:'Annual TDS certificate after the financial year closes', on:true },
                { label:'Gratuity Provisioning',           desc:'4.81% of basic as per the Payment of Gratuity Act', on:false },
              ].map((item,i) => (
                <div key={i} className="flex-between py-2 border-b border-white/5">
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${item.on?'bg-primary-600':'bg-surface-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.on?'left-5':'left-0.5'}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='ai' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2"><Bot className="w-4 h-4 text-primary-400"/>AI Configuration (Google Gemini)</h3>
            <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs text-primary-300 leading-relaxed">
              <p className="font-semibold mb-1">Get your Gemini API Key:</p>
              <p>1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline hover:text-primary-200">https://aistudio.google.com/app/apikey</a></p>
              <p>2. Click "Create API Key" → Copy it</p>
              <p>3. Add to <code className="bg-surface-700 px-1 rounded">backend/.env</code> as <code className="bg-surface-700 px-1 rounded">GEMINI_API_KEY=your-key</code></p>
              <p>4. Add to <code className="bg-surface-700 px-1 rounded">frontend/.env</code> as <code className="bg-surface-700 px-1 rounded">VITE_GEMINI_API_KEY=your-key</code></p>
            </div>
            {[
              { label:'Gemini API Key (Backend)', placeholder:'AIza...', type:'password', note:'Used for resume screening, performance insights, payroll optimization' },
              { label:'Gemini Model',             placeholder:'gemini-1.5-flash', defaultVal:'gemini-1.5-flash', note:'gemini-1.5-flash (fast) or gemini-1.5-pro (accurate)' },
              { label:'Max Output Tokens',        placeholder:'2048', defaultVal:'2048', note:'Max tokens per AI response' },
              { label:'Temperature',              placeholder:'0.4', defaultVal:'0.4', note:'0.0 = deterministic, 1.0 = creative' },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input className="input-field text-sm" type={f.type||'text'} placeholder={f.placeholder} defaultValue={f.defaultVal}/>
                {f.note && <p className="text-[10px] text-slate-500 mt-1">{f.note}</p>}
              </div>
            ))}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Features</p>
              {[
                { label:'AI Resume Screening',     desc:'Auto-screen and score resumes on submission',    on:true  },
                { label:'ARIA Chat Assistant',     desc:'HR chatbot powered by Gemini',                  on:true  },
                { label:'Performance Insights',    desc:'AI-generated review summaries',                  on:true  },
                { label:'Payroll Optimization',    desc:'Tax-efficient salary structuring (new regime)',  on:false },
                { label:'JD Generator',            desc:'Auto-generate job descriptions with AI',         on:true  },
                { label:'Interview Analysis',      desc:'AI analysis of interview transcripts',           on:false },
              ].map((item,i) => (
                <div key={i} className="flex-between py-2 border-b border-white/5">
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${item.on?'bg-primary-600':'bg-surface-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.on?'left-5':'left-0.5'}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='security' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-warning-400"/>Security Settings</h3>
            {[
              { label:'JWT Secret Key', placeholder:'Enter strong secret...', type:'password' },
              { label:'JWT Expiry (Access Token)', placeholder:'7d', defaultVal:'7d' },
              { label:'JWT Expiry (Refresh Token)', placeholder:'30d', defaultVal:'30d' },
              { label:'Max Login Attempts', placeholder:'5', defaultVal:'5' },
              { label:'Account Lockout Duration (hours)', placeholder:'2', defaultVal:'2' },
              { label:'Rate Limit (requests/15min)', placeholder:'100', defaultVal:'100' },
              { label:'Allowed CORS Origins', placeholder:'https://yourdomain.com' },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input className="input-field text-sm" type={f.type||'text'} placeholder={f.placeholder} defaultValue={f.defaultVal}/>
              </div>
            ))}
            <div className="space-y-3 pt-2">
              {[
                { label:'Force HTTPS',              on:true  },
                { label:'Enable 2FA for Admins',   on:false },
                { label:'IP Whitelist',             on:false },
                { label:'Audit Logging',            on:true  },
              ].map((item,i) => (
                <div key={i} className="flex-between py-2 border-b border-white/5">
                  <p className="text-xs text-white">{item.label}</p>
                  <div className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${item.on?'bg-primary-600':'bg-surface-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.on?'left-5':'left-0.5'}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='notifications' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-accent-400"/>Notification Settings</h3>
            {[
              { label:'SMTP Host',     placeholder:'smtp.gmail.com',    defaultVal:'smtp.gmail.com' },
              { label:'SMTP Port',     placeholder:'587',               defaultVal:'587'            },
              { label:'SMTP User',     placeholder:'your@email.com'                                 },
              { label:'SMTP Password', placeholder:'App password...',   type:'password'             },
              { label:'From Email',    placeholder:'noreply@nexusinfotech.demo'                     },
              { label:'From Name',     placeholder:'Nexus Infotech HR', defaultVal:`${COMPANY.shortName} HR` },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input className="input-field text-sm" type={f.type||'text'} placeholder={f.placeholder} defaultValue={f.defaultVal}/>
              </div>
            ))}
            <div className="space-y-3 pt-2">
              {[
                { label:'Payslip Ready Emails',      on:true  },
                { label:'Leave Approval Emails',     on:true  },
                { label:'New Employee Welcome',      on:true  },
                { label:'Performance Review Reminders',on:true },
                { label:'Payroll Processing Alerts', on:false },
              ].map((item,i) => (
                <div key={i} className="flex-between py-2 border-b border-white/5">
                  <p className="text-xs text-white">{item.label}</p>
                  <div className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${item.on?'bg-primary-600':'bg-surface-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.on?'left-5':'left-0.5'}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
