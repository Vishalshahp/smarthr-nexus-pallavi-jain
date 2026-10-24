import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, Camera, Shield, Key, Landmark } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import { formatDateIN } from '@/utils/india';

// Sample statutory & bank details (masked, demo only)
const STATUTORY = [
  { label:'PAN',              value:'ABCDE••••F'            },
  { label:'UAN (EPFO)',       value:'1000 0000 0004'        },
  { label:'Aadhaar',          value:'XXXX XXXX 4321'        },
  { label:'Bank',             value:'HDFC Bank, Ahmedabad'  },
  { label:'Account Number',   value:'XXXXXXXX4521'          },
  { label:'IFSC',             value:'HDFC0001234'           },
  { label:'Tax Regime',       value:'New regime (FY 2026-27)' },
  { label:'ESI',              value:'Not applicable'        },
];

export default function MyProfile() {
  const user = useSelector(selectUser);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({
    firstName: user?.firstName || 'Aarav',
    lastName:  user?.lastName  || 'Shah',
    phone:     user?.phone     || '+91 90000 00004',
    city:      user?.address?.city    || 'Ahmedabad',
    state:     user?.address?.state   || 'Gujarat',
    pincode:   user?.address?.zipCode || '380009',
    country:   user?.address?.country || 'India',
    bio:       'Passionate Frontend Developer with 3+ years of experience building scalable React applications.',
  });

  const handleSave = () => { setEditing(false); toast.success('Profile updated successfully!'); };

  const TABS = ['personal','security','preferences'];

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <h1 className="font-display text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your personal information and settings</p>
      </motion.div>

      {/* Profile header card */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="glass-card p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex-center shadow-glow-primary">
              <span className="text-2xl font-bold text-white">
                {(user?.firstName||'A')[0]}{(user?.lastName||'S')[0]}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex-center border-2 border-surface-900 hover:bg-primary-500 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white"/>
            </button>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-400 text-sm">{user?.position || 'Frontend Developer'}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="badge-primary badge text-[10px] capitalize">{user?.role?.replace(/_/g,' ')}</span>
                  <span className="badge-success badge text-[10px]">Active</span>
                  <span className="text-[10px] text-slate-500 font-mono">{user?.employeeId || 'EMP00004'}</span>
                </div>
              </div>
              <button onClick={()=>editing ? handleSave() : setEditing(true)}
                className={editing ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
                {editing ? <><Save className="w-3.5 h-3.5"/>Save Changes</> : <><Edit className="w-3.5 h-3.5"/>Edit Profile</>}
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {[
                { icon:Mail,     label:user?.email || 'employee@demo.com' },
                { icon:Phone,    label:form.phone },
                { icon:MapPin,   label:`${form.city}, ${form.state} ${form.pincode}` },
                { icon:Calendar, label:`Joined ${user?.dateOfJoining ? formatDateIN(user.dateOfJoining,{day:undefined}) : 'Jul 2023'}` },
              ].map((item,i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <item.icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0"/>
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize ${tab===t?'bg-primary-600 text-white':'btn-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Personal tab */}
      {tab==='personal' && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-400"/>Personal Information
            </h3>
            <div className="space-y-4">
              {[
                { label:'First Name', key:'firstName', type:'text' },
                { label:'Last Name',  key:'lastName',  type:'text' },
                { label:'Phone',      key:'phone',     type:'tel'  },
                { label:'City',       key:'city',      type:'text' },
                { label:'State',      key:'state',     type:'text' },
                { label:'PIN Code',   key:'pincode',   type:'text' },
                { label:'Country',    key:'country',   type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="input-label">{f.label}</label>
                  <input type={f.type} value={form[f.key]} disabled={!editing}
                    onChange={e=>setForm({...form,[f.key]:e.target.value})}
                    className={`input-field text-sm ${!editing?'opacity-60 cursor-not-allowed':''}`}/>
                </div>
              ))}
              <div>
                <label className="input-label">Bio</label>
                <textarea value={form.bio} disabled={!editing} rows={3}
                  onChange={e=>setForm({...form,bio:e.target.value})}
                  className={`input-field text-sm resize-none ${!editing?'opacity-60 cursor-not-allowed':''}`}/>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-400"/>Employment Details
            </h3>
            <div className="space-y-3">
              {[
                { label:'Employee ID',   value: user?.employeeId   || 'EMP00004'        },
                { label:'Department',    value: user?.department?.name || 'Engineering' },
                { label:'Position',      value: user?.position     || 'Frontend Developer' },
                { label:'Employee Type', value: 'Full-Time'                            },
                { label:'Work Mode',     value: 'Hybrid'                               },
                { label:'Shift',         value: '09:00 – 18:00 IST (General)'          },
                { label:'Work Location', value: 'Ahmedabad (SG Highway)'               },
                { label:'Reporting To',  value: 'Rohan Mehta'                          },
                { label:'Date Joined',   value: user?.dateOfJoining ? formatDateIN(user.dateOfJoining) : '20 Jul 2023' },
              ].map(item => (
                <div key={item.label} className="flex-between py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-200 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-warning-400"/>Statutory &amp; Bank Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {STATUTORY.map(item => (
                <div key={item.label} className="flex-between py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-200 font-medium font-mono">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-3">Identifiers are masked. Contact HR to update PAN, bank or UAN details.</p>
          </div>
        </motion.div>
      )}

      {/* Security tab */}
      {tab==='security' && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-warning-400"/>Change Password
            </h3>
            <div className="space-y-4">
              {['Current Password','New Password','Confirm New Password'].map(l => (
                <div key={l}>
                  <label className="input-label">{l}</label>
                  <input type="password" placeholder="••••••••" className="input-field text-sm"/>
                </div>
              ))}
              <button className="btn-primary text-xs w-full justify-center mt-2">
                <Key className="w-3.5 h-3.5"/>Update Password
              </button>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-400"/>Account Security
            </h3>
            <div className="space-y-3">
              {[
                { label:'Two-Factor Auth',  value:'Disabled', action:'Enable',  color:'text-danger-400'  },
                { label:'Login Sessions',   value:'1 active', action:'View All',color:'text-primary-400' },
                { label:'Last Password Change',value:'Never', action:'Change',  color:'text-warning-400' },
              ].map(item => (
                <div key={item.label} className="flex-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className={`text-[10px] ${item.color}`}>{item.value}</p>
                  </div>
                  <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">{item.action}</button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences tab */}
      {tab==='preferences' && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Notification & Display Preferences</h3>
          <div className="space-y-4">
            {[
              { label:'Email Notifications', desc:'Receive updates via email',          on:true  },
              { label:'Leave Reminders',     desc:'Remind me about upcoming leaves',    on:true  },
              { label:'Payslip Alerts',      desc:'Notify when payslip is ready',       on:true  },
              { label:'Performance Alerts',  desc:'Notify about review deadlines',      on:false },
              { label:'Team Announcements',  desc:'Company-wide announcements',         on:true  },
            ].map((p,i) => (
              <div key={i} className="flex-between py-3 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
                <button className={`relative w-10 h-5 rounded-full transition-all ${p.on?'bg-primary-600':'bg-surface-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.on?'left-5':'left-0.5'}`}/>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
