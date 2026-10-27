/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import all local high-resolution photographic assets
import hospitalResortHero from './hospital_resort_hero_1793135535881.jpg';
import vipHospitalSuite from './vip_hospital_suite_1793135536901.jpg';
import hospitalIcuRoom from './hospital_icu_room_1793135537158.jpg';
import hospitalZenGarden from './hospital_zen_garden_1793135608049.jpg';
import doctorVietnameseMale from './doctor_vietnamese_male_1793135537764.jpg';
import doctorVietnameseFemale from './doctor_vietnamese_female_1793135574393.jpg';
import doctorInternationalMale from './doctor_international_male_1793135539236.jpg';
import doctorInternationalFemale from './doctor_international_female_1793135703359.jpg';
import seniorPatientPortrait from './senior_patient_portrait_1793135539108.jpg';
import patientFemalePortrait from './patient_female_portrait_1793135573934.jpg';

export const APP_IMAGES = {
  hospitalResortHero,
  vipHospitalSuite,
  hospitalIcuRoom,
  hospitalZenGarden,
  doctorVietnameseMale,
  doctorVietnameseFemale,
  doctorInternationalMale,
  doctorInternationalFemale,
  seniorPatientPortrait,
  patientFemalePortrait,
  // Default doctor and patient fallbacks
  defaultDoctor: doctorVietnameseMale,
  defaultDoctorFemale: doctorVietnameseFemale,
  defaultPatient: seniorPatientPortrait,
  defaultPatientFemale: patientFemalePortrait,
};

// Safe inline SVG placeholder if any image network error happens
export const SAFE_FALLBACK_AVATAR = 
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23005a54'%3E%3Crect width='100' height='100' rx='20' fill='%23e0f2f1'/%3E%3Ccircle cx='50' cy='38' r='20' fill='%23005a54'/%3E%3Cpath d='M20 85 C20 62 35 55 50 55 C65 55 80 62 80 85 Z' fill='%23005a54'/%3E%3C/svg%3E";

export default APP_IMAGES;
