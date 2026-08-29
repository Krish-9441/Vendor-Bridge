import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ---------- NAV ---------- */}
      <nav className="sticky top-0 z-50 bg-[#EDE6D6]/90 backdrop-blur-md border-b-2 border-[#231F16]">
        <div className="wrap flex items-center justify-between py-5">
          <div className="logo">
            <span className="logo-mark"></span>VendorBridge
          </div>
          <div className="hidden md:flex gap-[34px] text-[13px] font-mono text-[#6b6349] uppercase tracking-[0.04em]">
            <a href="#platform" className="transition-colors duration-200 hover:text-[#231F16]">Platform</a>
            <a href="#workflow" className="transition-colors duration-200 hover:text-[#231F16]">Workflow</a>
            <a href="#roles" className="transition-colors duration-200 hover:text-[#231F16]">Roles</a>
          </div>
          <div className="flex items-center gap-5 text-[13px]">
            <a href="/login" className="btn-ghost btn">Sign in</a>
            <a href="#" className="btn">Request a walkthrough</a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <header className="pt-20 pb-[60px] border-b-2 border-[#231F16] relative">
        <div className="wrap flex justify-between items-start gap-[50px] flex-wrap">
          <motion.div 
            className="max-w-[560px] flex-1 min-w-[320px]"
            initial="hidden" animate="visible" variants={fadeUp}
          >
            <span className="eyebrow">Procurement Manifest · ERP</span>
            <h1 className="text-[clamp(34px,5vw,54px)] leading-[1.06] my-[20px] mb-[22px]">
              Paperwork, finally<br/>kept <em className="not-italic text-[#8A3223] font-serif italic">in order.</em>
            </h1>
            <p className="text-[16.5px] text-[#4A4535] max-w-[460px] mb-[30px]">
              Every vendor, RFQ, quotation, approval, and invoice — filed against one record instead of scattered across inboxes and spreadsheets. The way procurement paperwork should have worked all along.
            </p>
            <div className="flex gap-4 items-center flex-wrap">
              <a href="#" className="btn">Request a walkthrough</a>
              <a href="#workflow" className="font-mono text-[13px] text-[#6b6349] border-b border-[#C9C0A8] pb-[2px] hover:text-[#231F16] hover:border-[#231F16] transition-colors">
                Trace a purchase order end to end →
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-shrink-0 pt-2"
            initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
            animate={{ opacity: 1, rotate: -13, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="w-[150px] h-[150px] border-[3px] border-[#8A3223] rounded-full text-[#8A3223] flex items-center justify-center text-center font-mono font-semibold text-[12px] tracking-[0.06em] relative before:content-[''] before:absolute before:inset-[8px] before:border before:border-[#8A3223] before:rounded-full">
              APPROVED<br/>BY MANAGER
            </div>
            <div className="font-mono text-[11px] text-[#6b6349] text-center mt-[14px] transform rotate-[13deg]">
              PO-2026-0819
            </div>
          </motion.div>
        </div>

        <div className="wrap mt-14">
          <motion.div 
            className="ledger-preview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="ledger-head">
              <span>Recent activity</span>
              <span className="hidden sm:inline">Vendor · Amount · Status</span>
            </div>
            
            {[
              { code: "RFQ-0114", desc: "Office furniture — 40 units", status: "Approved", statusClass: "approved", amt: "₹4,86,000" },
              { code: "QT-0271", desc: "Industrial packaging supply — Q3", status: "Pending review", statusClass: "pending", amt: "₹2,14,500" },
              { code: "PO-0098", desc: "Network hardware refresh", status: "Issued", statusClass: "issued", amt: "₹9,72,300" }
            ].map((row, i) => (
              <motion.div 
                key={row.code}
                className="ledger-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + (i * 0.1) }}
              >
                <span className="code">{row.code}</span>
                <span className="desc">{row.desc}</span>
                <span className={`status ${row.statusClass}`}>{row.status}</span>
                <span className="amt">{row.amt}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ---------- STRIP ---------- */}
      <div className="border-b-2 border-[#231F16] bg-[#EDE6D6]">
        <div className="wrap grid grid-cols-1 md:grid-cols-3">
          {[
            { num: "01", title: "One record, not five inboxes", desc: "Vendors, RFQs, quotations, approvals and invoices live against the same procurement record — nothing gets reconstructed from email threads." },
            { num: "02", title: "Role-scoped by design", desc: "Officers, vendors, approvers and admins each see exactly the queue and actions their role needs — nothing more." },
            { num: "03", title: "Every decision, timestamped", desc: "Approvals, rejections and status changes are logged automatically, so any purchase order can be traced back to its origin." }
          ].map((item, i) => (
            <div key={item.num} className="p-8 md:p-[32px_40px] border-b md:border-b-0 md:border-r border-[#C9C0A8] last:border-0 hover:bg-[#D9CDB0] transition-colors cursor-default">
              <span className="font-mono text-[11px] text-[#8A3223] mb-[10px] block">{item.num}</span>
              <h3 className="text-[16px] mb-2">{item.title}</h3>
              <p className="text-[13.5px] text-[#6b6349]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- PLATFORM ---------- */}
      <section id="platform" className="py-24">
        <div className="wrap">
          <motion.div 
            className="max-w-[600px] mb-[52px]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          >
            <span className="eyebrow">Platform</span>
            <h2 className="text-[clamp(26px,3.2vw,34px)] mt-[14px]">Six modules. One procurement lifecycle.</h2>
            <p className="text-[#6b6349] mt-[14px] text-[15px]">Each screen is built around a real handoff in the process — not a generic settings page.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#231F16] border-[1.5px] border-[#231F16]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          >
            {[
              { num: "01", title: "Vendor Management", desc: "Registration, GST and contact details, categories, and status tracking — with search and filtering to keep a large vendor base usable." },
              { num: "02", title: "RFQ Creation", desc: "Titles, product or service specs, quantities, attachments, deadlines and vendor assignment — issued in one structured form." },
              { num: "03", title: "Quotation Comparison", desc: "Side-by-side pricing, delivery timelines and vendor ratings, with the lowest price and fastest delivery surfaced automatically." },
              { num: "04", title: "Approval Workflow", desc: "Approve or reject with remarks, see the full approval timeline, and track state transitions from submitted to signed off." },
              { num: "05", title: "Purchase Orders & Invoicing", desc: "Auto-generated PO numbers, tax and total calculations, and invoices that can be downloaded, printed, or emailed directly." },
              { num: "06", title: "Reports & Analytics", desc: "Vendor performance, spending summaries and monthly procurement trends, exportable for finance and leadership review." },
            ].map((feature) => (
              <motion.div key={feature.num} variants={fadeUp} className="bg-[#F4EFE3] p-[30px_26px] min-h-[190px] flex flex-col justify-between transition-colors duration-200 hover:bg-[#E4DBC7] cursor-pointer group">
                <span className="font-mono text-[11px] text-[#8A3223] group-hover:scale-110 origin-left transition-transform">{feature.num}</span>
                <div>
                  <h3 className="text-[17.5px] my-5 mb-[10px]">{feature.title}</h3>
                  <p className="text-[13.5px] text-[#6b6349] leading-[1.55]">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- WORKFLOW ---------- */}
      <section id="workflow" className="py-24 bg-[#E4DBC7] border-y-2 border-[#231F16]">
        <div className="wrap">
          <motion.div 
            className="max-w-[600px] mb-[52px]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          >
            <span className="eyebrow">Workflow</span>
            <h2 className="text-[clamp(26px,3.2vw,34px)] mt-[14px]">How a single request moves end to end</h2>
            <p className="text-[#6b6349] mt-[14px] text-[15px]">This is the actual trail a request leaves in VendorBridge, from first RFQ to a paid invoice.</p>
          </motion.div>

          <div className="border-t border-[#C9C0A8]">
            {[
              { idx: "01", title: "Officer creates an RFQ", desc: "Specs, quantities and a deadline are set, and vendors are invited to quote." },
              { idx: "02", title: "Vendors submit quotations", desc: "Pricing, delivery timelines and notes come back into the same RFQ record." },
              { idx: "03", title: "Quotations are compared", desc: "The procurement team reviews all responses side by side before deciding." },
              { idx: "04", title: "Approval is requested", desc: "The selected quotation is routed to a manager for sign-off, with remarks." },
              { idx: "05", title: "Purchase order is generated", desc: "An approved quotation becomes a numbered PO, ready to send to the vendor." },
              { idx: "06", title: "Invoice is generated", desc: "Taxes and totals are calculated from the PO, with no re-entry of line items." },
              { idx: "07", title: "Invoice is printed or emailed", desc: "Sent directly from the record — as a PDF, by print, or straight to the vendor's inbox." },
              { idx: "08", title: "Activity is logged", desc: "Every step above is timestamped in the activity log, ready for audit or reporting." },
            ].map((step, i) => (
              <motion.div 
                key={step.idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="grid grid-cols-[50px_1fr] sm:grid-cols-[70px_1fr] gap-4 sm:gap-5 py-[22px] border-b border-[#C9C0A8] hover:pl-2 transition-all duration-300"
              >
                <span className="font-mono text-[13px] text-[#8A3223] pt-[2px]">{step.idx}</span>
                <div>
                  <h4 className="text-[16.5px] mb-[6px]">{step.title}</h4>
                  <p className="text-[13.5px] text-[#6b6349] max-w-[560px]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ROLES ---------- */}
      <section id="roles" className="py-24">
        <div className="wrap">
          <motion.div 
            className="max-w-[600px] mb-[52px]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          >
            <span className="eyebrow">Access</span>
            <h2 className="text-[clamp(26px,3.2vw,34px)] mt-[14px]">Four roles, four different queues</h2>
            <p className="text-[#6b6349] mt-[14px] text-[15px]">Nobody logs in to a dashboard built for someone else's job.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          >
            {[
              { num: "01", role: "Procurement Officer", items: ["Create RFQs", "Compare quotations", "Generate purchase orders", "Generate invoices"] },
              { num: "02", role: "Vendor", items: ["Submit quotations", "Track RFQ status", "View purchase orders"] },
              { num: "03", role: "Manager / Approver", items: ["Approve or reject requests", "Monitor procurement workflows"] },
              { num: "04", role: "Admin", items: ["Manage users", "Manage vendors", "View procurement analytics"] },
            ].map((roleCard) => (
              <motion.div 
                key={roleCard.num} 
                variants={fadeUp}
                className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-[24px_20px] relative hover:-translate-y-1 hover:shadow-[4px_4px_0_#231F16] transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[6px] before:bg-[repeating-linear-gradient(90deg,#231F16_0_8px,transparent_8px_16px)]"
              >
                <span className="font-mono text-[10.5px] text-[#8A3223] uppercase tracking-[0.06em] my-[12px] mb-[14px] block">Role · {roleCard.num}</span>
                <h3 className="text-[16.5px] mb-[14px]">{roleCard.role}</h3>
                <ul className="list-none text-[13px] text-[#6b6349] space-y-1">
                  {roleCard.items.map((item, i) => (
                    <li key={i} className="py-[6px] pl-[14px] relative border-t border-[#C9C0A8] first:border-t-0 before:content-['—'] before:absolute before:left-0 before:text-[#C9C0A8]">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="py-24 pb-32">
        <div className="wrap flex justify-between items-end flex-wrap gap-[28px] border-t-2 border-[#231F16] pt-[42px]">
          <h2 className="text-[clamp(28px,3.8vw,40px)] max-w-[540px]">See your own procurement trail, mocked up with real data.</h2>
          <div className="flex gap-[14px] flex-wrap">
            <a href="#" className="btn">Request a walkthrough</a>
            <a href="/login" className="btn-ghost btn">Sign in</a>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t-[1.5px] border-[#231F16] py-[34px]">
        <div className="wrap flex justify-between items-center flex-wrap gap-[14px] text-[12.5px] text-[#6b6349] font-mono">
          <div className="text-[14px] font-serif text-[#231F16] font-semibold">VendorBridge</div>
          <div>Procurement &amp; Vendor Management ERP</div>
        </div>
      </footer>
    </div>
  );
}
