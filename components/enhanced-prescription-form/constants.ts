// Constants and configuration for the enhanced prescription form

import { Heart, Brain, Activity, Scan, Radiation, Syringe } from "lucide-react";

// Dosage options
export const DOSAGE_OPTIONS = [
  { value: "250mg", label: "250 mg" },
  { value: "500mg", label: "500 mg" },
  { value: "750mg", label: "750 mg" },
  { value: "1000mg", label: "1000 mg" },
  { value: "5mg", label: "5 mg" },
  { value: "10mg", label: "10 mg" },
  { value: "20mg", label: "20 mg" },
  { value: "40mg", label: "40 mg" },
  { value: "50mcg", label: "50 mcg" },
  { value: "100mcg", label: "100 mcg" },
  { value: "5ml", label: "5 ml" },
  { value: "10ml", label: "10 ml" },
  { value: "custom", label: "Other (Custom)" },
];

// Import frequency and duration options from utility
import {
  getFrequencyOptions,
  getDurationOptions,
} from "@/lib/medicationTimingTranslations";

export const FREQUENCY_OPTIONS = getFrequencyOptions();
export const DURATION_OPTIONS = getDurationOptions();

// Physical exam categories
export const PHYSICAL_EXAM_CATEGORIES = [
  { id: "general", label: "General Examination", icon: "👤" },
  { id: "cardio", label: "Cardiovascular", icon: Heart },
  { id: "respiratory", label: "Respiratory", icon: Activity },
  { id: "neuro", label: "Neurological", icon: Brain },
  { id: "abdominal", label: "Abdominal", icon: Scan },
];

