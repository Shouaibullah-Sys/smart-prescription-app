// Test and Imaging database - English only
// service/testDatabaseService.ts
export interface Test {
  id: string;
  name: string;
  category: string[];
  type: "Laboratory" | "Imaging" | "Special Test" | "Procedure";
  preparation?: string[];
  fasting_required?: boolean;
  description?: string;
  normal_range?: string;
  popular_score: number;
  insurance_coverage?: boolean;
  cost_estimate?: number;
  turnaround_time?: string;
  sample_type?: string;
}

export class TestDatabase {
  private tests: Test[] = [
    // Laboratory Tests - Blood Tests
    {
      id: "test001",
      name: "Complete Blood Count (CBC)",
      category: ["Blood Test", "Hematology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description:
        "Measures different components of blood including red cells, white cells, and platelets",
      normal_range: "Varies by parameter",
      popular_score: 95,
    },
    {
      id: "test002",
      name: "Basic Metabolic Panel (BMP)",
      category: ["Blood Test", "Chemistry"],
      type: "Laboratory",
      preparation: ["Fasting for 8-12 hours"],
      fasting_required: true,
      description: "Measures glucose, calcium, and electrolytes",
      normal_range: "Varies by parameter",
      popular_score: 90,
    },
    {
      id: "test003",
      name: "Comprehensive Metabolic Panel (CMP)",
      category: ["Blood Test", "Chemistry"],
      type: "Laboratory",
      preparation: ["Fasting for 8-12 hours"],
      fasting_required: true,
      description:
        "Measures liver function, kidney function, and electrolyte balance",
      normal_range: "Varies by parameter",
      popular_score: 88,
    },
    {
      id: "test004",
      name: "Lipid Profile",
      category: ["Blood Test", "Cardiology"],
      type: "Laboratory",
      preparation: ["Fasting for 9-12 hours"],
      fasting_required: true,
      description: "Measures cholesterol and triglyceride levels",
      normal_range: "Total cholesterol: <200 mg/dL",
      popular_score: 85,
    },
    {
      id: "test005",
      name: "Fasting Blood Glucose",
      category: ["Blood Test", "Endocrinology"],
      type: "Laboratory",
      preparation: ["Fasting for 8-12 hours"],
      fasting_required: true,
      description: "Measures blood sugar levels after fasting",
      normal_range: "70-100 mg/dL",
      popular_score: 87,
    },
    {
      id: "test006",
      name: "HbA1c (Hemoglobin A1c)",
      category: ["Blood Test", "Endocrinology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures average blood sugar levels over 2-3 months",
      normal_range: "Below 5.7%",
      popular_score: 83,
    },
    {
      id: "test007",
      name: "Thyroid Stimulating Hormone (TSH)",
      category: ["Blood Test", "Endocrinology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures thyroid function",
      normal_range: "0.4-4.0 mIU/L",
      popular_score: 80,
    },
    {
      id: "test008",
      name: "Liver Function Tests (LFT)",
      category: ["Blood Test", "Hepatology"],
      type: "Laboratory",
      preparation: ["Avoid alcohol for 24 hours"],
      fasting_required: false,
      description: "Measures enzymes and proteins produced by the liver",
      normal_range: "Varies by parameter",
      popular_score: 82,
    },
    {
      id: "test009",
      name: "Kidney Function Tests (KFT)",
      category: ["Blood Test", "Nephrology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures creatinine and blood urea nitrogen",
      normal_range: "Creatinine: 0.6-1.2 mg/dL",
      popular_score: 78,
    },
    {
      id: "test010",
      name: "C-Reactive Protein (CRP)",
      category: ["Blood Test", "Inflammation"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures inflammation in the body",
      normal_range: "<3.0 mg/L",
      popular_score: 75,
    },
    {
      id: "test011",
      name: "Vitamin D (25-OH)",
      category: ["Blood Test", "Vitamin"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures vitamin D levels",
      normal_range: "30-100 ng/mL",
      popular_score: 77,
    },
    {
      id: "test012",
      name: "Vitamin B12",
      category: ["Blood Test", "Vitamin"],
      type: "Laboratory",
      preparation: ["Fasting for 8 hours"],
      fasting_required: true,
      description: "Measures vitamin B12 levels",
      normal_range: "200-900 pg/mL",
      popular_score: 74,
    },
    {
      id: "test013",
      name: "Folate (Folic Acid)",
      category: ["Blood Test", "Vitamin"],
      type: "Laboratory",
      preparation: ["Fasting for 8 hours"],
      fasting_required: true,
      description: "Measures folate levels",
      normal_range: "3-20 ng/mL",
      popular_score: 72,
    },
    {
      id: "test014",
      name: "Iron Studies",
      category: ["Blood Test", "Hematology"],
      type: "Laboratory",
      preparation: ["Fasting for 12 hours"],
      fasting_required: true,
      description: "Measures iron, ferritin, and transferrin",
      normal_range: "Varies by parameter",
      popular_score: 73,
    },
    {
      id: "test015",
      name: "Prostate Specific Antigen (PSA)",
      category: ["Blood Test", "Oncology"],
      type: "Laboratory",
      preparation: ["Avoid exercise for 48 hours"],
      fasting_required: false,
      description: "Screens for prostate cancer",
      normal_range: "<4.0 ng/mL",
      popular_score: 76,
    },
    {
      id: "test016",
      name: "CA-125",
      category: ["Blood Test", "Oncology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Tumor marker for ovarian cancer",
      normal_range: "<35 U/mL",
      popular_score: 70,
    },
    {
      id: "test017",
      name: "CEA (Carcinoembryonic Antigen)",
      category: ["Blood Test", "Oncology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Tumor marker for colorectal cancer",
      normal_range: "<3.0 ng/mL (non-smokers)",
      popular_score: 68,
    },
    {
      id: "test018",
      name: "Troponin I",
      category: ["Blood Test", "Cardiology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures heart muscle damage",
      normal_range: "<0.04 ng/mL",
      popular_score: 79,
    },
    {
      id: "test019",
      name: "BNP (B-type Natriuretic Peptide)",
      category: ["Blood Test", "Cardiology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Measures heart failure marker",
      normal_range: "<100 pg/mL",
      popular_score: 74,
    },
    {
      id: "test020",
      name: "D-dimer",
      category: ["Blood Test", "Hematology"],
      type: "Laboratory",
      preparation: ["None required"],
      fasting_required: false,
      description: "Screens for blood clots",
      normal_range: "<500 ng/mL",
      popular_score: 72,
    },

    // Laboratory Tests - Urine Tests
    {
      id: "test021",
      name: "Complete Urinalysis",
      category: ["Urine Test", "Nephrology"],
      type: "Laboratory",
      preparation: ["Clean catch midstream sample"],
      fasting_required: false,
      description: "Comprehensive analysis of urine",
      normal_range: "Normal findings vary",
      popular_score: 85,
    },
    {
      id: "test022",
      name: "Urine Culture",
      category: ["Urine Test", "Microbiology"],
      type: "Laboratory",
      preparation: ["Clean catch midstream sample"],
      fasting_required: false,
      description: "Tests for bacterial infection in urine",
      normal_range: "No growth",
      popular_score: 78,
    },
    {
      id: "test023",
      name: "24-Hour Urine Protein",
      category: ["Urine Test", "Nephrology"],
      type: "Laboratory",
      preparation: ["Collect all urine for 24 hours"],
      fasting_required: false,
      description: "Measures protein in urine over 24 hours",
      normal_range: "<150 mg/24 hours",
      popular_score: 70,
    },
    {
      id: "test024",
      name: "Urine Drug Screen",
      category: ["Urine Test", "Toxicology"],
      type: "Laboratory",
      preparation: ["Provide supervised sample"],
      fasting_required: false,
      description: "Tests for presence of drugs",
      normal_range: "Negative",
      popular_score: 65,
    },

    // Laboratory Tests - Stool Tests
    {
      id: "test025",
      name: "Stool Occult Blood",
      category: ["Stool Test", "Gastroenterology"],
      type: "Laboratory",
      preparation: ["Avoid certain foods and medications"],
      fasting_required: false,
      description: "Tests for hidden blood in stool",
      normal_range: "Negative",
      popular_score: 73,
    },
    {
      id: "test026",
      name: "Stool Culture",
      category: ["Stool Test", "Microbiology"],
      type: "Laboratory",
      preparation: ["Collect fresh stool sample"],
      fasting_required: false,
      description: "Tests for bacterial infections",
      normal_range: "No pathogenic bacteria",
      popular_score: 68,
    },
    {
      id: "test027",
      name: "Ova and Parasites",
      category: ["Stool Test", "Microbiology"],
      type: "Laboratory",
      preparation: ["Collect fresh stool sample"],
      fasting_required: false,
      description: "Tests for parasitic infections",
      normal_range: "No parasites seen",
      popular_score: 66,
    },

    // Imaging Tests - X-Ray
    {
      id: "test028",
      name: "Chest X-ray",
      category: ["Imaging", "Radiology"],
      type: "Imaging",
      preparation: ["Remove jewelry and metal objects"],
      fasting_required: false,
      description: "Imaging of chest organs",
      normal_range: "Normal lung fields",
      popular_score: 92,
    },
    {
      id: "test029",
      name: "Abdominal X-ray",
      category: ["Imaging", "Radiology"],
      type: "Imaging",
      preparation: ["Remove metal objects"],
      fasting_required: false,
      description: "Imaging of abdominal organs",
      normal_range: "Normal bowel gas pattern",
      popular_score: 75,
    },
    {
      id: "test030",
      name: "Bone X-ray",
      category: ["Imaging", "Orthopedics"],
      type: "Imaging",
      preparation: ["Remove jewelry and metal objects"],
      fasting_required: false,
      description: "Imaging of bones",
      normal_range: "Normal bone structure",
      popular_score: 80,
    },

    // Imaging Tests - CT Scan
    {
      id: "test031",
      name: "CT Scan Brain",
      category: ["Imaging", "Neurology"],
      type: "Imaging",
      preparation: ["Remove metal objects", "May require contrast"],
      fasting_required: true,
      description: "Detailed brain imaging",
      normal_range: "Normal brain anatomy",
      popular_score: 85,
    },
    {
      id: "test032",
      name: "CT Scan Chest",
      category: ["Imaging", "Pulmonology"],
      type: "Imaging",
      preparation: ["Remove metal objects", "May require contrast"],
      fasting_required: true,
      description: "Detailed chest imaging",
      normal_range: "Normal lung and heart",
      popular_score: 83,
    },
    {
      id: "test033",
      name: "CT Scan Abdomen",
      category: ["Imaging", "Gastroenterology"],
      type: "Imaging",
      preparation: ["Remove metal objects", "May require contrast"],
      fasting_required: true,
      description: "Detailed abdominal imaging",
      normal_range: "Normal abdominal organs",
      popular_score: 82,
    },
    {
      id: "test034",
      name: "CT Angiography",
      category: ["Imaging", "Cardiology"],
      type: "Imaging",
      preparation: ["Remove metal objects", "Contrast required"],
      fasting_required: true,
      description: "Imaging of blood vessels",
      normal_range: "Normal vessel anatomy",
      popular_score: 78,
    },

    // Imaging Tests - MRI
    {
      id: "test035",
      name: "MRI Brain",
      category: ["Imaging", "Neurology"],
      type: "Imaging",
      preparation: ["Remove all metal objects"],
      fasting_required: false,
      description: "Detailed brain imaging using magnetic fields",
      normal_range: "Normal brain anatomy",
      popular_score: 87,
    },
    {
      id: "test036",
      name: "MRI Spine",
      category: ["Imaging", "Orthopedics"],
      type: "Imaging",
      preparation: ["Remove all metal objects"],
      fasting_required: false,
      description: "Detailed spinal imaging",
      normal_range: "Normal spine anatomy",
      popular_score: 81,
    },
    {
      id: "test037",
      name: "MRI Knee",
      category: ["Imaging", "Orthopedics"],
      type: "Imaging",
      preparation: ["Remove all metal objects"],
      fasting_required: false,
      description: "Detailed knee joint imaging",
      normal_range: "Normal knee anatomy",
      popular_score: 76,
    },
    {
      id: "test038",
      name: "MRI Breast",
      category: ["Imaging", "Oncology"],
      type: "Imaging",
      preparation: ["Remove all metal objects"],
      fasting_required: false,
      description: "Detailed breast imaging",
      normal_range: "Normal breast tissue",
      popular_score: 74,
    },

    // Imaging Tests - Ultrasound
    {
      id: "test039",
      name: "Abdominal Ultrasound",
      category: ["Imaging", "Gastroenterology"],
      type: "Imaging",
      preparation: ["Fasting for 8-12 hours"],
      fasting_required: true,
      description: "Sound wave imaging of abdominal organs",
      normal_range: "Normal organ size and texture",
      popular_score: 86,
    },
    {
      id: "test040",
      name: "Pelvic Ultrasound",
      category: ["Imaging", "Gynecology"],
      type: "Imaging",
      preparation: ["Full bladder may be required"],
      fasting_required: false,
      description: "Sound wave imaging of pelvic organs",
      normal_range: "Normal pelvic anatomy",
      popular_score: 80,
    },
    {
      id: "test041",
      name: "Pregnancy Ultrasound",
      category: ["Imaging", "Obstetrics"],
      type: "Imaging",
      preparation: ["Full bladder may be required"],
      fasting_required: false,
      description: "Imaging of developing fetus",
      normal_range: "Normal fetal development",
      popular_score: 88,
    },
    {
      id: "test042",
      name: "Echocardiogram",
      category: ["Imaging", "Cardiology"],
      type: "Imaging",
      preparation: ["None required"],
      fasting_required: false,
      description: "Ultrasound of the heart",
      normal_range: "Normal heart function",
      popular_score: 84,
    },
    {
      id: "test043",
      name: "Carotid Ultrasound",
      category: ["Imaging", "Neurology"],
      type: "Imaging",
      preparation: ["None required"],
      fasting_required: false,
      description: "Ultrasound of neck arteries",
      normal_range: "Normal blood flow",
      popular_score: 73,
    },
    {
      id: "test044",
      name: "Doppler Ultrasound",
      category: ["Imaging", "Vascular"],
      type: "Imaging",
      preparation: ["None required"],
      fasting_required: false,
      description: "Blood flow imaging",
      normal_range: "Normal blood flow patterns",
      popular_score: 71,
    },

    // Imaging Tests - Nuclear Medicine
    {
      id: "test045",
      name: "Bone Scan",
      category: ["Imaging", "Nuclear Medicine"],
      type: "Imaging",
      preparation: ["Drink plenty of fluids"],
      fasting_required: false,
      description: "Nuclear imaging of bones",
      normal_range: "No abnormal uptake",
      popular_score: 69,
    },
    {
      id: "test046",
      name: "Thyroid Scan",
      category: ["Imaging", "Nuclear Medicine"],
      type: "Imaging",
      preparation: ["May need to stop thyroid medications"],
      fasting_required: false,
      description: "Nuclear imaging of thyroid",
      normal_range: "Normal thyroid uptake",
      popular_score: 67,
    },
    {
      id: "test047",
      name: "Stress Test (Exercise ECG)",
      category: ["Imaging", "Cardiology"],
      type: "Imaging",
      preparation: ["Avoid caffeine for 24 hours"],
      fasting_required: true,
      description: "Heart function during exercise",
      normal_range: "Normal heart rate response",
      popular_score: 77,
    },

    // Special Tests - Endoscopy
    {
      id: "test048",
      name: "Upper Endoscopy (EGD)",
      category: ["Special Test", "Gastroenterology"],
      type: "Special Test",
      preparation: ["Fasting for 8 hours", "Sedation required"],
      fasting_required: true,
      description: "Visual examination of esophagus and stomach",
      normal_range: "Normal mucosa",
      popular_score: 79,
    },
    {
      id: "test049",
      name: "Colonoscopy",
      category: ["Special Test", "Gastroenterology"],
      type: "Special Test",
      preparation: ["Bowel prep required", "Sedation required"],
      fasting_required: true,
      description: "Visual examination of colon",
      normal_range: "Normal colon mucosa",
      popular_score: 83,
    },
    {
      id: "test050",
      name: "Sigmoidoscopy",
      category: ["Special Test", "Gastroenterology"],
      type: "Special Test",
      preparation: ["Bowel prep may be required"],
      fasting_required: false,
      description: "Visual examination of lower colon",
      normal_range: "Normal rectal and sigmoid mucosa",
      popular_score: 72,
    },

    // Special Tests - Cardiac Tests
    {
      id: "test051",
      name: "Electrocardiogram (ECG/EKG)",
      category: ["Special Test", "Cardiology"],
      type: "Special Test",
      preparation: ["Avoid exercise before test"],
      fasting_required: false,
      description: "Records electrical activity of heart",
      normal_range: "Normal heart rhythm",
      popular_score: 89,
    },
    {
      id: "test052",
      name: "Holter Monitor",
      category: ["Special Test", "Cardiology"],
      type: "Special Test",
      preparation: ["Shower before application"],
      fasting_required: false,
      description: "24-hour heart rhythm monitoring",
      normal_range: "Normal heart rhythm throughout day",
      popular_score: 74,
    },
    {
      id: "test053",
      name: "Cardiac Catheterization",
      category: ["Special Test", "Cardiology"],
      type: "Special Test",
      preparation: ["Fasting for 8 hours", "Contrast required"],
      fasting_required: true,
      description: " Invasive heart imaging",
      normal_range: "Normal coronary arteries",
      popular_score: 76,
    },

    // Special Tests - Pulmonary Tests
    {
      id: "test054",
      name: "Pulmonary Function Test (PFT)",
      category: ["Special Test", "Pulmonology"],
      type: "Special Test",
      preparation: ["Avoid smoking for 4 hours"],
      fasting_required: false,
      description: "Measures lung function",
      normal_range: "Normal lung volumes",
      popular_score: 75,
    },
    {
      id: "test055",
      name: "Peak Flow Test",
      category: ["Special Test", "Pulmonology"],
      type: "Special Test",
      preparation: ["Avoid tight clothing"],
      fasting_required: false,
      description: "Measures how fast you can exhale",
      normal_range: "Varies by age and height",
      popular_score: 68,
    },

    // Special Tests - Neurological Tests
    {
      id: "test056",
      name: "EEG (Electroencephalogram)",
      category: ["Special Test", "Neurology"],
      type: "Special Test",
      preparation: ["Avoid caffeine for 8 hours"],
      fasting_required: false,
      description: "Records brain electrical activity",
      normal_range: "Normal brain wave patterns",
      popular_score: 70,
    },
    {
      id: "test057",
      name: "EMG (Electromyography)",
      category: ["Special Test", "Neurology"],
      type: "Special Test",
      preparation: ["Avoid caffeine for 3 hours"],
      fasting_required: false,
      description: "Tests muscle and nerve function",
      normal_range: "Normal nerve conduction",
      popular_score: 69,
    },
    {
      id: "test058",
      name: "Nerve Conduction Study",
      category: ["Special Test", "Neurology"],
      type: "Special Test",
      preparation: ["Avoid lotions on skin"],
      fasting_required: false,
      description: "Tests speed of nerve signals",
      normal_range: "Normal nerve conduction velocity",
      popular_score: 67,
    },

    // Special Tests - Eye Tests
    {
      id: "test059",
      name: "Eye Exam (Comprehensive)",
      category: ["Special Test", "Ophthalmology"],
      type: "Special Test",
      preparation: ["Bring current glasses/contacts"],
      fasting_required: false,
      description: "Comprehensive eye examination",
      normal_range: "Normal vision and eye health",
      popular_score: 82,
    },
    {
      id: "test060",
      name: "Tonometry (Eye Pressure)",
      category: ["Special Test", "Ophthalmology"],
      type: "Special Test",
      preparation: ["Remove contact lenses"],
      fasting_required: false,
      description: "Measures pressure inside eye",
      normal_range: "10-21 mmHg",
      popular_score: 71,
    },
    {
      id: "test061",
      name: "Fundoscopy",
      category: ["Special Test", "Ophthalmology"],
      type: "Special Test",
      preparation: ["Dilation drops may be used"],
      fasting_required: false,
      description: "Examination of retina and optic nerve",
      normal_range: "Normal retina and optic disc",
      popular_score: 68,
    },

    // Special Tests - Audiometry
    {
      id: "test062",
      name: "Hearing Test (Audiometry)",
      category: ["Special Test", "ENT"],
      type: "Special Test",
      preparation: ["Avoid loud noise for 24 hours"],
      fasting_required: false,
      description: "Measures hearing ability",
      normal_range: "Normal hearing thresholds",
      popular_score: 73,
    },

    // Special Tests - Allergy Tests
    {
      id: "test063",
      name: "Skin Allergy Test",
      category: ["Special Test", "Allergy"],
      type: "Special Test",
      preparation: ["Stop antihistamines 5 days prior"],
      fasting_required: false,
      description: "Tests for allergic reactions",
      normal_range: "No reaction to allergens",
      popular_score: 69,
    },
    {
      id: "test064",
      name: "RAST (Allergy Blood Test)",
      category: ["Special Test", "Allergy"],
      type: "Special Test",
      preparation: ["None required"],
      fasting_required: false,
      description: "Blood test for specific allergies",
      normal_range: "Low or no allergen-specific IgE",
      popular_score: 66,
    },

    // Special Tests - Biopsy
    {
      id: "test065",
      name: "Skin Biopsy",
      category: ["Special Test", "Dermatology"],
      type: "Special Test",
      preparation: ["Inform about medications"],
      fasting_required: false,
      description: "Removal of skin sample for analysis",
      normal_range: "Normal skin histology",
      popular_score: 64,
    },
    {
      id: "test066",
      name: "Liver Biopsy",
      category: ["Special Test", "Hepatology"],
      type: "Special Test",
      preparation: ["Fasting for 8 hours", "Coagulation studies needed"],
      fasting_required: true,
      description: "Removal of liver tissue sample",
      normal_range: "Normal liver histology",
      popular_score: 62,
    },

    // Additional Common Tests
    {
      id: "test067",
      name: "Glucose Tolerance Test",
      category: ["Blood Test", "Endocrinology"],
      type: "Laboratory",
      preparation: ["Fasting for 8-12 hours"],
      fasting_required: true,
      description: "Measures body's response to glucose",
      normal_range: "Blood sugar returns to normal in 2 hours",
      popular_score: 76,
    },
    {
      id: "test068",
      name: "Blood Culture",
      category: ["Blood Test", "Microbiology"],
      type: "Laboratory",
      preparation: ["No preparation needed"],
      fasting_required: false,
      description: "Tests for bacteria in blood",
      normal_range: "No bacterial growth",
      popular_score: 70,
    },
    {
      id: "test069",
      name: "Throat Culture",
      category: ["Microbiology", "ENT"],
      type: "Laboratory",
      preparation: ["Avoid antibiotics before test"],
      fasting_required: false,
      description: "Tests for throat infection",
      normal_range: "No pathogenic bacteria",
      popular_score: 68,
    },
    {
      id: "test070",
      name: "Wound Culture",
      category: ["Microbiology", "Surgery"],
      type: "Laboratory",
      preparation: ["Clean wound before sampling"],
      fasting_required: false,
      description: "Tests for infection in wounds",
      normal_range: "No pathogenic bacteria",
      popular_score: 66,
    },
  ];

  search(query: string): Test[] {
    if (!query || query.trim() === "") {
      return this.tests.slice(0, 10); // Return top 10 popular tests
    }

    const searchTerm = query.toLowerCase().trim();

    return this.tests
      .filter((test) => {
        // Search in test name
        if (test.name.toLowerCase().includes(searchTerm)) return true;

        // Search in categories
        if (test.category.some((cat) => cat.toLowerCase().includes(searchTerm)))
          return true;

        // Search in type
        if (test.type.toLowerCase().includes(searchTerm)) return true;

        return false;
      })
      .sort((a, b) => b.popular_score - a.popular_score);
  }

  getSuggestions(query: string): Array<{
    id: string;
    name: string;
    category: string[];
    type: string;
    preparation?: string[];
    fasting_required?: boolean;
    insurance_coverage?: boolean;
    cost_estimate?: number;
    turnaround_time?: string;
    sample_type?: string;
  }> {
    const results = this.search(query);

    return results.slice(0, 15).map((test) => ({
      id: test.id,
      name: test.name,
      category: test.category,
      type: test.type,
      preparation: test.preparation,
      fasting_required: test.fasting_required,
      insurance_coverage: test.insurance_coverage,
      cost_estimate: test.cost_estimate,
      turnaround_time: test.turnaround_time,
      sample_type: test.sample_type,
    }));
  }

  getAll(): Test[] {
    return this.tests;
  }

  getByType(type: "Laboratory" | "Imaging" | "Special Test"): Test[] {
    return this.tests.filter((test) => test.type === type);
  }

  getByCategory(category: string): Test[] {
    return this.tests.filter((test) =>
      test.category.some((cat) =>
        cat.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  getByIds(ids: string[]): Test[] {
    return this.tests.filter((test) => ids.includes(test.id));
  }

  getByNames(names: string[]): Test[] {
    return this.tests.filter((test) =>
      names.some((name) => test.name.toLowerCase().includes(name.toLowerCase()))
    );
  }
}

export const testDB = new TestDatabase();
