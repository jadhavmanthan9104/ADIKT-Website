"use client"

import React, { useState, useEffect } from "react"
import { Mail, Phone, MapPin, Check, Send, Clock, ShieldCheck } from "@/components/ui/Icons"
import { contentStore, AdminContentItem } from "@/lib/content-store"

export default function ContactPage() {
  const [content, setContent] = useState<AdminContentItem>(contentStore.getContent())
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) setContent(data.content)
      })
      .catch(() => {})

    return contentStore.subscribe(() => {
      setContent(contentStore.getContent())
    })
  }, [])

  const contact = content.pages?.contact || {
    title: "Contact Concierge",
    subtitle: "Our customer service team is available Monday to Saturday, 10:00 AM – 7:00 PM IST.",
    email: "support@adiktclothing.com",
    phone: "+91 98765 43210",
    address: "ADIKT Apparel Works Pvt Ltd, Linking Road, Bandra West, Mumbai, MH 400050",
    hours: "Mon – Sat: 10:00 AM – 7:00 PM IST",
    responseTime: "Within 2 to 4 business hours",
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Customer Concierge</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
          {contact.title}
        </h1>
        <p className="text-xs text-zinc-400">
          {contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Direct Channels</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 text-zinc-300">
                <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Concierge</p>
                  <p className="text-zinc-400 font-mono">{contact.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">WhatsApp & Phone Support</p>
                  <p className="text-zinc-400 font-mono">{contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Corporate Studio</p>
                  <p className="text-zinc-400 leading-relaxed">{contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300 border-t border-zinc-800/80 pt-3">
                <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Operational Hours</p>
                  <p className="text-zinc-400">{contact.hours}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">⚡ Response time: {contact.responseTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase">Inquiry Received</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Our concierge team has received your message and will respond via email or WhatsApp within 2–4 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-accent hover:underline font-bold pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Send Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 font-medium">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    placeholder="e.g. ADIKT-78291"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can our garment specialist assist you?"
                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
