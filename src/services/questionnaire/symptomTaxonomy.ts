import { SymptomTaxonomyItem, BodySystem, Language } from '../../types/questionnaire';

/**
 * Initial Expandable Taxonomy of 21 Core Symptoms
 * Configured with SNOMED-CT / ICD references, body systems, English & Hindi names, and search synonyms.
 */
export const INITIAL_SYMPTOM_TAXONOMY: SymptomTaxonomyItem[] = [
  {
    id: 'sym_fever',
    slug: 'fever',
    name: 'Fever',
    nameHi: 'बुखार (ज्वर)',
    category: 'Infectious & General',
    categoryHi: 'संक्रामक एवं सामान्य',
    bodySystem: 'systemic',
    description: 'Elevated body temperature, chills, shivering, or feeling abnormally hot.',
    descriptionHi: 'शरीर का तापमान बढ़ना, ठंड लगना, कंपकंपी या अत्यधिक गर्मी लगना।',
    iconName: 'Thermometer',
    synonymsEn: ['high temperature', 'chills', 'pyrexia', 'shivering', 'febrile', 'body heat'],
    synonymsHi: ['bukhar', 'tapman', 'thand lagna', 'jwar', 'thithuran'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-386661006',
    initialQuestionId: 'q_fever_temp_val',
  },
  {
    id: 'sym_headache',
    slug: 'headache',
    name: 'Headache',
    nameHi: 'सिरदर्द',
    category: 'Neurological',
    categoryHi: 'तंत्रिका संबंधी',
    bodySystem: 'neurological',
    description: 'Pain, throbbing, or pressure in the head, scalp, forehead, or temples.',
    descriptionHi: 'सिर, माथे, कनपटी या सिर के पिछले हिस्से में दर्द, धड़कन या भारीपन।',
    iconName: 'Brain',
    synonymsEn: ['head pain', 'migraine', 'cephalea', 'throbbing head', 'tension headache', 'temple pain'],
    synonymsHi: ['sirdard', 'sar dard', 'migraine', 'adhkapari', 'sar bhari hona'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-25064002',
    initialQuestionId: 'q_headache_loc',
  },
  {
    id: 'sym_cough',
    slug: 'cough',
    name: 'Cough',
    nameHi: 'खांसी',
    category: 'Respiratory',
    categoryHi: 'श्वसन संबंधी',
    bodySystem: 'respiratory',
    description: 'Dry or productive coughing, coughing fits, or chest throat irritation.',
    descriptionHi: 'सूखी या बलगम वाली खांसी, लगातार खांसी के दौरे या गले में जलन।',
    iconName: 'Wind',
    synonymsEn: ['coughing', 'tussis', 'dry cough', 'wet cough', 'phlegm cough', 'hacking cough'],
    synonymsHi: ['khasi', 'sukhi khasi', 'balgam wali khasi', 'khokhi'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-49727002',
    initialQuestionId: 'q_cough_type',
  },
  {
    id: 'sym_cold',
    slug: 'cold',
    name: 'Cold & Congestion',
    nameHi: 'जुकाम और नाक बंद',
    category: 'Respiratory',
    categoryHi: 'श्वसन संबंधी',
    bodySystem: 'respiratory',
    description: 'Runny nose, nasal congestion, sneezing, or post-nasal drip.',
    descriptionHi: 'बहती नाक, नाक बंद होना, छींकें आना या नाक में भारीपन।',
    iconName: 'Droplets',
    synonymsEn: ['runny nose', 'stuffy nose', 'rhinorrhea', 'sneezing', 'coryza', 'nasal block'],
    synonymsHi: ['jukam', 'sardi', 'naak bahna', 'naak band', 'chhink'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-82272006',
    initialQuestionId: 'q_cold_duration',
  },
  {
    id: 'sym_sore_throat',
    slug: 'sore-throat',
    name: 'Sore Throat',
    nameHi: 'गले में खराश / दर्द',
    category: 'ENT & Upper Respiratory',
    categoryHi: 'ईएनटी एवं ऊपरी श्वसन',
    bodySystem: 'ent',
    description: 'Scratchiness, raw sensation, or painful swallowing in the throat.',
    descriptionHi: 'गले में चुभन, निगलने में दर्द, सूजन या गले का सूखना।',
    iconName: 'Activity',
    synonymsEn: ['throat pain', 'pharyngitis', 'tonsil pain', 'painful swallowing', 'scratchy throat'],
    synonymsHi: ['gale me kharash', 'gala dard', 'tonsil', 'nigalne me taklif'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-267102003',
    initialQuestionId: 'q_throat_swallowing',
  },
  {
    id: 'sym_stomach_pain',
    slug: 'stomach-pain',
    name: 'Stomach Pain',
    nameHi: 'पेट दर्द',
    category: 'Gastrointestinal',
    categoryHi: 'पाचन तंत्र संबंधी',
    bodySystem: 'gastrointestinal',
    description: 'Aching, cramping, sharp, or dull discomfort in the abdominal area.',
    descriptionHi: 'पेट में ऐंठन, मरोड़, तेज या हल्का लगातार दर्द।',
    iconName: 'ShieldAlert',
    synonymsEn: ['abdominal pain', 'belly ache', 'tummy ache', 'gastric pain', 'stomach cramps', 'indigestion'],
    synonymsHi: ['pet dard', 'pet me marod', 'gas ka dard', 'pet kharab'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-21522000',
    initialQuestionId: 'q_stomach_location',
  },
  {
    id: 'sym_diarrhea',
    slug: 'diarrhea',
    name: 'Diarrhea',
    nameHi: 'दस्त (लूज मोशन)',
    category: 'Gastrointestinal',
    categoryHi: 'पाचन तंत्र संबंधी',
    bodySystem: 'gastrointestinal',
    description: 'Frequent loose, watery bowel movements or sudden urgency.',
    descriptionHi: 'बार-बार पतला मल आना, पेट में मरोड़ या बार-बार शौच जाना।',
    iconName: 'AlertCircle',
    synonymsEn: ['loose stools', 'watery stool', 'dysentery', 'upset stomach', 'frequent motions'],
    synonymsHi: ['dast', 'loose motion', 'patla dast', 'pet chalna', 'marod'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-62315008',
    initialQuestionId: 'q_diarrhea_frequency',
  },
  {
    id: 'sym_constipation',
    slug: 'constipation',
    name: 'Constipation',
    nameHi: 'कब्ज (मल त्याग में कठिनाई)',
    category: 'Gastrointestinal',
    categoryHi: 'पाचन तंत्र संबंधी',
    bodySystem: 'gastrointestinal',
    description: 'Difficulty passing stools, hard/infrequent bowel movements, or bloating.',
    descriptionHi: 'मल त्याग में कठिनाई, सूखा/कड़ा मल या पेट साफ न होना।',
    iconName: 'Layers',
    synonymsEn: ['hard stool', 'infrequent bowel', 'irregular motions', 'straining', 'bowel blockage'],
    synonymsHi: ['kabz', 'pet saaf na hona', 'shauch me dikkat', 'constipation'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-14760008',
    initialQuestionId: 'q_constipation_duration',
  },
  {
    id: 'sym_vomiting',
    slug: 'vomiting',
    name: 'Vomiting & Nausea',
    nameHi: 'उल्टी और मतली',
    category: 'Gastrointestinal',
    categoryHi: 'पाचन तंत्र संबंधी',
    bodySystem: 'gastrointestinal',
    description: 'Emesis, regurgitation of food/fluids, or persistent feeling of nausea.',
    descriptionHi: 'उल्टी होना, भोजन या पानी बाहर आना अथवा जी मिचलाना।',
    iconName: 'AlertTriangle',
    synonymsEn: ['emesis', 'throwing up', 'nausea', 'queasiness', 'puking', 'gagging'],
    synonymsHi: ['ulti', 'ji michlana', 'kai', 'vomit', 'matli'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-422400008',
    initialQuestionId: 'q_vomit_episodes',
  },
  {
    id: 'sym_back_pain',
    slug: 'back-pain',
    name: 'Back Pain',
    nameHi: 'पीठ / कमर दर्द',
    category: 'Musculoskeletal',
    categoryHi: 'मांसपेशी एवं अस्थि संबंधी',
    bodySystem: 'musculoskeletal',
    description: 'Lower back, upper back, or lumbar spine pain, stiffness, or sciatica.',
    descriptionHi: 'पीठ के निचले हिस्से, ऊपरी पीठ या रीढ़ की हड्डी में दर्द व अकड़न।',
    iconName: 'Activity',
    synonymsEn: ['lumbago', 'lower backache', 'spine pain', 'sciatica', 'back stiffness', 'slipped disc'],
    synonymsHi: ['kamar dard', 'peeth dard', 'reedh ki haddi ka dard', 'chak'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-161891005',
    initialQuestionId: 'q_back_location',
  },
  {
    id: 'sym_joint_pain',
    slug: 'joint-pain',
    name: 'Joint Pain & Swelling',
    nameHi: 'जोड़ों का दर्द व सूजन',
    category: 'Musculoskeletal',
    categoryHi: 'मांसपेशी एवं अस्थि संबंधी',
    bodySystem: 'musculoskeletal',
    description: 'Pain, swelling, warmth, or morning stiffness in knees, fingers, hips, or shoulders.',
    descriptionHi: 'घुटनों, उंगलियों, कूल्हों या कंधों के जोड़ों में दर्द, सूजन या अकड़न।',
    iconName: 'Maximize2',
    synonymsEn: ['arthralgia', 'arthritis', 'knee pain', 'stiff joints', 'swollen joints', 'rheumatism'],
    synonymsHi: ['jodon ka dard', 'ghutne ka dard', 'gathiya', 'sandhi vata', 'sujan'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-57676002',
    initialQuestionId: 'q_joint_involved',
  },
  {
    id: 'sym_skin_problems',
    slug: 'skin-problems',
    name: 'Skin Problems & Rashes',
    nameHi: 'त्वचा की समस्याएं व चकत्ते',
    category: 'Dermatological',
    categoryHi: 'त्वचा संबंधी',
    bodySystem: 'dermatological',
    description: 'Rashes, redness, itching, bumps, hives, peeling, or lesions on skin.',
    descriptionHi: 'त्वचा पर लाल चकत्ते, खुजली, दाने, पित्ती, पपड़ी या जलन।',
    iconName: 'Sun',
    synonymsEn: ['rash', 'itching', 'pruritus', 'eczema', 'dermatitis', 'hives', 'urticaria', 'boils'],
    synonymsHi: ['khujli', 'chakatte', 'daanedaar tvacha', 'kharish', 'pitti', 'charm rog'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-271807003',
    initialQuestionId: 'q_skin_appearance',
  },
  {
    id: 'sym_allergies',
    slug: 'allergies',
    name: 'Allergies & Reactions',
    nameHi: 'एलर्जी संबंधी प्रतिक्रिया',
    category: 'Immunological',
    categoryHi: 'प्रतिरक्षा प्रणाली संबंधी',
    bodySystem: 'immunological',
    description: 'Allergic flares triggered by food, pollen, dust, medicines, or insect stings.',
    descriptionHi: 'धूल, परागकण, भोजन, दवा या मौसम परिवर्तन से होने वाली एलर्जी।',
    iconName: 'Shield',
    synonymsEn: ['allergic reaction', 'hypersensitivity', 'hay fever', 'dust allergy', 'food allergy'],
    synonymsHi: ['allergy', 'dhul se allergy', 'dawa se allergy', 'chheenk aur khujli'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-419199007',
    initialQuestionId: 'q_allergy_trigger',
  },
  {
    id: 'sym_fatigue',
    slug: 'fatigue',
    name: 'Fatigue & Weakness',
    nameHi: 'थकान और अत्यधिक कमजोरी',
    category: 'General & Systemic',
    categoryHi: 'सामान्य एवं शारीरिक',
    bodySystem: 'systemic',
    description: 'Extreme tiredness, lack of energy, lethargy, or weakness during simple tasks.',
    descriptionHi: 'अत्यधिक थकान, ऊर्जा की कमी, सुस्ती या रोजमर्रा के कामों में कमजोरी।',
    iconName: 'BatteryLow',
    synonymsEn: ['tiredness', 'exhaustion', 'lethargy', 'weakness', 'asthenia', 'low energy'],
    synonymsHi: ['thakan', 'kamzori', 'sustapan', 'thakawat', 'urja ki kami'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-84229001',
    initialQuestionId: 'q_fatigue_duration',
  },
  {
    id: 'sym_dizziness',
    slug: 'dizziness',
    name: 'Dizziness & Vertigo',
    nameHi: 'चक्कर आना और असंतुलन',
    category: 'Neurological & Balance',
    categoryHi: 'तंत्रिका एवं संतुलन संबंधी',
    bodySystem: 'neurological',
    description: 'Lightheadedness, spinning sensation (vertigo), feeling faint, or unsteadiness.',
    descriptionHi: 'सिर घूमना, कमरा घूमता हुआ महसूस होना, बेहोशी जैसी स्थिति या लड़खड़ाहट।',
    iconName: 'Compass',
    synonymsEn: ['vertigo', 'lightheaded', 'faintness', 'spinning', 'presyncope', 'unsteady'],
    synonymsHi: ['chakkar aana', 'sir ghumna', 'giddiness', 'behoshi jaisa lagna'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-404640003',
    initialQuestionId: 'q_dizziness_type',
  },
  {
    id: 'sym_urinary_symptoms',
    slug: 'urinary-symptoms',
    name: 'Urinary Symptoms',
    nameHi: 'मूत्र संबंधी समस्याएं',
    category: 'Urological',
    categoryHi: 'मूत्र प्रणाली संबंधी',
    bodySystem: 'urological',
    description: 'Burning sensation during urination, frequent urination, urgency, or discoloration.',
    descriptionHi: 'पेशाब में जलन, बार-बार पेशाब आना, रुक-रुक कर आना या रंग में बदलाव।',
    iconName: 'Filter',
    synonymsEn: ['dysuria', 'burning urination', 'frequent urine', 'uti symptoms', 'urine infection'],
    synonymsHi: ['peshab me jalan', 'baar baar peshab', 'peshab me dard', 'uti'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-386663009',
    initialQuestionId: 'q_urine_burning',
  },
  {
    id: 'sym_respiratory_symptoms',
    slug: 'respiratory-symptoms',
    name: 'Respiratory & Breathing Issues',
    nameHi: 'सांस लेने में कठिनाई / घरघराहट',
    category: 'Respiratory',
    categoryHi: 'श्वसन संबंधी',
    bodySystem: 'respiratory',
    description: 'Shortness of breath, rapid breathing, wheezing sounds, or chest tightness.',
    descriptionHi: 'सांस फूलना, तेजी से सांस चलना, छाती में सीटी जैसी आवाज या भारीपन।',
    iconName: 'Wind',
    synonymsEn: ['dyspnea', 'short of breath', 'breathlessness', 'wheezing', 'chest tightness', 'asthma flare'],
    synonymsHi: ['saans phulna', 'saans lene me taklif', 'dama', 'ghargharahat'],
    isEmergencyTrigger: true, // Respiratory issues undergo priority red flag screening
    standardCode: 'SNOMED-267036007',
    initialQuestionId: 'q_respiratory_rest_exertion',
  },
  {
    id: 'sym_eye_symptoms',
    slug: 'eye-symptoms',
    name: 'Eye Symptoms',
    nameHi: 'आंखों की समस्याएं व लालिमा',
    category: 'Ophthalmological',
    categoryHi: 'नेत्र संबंधी',
    bodySystem: 'ophthalmological',
    description: 'Redness, watery eyes, discharge, itching, eye strain, or blurry vision.',
    descriptionHi: 'आंखों में लाली, पानी आना, खुजली, चिपचिपा स्राव या धुंधला दिखाई देना।',
    iconName: 'Eye',
    synonymsEn: ['red eye', 'pink eye', 'conjunctivitis', 'watery eyes', 'eye pain', 'blurred vision'],
    synonymsHi: ['aankh laal hona', 'aankh se pani', 'aankh me dard', 'conjunctivitis', 'dhundhla dikhna'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-193967004',
    initialQuestionId: 'q_eye_redness',
  },
  {
    id: 'sym_ear_symptoms',
    slug: 'ear-symptoms',
    name: 'Ear Symptoms & Hearing',
    nameHi: 'कान की समस्याएं व दर्द',
    category: 'ENT',
    categoryHi: 'ईएनटी',
    bodySystem: 'ent',
    description: 'Earache, feeling of fullness/blockage, ringing in ears (tinnitus), or discharge.',
    descriptionHi: 'कान में दर्द, कान बंद होना, सांय-सांय की आवाज (टिनिटस) या मवाद निकलना।',
    iconName: 'Volume2',
    synonymsEn: ['earache', 'ear pain', 'otitis', 'tinnitus', 'ear discharge', 'clogged ear'],
    synonymsHi: ['kaan dard', 'kaan bahna', 'kaan me aawaz', 'kaan band hona'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-271764005',
    initialQuestionId: 'q_ear_pain_loc',
  },
  {
    id: 'sym_dental_symptoms',
    slug: 'dental-symptoms',
    name: 'Dental & Gum Symptoms',
    nameHi: 'दांत और मसूड़ों की समस्याएं',
    category: 'Dental & Oral',
    categoryHi: 'दंत एवं मुख संबंधी',
    bodySystem: 'dental',
    description: 'Toothache, sensitivity to hot/cold, bleeding gums, or swollen jaw/gums.',
    descriptionHi: 'दांत दर्द, गर्म-ठंडा लगना, मसूड़ों से खून आना या मसूड़ों में सूजन।',
    iconName: 'Smile',
    synonymsEn: ['toothache', 'dental pain', 'bleeding gums', 'sensitive teeth', 'cavity pain', 'gingivitis'],
    synonymsHi: ['daant dard', 'masude se khoon', 'daant me thanda garam', 'daant me kida'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-27355003',
    initialQuestionId: 'q_dental_sensitivity',
  },
  {
    id: 'sym_menstrual_concerns',
    slug: 'menstrual-concerns',
    name: 'Menstrual Concerns & Cramps',
    nameHi: 'मासिक धर्म संबंधी समस्याएं',
    category: 'Gynecological',
    categoryHi: 'स्त्री रोग संबंधी',
    bodySystem: 'gynecological',
    description: 'Severe menstrual cramps (dysmenorrhea), heavy bleeding, irregular cycles, or PMS.',
    descriptionHi: 'मासिक धर्म के दौरान तेज पेट/कमर दर्द, अत्यधिक रक्तस्राव या अनियमित चक्र।',
    iconName: 'Calendar',
    synonymsEn: ['period cramps', 'dysmenorrhea', 'heavy periods', 'irregular cycle', 'menstrual pain', 'pms'],
    synonymsHi: ['periods ka dard', 'masik dharm', 'periods me khinchaav', 'heavy bleeding'],
    isEmergencyTrigger: false,
    standardCode: 'SNOMED-289945000',
    initialQuestionId: 'q_menstrual_issue_type',
  },
];

/**
 * Expandable Symptom Taxonomy Registry
 * Enables registering new clinical symptoms dynamically without rewriting core logic.
 */
class SymptomTaxonomyRegistry {
  private items: Map<string, SymptomTaxonomyItem> = new Map();

  constructor(initialItems: SymptomTaxonomyItem[] = INITIAL_SYMPTOM_TAXONOMY) {
    initialItems.forEach((item) => this.registerSymptom(item));
  }

  public registerSymptom(item: SymptomTaxonomyItem): void {
    this.items.set(item.id, item);
    this.items.set(item.slug, item);
  }

  public getAll(): SymptomTaxonomyItem[] {
    const unique = new Map<string, SymptomTaxonomyItem>();
    this.items.forEach((item) => unique.set(item.id, item));
    return Array.from(unique.values());
  }

  public getById(idOrSlug: string): SymptomTaxonomyItem | undefined {
    return this.items.get(idOrSlug);
  }

  public getByBodySystem(system: BodySystem): SymptomTaxonomyItem[] {
    return this.getAll().filter((item) => item.bodySystem === system);
  }

  public search(query: string, language: Language = 'en'): SymptomTaxonomyItem[] {
    if (!query || query.trim() === '') return this.getAll();
    const cleanQuery = query.toLowerCase().trim();

    return this.getAll().filter((item) => {
      const matchEn =
        item.name.toLowerCase().includes(cleanQuery) ||
        item.description.toLowerCase().includes(cleanQuery) ||
        item.synonymsEn.some((syn) => syn.toLowerCase().includes(cleanQuery)) ||
        item.category.toLowerCase().includes(cleanQuery);

      const matchHi =
        item.nameHi.toLowerCase().includes(cleanQuery) ||
        item.descriptionHi.toLowerCase().includes(cleanQuery) ||
        item.synonymsHi.some((syn) => syn.toLowerCase().includes(cleanQuery)) ||
        item.categoryHi.toLowerCase().includes(cleanQuery);

      return matchEn || matchHi;
    });
  }
}

export const symptomRegistry = new SymptomTaxonomyRegistry();
