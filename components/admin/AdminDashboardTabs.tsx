'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AdminPaymentsTable from '@/components/billing/AdminPaymentsTable';
import AdminShopierWebhookCard from '@/components/billing/AdminShopierWebhookCard';

export default function AdminDashboardTabs({
  users,
  loginLogs,
  payments,
  supportTickets,
}: {
  users: any[];
  loginLogs: any[];
  payments: any[];
  supportTickets: any[];
}) {
  const [activeTab, setActiveTab] = useState<'audit' | 'billing' | 'support'>('audit');

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-slate-200">
        <button
          className={`pb-2 text-sm font-medium ${activeTab === 'audit' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </button>
        <button
          className={`pb-2 text-sm font-medium ${activeTab === 'billing' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing Queue
        </button>
        <button
          className={`pb-2 text-sm font-medium ${activeTab === 'support' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('support')}
        >
          Support Tickets
        </button>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Comprehensive Login History</h2>
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Email</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Login At</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User ID</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Log ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loginLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                            No login logs found yet. Ensure the Postgres trigger is active.
                          </td>
                        </tr>
                      ) : (
                        loginLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{log.email}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(log.login_at).toLocaleString('tr-TR')}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{log.user_id}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">{log.id.split('-')[0]}...</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">User Accounts</h2>
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Email</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Account Created At</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Sign In At</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{u.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleString('tr-TR')}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('tr-TR') : 'Never'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Manual fallback mode: approve or reject unmatched Shopier payments when webhook matching cannot auto-map a user.
          </div>
          <AdminShopierWebhookCard />
          <AdminPaymentsTable initialPayments={payments} />
        </div>
      )}

      {activeTab === 'support' && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Support Tickets</h2>
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Email</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Message</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {supportTickets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                          No support tickets found.
                        </td>
                      </tr>
                    ) : (
                      supportTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{ticket.email}</td>
                          <td className="px-3 py-4 text-sm text-gray-500 whitespace-pre-wrap">{ticket.message}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(ticket.created_at).toLocaleString('tr-TR')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
