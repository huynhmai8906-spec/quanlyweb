/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NavigationTab,
  Patient,
  Doctor,
  MedicationItem,
  Prescription,
  RoomBed,
  Ambulance,
  ToastMessage,
} from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_MEDICATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ROOMS,
  INITIAL_AMBULANCES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { PharmacyView } from './components/PharmacyView';
import { DoctorsView } from './components/DoctorsView';
import { TelehealthView } from './components/TelehealthView';
import { RoomsView } from './components/RoomsView';
import { EmergencyView } from './components/EmergencyView';
import { ApiGatewayView } from './components/ApiGatewayView';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [rooms, setRooms] = useState<RoomBed[]>(INITIAL_ROOMS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast dispatch helper
  const addToast = (title: string, description: string, type: ToastMessage['type'] = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1-Click Patient Addition
  const handleAddPatient = (newPat: Patient) => {
    setPatients((prev) => [newPat, ...prev]);
    addToast(
      'Tiếp Nhận Bệnh Nhân Thành Công!',
      `Hồ sơ EHR ${newPat.id} (${newPat.name}) đã được khởi tạo và phát bản tin HL7 ADT^A01.`,
      'success'
    );
  };

  // 1-Click Doctor Addition
  const handleAddDoctor = (newDoc: Doctor) => {
    setDoctors((prev) => [newDoc, ...prev]);
    addToast(
      'Thêm Cố Vấn Y Khoa Thành Công!',
      `Bác sĩ ${newDoc.name} đã được cập nhật vào danh sách Hội đồng và phân bổ lịch trực.`,
      'success'
    );
  };

  // 1-Click Prescription Status Switcher
  const handleTogglePrescriptionStatus = (rxId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === rxId) {
          const isDelivered = rx.deliveryStatus === 'Đã Giao Bệnh Nhân';
          const newStatus = isDelivered ? 'Đang Vận Chuyển' : 'Đã Giao Bệnh Nhân';
          const newTime = isDelivered
            ? 'Đang vận chuyển lên phòng bệnh'
            : `Đã ký nhận lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

          addToast(
            isDelivered ? 'Cập Nhật Trạng Thái Đơn Thuốc' : 'Đã Giao Thuốc Thành Công!',
            `Đơn ${rx.rxCode} cho bệnh nhân ${rx.patientName} (${rx.room}): ${newStatus}.`,
            isDelivered ? 'warning' : 'success'
          );

          return {
            ...rx,
            deliveryStatus: newStatus,
            deliveryTime: newTime,
          };
        }
        return rx;
      })
    );
  };

  // Create Prescription & Deduct Inventory Stock
  const handleCreatePrescription = (newRx: Prescription) => {
    setPrescriptions((prev) => [newRx, ...prev]);

    // Deduct stock
    newRx.drugs.forEach((drug) => {
      setMedications((prev) =>
        prev.map((m) => {
          if (m.name.includes(drug.name) || drug.name.includes(m.name)) {
            const updatedStock = Math.max(0, m.stock - drug.quantity);
            return { ...m, stock: updatedStock };
          }
          return m;
        })
      );
    });

    addToast(
      'Bắn API & Đẩy Đơn Thành Công!',
      `Đơn ${newRx.rxCode} đã được chuyển tới hệ thống Robot phân phối kho dược trung tâm.`,
      'success'
    );
  };

  // Restock Medication
  const handleRestockMedication = (medId: string, addedStock: number) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const newStock = m.stock + addedStock;
          addToast(
            'Nhập Kho Thành Công!',
            `Đã nhập thêm ${addedStock} ${m.unit} cho mặt hàng: ${m.name}. Tồn kho mới: ${newStock}.`,
            'success'
          );
          return { ...m, stock: newStock };
        }
        return m;
      })
    );
  };

  // Room update
  const handleUpdateRoom = (updatedRoom: RoomBed) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  // Emergency Golden Hour Trigger
  const handleTriggerEmergency = () => {
    setCurrentTab('emergency');
    addToast(
      'BÁO ĐỘNG ĐỎ CẤP CỨU 115',
      'Đã kích hoạt toàn bộ kíp phản ứng nhanh và khởi động thuật toán Dijkstra tìm lộ trình cứu thương tối ưu.',
      'emergency'
    );
  };

  // Global search filtering
  const handleGlobalSearch = (query: string) => {
    if (!query) return;
    const lower = query.toLowerCase();

    // Check if matches a patient
    const matchedPatient = patients.find(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower) ||
        p.cccd.includes(lower)
    );
    if (matchedPatient) {
      setSelectedPatientId(matchedPatient.id);
      setCurrentTab('patients');
      return;
    }

    // Check if matches a medication
    const matchedMed = medications.find(
      (m) => m.name.toLowerCase().includes(lower) || m.activeIngredient.toLowerCase().includes(lower)
    );
    if (matchedMed) {
      setCurrentTab('pharmacy');
      return;
    }

    // Check if matches a doctor
    const matchedDoc = doctors.find((d) => d.name.toLowerCase().includes(lower));
    if (matchedDoc) {
      setCurrentTab('doctors');
      return;
    }
  };

  const pendingRxCount = prescriptions.filter(
    (p) => p.deliveryStatus === 'Đang Vận Chuyển' || p.deliveryStatus === 'Đang Chuẩn Bị'
  ).length;

  return (
    <div className="min-h-screen bg-surface flex text-on-surface">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        patientCount={patients.length}
        pendingRxCount={pendingRxCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 pl-72 flex flex-col min-w-0">
        <TopHeader
          currentTab={currentTab}
          onNavigateTab={setCurrentTab}
          onSearch={handleGlobalSearch}
          onTriggerEmergency={handleTriggerEmergency}
        />

        <main className="flex-1 pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              patients={patients}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setCurrentTab('patients');
              }}
              pendingRxCount={pendingRxCount}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onAddPatient={handleAddPatient}
              onNavigateToPharmacy={(patId) => {
                setSelectedPatientId(patId);
                setCurrentTab('pharmacy');
              }}
              onNavigateToTelehealth={(patId) => {
                setSelectedPatientId(patId);
                setCurrentTab('telehealth');
              }}
            />
          )}

          {currentTab === 'pharmacy' && (
            <PharmacyView
              medications={medications}
              prescriptions={prescriptions}
              patients={patients}
              onTogglePrescriptionStatus={handleTogglePrescriptionStatus}
              onCreatePrescription={handleCreatePrescription}
              onRestockMedication={handleRestockMedication}
            />
          )}

          {currentTab === 'doctors' && (
            <DoctorsView
              doctors={doctors}
              onAddDoctor={handleAddDoctor}
              onConsultDoctor={(docId) => {
                setCurrentTab('telehealth');
              }}
            />
          )}

          {currentTab === 'telehealth' && (
            <TelehealthView
              patients={patients}
              doctors={doctors}
              selectedPatientId={selectedPatientId}
              onTriggerToast={(title, desc, type) => addToast(title, desc, type)}
            />
          )}

          {currentTab === 'rooms' && (
            <RoomsView
              rooms={rooms}
              onUpdateRoom={handleUpdateRoom}
              onNavigateToPatientEhr={(patientId) => {
                setSelectedPatientId(patientId);
                setCurrentTab('patients');
              }}
            />
          )}

          {currentTab === 'emergency' && (
            <EmergencyView
              ambulances={ambulances}
              onTriggerToast={(title, desc, type) => addToast(title, desc, type)}
            />
          )}

          {currentTab === 'api_gateway' && (
            <ApiGatewayView
              onTriggerToast={(title, desc, type) => addToast(title, desc, type)}
            />
          )}
        </main>
      </div>

      {/* Global Toast Container */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
