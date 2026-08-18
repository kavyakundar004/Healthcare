import { QuestionDefinition } from '../../types/questionnaire';

/**
 * Structured Question Library
 * Dynamic questions with clinical branching rules, multi-language support (English / Hindi),
 * and strictly calibrated question widgets.
 */
export const QUESTION_LIBRARY: QuestionDefinition[] = [
  // =========================================================================
  // 1. SYSTEMIC & GENERAL INTAKE QUESTIONS (Common Baseline)
  // =========================================================================
  {
    id: 'q_general_duration',
    category: 'duration',
    type: 'duration',
    text: 'How long have you been experiencing these symptoms overall?',
    textHi: 'आप कुल कितने समय से इन लक्षणों का अनुभव कर रहे हैं?',
    helpText: 'Specify the time since the first noticeable onset.',
    helpTextHi: 'लक्षण पहली बार शुरू होने का समय बताएं।',
    isRequired: true,
    sortOrder: 1,
  },
  {
    id: 'q_general_onset_mode',
    category: 'character',
    type: 'single_choice',
    text: 'How did these symptoms start?',
    textHi: 'लक्षणों की शुरुआत किस प्रकार हुई?',
    isRequired: true,
    sortOrder: 2,
    options: [
      {
        id: 'opt_onset_sudden',
        value: 'sudden',
        label: 'Suddenly (within minutes or hours)',
        labelHi: 'अचानक (कुछ मिनटों या घंटों के भीतर)',
        scoreWeight: 2,
      },
      {
        id: 'opt_onset_gradual',
        value: 'gradual',
        label: 'Gradually (over several days)',
        labelHi: 'धीरे-धीरे (कई दिनों के दौरान)',
        scoreWeight: 1,
      },
      {
        id: 'opt_onset_recurrent',
        value: 'recurrent',
        label: 'Comes and goes in episodes (recurrent)',
        labelHi: 'रुक-रुक कर बार-बार आता-जाता है (आवर्तक)',
        scoreWeight: 1,
      },
    ],
  },
  {
    id: 'q_general_severity_scale',
    category: 'severity',
    type: 'numeric_scale',
    text: 'On a scale from 0 to 10, how severe is your overall discomfort right now?',
    textHi: '0 से 10 के पैमाने पर, वर्तमान में आपकी कुल परेशानी कितनी गंभीर है?',
    isRequired: true,
    min: 0,
    max: 10,
    step: 1,
    scaleLabels: {
      min: '0 - No discomfort',
      minHi: '0 - कोई परेशानी नहीं',
      mid: '5 - Moderate discomfort',
      midHi: '5 - मध्यम परेशानी',
      max: '10 - Extreme / Unbearable',
      maxHi: '10 - अत्यधिक / असहनीय',
    },
    sortOrder: 3,
  },

  // =========================================================================
  // 2. FEVER (sym_fever)
  // =========================================================================
  {
    id: 'q_fever_temp_val',
    symptomId: 'sym_fever',
    category: 'vitals',
    type: 'temperature',
    text: 'What is your measured body temperature (if recorded)?',
    textHi: 'आपका मापा गया शारीरिक तापमान कितना है (यदि मापा गया हो)?',
    helpText: 'Enter in Fahrenheit (°F) or Celsius (°C). If unmeasured, skip or enter estimated feeling.',
    helpTextHi: 'फ़ारेनहाइट (°F) या सेल्सियस (°C) में दर्ज करें। यदि मापा नहीं है तो छोड़ सकते हैं।',
    isRequired: false,
    min: 94.0,
    max: 110.0,
    step: 0.1,
    defaultUnit: 'F',
    defaultUnitHi: '°F',
    sortOrder: 10,
  },
  {
    id: 'q_fever_chills_pattern',
    symptomId: 'sym_fever',
    category: 'associated',
    type: 'single_choice',
    text: 'Are you experiencing chills or shivering along with the fever?',
    textHi: 'क्या बुखार के साथ ठंड लगना या कंपकंपी महसूस हो रही है?',
    isRequired: true,
    sortOrder: 11,
    options: [
      { id: 'opt_fever_chills_high', value: 'severe_shivering', label: 'Severe shivering / Teeth chattering', labelHi: 'तेज कंपकंपी / दांत बजना', scoreWeight: 2 },
      { id: 'opt_fever_chills_mild', value: 'mild_chills', label: 'Mild chills on and off', labelHi: 'हल्की ठंड लगना', scoreWeight: 1 },
      { id: 'opt_fever_chills_none', value: 'no_chills', label: 'No chills, just feeling hot/sweaty', labelHi: 'ठंड नहीं, केवल पसीना या गर्मी', scoreWeight: 0 },
    ],
  },
  {
    id: 'q_fever_time_pattern',
    symptomId: 'sym_fever',
    category: 'character',
    type: 'single_choice',
    text: 'When is the fever highest during the day?',
    textHi: 'दिन के किस समय बुखार सबसे अधिक होता है?',
    isRequired: false,
    sortOrder: 12,
    options: [
      { id: 'opt_fever_evenings', value: 'evenings', label: 'Rises mostly in evening / night', labelHi: 'शाम या रात में बढ़ता है' },
      { id: 'opt_fever_continuous', value: 'continuous', label: 'High continuously all day', labelHi: 'पूरे दिन लगातार तेज रहता है' },
      { id: 'opt_fever_irregular', value: 'irregular', label: 'Irregular spikes with sweating', labelHi: 'अनियमित रूप से पसीने के साथ बढ़ता-घटता है' },
    ],
  },

  // =========================================================================
  // 3. HEADACHE (sym_headache)
  // =========================================================================
  {
    id: 'q_headache_loc',
    symptomId: 'sym_headache',
    category: 'location',
    type: 'single_choice',
    text: 'Where exactly is the headache located?',
    textHi: 'सिरदर्द मुख्य रूप से सिर के किस हिस्से में है?',
    isRequired: true,
    sortOrder: 20,
    options: [
      { id: 'opt_head_one_side', value: 'one_sided', label: 'One side of the head / temple (unilateral)', labelHi: 'सिर के एक तरफ / कनपटी में (आधा सिर)' },
      { id: 'opt_head_forehead', value: 'forehead_band', label: 'Forehead / Tight band around whole head', labelHi: 'माथे पर / सिर के चारों ओर पट्टी जैसा कसाव' },
      { id: 'opt_head_behind_eyes', value: 'behind_eyes', label: 'Behind one or both eyes / sinus bridge', labelHi: 'आंखों के पीछे / नाक के ऊपरी हिस्से पर' },
      { id: 'opt_head_back_neck', value: 'back_of_head_neck', label: 'Back of head and upper neck (occipital)', labelHi: 'सिर के पिछले हिस्से और गर्दन में' },
      { id: 'opt_head_diffuse', value: 'entire_head', label: 'Diffused all over the head', labelHi: 'पूरे सिर में फैला हुआ' },
    ],
  },
  {
    id: 'q_headache_character',
    symptomId: 'sym_headache',
    category: 'character',
    type: 'single_choice',
    text: 'How would you describe the feeling of the headache?',
    textHi: 'सिरदर्द की प्रकृति (अनुभूति) कैसी है?',
    isRequired: true,
    sortOrder: 21,
    options: [
      { id: 'opt_head_throbbing', value: 'pulsating_throbbing', label: 'Throbbing / Pulsating with heartbeat', labelHi: 'धड़कता हुआ / टीस मारने वाला' },
      { id: 'opt_head_dull_pressure', value: 'dull_pressing', label: 'Dull ache / Heavy constant pressure', labelHi: 'हल्का लगातार भारीपन / दबाव' },
      { id: 'opt_head_sharp_stabbing', value: 'sharp_stabbing', label: 'Sharp / Stabbing / Electric bursts', labelHi: 'तेज चुभने वाला / अचानक बिजली जैसा झटका' },
    ],
  },
  {
    id: 'q_headache_red_flags',
    symptomId: 'sym_headache',
    category: 'red_flags',
    type: 'multiple_choice',
    text: 'Are you experiencing any of these specific sensations with your headache?',
    textHi: 'क्या आपको सिरदर्द के साथ इनमें से कोई विशिष्ट लक्षण महसूस हो रहे हैं?',
    isRequired: true,
    isRedFlagScreening: true,
    sortOrder: 22,
    options: [
      { id: 'opt_head_thunderclap', value: 'thunderclap', label: 'Sudden "worst headache of my entire life" (thunderclap onset)', labelHi: 'अचानक "जीवन का सबसे भयंकर सिरदर्द" (बिजली की तेजी से)', isRedFlag: true },
      { id: 'opt_head_stiff_neck', value: 'stiff_neck', label: 'Stiff neck (difficulty touching chin to chest)', labelHi: 'गर्दन में अकड़न (ठोड़ी को छाती से छूने में कठिनाई)', isRedFlag: true },
      { id: 'opt_head_photophobia', value: 'photophobia', label: 'Extreme sensitivity to bright light or loud sound', labelHi: 'तेज रोशनी या आवाज से अत्यधिक परेशानी' },
      { id: 'opt_head_vision_blur', value: 'visual_aura', label: 'Visual zigzag lines, flashing spots, or blurriness (aura)', labelHi: 'आंखों के आगे चमकती रेखाएं या धुंधलापन' },
      { id: 'opt_head_weakness', value: 'focal_weakness', label: 'Weakness or numbness on one side of face/arm', labelHi: 'चेहरे या हाथ के एक तरफ कमजोरी या सुन्नपन', isRedFlag: true },
      { id: 'opt_head_none', value: 'none_of_above', label: 'None of the above', labelHi: 'उपरोक्त में से कोई नहीं' },
    ],
  },

  // =========================================================================
  // 4. STOMACH PAIN (sym_stomach_pain)
  // =========================================================================
  {
    id: 'q_stomach_location',
    symptomId: 'sym_stomach_pain',
    category: 'location',
    type: 'single_choice',
    text: 'Where in your abdomen is the pain most focused?',
    textHi: 'पेट में दर्द मुख्य रूप से किस स्थान पर केंद्रित है?',
    isRequired: true,
    sortOrder: 30,
    options: [
      { id: 'opt_stom_upper_mid', value: 'epigastric_upper_mid', label: 'Upper middle (above belly button / heartburn area)', labelHi: 'ऊपरी मध्य भाग (नाभि के ऊपर / सीने के ठीक नीचे)' },
      { id: 'opt_stom_upper_right', value: 'right_upper_quadrant', label: 'Upper right side (under right ribs)', labelHi: 'ऊपरी दाहिनी ओर (दाहिनी पसलियों के नीचे)' },
      { id: 'opt_stom_lower_right', value: 'right_lower_quadrant', label: 'Lower right side (near appendix area)', labelHi: 'निचला दाहिना भाग (अपेंडिक्स का हिस्सा)' },
      { id: 'opt_stom_lower_left', value: 'left_lower_quadrant', label: 'Lower left side / Lower abdomen', labelHi: 'निचला बायां भाग / पेडू का हिस्सा' },
      { id: 'opt_stom_around_navel', value: 'periumbilical', label: 'Directly around the belly button', labelHi: 'नाभि के बिल्कुल चारों ओर' },
      { id: 'opt_stom_diffuse', value: 'diffuse_cramps', label: 'General cramping all across the abdomen', labelHi: 'पूरे पेट में मरोड़ और ऐंठन' },
    ],
  },
  {
    id: 'q_stomach_meal_relation',
    symptomId: 'sym_stomach_pain',
    category: 'character',
    type: 'single_choice',
    text: 'Does eating food make the pain better or worse?',
    textHi: 'क्या भोजन करने से दर्द बढ़ता है या कम होता है?',
    isRequired: true,
    sortOrder: 31,
    options: [
      { id: 'opt_stom_worse_food', value: 'worse_after_eating', label: 'Worse after eating meals (especially fatty or spicy food)', labelHi: 'खाना खाने के बाद बढ़ता है (विशेषकर चिकना या तीखा खाना)' },
      { id: 'opt_stom_better_food', value: 'better_after_eating', label: 'Better with food / Worse on empty stomach', labelHi: 'खाना खाने पर आराम मिलता है / खाली पेट बढ़ता है' },
      { id: 'opt_stom_no_relation', value: 'no_meal_relation', label: 'No clear relation to meals', labelHi: 'भोजन से कोई स्पष्ट संबंध नहीं' },
    ],
  },
  {
    id: 'q_stomach_red_flags',
    symptomId: 'sym_stomach_pain',
    category: 'red_flags',
    type: 'multiple_choice',
    text: 'Do you have any of these associated digestive warning signs?',
    textHi: 'क्या आपको पेट दर्द के साथ इनमें से कोई चेतावनी लक्षण हैं?',
    isRequired: true,
    isRedFlagScreening: true,
    sortOrder: 32,
    options: [
      { id: 'opt_stom_vomit_blood', value: 'vomit_blood_coffee', label: 'Vomiting blood or coffee-ground material', labelHi: 'उल्टी में खून या कॉफी के रंग जैसा पदार्थ', isRedFlag: true },
      { id: 'opt_stom_black_stool', value: 'black_tarry_stool', label: 'Black, tarry, or bloody stools', labelHi: 'काले रंग का, तारकोल जैसा या खूनी मल', isRedFlag: true },
      { id: 'opt_stom_rigid_abdomen', value: 'rigid_board_belly', label: 'Stomach feels rock hard / intensely tender to light touch', labelHi: 'पेट पत्थर जैसा सख्त लगना / छूने पर अत्यधिक असहनीय दर्द', isRedFlag: true },
      { id: 'opt_stom_inability_fluids', value: 'cannot_keep_fluids', label: 'Inability to keep any fluids down for >12 hours', labelHi: '12 घंटे से अधिक समय से पानी भी न पच पाना' },
      { id: 'opt_stom_none', value: 'none', label: 'None of these signs', labelHi: 'इनमें से कोई भी लक्षण नहीं' },
    ],
  },

  // =========================================================================
  // 5. COUGH & RESPIRATORY (sym_cough & sym_respiratory_symptoms)
  // =========================================================================
  {
    id: 'q_cough_type',
    symptomId: 'sym_cough',
    category: 'character',
    type: 'single_choice',
    text: 'What type of cough are you experiencing?',
    textHi: 'आपकी खांसी का प्रकार कैसा है?',
    isRequired: true,
    sortOrder: 40,
    options: [
      { id: 'opt_cough_dry', value: 'dry_hacking', label: 'Dry, tickly, hacking cough (no phlegm)', labelHi: 'सूखी, गले में चुभने वाली खांसी (कोई बलगम नहीं)' },
      { id: 'opt_cough_wet_clear', value: 'wet_clear_phlegm', label: 'Wet cough with clear / whitish mucus', labelHi: 'गीली खांसी, साफ या सफेद बलगम के साथ' },
      { id: 'opt_cough_wet_yellow', value: 'wet_yellow_green', label: 'Wet cough with thick yellow or greenish phlegm', labelHi: 'गीली खांसी, गाढ़े पीले या हरे बलगम के साथ' },
      { id: 'opt_cough_blood', value: 'blood_streaked', label: 'Coughing up blood or rust-colored streaks', labelHi: 'खांसी में खून या जंग के रंग की धारियां', isRedFlag: true },
    ],
  },
  {
    id: 'q_respiratory_rest_exertion',
    symptomId: 'sym_respiratory_symptoms',
    category: 'severity',
    type: 'single_choice',
    text: 'When do you feel shortness of breath?',
    textHi: 'सांस फूलने की समस्या कब महसूस होती है?',
    isRequired: true,
    sortOrder: 41,
    options: [
      { id: 'opt_resp_rest', value: 'at_rest', label: 'Even while resting or speaking full sentences', labelHi: 'आराम करते हुए या बात करते समय भी', isRedFlag: true },
      { id: 'opt_resp_light_walk', value: 'light_activity', label: 'During mild walking or household chores', labelHi: 'हल्का टहलने या घरेलू काम करने पर' },
      { id: 'opt_resp_heavy_exercise', value: 'heavy_exertion', label: 'Only during brisk exercise or climbing stairs', labelHi: 'केवल तेज दौड़ने या सीढ़ियां चढ़ने पर' },
    ],
  },
  {
    id: 'q_respiratory_red_flags',
    symptomId: 'sym_respiratory_symptoms',
    category: 'red_flags',
    type: 'multiple_choice',
    text: 'Are you observing any of the following critical breathing signs?',
    textHi: 'क्या आपको सांस लेने के साथ इनमें से कोई गंभीर लक्षण दिख रहे हैं?',
    isRequired: true,
    isRedFlagScreening: true,
    sortOrder: 42,
    options: [
      { id: 'opt_resp_blue_lips', value: 'cyanosis_lips_nails', label: 'Bluish or pale tint to lips, face, or fingernails', labelHi: 'होंठों, चेहरे या नाखूनों का नीला या पीला पड़ना', isRedFlag: true },
      { id: 'opt_resp_stridor_wheeze', value: 'audible_stridor', label: 'High-pitched whistling sound during every breath', labelHi: 'हर सांस के साथ तेज सीटी जैसी आवाज (घरघराहट)' },
      { id: 'opt_resp_chest_indrawing', value: 'chest_retraction', label: 'Ribs pulling in deeply during breathing (chest retraction)', labelHi: 'सांस लेते समय पसलियों का गहराई से अंदर धंसना', isRedFlag: true },
      { id: 'opt_resp_none', value: 'none', label: 'None of these', labelHi: 'इनमें से कोई नहीं' },
    ],
  },

  // =========================================================================
  // 6. SORE THROAT & COLD (sym_sore_throat, sym_cold)
  // =========================================================================
  {
    id: 'q_cold_duration',
    symptomId: 'sym_cold',
    category: 'duration',
    type: 'single_choice',
    text: 'What are your primary nasal and head cold symptoms?',
    textHi: 'आपके जुकाम के मुख्य लक्षण क्या हैं?',
    isRequired: true,
    sortOrder: 50,
    options: [
      { id: 'opt_cold_runny', value: 'runny_watery', label: 'Watery runny nose with frequent sneezing', labelHi: 'पानी जैसी बहती नाक और बार-बार छींकें' },
      { id: 'opt_cold_blocked', value: 'stuffy_congested', label: 'Both nostrils blocked / Heavy sinus pressure', labelHi: 'दोनों नथुने बंद / सिर व साइनस में भारी दबाव' },
      { id: 'opt_cold_loss_smell', value: 'loss_of_smell_taste', label: 'Loss of smell or taste sensation', labelHi: 'सूंघने या स्वाद की क्षमता में कमी' },
    ],
  },
  {
    id: 'q_throat_swallowing',
    symptomId: 'sym_sore_throat',
    category: 'severity',
    type: 'single_choice',
    text: 'How significantly does your sore throat affect swallowing?',
    textHi: 'गले की खराश निगलने की क्रिया को कितना प्रभावित कर रही है?',
    isRequired: true,
    sortOrder: 51,
    options: [
      { id: 'opt_throat_unable_swallow', value: 'cannot_swallow_saliva', label: 'Unable to swallow even liquids or saliva (drooling)', labelHi: 'पानी या लार भी नहीं निगल पा रहे हैं', isRedFlag: true },
      { id: 'opt_throat_pain_solids', value: 'pain_with_solids', label: 'Painful with solid food, but liquids are manageable', labelHi: 'ठोस भोजन में दर्द, लेकिन तरल पदार्थ पी सकते हैं' },
      { id: 'opt_throat_scratchy', value: 'mild_scratchy', label: 'Mild scratchiness or tickle', labelHi: 'हल्की खराश या चुभन' },
    ],
  },

  // =========================================================================
  // 7. DIARRHEA, VOMITING & CONSTIPATION (sym_diarrhea, sym_vomiting, sym_constipation)
  // =========================================================================
  {
    id: 'q_diarrhea_frequency',
    symptomId: 'sym_diarrhea',
    category: 'severity',
    type: 'single_choice',
    text: 'How many episodes of loose stool have occurred in the last 24 hours?',
    textHi: 'पिछले 24 घंटों में कितनी बार पतले दस्त हुए हैं?',
    isRequired: true,
    sortOrder: 60,
    options: [
      { id: 'opt_dia_1_3', value: '1_to_3_times', label: '1 to 3 times (mild)', labelHi: '1 से 3 बार (हल्का)' },
      { id: 'opt_dia_4_6', value: '4_to_6_times', label: '4 to 6 times (moderate)', labelHi: '4 से 6 बार (मध्यम)' },
      { id: 'opt_dia_more_6', value: 'more_than_6_times', label: 'More than 6 times / Continuous watery episodes', labelHi: '6 बार से अधिक / लगातार पानी जैसे दस्त' },
    ],
  },
  {
    id: 'q_diarrhea_blood_mucus',
    symptomId: 'sym_diarrhea',
    category: 'character',
    type: 'yes_no',
    text: 'Is there visible blood, black color, or mucus in the stool?',
    textHi: 'क्या मल में साफ खून, काला रंग या सफेद आंव/मवाद दिखाई दे रहा है?',
    isRequired: true,
    sortOrder: 61,
  },
  {
    id: 'q_vomit_episodes',
    symptomId: 'sym_vomiting',
    category: 'severity',
    type: 'single_choice',
    text: 'How frequently are vomiting episodes occurring?',
    textHi: 'उल्टी के दौरे कितनी बार आ रहे हैं?',
    isRequired: true,
    sortOrder: 62,
    options: [
      { id: 'opt_vom_once_twice', value: '1_2_episodes', label: '1 to 2 times after meals', labelHi: 'खाने के बाद 1 से 2 बार' },
      { id: 'opt_vom_frequent', value: 'frequent_persistent', label: 'Frequent, unable to retain water for several hours', labelHi: 'बार-बार, कई घंटों से पानी भी नहीं रुक रहा' },
      { id: 'opt_vom_only_nausea', value: 'nausea_only', label: 'Mostly feeling nauseated with dry heaving', labelHi: 'केवल जी मिचलाना और उबकाई आना' },
    ],
  },
  {
    id: 'q_constipation_duration',
    symptomId: 'sym_constipation',
    category: 'duration',
    type: 'single_choice',
    text: 'How long has it been since your last normal bowel movement?',
    textHi: 'अंतिम बार सामान्य रूप से पेट साफ हुए कितना समय हुआ है?',
    isRequired: true,
    sortOrder: 63,
    options: [
      { id: 'opt_const_2_3_days', value: '2_to_3_days', label: '2 to 3 days', labelHi: '2 से 3 दिन' },
      { id: 'opt_const_4_7_days', value: '4_to_7_days', label: '4 to 7 days', labelHi: '4 से 7 दिन' },
      { id: 'opt_const_more_week', value: 'more_than_week', label: 'More than a week', labelHi: 'एक सप्ताह से अधिक' },
    ],
  },

  // =========================================================================
  // 8. MUSCULOSKELETAL: BACK PAIN & JOINT PAIN (sym_back_pain, sym_joint_pain)
  // =========================================================================
  {
    id: 'q_back_location',
    symptomId: 'sym_back_pain',
    category: 'location',
    type: 'single_choice',
    text: 'Where on your back is the pain located?',
    textHi: 'पीठ में दर्द मुख्य रूप से किस जगह पर है?',
    isRequired: true,
    sortOrder: 70,
    options: [
      { id: 'opt_back_lower_lumbar', value: 'lower_lumbar', label: 'Lower back (lumbar area / above hips)', labelHi: 'पीठ का निचला हिस्सा (कमर / कूल्हों के ऊपर)' },
      { id: 'opt_back_radiating_leg', value: 'radiating_to_leg', label: 'Lower back radiating down into the buttocks, thigh, or foot (sciatica)', labelHi: 'कमर से शुरू होकर पैर, जांघ या पंजे तक जाने वाला दर्द (सायटिका)' },
      { id: 'opt_back_upper_shoulder', value: 'upper_between_shoulders', label: 'Upper back between the shoulder blades', labelHi: 'ऊपरी पीठ / दोनों कंधों के बीच में' },
      { id: 'opt_back_neck', value: 'cervical_neck', label: 'Neck area (cervical spine)', labelHi: 'गर्दन का हिस्सा (सर्वाइकल)' },
    ],
  },
  {
    id: 'q_back_nerve_flags',
    symptomId: 'sym_back_pain',
    category: 'red_flags',
    type: 'multiple_choice',
    text: 'Do you have any of these neurological warning signs along with your back pain?',
    textHi: 'क्या कमर दर्द के साथ इनमें से कोई तंत्रिका संबंधी लक्षण हैं?',
    isRequired: true,
    isRedFlagScreening: true,
    sortOrder: 71,
    options: [
      { id: 'opt_back_bowel_bladder_loss', value: 'cauda_equina_incontinence', label: 'Loss of bowel or bladder control / Inability to urinate', labelHi: 'पेशाब या शौच पर नियंत्रण खोना / पेशाब रुक जाना', isRedFlag: true },
      { id: 'opt_back_saddle_numbness', value: 'saddle_anesthesia', label: 'Numbness around groin / inner thighs / buttocks (saddle area)', labelHi: 'गुप्तांग या जांघों के अंदरूनी हिस्से में सुन्नपन', isRedFlag: true },
      { id: 'opt_back_foot_drop', value: 'progressive_foot_weakness', label: 'Foot weakness / Tripping while walking (foot drop)', labelHi: 'पैर उठाने में कमजोरी / चलते समय लड़खड़ाहट' },
      { id: 'opt_back_none', value: 'none', label: 'None of these symptoms', labelHi: 'इनमें से कोई भी लक्षण नहीं' },
    ],
  },
  {
    id: 'q_joint_involved',
    symptomId: 'sym_joint_pain',
    category: 'location',
    type: 'multiple_choice',
    text: 'Which joints are currently affected?',
    textHi: 'वर्तमान में कौन से जोड़ प्रभावित हैं?',
    isRequired: true,
    sortOrder: 72,
    options: [
      { id: 'opt_joint_knees', value: 'knees', label: 'Knees (one or both)', labelHi: 'घुटने (एक या दोनों)' },
      { id: 'opt_joint_fingers_hands', value: 'fingers_wrists', label: 'Small joints of fingers & wrists', labelHi: 'हाथ की उंगलियां एवं कलाई' },
      { id: 'opt_joint_ankles_feet', value: 'ankles_feet', label: 'Ankles / Great toe (sudden intense pain)', labelHi: 'टखने / पैर का अंगूठा (अचानक तेज दर्द)' },
      { id: 'opt_joint_shoulders_hips', value: 'shoulders_hips', label: 'Shoulders or Hips', labelHi: 'कंधे या कूल्हे' },
      { id: 'opt_joint_multiple_migrating', value: 'multiple_body_joints', label: 'Multiple joints shifting across the body', labelHi: 'शरीर के कई अलग-अलग जोड़' },
    ],
  },
  {
    id: 'q_joint_swelling_warmth',
    symptomId: 'sym_joint_pain',
    category: 'character',
    type: 'single_choice',
    text: 'Is there noticeable swelling, redness, or heat in the painful joint?',
    textHi: 'क्या दर्द वाले जोड़ में सूजन, लाली या गर्माहट महसूस हो रही है?',
    isRequired: true,
    sortOrder: 73,
    options: [
      { id: 'opt_joint_hot_swollen', value: 'hot_red_swollen', label: 'Yes, noticeably swollen, warm, and red', labelHi: 'हाँ, साफ सूजन, लालिमा और गर्माहट है' },
      { id: 'opt_joint_mild_stiffness', value: 'stiff_morning_only', label: 'Morning stiffness lasting >30 minutes without intense heat', labelHi: 'सुबह 30 मिनट से अधिक अकड़न, लेकिन तेज गर्मी नहीं' },
      { id: 'opt_joint_pain_only', value: 'pain_on_movement_only', label: 'Ache primarily during movement or weight bearing', labelHi: 'केवल चलने-फिरने या वजन उठाने पर दर्द' },
    ],
  },

  // =========================================================================
  // 9. SKIN & ALLERGIES (sym_skin_problems, sym_allergies)
  // =========================================================================
  {
    id: 'q_skin_appearance',
    symptomId: 'sym_skin_problems',
    category: 'character',
    type: 'single_choice',
    text: 'How does the skin rash or lesion appear?',
    textHi: 'त्वचा के चकत्ते या दाने किस प्रकार दिखाई दे रहे हैं?',
    isRequired: true,
    sortOrder: 80,
    options: [
      { id: 'opt_skin_hives', value: 'raised_red_welts_hives', label: 'Raised red itchy welts / hives that change spots (urticaria)', labelHi: 'उभरे हुए लाल खुजलीदार चकत्ते / पित्ती' },
      { id: 'opt_skin_dry_scaly', value: 'dry_flaking_patches', label: 'Dry, red, flaking, cracked patches (eczema-like)', labelHi: 'सूखी, पपड़ीदार, फटी हुई लाल त्वचा' },
      { id: 'opt_skin_blisters_pus', value: 'fluid_blisters_pus', label: 'Fluid-filled blisters or pus-filled pimples', labelHi: 'पानी भरे छाले या मवाद वाले दाने' },
      { id: 'opt_skin_target_rings', value: 'expanding_bullseye_ring', label: 'Expanding circular or ring-shaped redness', labelHi: 'गोल छल्ले के आकार में फैलती लाली' },
    ],
  },
  {
    id: 'q_allergy_trigger',
    symptomId: 'sym_allergies',
    category: 'context',
    type: 'single_choice',
    text: 'What do you suspect might have triggered the reaction?',
    textHi: 'आपको क्या लगता है कि यह प्रतिक्रिया किस वजह से शुरू हुई?',
    isRequired: false,
    sortOrder: 81,
    options: [
      { id: 'opt_all_medication', value: 'new_medication', label: 'Recently started medication or supplement', labelHi: 'हाल ही में शुरू की गई कोई दवा' },
      { id: 'opt_all_food', value: 'specific_food_nut_seafood', label: 'Specific food (nuts, dairy, seafood, eggs, etc.)', labelHi: 'कोई विशेष भोजन (मेवे, दूध, सी-फूड, अंडा आदि)' },
      { id: 'opt_all_insect_plant', value: 'insect_sting_plant', label: 'Insect bite, sting, or plant contact', labelHi: 'कीड़ा काटने या पौधे के संपर्क में आने से' },
      { id: 'opt_all_dust_pollen', value: 'environmental_dust_pollen', label: 'Dust, animal fur, or pollen', labelHi: 'धूल, पालतू जानवर के बाल या परागकण' },
      { id: 'opt_all_unknown', value: 'unknown_trigger', label: 'Unknown / Not sure', labelHi: 'अज्ञात / निश्चित नहीं' },
    ],
  },
  {
    id: 'q_allergy_airway_screen',
    symptomId: 'sym_allergies',
    category: 'red_flags',
    type: 'multiple_choice',
    text: 'Are you experiencing any of these rapid-onset allergic signs?',
    textHi: 'क्या आपको अचानक इनमें से कोई गंभीर एलर्जी लक्षण महसूस हो रहे हैं?',
    isRequired: true,
    isRedFlagScreening: true,
    sortOrder: 82,
    options: [
      { id: 'opt_all_lip_tongue_swelling', value: 'swelling_lips_tongue_throat', label: 'Swelling of the lips, tongue, or throat closing up', labelHi: 'होंठ, जीभ या गले में तेजी से सूजन आना', isRedFlag: true },
      { id: 'opt_all_wheezing_breathing', value: 'acute_wheezing_gasping', label: 'Difficulty breathing or sudden wheezing', labelHi: 'सांस लेने में भारी कठिनाई या घरघराहट', isRedFlag: true },
      { id: 'opt_all_dizziness_collapse', value: 'severe_dizziness_collapse', label: 'Severe dizziness, fainting, or sudden collapse', labelHi: 'तेज चक्कर आना, बेहोशी या गिर पड़ना', isRedFlag: true },
      { id: 'opt_all_none', value: 'none', label: 'None of these signs', labelHi: 'इनमें से कोई नहीं' },
    ],
  },

  // =========================================================================
  // 10. FATIGUE & DIZZINESS (sym_fatigue, sym_dizziness)
  // =========================================================================
  {
    id: 'q_fatigue_duration',
    symptomId: 'sym_fatigue',
    category: 'duration',
    type: 'single_choice',
    text: 'How long has severe fatigue or low energy been present?',
    textHi: 'अत्यधिक थकान या ऊर्जा की कमी कितने समय से महसूस हो रही है?',
    isRequired: true,
    sortOrder: 90,
    options: [
      { id: 'opt_fat_recent_days', value: 'under_2_weeks', label: 'Recent onset (< 2 weeks)', labelHi: 'हाल ही में शुरू हुई (< 2 सप्ताह)' },
      { id: 'opt_fat_persistent_weeks', value: '2_to_6_weeks', label: 'Persistent (2 to 6 weeks)', labelHi: 'लगातार बनी हुई (2 से 6 सप्ताह)' },
      { id: 'opt_fat_chronic_months', value: 'more_than_6_months', label: 'Chronic (> 6 months interfering with work/routine)', labelHi: 'लंबे समय से (> 6 महीने से काम में रुकावट)' },
    ],
  },
  {
    id: 'q_dizziness_type',
    symptomId: 'sym_dizziness',
    category: 'character',
    type: 'single_choice',
    text: 'What best describes the sensation of dizziness?',
    textHi: 'चक्कर आने की अनुभूति का सबसे सटीक वर्णन कौन सा है?',
    isRequired: true,
    sortOrder: 91,
    options: [
      { id: 'opt_diz_spinning_room', value: 'true_spinning_vertigo', label: 'Room is spinning or tilting around you (vertigo)', labelHi: 'कमरा या आसपास की चीजें घूमती हुई लग रही हैं (वर्टिगो)' },
      { id: 'opt_diz_faint_standing', value: 'lightheaded_postural', label: 'Feeling faint/woozy when standing up quickly (lightheaded)', labelHi: 'अचानक खड़े होने पर आंखों के आगे अंधेरा या हल्कापन' },
      { id: 'opt_diz_unsteady_walking', value: 'unsteady_equilibrium', label: 'Feeling off-balance while walking without room spinning', labelHi: 'चलते समय लड़खड़ाहट या संतुलन की कमी' },
    ],
  },

  // =========================================================================
  // 11. URINARY SYMPTOMS (sym_urinary_symptoms)
  // =========================================================================
  {
    id: 'q_urine_burning',
    symptomId: 'sym_urinary_symptoms',
    category: 'character',
    type: 'single_choice',
    text: 'What is your primary urinary symptom?',
    textHi: 'पेशाब से संबंधित आपकी मुख्य समस्या क्या है?',
    isRequired: true,
    sortOrder: 100,
    options: [
      { id: 'opt_uri_burning_pain', value: 'burning_dysuria', label: 'Burning, stinging sensation during urination', labelHi: 'पेशाब करते समय जलन या चुभन' },
      { id: 'opt_uri_frequency_urgency', value: 'frequency_urgency', label: 'Needing to urinate every few minutes with strong urgency', labelHi: 'बार-बार पेशाब की तीव्र इच्छा होना' },
      { id: 'opt_uri_weak_stream', value: 'hesitancy_weak_stream', label: 'Difficulty starting urine or very weak stream', labelHi: 'पेशाब शुरू करने में कठिनाई या बहुत धीमी धार' },
      { id: 'opt_uri_blood', value: 'visible_hematuria', label: 'Visible blood or pink/cola-colored urine', labelHi: 'पेशाब में खून या गुलाबी/भूरा रंग', isRedFlag: true },
    ],
  },
  {
    id: 'q_urine_fever_back',
    symptomId: 'sym_urinary_symptoms',
    category: 'associated',
    type: 'yes_no',
    text: 'Do you also have high fever with shivering or deep pain on one side of your lower back / flank?',
    textHi: 'क्या आपको पेशाब की समस्या के साथ तेज बुखार, कंपकंपी या पीठ के एक तरफ तेज दर्द है?',
    isRequired: true,
    sortOrder: 101,
  },

  // =========================================================================
  // 12. EYE, EAR & DENTAL SYMPTOMS (sym_eye_symptoms, sym_ear_symptoms, sym_dental_symptoms)
  // =========================================================================
  {
    id: 'q_eye_redness',
    symptomId: 'sym_eye_symptoms',
    category: 'character',
    type: 'single_choice',
    text: 'What specific eye symptoms are present?',
    textHi: 'आंखों में कौन से विशिष्ट लक्षण मौजूद हैं?',
    isRequired: true,
    sortOrder: 110,
    options: [
      { id: 'opt_eye_red_sticky', value: 'red_sticky_discharge', label: 'Redness with sticky yellow/green crust or discharge', labelHi: 'लालिमा के साथ चिपचिपा पीला/हरा स्राव या कीचड़' },
      { id: 'opt_eye_severe_pain_vision', value: 'severe_pain_vision_drop', label: 'Severe deep eye ache with sudden loss/blur of vision', labelHi: 'आंख में असहनीय गहरा दर्द और अचानक रोशनी कम होना', isRedFlag: true },
      { id: 'opt_eye_itching_watery', value: 'itching_watery_allergies', label: 'Both eyes itchy, watery, and gritty (allergic/viral)', labelHi: 'दोनों आंखों में खुजली, पानी और किरकिरापन' },
    ],
  },
  {
    id: 'q_ear_pain_loc',
    symptomId: 'sym_ear_symptoms',
    category: 'character',
    type: 'single_choice',
    text: 'What is happening with your ear?',
    textHi: 'कान में क्या समस्या महसूस हो रही है?',
    isRequired: true,
    sortOrder: 111,
    options: [
      { id: 'opt_ear_deep_pain', value: 'deep_throbbing_earache', label: 'Deep throbbing earache inside the ear canal', labelHi: 'कान के अंदर गहरा टीस मारने वाला दर्द' },
      { id: 'opt_ear_fluid_drainage', value: 'pus_fluid_discharge', label: 'Fluid, pus, or foul-smelling drainage from the ear', labelHi: 'कान से मवाद, पानी या बदबूदार स्राव निकलना' },
      { id: 'opt_ear_tinnitus_block', value: 'ringing_clogged_hearing_loss', label: 'Ringing sounds (tinnitus) or feeling clogged/muffled', labelHi: 'कान में सीटी/घंटी जैसी आवाज या सुनाई कम देना' },
    ],
  },
  {
    id: 'q_dental_sensitivity',
    symptomId: 'sym_dental_symptoms',
    category: 'character',
    type: 'single_choice',
    text: 'What best describes your dental concern?',
    textHi: 'दांत या मसूड़ों की समस्या का विवरण क्या है?',
    isRequired: true,
    sortOrder: 112,
    options: [
      { id: 'opt_den_throbbing_ache', value: 'constant_throbbing_toothache', label: 'Constant throbbing pain keeping you awake', labelHi: 'लगातार तेज धड़कता हुआ दांत दर्द जो सोने न दे' },
      { id: 'opt_den_hot_cold_sensitive', value: 'temperature_sensitivity', label: 'Sharp pain only when eating hot, cold, or sweet food', labelHi: 'केवल ठंडा, गर्म या मीठा खाने पर तेज झनझनाहट' },
      { id: 'opt_den_swollen_jaw_face', value: 'swollen_jaw_gum_abscess', label: 'Swelling in the gums, jawline, or side of the face', labelHi: 'मसूड़े, जबड़े या चेहरे पर सूजन (मवाद का फोड़ा)', isRedFlag: true },
    ],
  },

  // =========================================================================
  // 13. MENSTRUAL CONCERNS (sym_menstrual_concerns)
  // =========================================================================
  {
    id: 'q_menstrual_issue_type',
    symptomId: 'sym_menstrual_concerns',
    category: 'character',
    type: 'single_choice',
    text: 'What is the main menstrual concern you are experiencing?',
    textHi: 'मासिक धर्म से संबंधित आपकी मुख्य चिंता क्या है?',
    isRequired: true,
    sortOrder: 120,
    options: [
      { id: 'opt_mens_severe_cramps', value: 'severe_dysmenorrhea', label: 'Severe lower abdominal/back cramping during periods', labelHi: 'मासिक धर्म के दौरान असहनीय पेट व कमर दर्द' },
      { id: 'opt_mens_heavy_bleeding', value: 'excessive_heavy_flow', label: 'Excessively heavy bleeding (soaking through a pad/tampon every hour)', labelHi: 'अत्यधिक रक्तस्राव (हर घंटे पैड बदलने की आवश्यकता)' },
      { id: 'opt_mens_irregular_delayed', value: 'delayed_irregular_cycle', label: 'Delayed, missed, or completely irregular cycle', labelHi: 'मासिक चक्र में देरी या अनियमितता' },
      { id: 'opt_mens_sudden_pelvic_pain', value: 'acute_one_sided_pelvic_pain', label: 'Sudden severe one-sided sharp pelvic pain', labelHi: 'अचानक पेट के निचले एक हिस्से में तेज दर्द', isRedFlag: true },
    ],
  },

  // =========================================================================
  // 14. GENERAL CLINICAL VITALS & MEASUREMENTS (Optional Deep Intake)
  // =========================================================================
  {
    id: 'q_vitals_blood_pressure',
    category: 'vitals',
    type: 'blood_pressure',
    text: 'What is your recent blood pressure reading (if measured)?',
    textHi: 'आपका हालिया ब्लड प्रेशर (रक्तचाप) कितना है (यदि मापा गया हो)?',
    helpText: 'Enter Systolic (top number) and Diastolic (bottom number) in mmHg.',
    helpTextHi: 'सिस्टोलिक (ऊपर का अंक) और डायस्टोलिक (नीचे का अंक) mmHg में दर्ज करें।',
    isRequired: false,
    sortOrder: 130,
  },
  {
    id: 'q_vitals_pulse_rate',
    category: 'vitals',
    type: 'measurement',
    text: 'What is your resting pulse rate in beats per minute (BPM)?',
    textHi: 'आपकी सामान्य नाड़ी गति (पल्स रेट) प्रति मिनट कितनी है?',
    isRequired: false,
    min: 40,
    max: 220,
    step: 1,
    defaultUnit: 'bpm',
    defaultUnitHi: 'बीपीएम',
    sortOrder: 131,
  },
  {
    id: 'q_vitals_spo2',
    category: 'vitals',
    type: 'measurement',
    text: 'What is your blood oxygen saturation (SpO2 %)?',
    textHi: 'आपका रक्त ऑक्सीजन स्तर (SpO2 %) कितना है?',
    isRequired: false,
    min: 70,
    max: 100,
    step: 1,
    defaultUnit: '%',
    defaultUnitHi: '%',
    sortOrder: 132,
  },

  // =========================================================================
  // 15. FREE TEXT CLINICAL REMARKS (Safe Patient Context)
  // =========================================================================
  {
    id: 'q_additional_notes',
    category: 'context',
    type: 'free_text',
    text: 'Is there anything else specific about your symptoms, triggers, or changes you would like to note?',
    textHi: 'क्या आपके लक्षणों, खान-पान या हाल के बदलावों के बारे में कोई अन्य विवरण है जो आप जोड़ना चाहते हैं?',
    helpText: 'Provide any additional context without personal identifiers.',
    helpTextHi: 'बिना किसी व्यक्तिगत पहचान के कोई भी अतिरिक्त संदर्भ प्रदान करें।',
    isRequired: false,
    sortOrder: 140,
  },
];
