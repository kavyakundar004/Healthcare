import { db } from './index.ts';
import {
  symptomCategories,
  symptoms,
  questions,
  questionOptions,
  medicalConditions,
  treatmentInformations,
  ayurvedaInformations,
  medicines,
  medicineInteractions,
  knowledgeSources,
  users,
} from './schema.ts';
import { count, eq } from 'drizzle-orm';

export async function seedInitialMasterData() {
  try {
    const existingCats = await db.select({ count: count() }).from(symptomCategories);
    if (Number(existingCats[0]?.count || 0) > 0) {
      console.log('Database already has seeded data. Skipping duplicate seed.');
      return { status: 'already_seeded' };
    }

    console.log('Seeding initial foundational healthcare models...');

    // 1. Seed System Admin & Demo User
    const adminUser = await db
      .insert(users)
      .values({
        uid: 'sys-admin-root',
        email: 'admin@healthguide.ai',
        displayName: 'System Medical Administrator',
        role: 'admin',
      })
      .onConflictDoNothing()
      .returning();

    // 2. Symptom Categories
    const categories = await db
      .insert(symptomCategories)
      .values([
        {
          name: 'Cardiovascular & Chest',
          slug: 'cardiovascular',
          description: 'Heart, circulation, chest pressure, and vascular indicators',
          bodySystem: 'Cardiovascular',
          icon: 'Heart',
          sortOrder: 1,
        },
        {
          name: 'Respiratory & Pulmonary',
          slug: 'respiratory',
          description: 'Breathing, cough, airway congestion, and lung health',
          bodySystem: 'Respiratory',
          icon: 'Wind',
          sortOrder: 2,
        },
        {
          name: 'Gastrointestinal & Digestion',
          slug: 'gastrointestinal',
          description: 'Stomach, intestinal balance, acidity, and bowel health',
          bodySystem: 'Digestive',
          icon: 'Activity',
          sortOrder: 3,
        },
        {
          name: 'Neurological & Cognitive',
          slug: 'neurological',
          description: 'Headaches, dizziness, cognitive strain, and sensory shifts',
          bodySystem: 'Nervous',
          icon: 'Brain',
          sortOrder: 4,
        },
        {
          name: 'General Wellness & Vigor',
          slug: 'general-wellness',
          description: 'Fatigue, immunity, sleep architecture, and vitality',
          bodySystem: 'Systemic',
          icon: 'Sun',
          sortOrder: 5,
        },
      ])
      .returning();

    const cardioCat = categories.find((c) => c.slug === 'cardiovascular') || categories[0];
    const respCat = categories.find((c) => c.slug === 'respiratory') || categories[1];
    const gastroCat = categories.find((c) => c.slug === 'gastrointestinal') || categories[2];
    const neuroCat = categories.find((c) => c.slug === 'neurological') || categories[3];

    // 3. Symptoms
    const syms = await db
      .insert(symptoms)
      .values([
        {
          categoryId: cardioCat.id,
          name: 'Chest Pain / Tightness',
          slug: 'chest-pain',
          description: 'Sensation of pressure, squeezing, or sharp retrosternal pain',
          standardCode: 'R07.9',
          severityLevel: 5,
          isEmergencyTrigger: true,
        },
        {
          categoryId: respCat.id,
          name: 'Shortness of Breath',
          slug: 'shortness-of-breath',
          description: 'Dyspnea or difficulty drawing a complete breath',
          standardCode: 'R06.02',
          severityLevel: 4,
          isEmergencyTrigger: true,
        },
        {
          categoryId: gastroCat.id,
          name: 'Acid Reflux / Heartburn',
          slug: 'acid-reflux',
          description: 'Burning substernal sensation exacerbated postprandially',
          standardCode: 'K21.9',
          severityLevel: 2,
          isEmergencyTrigger: false,
        },
        {
          categoryId: neuroCat.id,
          name: 'Tension Headache',
          slug: 'tension-headache',
          description: 'Dull, aching band-like head pain with scalp tenderness',
          standardCode: 'G44.2',
          severityLevel: 2,
          isEmergencyTrigger: false,
        },
      ])
      .returning();

    const chestPainSym = syms.find((s) => s.slug === 'chest-pain') || syms[0];
    const refluxSym = syms.find((s) => s.slug === 'acid-reflux') || syms[2];

    // 4. Questions & Options for Triage
    const q1 = await db
      .insert(questions)
      .values({
        symptomId: chestPainSym.id,
        text: 'Does the chest pain radiate to your left arm, shoulder, neck, or jaw?',
        description: 'Assesses potential acute coronary syndrome radiation patterns',
        questionType: 'single_choice',
        isRequired: true,
        sortOrder: 1,
      })
      .returning();

    await db.insert(questionOptions).values([
      {
        questionId: q1[0].id,
        label: 'Yes, radiates to arm or jaw',
        value: 'radiating_pain',
        scoreWeight: 50,
        isRedFlagOption: true,
        sortOrder: 1,
      },
      {
        questionId: q1[0].id,
        label: 'No radiation, localized only',
        value: 'no_radiation',
        scoreWeight: 10,
        isRedFlagOption: false,
        sortOrder: 2,
      },
    ]);

    const q2 = await db
      .insert(questions)
      .values({
        symptomId: refluxSym.id,
        text: 'How frequently do you experience the burning sensation in your chest or throat?',
        description: 'Evaluates chronic GERD vs episodic indigestion',
        questionType: 'single_choice',
        isRequired: true,
        sortOrder: 1,
      })
      .returning();

    await db.insert(questionOptions).values([
      {
        questionId: q2[0].id,
        label: 'Occasional (1-2 times a month after spicy meals)',
        value: 'occasional',
        scoreWeight: 5,
        isRedFlagOption: false,
        sortOrder: 1,
      },
      {
        questionId: q2[0].id,
        label: 'Persistent (Multiple times per week or daily)',
        value: 'frequent',
        scoreWeight: 20,
        isRedFlagOption: false,
        sortOrder: 2,
      },
    ]);

    // 5. Medical Conditions
    const conditions = await db
      .insert(medicalConditions)
      .values([
        {
          name: 'Gastroesophageal Reflux Disease (GERD)',
          icdCode: 'K21.0',
          category: 'Gastroenterology',
          description: 'Chronic mucosal damage caused by stomach acid coming up from the stomach into the esophagus.',
          commonSymptomsSummary: 'Heartburn, acid regurgitation, dysphagia, epigastric fullness',
          riskLevel: 'moderate',
        },
        {
          name: 'Tension-Type Headache',
          icdCode: 'G44.209',
          category: 'Neurology',
          description: 'Most common primary headache disorder, characterized by diffuse bilateral pain.',
          commonSymptomsSummary: 'Dull ache, band-like tightness around forehead or occiput, neck tension',
          riskLevel: 'low',
        },
        {
          name: 'Essential Hypertension',
          icdCode: 'I10',
          category: 'Cardiology',
          description: 'Persistent resting systolic blood pressure >= 130 mmHg and/or diastolic >= 80 mmHg.',
          commonSymptomsSummary: 'Often asymptomatic; morning occipital headache, palpitations, dizziness',
          riskLevel: 'high',
        },
      ])
      .returning();

    const gerd = conditions[0];
    const headache = conditions[1];

    // 6. Treatment Information
    await db.insert(treatmentInformations).values([
      {
        conditionId: gerd.id,
        treatmentType: 'pharmacological',
        title: 'Proton Pump Inhibitors & H2 Antagonists',
        description: 'First-line acid suppression therapy combined with lifestyle elevation of head of bed.',
        evidenceLevel: 'Class I Level A (Multiple RCTs)',
        contraindications: 'Known hypersensitivity to omeprazole/pantoprazole',
        precautions: 'Long-term usage warrants monitoring of Vitamin B12 and bone density.',
      },
      {
        conditionId: headache.id,
        treatmentType: 'lifestyle',
        title: 'Ergonomic Posture, Hydration & Stress Reduction',
        description: 'Regular sleep hygiene, neck stretching, 2-3L daily hydration, and screen-break routines.',
        evidenceLevel: 'Class IIa Level B',
        precautions: 'Seek medical assessment if accompanied by sudden visual aura or neck stiffness.',
      },
    ]);

    // 7. Ayurveda Information
    await db.insert(ayurvedaInformations).values([
      {
        conditionId: gerd.id,
        doshaDominance: 'pitta',
        prakritiGuidance: 'Amlapitta imbalance characterized by elevated Ushna (heat) and Tikshna (sharpness) in Agni.',
        herbalRemedies: 'Yashtimadhu (Licorice root), Shatavari, Amla (Indian Gooseberry), Coriander seed water',
        aharaDietaryNotes: 'Favor cooling, sweet, and bitter tastes. Avoid deeply fried, sour, vinegar, chili, and late-night heavy meals.',
        viharaLifestyleNotes: 'Avoid lying down within 2.5 hours after meals. Practice gentle Sheetali and Sheetkari cooling Pranayama.',
        contraindications: 'Avoid excessive warming spices (cayenne, dry ginger) during acute flare-ups.',
      },
      {
        conditionId: headache.id,
        doshaDominance: 'vata',
        prakritiGuidance: 'Vata-Pitta aggregation in Shiras (cranial channels) triggered by dry weather, eye strain, or irregular meals.',
        herbalRemedies: 'Brahmi (Bacopa monnieri), Ashwagandha for nervous exhaustion, Nasya with sesame oil',
        aharaDietaryNotes: 'Warm, grounding soups with moderate ghee. Eliminate cold and raw dry foods.',
        viharaLifestyleNotes: 'Shiroabhyanga (gentle warm oil head massage) before sleep; practice Anuloma Viloma breathing.',
        contraindications: 'Do not perform vigorous exercise during fasting or acute sleep deprivation.',
      },
    ]);

    // 8. Medicines & Interactions
    const meds = await db
      .insert(medicines)
      .values([
        {
          genericName: 'Omeprazole',
          brandNames: 'Prilosec, Losec, Omez',
          drugClass: 'Proton Pump Inhibitor (PPI)',
          therapeuticIndications: 'GERD, peptic ulcer disease, Zollinger-Ellison syndrome',
          standardDosageInfo: '20mg to 40mg once daily before breakfast',
          routeOfAdministration: 'oral',
          sideEffectsSummary: 'Headache, abdominal pain, nausea, diarrhea',
          warnings: 'May reduce absorption of iron, magnesium, and vitamin B12.',
        },
        {
          genericName: 'Clopidogrel',
          brandNames: 'Plavix',
          drugClass: 'Antiplatelet Agent',
          therapeuticIndications: 'Prevention of atherothrombotic events in CAD/stroke',
          standardDosageInfo: '75mg once daily',
          routeOfAdministration: 'oral',
          sideEffectsSummary: 'Bleeding, purpura, bruising',
          warnings: 'CYP2C19 inhibitors can significantly reduce clopidogrel efficacy.',
        },
      ])
      .returning();

    // Medicine interaction (Omeprazole + Clopidogrel)
    if (meds.length >= 2) {
      await db.insert(medicineInteractions).values({
        primaryMedicineId: meds[0].id,
        interactingMedicineId: meds[1].id,
        severityLevel: 'major',
        interactionMechanism: 'Omeprazole competitively inhibits CYP2C19, decreasing clopidogrel active metabolite formation by ~45%.',
        clinicalManagement: 'Avoid co-administration. Consider pantoprazole or an H2 blocker like famotidine if acid suppression is required.',
      });
    }

    // 9. Knowledge Sources
    await db.insert(knowledgeSources).values([
      {
        title: 'Clinical Practice Guidelines for the Diagnosis and Management of Gastroesophageal Reflux Disease',
        sourceName: 'American College of Gastroenterology (ACG)',
        sourceUrl: 'https://journals.lww.com/ajg/fulltext/2022/01000/acg_clinical_guidelines_for_the_diagnosis_and.14.aspx',
        publicationYear: 2022,
        credibilityScore: 0.98,
        summary: 'Gold standard clinical guidelines on PPI therapy, endoscopic surveillance, and lifestyle intervention for GERD.',
      },
      {
        title: 'Charaka Samhita: Chikitsa Sthana (Chapter on Grahani & Amlapitta)',
        sourceName: 'Traditional Classical Ayurvedic Formulary & National Council of Indian Medicine',
        publicationYear: 2018,
        credibilityScore: 0.94,
        summary: 'Classical Ayurvedic treatise on digestive fire (Agni), tissue metabolism (Dhatus), and restorative herbal formulations.',
      },
    ]);

    console.log('Initial foundational master data successfully seeded into Cloud SQL!');
    return { status: 'seeded_successfully' };
  } catch (error) {
    console.error('Error seeding initial master data:', error);
    throw error;
  }
}
