'use client';
import { Check, X, CreditCard, Receipt, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingSettings() {
  const billingHistory = [
    { date: "May 15, 2025", amount: "$9.99", status: "Paid" },
    { date: "May 15, 2025", amount: "$9.99", status: "Paid" },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        { text: "5 Quizzes", included: true },
        { text: "Basic Analytics", included: true },
        { text: "50 Student Limit", included: true },
        { text: "Custom Branding", included: false },
        { text: "Advanced Question Types", included: false },
      ],
      buttonText: "Current Plan",
      current: true,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/mo",
      features: [
        { text: "Unlimited Quizzes", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "500 Student Limit", included: true },
        { text: "Custom Branding", included: true },
        { text: "Advanced Question Types", included: true },
      ],
      buttonText: "Upgrade",
      popular: true,
      current: false,
    },
    {
      name: "Enterprise",
      price: "$12.99",
      period: "/mo",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Unlimited Access", included: true },
        { text: "API Access", included: true },
        { text: "Dedicated Support", included: true },
        { text: "Custom Integrations", included: true },
      ],
      buttonText: "Contact Sales",
      current: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Section: Subscription & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subscription Plan Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Subscription Plan</h2>
          <p className="text-muted-foreground text-sm font-medium mb-6">Manage your subscription and billing details</p>
          
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 relative overflow-hidden group transition-all hover:border-primary/50">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                Active
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Pro Plan</h3>
                <p className="text-muted-foreground text-xs font-medium">Your subscription renews on June 15, 2025</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Price</span>
                  <span className="text-foreground font-bold">$9.99 / month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Billing Cycle</span>
                  <span className="text-foreground font-bold">Monthly</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Payment Method</span>
                  <span className="text-foreground font-bold">•••• •••• •••• 4242</span>
                </div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <button className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-lg hover:bg-secondary transition cursor-pointer">
                  Change Plan
                </button>
                <button className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-lg hover:bg-secondary transition cursor-pointer">
                  Update Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Billing History</h2>
          <div className="mt-6 space-y-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground font-bold uppercase tracking-wider text-left border-b border-border">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {billingHistory.map((item, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 text-foreground font-medium">{item.date}</td>
                    <td className="py-4 text-foreground font-bold">{item.amount}</td>
                    <td className="py-4 text-right">
                      <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black text-[10px] uppercase">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="w-full py-2 mt-2 text-xs font-bold border border-border rounded-lg hover:bg-secondary transition flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer">
              <Receipt size={14} /> View All Invoices
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Plan Comparison */}
      <div className="rounded-sm border border-border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Plan Comparison</h2>
        <p className="text-muted-foreground text-sm font-medium mb-10">Compare available subscription plans</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={cn(
                "rounded-2xl p-6 border-2 flex flex-col transition-all duration-300 relative",
                plan.popular 
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                  : "border-border bg-background hover:border-primary/30"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                  Popular
                </div>
              )}
              
              <div className="mb-6">S
                <p className="text-sm  text-muted-foreground  tracking-widest">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>}
                </div>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <X size={16} className="text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      feature.included ? "text-foreground" : "text-muted-foreground/40"
                    )}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className={cn(
                "w-full py-3 rounded-xl text-sm font-black  tracking-widest transition-all active:scale-95 cursor-pointer",
                plan.popular 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90" 
                  : "bg-secondary text-foreground hover:bg-muted"
              )}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground font-medium pt-4">
        Need help with your account settings? <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span>
      </p>
    </div>
  );
}