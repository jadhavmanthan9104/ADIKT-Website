"use client"

import React, { useState } from "react"
import { Mail, Phone, MapPin, Check, Send } from "@/components/ui/Icons"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Customer Concierge</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          Contact Support
        </h1>
        <p className="text-xs text-zinc-400">
          Our customer service team is available Monday to Saturday, 10:00 AM – 7:00 PM IST.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Direct Channels</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 text-zinc-300">
                <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Concierge</p>
                  <p className="text-zinc-400">support@adiktclothing.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">WhatsApp / Call Support</p>
                  <p className="text-zinc-400">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Corporate Studio</p>
                  <p className="text-zinc-400">
                    ADIKT Apparel Works Pvt Ltd, Linking Road, Bandra West, Mumbai, Maharashtra 400050
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Send An Inquiry</h3>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-white uppercase">Message Dispatched</h4>
                <p className="text-xs text-zinc-400">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Our customer concierge team will respond within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">Order Reference # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ADKT-10492"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                    placeholder="How can we assist you regarding sizing, orders, or fabric specs?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
