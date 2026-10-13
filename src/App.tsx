import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { PublicBookingView } from './components/PublicBookingView';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { ContractsView } from './components/ContractsView';
import { ClientAccountsView } from './components/ClientAccountsView';
import { AppointmentsView } from './components/AppointmentsView';
import { LegalToolsView } from './components/LegalToolsView';
import {
  INITIAL_CASES,
  INITIAL_CONTRACTS,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
} from './data/initialData';
import { CaseItem, ContractItem, ClientAccount, Appointment, AuthSession } from './types';
import { getDaysRemaining } from './utils/dateHelpers';

export default function App() {
  // Authentication session (Admin role only for backoffice)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('smartech_auth_session');
    if (saved) {
      try {
        const parsed: AuthSession = JSON.parse(saved);
        return parsed.role === 'admin';
      } catch {
        return false;
      }
    }
    return localStorage.getItem('smartech_auth_token') === 'logged_in_admin';
  });

  // Admin login modal open state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Current Navigation Tab for Admin
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data States with localStorage persistence
  const [cases, setCases] = useState<CaseItem[]>(() => {
    const saved = localStorage.getItem('smartech_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [contracts, setContracts] = useState<ContractItem[]>(() => {
    const saved = localStorage.getItem('smartech_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [clients, setClients] = useState<ClientAccount[]>(() => {
    const saved = localStorage.getItem('smartech_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('smartech_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('smartech_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('smartech_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('smartech_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('smartech_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Handle Admin Logout
  const handleLogout = () => {
    localStorage.removeItem('smartech_auth_session');
    localStorage.removeItem('smartech_auth_token');
    setIsAdminLoggedIn(false);
  };

  // Urgent contracts count (<= 30 days and >= 0)
  const urgentRenewalsCount = contracts.filter((c) => {
    const days = getDaysRemaining(c.endDate);
    return days >= 0 && days <= 30;
  }).length;

  // Handlers for Cases
  const handleAddCase = (newCase: CaseItem) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const handleUpdateCase = (updatedCase: CaseItem) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
  };

  // Handlers for Contracts
  const handleAddContract = (newContract: ContractItem) => {
    setContracts((prev) => [newContract, ...prev]);
  };

  const handleUpdateContract = (updatedContract: ContractItem) => {
    setContracts((prev) => prev.map((c) => (c.id === updatedContract.id ? updatedContract : c)));
  };

  // Handlers for Clients
  const handleAddClient = (newClient: ClientAccount) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: ClientAccount) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  // Handlers for Appointments
  const handleAddAppointment = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev]);
  };

  const handleUpdateAppointment = (updatedApp: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  // 1. If NOT logged in as Admin: Show Clients the Public Appointment Booking Screen Only!
  // Linked to WhatsApp 01003676300 with zero access to cases, contracts or finances.
  if (!isAdminLoggedIn) {
    return (
      <>
        <PublicBookingView
          onBookAppointment={handleAddAppointment}
          onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        />

        {/* Modal for Admin Login (admin / 123) */}
        <LoginScreen
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(session) => {
            if (session.role === 'admin') {
              setIsAdminLoggedIn(true);
              setIsLoginModalOpen(false);
            }
          }}
        />
      </>
    );
  }

  // 2. If logged in as Admin: Full Law Firm Management System
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex flex-col font-sans selection:bg-[#00F0FF]/20 selection:text-[#00F0FF]">
      {/* Navigation Header */}
      <Navbar
        role="admin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        urgentRenewalsCount={urgentRenewalsCount}
        onLogout={handleLogout}
      />

      {/* Main View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            cases={cases}
            contracts={contracts}
            clients={clients}
            appointments={appointments}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewCaseModal={() => setActiveTab('cases')}
            onOpenNewContractModal={() => setActiveTab('contracts')}
            onOpenNewAppointmentModal={() => setActiveTab('appointments')}
          />
        )}

        {activeTab === 'cases' && (
          <CasesView
            cases={cases}
            onAddCase={handleAddCase}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            onAddContract={handleAddContract}
            onUpdateContract={handleUpdateContract}
          />
        )}

        {activeTab === 'accounts' && (
          <ClientAccountsView
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
          />
        )}

        {activeTab === 'tools' && <LegalToolsView />}
      </main>

      {/* System Copyright Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0E1A] py-4 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400">
            مكتب أ. عمرو طنطاوي للمحاماة والاستشارات القانونية · واتساب: <strong className="text-emerald-400 font-en">01003676300</strong>
          </span>
          <span className="flex items-center gap-2 flex-wrap justify-center text-slate-400">
            <span>جميع الحقوق محفوظة لـ <strong className="text-slate-200 font-bold">د. هبه سعيد عبدالله</strong></span>
            <span className="text-slate-600">|</span>
            <span>ايميل: <a href="mailto:heba.wafa2@gmail.com" className="text-cyan-300 font-en hover:underline">heba.wafa2@gmail.com</a></span>
            <span className="text-slate-600">|</span>
            <span>موبايل: <a href="tel:01098888773" className="text-cyan-300 font-en hover:underline" dir="ltr">01098888773</a></span>
          </span>
        </div>
      </footer>
    </div>
  );
}