// System examination options with icons
export const SYSTEM_EXAM_OPTIONS = {
  cns: [
    { label: "CT Brain: Normal", icon: "🧠" },
    { label: "CT Brain: Acute findings present", icon: "⚠️" },
    { label: "MRI Brain: Normal", icon: "🧲" },
    { label: "MRI Brain: Abnormal signal/lesion", icon: "🚩" },
    { label: "EEG: Normal", icon: "📈" },
    { label: "EEG: Epileptiform activity", icon: "⚡" },
    { label: "Nerve Conduction Study: Normal", icon: "🔌" },
    { label: "Nerve Conduction Study: Abnormal", icon: "❗" },
    { label: "EMG: Normal", icon: "💪" },
    { label: "EMG: Myopathic/neuropathic changes", icon: "🦾" },
    { label: "CSF Analysis: Normal", icon: "🧪" },
    { label: "CSF Analysis: Abnormal", icon: "🚨" },
    { label: "Blood Tests: Within normal limits", icon: "🩸" },
    { label: "Blood Tests: Abnormal findings", icon: "📉" },
    { label: "Electrolytes: Normal", icon: "🧂" },
    { label: "Electrolytes: Imbalance detected", icon: "⚖️" },
    { label: "Vitamin B12 Level: Normal", icon: "💊" },
    { label: "Vitamin B12 Level: Deficient", icon: "⬇️" },
    { label: "Thyroid Function Tests: Normal", icon: "🦋" },
    { label: "Thyroid Function Tests: Abnormal", icon: "❌" },
    { label: "No significant abnormalities on investigations", icon: "✅" },
  ],

  cardiovascular: [
    { label: "Apex beat: Palpable and normal position", icon: "🫀" },
    { label: "Apex beat: Displaced", icon: "📍" },
    { label: "Precordial heave: Absent", icon: "➖" },
    { label: "Precordial heave: Present", icon: "✋" },
    { label: "Thrill: Absent", icon: "❌" },
    { label: "Thrill: Present", icon: "⚡" },
    { label: "Peripheral pulses: Normal volume", icon: "🫳" },
    { label: "Peripheral pulses: Bounding", icon: "📈" },
    { label: "Peripheral pulses: Weak", icon: "📉" },
    { label: "Peripheral pulses: Absent", icon: "🚫" },
    { label: "Radial pulse: Regular", icon: "🫲" },
    { label: "Radial pulse: Irregular", icon: "🔄" },
    { label: "Femoral pulse: Palpable", icon: "🦵" },
    { label: "Femoral pulse: Delayed or absent", icon: "⏳" },
    { label: "Temperature of extremities: Warm", icon: "🔥" },
    { label: "Temperature of extremities: Cold", icon: "❄️" },
    { label: "Edema: Absent on palpation", icon: "➖" },
    { label: "Edema: Pitting edema present", icon: "👇" },
    { label: "Tenderness: Absent", icon: "👍" },
    { label: "Tenderness: Present", icon: "⚠️" },
    { label: "No abnormal findings on palpation", icon: "✅" },
  ],

  respiratory: [
    { label: "Percussion note: Resonant", icon: "🥁" },
    { label: "Percussion note: Dull", icon: "🔇" },
    { label: "Percussion note: Stony dull", icon: "🪨" },
    { label: "Percussion note: Hyperresonant", icon: "📯" },
    { label: "Percussion note: Tympanic", icon: "🎶" },
    { label: "Percussion: Symmetrical bilaterally", icon: "⚖️" },
    { label: "Percussion: Asymmetrical", icon: "⚡" },
    { label: "Lung fields: Normal resonance", icon: "🫁" },
    { label: "Lung fields: Reduced resonance (basal)", icon: "⬇️" },
    { label: "Lung fields: Reduced resonance (apical)", icon: "⬆️" },
    { label: "Costophrenic angle: Resonant", icon: "📐" },
    { label: "Costophrenic angle: Dull", icon: "🚩" },
    { label: "Diaphragmatic excursion: Normal", icon: "↕️" },
    { label: "Diaphragmatic excursion: Reduced", icon: "⏬" },
    { label: "Percussion tenderness: Absent", icon: "➖" },
    { label: "Percussion tenderness: Present", icon: "⚠️" },
    { label: "No abnormal findings on percussion", icon: "✅" },
  ],

  gastrointestinal: [
    { label: "Auscultation: Bowel sounds normal", icon: "🔊" },
    { label: "Auscultation: Bowel sounds hyperactive", icon: "🔊🔊" },
    { label: "Auscultation: Bowel sounds hypoactive", icon: "🔈" },
    { label: "Auscultation: Bowel sounds absent", icon: "🔇" },
    { label: "Auscultation: Bruits absent", icon: "✅" },
    { label: "Auscultation: Bruits present", icon: "⚠️" },
    { label: "Auscultation: Venous hum absent", icon: "✅" },
    { label: "Auscultation: Venous hum present", icon: "🎵" },
    { label: "Auscultation: Friction rub absent", icon: "✅" },
    { label: "Auscultation: Friction rub present", icon: "🌀" },
    { label: "Auscultation: Liver span normal", icon: "🫄" },
    { label: "Auscultation: Liver span increased", icon: "⬆️" },
    { label: "Auscultation: Spleen sounds normal", icon: "✅" },
    { label: "Auscultation: Spleen sounds increased", icon: "⬆️" },
    { label: "Auscultation: Kidneys normal", icon: "✅" },
    { label: "Auscultation: Kidney bruit present", icon: "🎵" },
    { label: "No abnormal findings on auscultation", icon: "✅" },
  ],

  other: [
    { label: "Skin: Normal", icon: "👤" },
    { label: "Skin: Pale", icon: "🫛" },
    { label: "Skin: Jaundiced", icon: "🟡" },
    { label: "Skin: Cyanosed", icon: "🔵" },
    { label: "Skin: Rash present", icon: "🔴" },
    { label: "Lymph nodes: Not palpable", icon: "✅" },
    { label: "Lymph nodes: Palpable", icon: "🤚" },
    { label: "Lymph nodes: Tender", icon: "⚠️" },
    { label: "Thyroid: Not palpable", icon: "✅" },
    { label: "Thyroid: Palpable", icon: "🤚" },
    { label: "Thyroid: Enlarged", icon: "🔄" },
    { label: "Thyroid: Tender", icon: "⚠️" },
    { label: "Musculoskeletal: Normal", icon: "🦴" },
    { label: "Musculoskeletal: Joint swelling", icon: "🦴🔄" },
    { label: "Musculoskeletal: Limited range of motion", icon: "🦴🔒" },
    { label: "Musculoskeletal: Tenderness present", icon: "⚠️" },
    { label: "Genitourinary: Normal", icon: "✅" },
    { label: "Genitourinary: Abnormal findings", icon: "⚠️" },
    { label: "No abnormal findings on general examination", icon: "✅" },
  ],
};
