import React, { createContext, useContext, useState } from 'react'

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'es'

interface LanguageOption {
  code: LanguageCode
  label: string
  nativeLabel: string
  flag: string
  bcp47: string
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    bcp47: 'en-US',
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    flag: '🇮🇳',
    bcp47: 'ta-IN',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    bcp47: 'hi-IN',
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    flag: '🇮🇳',
    bcp47: 'te-IN',
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    bcp47: 'kn-IN',
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    flag: '🇮🇳',
    bcp47: 'ml-IN',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    flag: '🇪🇸',
    bcp47: 'es-ES',
  },
]

export const TRANSLATIONS = {
  en: {
    seniorMode: 'Senior Safe Mode',
    caregiverPortal: 'Caregiver Portal',
    childrenPortal: 'Children Portal',
    doctorPortal: 'Doctor Portal',
    careCircleSetup: 'Care Circle Setup',
    goodDay: 'Good Day',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    caringWithLove: 'Caring for {honorific} with love',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    morningTime: '8:00 AM - 11:00 AM',
    afternoonTime: '12:00 PM - 3:00 PM',
    eveningTime: '5:00 PM - 7:30 PM',
    nightTime: '9:00 PM - 10:30 PM',
    iHaveTakenThis: 'I Have Taken This',
    completed: 'Completed',
    listenGuidance: 'Listen Guidance',
    stopAudio: 'Stop Audio',
    generatingVoice: 'Generating voice guidance...',
    doctorsAdvice: "Doctor's Advice",
    dose: 'Dose',
    takenToday: 'Taken Today',
    wonderfulJob: 'Wonderful job, {honorific}! All {slot} medicines completed.',
    familyNotified:
      '{childName} and your doctor have been updated on your positive adherence.',
    noMedsScheduled: 'No medications scheduled for {slot}',
    takeRest: 'Take a walk, rest, or enjoy a cup of warm herbal tea!',
    emergencyTitle: 'Emergency Assistance for {honorific}',
    emergencySubtext:
      'Feeling dizzy, unwell, or need immediate help? Pressing this will immediately call {childName} ({childPhone}) and send urgent alerts to your doctor.',
    callChildNow: 'Call {childName} (SOS)',
    callChildSos: 'Call {childName} Now',
    callingChild: 'Calling {childName} Now...',
    emergencyTriggeredBanner: 'Direct Phone Call to Children • Instant SOS',
    dialingChildrenNumber: "Dialing Children's Phone Number",
    directCall: 'Direct Call {childName}',
    whatsappSos: 'Send WhatsApp SOS Alert',
    callDoctor: 'Call Doctor: {doctorName}',
    callAmbulance: 'Call Medical Emergency Ambulance (108 / 911)',
    closeSafe: 'Close / I am safe now',
    emailsDispatched:
      'Automated high-priority emails have been dispatched to {childEmail}.',
    overview: 'Overview',
    medications: 'Medications',
    appointments: 'Appointments',
    geminiSafety: 'Gemini Safety',
    emailAlerts: 'Email Alerts',
    dailyAdherence: 'Daily Adherence',
    activeMedications: 'Active Medications',
    upcomingVisits: 'Upcoming Visits',
    geminiShield: 'Gemini Drug Safety',
    addMedication: 'Add Medication',
    passcode: 'Passcode',
    switchSeniorMode: 'Switch to Senior Mode',
  },
  ta: {
    seniorMode: 'முதியோர் பாதுகாப்பு பயன்முறை',
    caregiverPortal: 'பராமரிப்பாளர் தளம்',
    childrenPortal: 'பிள்ளைகள் தளம்',
    doctorPortal: 'மருத்துவர் தளம்',
    careCircleSetup: 'பாதுகாப்பு வட்டம்',
    goodDay: 'வணக்கம்',
    goodMorning: 'காலை வணக்கம்',
    goodAfternoon: 'மதிய வணக்கம்',
    goodEvening: 'மாலை வணக்கம்',
    caringWithLove: '{honorific} வை அன்போடும் அக்கறையோடும் கவனித்துக் கொள்கிறோம்',
    morning: 'காலை',
    afternoon: 'மதியம்',
    evening: 'மாலை',
    night: 'இரவு',
    morningTime: 'காலை 8:00 - 11:00',
    afternoonTime: 'மதியம் 12:00 - 3:00',
    eveningTime: 'மாலை 5:00 - 7:30',
    nightTime: 'இரவு 9:00 - 10:30',
    iHaveTakenThis: 'மருந்து சாப்பிட்டேன்',
    completed: 'முடிந்தது ✓',
    listenGuidance: 'குரல் வழிகாட்டல்',
    stopAudio: 'நிறுத்து',
    generatingVoice: 'குரல் வழிகாட்டல் தயாராகிறது...',
    doctorsAdvice: 'மருத்துவரின் அறிவுரை',
    dose: 'அளவு',
    takenToday: 'இன்று உட்கொண்டது',
    wonderfulJob: 'அற்புதம், {honorific}! அனைத்து {slot} மருந்துகளையும் முடித்தீர்கள்.',
    familyNotified:
      'உங்கள் பிள்ளை {childName} மற்றும் மருத்துவருக்கு தகவல் அனுப்பப்பட்டது.',
    noMedsScheduled: '{slot} நேரத்தில் மருந்துகள் ஏதுமில்லை',
    takeRest: 'நன்றாக ஓய்வெடுங்கள் அல்லது வெதுவெதுப்பான நீர் அருந்துங்கள்!',
    emergencyTitle: '{honorific} விற்கான அவசர உதவி',
    emergencySubtext:
      'மயக்கம், உடல்நலக் குறைவு அல்லது அவசர உதவி தேவையா? இதனை அழுத்தினால் உடனடியாக உங்கள் பிள்ளை {childName} ({childPhone}) க்கு நேரடி தொலைபேசி அழைப்பு செல்லும்.',
    callChildNow: '{childName} ஐ அழையுங்கள் (SOS)',
    callChildSos: '{childName} க்கு உடனே அழையுங்கள்',
    callingChild: '{childName} க்கு அழைப்பு போகிறது...',
    emergencyTriggeredBanner: 'பிள்ளைக்கு நேரடி அழைப்பு • உடனடி அவசர உதவி',
    dialingChildrenNumber: 'பிள்ளையின் தொலைபேசி எண்',
    directCall: '{childName} ஐ நேரடியாக அழையுங்கள்',
    whatsappSos: 'வாட்ஸ்அப் அவசர எச்சரிக்கை அனுப்பவும்',
    callDoctor: 'மருத்துவரை அழையுங்கள்: {doctorName}',
    callAmbulance: 'ஆம்புலன்ஸ் அவசர அழைப்பு (108)',
    closeSafe: 'மூடு / நான் பாதுகாப்பாக உள்ளேன்',
    emailsDispatched:
      'தானியங்கி அவசர மின்னஞ்சல் {childEmail} முகவரிக்கு அனுப்பப்பட்டுள்ளது.',
    overview: 'கண்ணோட்டம்',
    medications: 'மருந்துகள்',
    appointments: 'சந்திப்புகள்',
    geminiSafety: 'ஜெமினி பாதுகாப்பு',
    emailAlerts: 'மின்னஞ்சல் எச்சரிக்கை',
    dailyAdherence: 'தினசரி மருந்து ஒழுங்கு',
    activeMedications: 'தற்போதைய மருந்துகள்',
    upcomingVisits: 'அடுத்த சந்திப்புகள்',
    geminiShield: 'ஜெமினி மருந்து பாதுகாப்பு',
    addMedication: 'மருந்து சேர்க்க',
    passcode: 'ரகசிய குறியீடு',
    switchSeniorMode: 'முதியோர் பயன்முறைக்கு மாறுக',
  },
  hi: {
    seniorMode: 'वरिष्ठ नागरिक मोड',
    caregiverPortal: 'देखभालकर्ता पोर्टल',
    childrenPortal: 'बच्चों का पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    careCircleSetup: 'सुरक्षा दायरा सेटअप',
    goodDay: 'नमस्ते',
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    caringWithLove: '{honorific} की प्रेम और स्नेह से देखभाल',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    night: 'रात',
    morningTime: 'सुबह 8:00 - 11:00',
    afternoonTime: 'दोपहर 12:00 - 3:00',
    eveningTime: 'शाम 5:00 - 7:30',
    nightTime: 'रात 9:00 - 10:30',
    iHaveTakenThis: 'मैंने दवा ले ली है',
    completed: 'पूर्ण ✓',
    listenGuidance: 'आवाज में सुनें',
    stopAudio: 'आवाज रोकें',
    generatingVoice: 'आवाज तैयार हो रही है...',
    doctorsAdvice: 'डॉक्टर की सलाह',
    dose: 'खुराक',
    takenToday: 'आज ले ली गई',
    wonderfulJob: 'शाबाश, {honorific}! सभी {slot} की दवाइयाँ पूरी हो गईं।',
    familyNotified: 'आपके बच्चे {childName} और डॉक्टर को सूचना दे दी गई है।',
    noMedsScheduled: '{slot} के लिए कोई दवा निर्धारित नहीं है',
    takeRest: 'आराम करें, टहलें या गर्म पानी/हर्बल चाय पिएं!',
    emergencyTitle: '{honorific} के लिए आपातकालीन सहायता',
    emergencySubtext:
      'चक्कर आ रहे हैं, अस्वस्थ महसूस हो रहा है या तुरंत मदद चाहिए? इसे दबाने पर तुरंत {childName} ({childPhone}) को सीधा फोन लगेगा।',
    callChildNow: '{childName} को कॉल करें (SOS)',
    callChildSos: '{childName} को अभी कॉल करें',
    callingChild: '{childName} को कॉल जा रहा है...',
    emergencyTriggeredBanner: 'बच्चों को सीधी कॉल • तत्काल आपातकालीन सहायता',
    dialingChildrenNumber: 'बच्चे का फोन नंबर',
    directCall: '{childName} को सीधी कॉल करें',
    whatsappSos: 'व्हाट्सएप पर आपातकालीन संदेश भेजें',
    callDoctor: 'डॉक्टर को कॉल करें: {doctorName}',
    callAmbulance: 'एम्बुलेंस को कॉल करें (108 / 911)',
    closeSafe: 'बंद करें / मैं अब सुरक्षित हूँ',
    emailsDispatched: 'तत्काल ईमेल {childEmail} पर भेज दी गई है।',
    overview: 'अवलोकन',
    medications: 'दवाइयां',
    appointments: 'मुलाकातें',
    geminiSafety: 'जेमिनी सुरक्षा',
    emailAlerts: 'ईमेल सूचनाएं',
    dailyAdherence: 'दैनिक अनुपालन',
    activeMedications: 'सक्रिय दवाइयां',
    upcomingVisits: 'आगामी मुलाकातें',
    geminiShield: 'जेमिनी दवा सुरक्षा ढाल',
    addMedication: 'दवा जोड़ें',
    passcode: 'पासकोड',
    switchSeniorMode: 'वरिष्ठ मोड में जाएं',
  },
  te: {
    seniorMode: 'సీనియర్ సేఫ్ మోడ్',
    caregiverPortal: 'సంరక్షకుల పోర్టల్',
    childrenPortal: 'పిల్లల పోర్టల్',
    doctorPortal: 'డాక్టర్ పోర్టల్',
    careCircleSetup: 'కేర్ సర్కిల్ సెటప్',
    goodDay: 'నమస్కారం',
    goodMorning: 'శుభోదయం',
    goodAfternoon: 'శుభ మధ్యాహ్నం',
    goodEvening: 'శుభ సాయంత్రం',
    caringWithLove: '{honorific} ని ప్రేమతో చూసుకుంటున్నాము',
    morning: 'ఉదయం',
    afternoon: 'మధ్యాహ్నం',
    evening: 'సాయంత్రం',
    night: 'రాత్రి',
    morningTime: 'ఉదయం 8:00 - 11:00',
    afternoonTime: 'మధ్యాహ్నం 12:00 - 3:00',
    eveningTime: 'సాయంత్రం 5:00 - 7:30',
    nightTime: 'రాత్రి 9:00 - 10:30',
    iHaveTakenThis: 'నేను మందు వేసుకున్నాను',
    completed: 'పూర్తయింది ✓',
    listenGuidance: 'వాయిస్ వినండి',
    stopAudio: 'ఆపండి',
    generatingVoice: 'వాయిస్ సిద్ధమవుతోంది...',
    doctorsAdvice: 'డాక్టర్ సలహా',
    dose: 'మోతాదు',
    takenToday: 'ఈరోజు తీసుకున్నారు',
    wonderfulJob: 'చాలా బాగుంది, {honorific}! అన్ని {slot} మందులు పూర్తయ్యాయి.',
    familyNotified: 'మీ పిల్లలు {childName} మరియు డాక్టర్‌కు సమాచారం అందింది.',
    noMedsScheduled: '{slot} సమయంలో మందులు ఏవీ లేవు',
    takeRest: 'విశ్రాంతి తీసుకోండి లేదా వేడి నీరు త్రాగండి!',
    emergencyTitle: '{honorific} అత్యవసర సహాయం',
    emergencySubtext:
      'సహాయం కావాలన్నా లేదా కళ్లు తిరుగుతున్నా? ఇది నొక్కితే వెంటనే {childName} ({childPhone}) కి కాల్ వెళ్తుంది.',
    callChildNow: '{childName} కి కాల్ చేయండి (SOS)',
    callChildSos: '{childName} కి వెంటనే కాల్ చేయండి',
    callingChild: '{childName} కి కాల్ వెళ్తోంది...',
    emergencyTriggeredBanner: 'పిల్లలకు డైరెక్ట్ కాల్ • అత్యవసర సహాయం',
    dialingChildrenNumber: 'పిల్లల ఫోన్ నంబర్',
    directCall: '{childName} కి డైరెక్ట్ కాల్',
    whatsappSos: 'వాట్సాప్ అత్యవసర సందేశం',
    callDoctor: 'డాక్టర్ కి కాల్ చేయండి: {doctorName}',
    callAmbulance: 'అంబులెన్స్ కాల్ చేయండి (108 / 911)',
    closeSafe: 'మూసివేయి / నేను సురక్షితంగా ఉన్నాను',
    emailsDispatched: 'అత్యవసర ఈమెయిల్ {childEmail} కి పంపబడింది.',
    overview: 'అవలోకనం',
    medications: 'మందులు',
    appointments: 'అపాయింట్‌మెంట్లు',
    geminiSafety: 'జెమినీ భద్రత',
    emailAlerts: 'ఈమెయిల్ హెచ్చరికలు',
    dailyAdherence: 'రోజువారీ క్రమశిక్షణ',
    activeMedications: 'ప్రస్తుత మందులు',
    upcomingVisits: 'రాబోయే సందర్శనలు',
    geminiShield: 'జెమినీ సేఫ్టీ షీల్డ్',
    addMedication: 'మందు జోడించండి',
    passcode: 'పాస్‌కోడ్',
    switchSeniorMode: 'సీనియర్ మోడ్‌కు మారండి',
  },
  kn: {
    seniorMode: 'ಹಿರಿಯರ ಸುರಕ್ಷಿತ ಮೋಡ್',
    caregiverPortal: 'ಆರೈಕೆದಾರರ ಪೋರ್ಟಲ್',
    childrenPortal: 'ಮಕ್ಕಳ ಪೋರ್ಟಲ್',
    doctorPortal: 'ವೈದ್ಯರ ಪೋರ್ಟಲ್',
    careCircleSetup: 'ಆರೈಕೆ ವೃತ್ತ ಸೆಟಪ್',
    goodDay: 'ನಮಸ್ಕಾರ',
    goodMorning: 'ಶುಭೋದಯ',
    goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
    goodEvening: 'ಶುಭ ಸಂಜೆ',
    caringWithLove: '{honorific} ಅವರನ್ನು ಪ್ರೀತಿಯಿಂದ ನೋಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ',
    morning: 'ಬೆಳಗ್ಗೆ',
    afternoon: 'ಮಧ್ಯಾಹ್ನ',
    evening: 'ಸಂಜೆ',
    night: 'ರಾತ್ರಿ',
    morningTime: 'ಬೆಳಗ್ಗೆ 8:00 - 11:00',
    afternoonTime: 'ಮಧ್ಯಾಹ್ನ 12:00 - 3:00',
    eveningTime: 'ಸಂಜೆ 5:00 - 7:30',
    nightTime: 'ರಾತ್ರಿ 9:00 - 10:30',
    iHaveTakenThis: 'ಔಷಧಿ ಸೇವಿಸಿದ್ದೇನೆ',
    completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ ✓',
    listenGuidance: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ',
    stopAudio: 'ನಿಲ್ಲಿಸಿ',
    generatingVoice: 'ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    doctorsAdvice: 'ವೈದ್ಯರ ಸಲಹೆ',
    dose: 'ಪ್ರಮಾಣ',
    takenToday: 'ಇಂದು ಸೇವಿಸಲಾಗಿದೆ',
    wonderfulJob: 'ಅದ್ಭುತ, {honorific}! ಎಲ್ಲಾ {slot} ಔಷಧಿಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ.',
    familyNotified: 'ನಿಮ್ಮ ಮಕ್ಕಳು {childName} ಮತ್ತು ವೈದ್ಯರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ.',
    noMedsScheduled: '{slot} ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಔಷಧಿಗಳಿಲ್ಲ',
    takeRest: 'ಆರಾಮವಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಅಥವಾ ಬಿಸಿ ನೀರು ಕುಡಿಯಿರಿ!',
    emergencyTitle: '{honorific} ಅವರಿಗೆ ತುರ್ತು ಸಹಾಯ',
    emergencySubtext:
      'ಅಸ್ವಸ್ಥತೆ ಅಥವಾ ತುರ್ತು ಸಹಾಯ ಬೇಕೇ? ಇದನ್ನು ಒತ್ತಿದರೆ ತಕ್ಷಣ {childName} ({childPhone}) ಅವರಿಗೆ ಕರೆ ಹೋಗುತ್ತದೆ.',
    callChildNow: '{childName} ಕರೆ ಮಾಡಿ (SOS)',
    callChildSos: '{childName} ಅವರಿಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ',
    callingChild: '{childName} ಅವರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    emergencyTriggeredBanner: 'ಮಕ್ಕಳಿಗೆ ನೇರ ಕರೆ • ತುರ್ತು ಸಹಾಯ',
    dialingChildrenNumber: 'ಮಕ್ಕಳ ಫೋನ್ ಸಂಖ್ಯೆ',
    directCall: '{childName} ಅವರಿಗೆ ನೇರ ಕರೆ',
    whatsappSos: 'ವಾಟ್ಸಾಪ್ ತುರ್ತು ಸಂದೇಶ ಕಳುಹಿಸಿ',
    callDoctor: 'ವೈದ್ಯರಿಗೆ ಕರೆ ಮಾಡಿ: {doctorName}',
    callAmbulance: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ (108 / 911)',
    closeSafe: 'ಮುಚ್ಚಿ / ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆ',
    emailsDispatched: 'ತುರ್ತು ಇಮೇಲ್ ಅನ್ನು {childEmail} ಕಳುಹಿಸಲಾಗಿದೆ.',
    overview: 'ಅವಲೋಕನ',
    medications: 'ಔಷಧಿಗಳು',
    appointments: 'ನೇಮಕಾತಿಗಳು',
    geminiSafety: 'ಜೆಮಿನಿ ಸುರಕ್ಷತೆ',
    emailAlerts: 'ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳು',
    dailyAdherence: 'ದೈನಂದಿನ ಶಿಸ್ತು',
    activeMedications: 'ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು',
    upcomingVisits: 'ಮುಂಬರುವ ಭೇಟಿಗಳು',
    geminiShield: 'ಜೆಮಿನಿ ಸುರಕ್ಷತಾ ಕವಚ',
    addMedication: 'ಔಷಧಿ ಸೇರಿಸಿ',
    passcode: 'ಪಾಸ್‌ಕೋಡ್',
    switchSeniorMode: 'ಹಿರಿಯರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ',
  },
  ml: {
    seniorMode: 'സീനിയർ സേഫ് മോഡ്',
    caregiverPortal: 'കെയർടേക്കർ പോർട്ടൽ',
    childrenPortal: 'കുട്ടികളുടെ പോർട്ടൽ',
    doctorPortal: 'ഡോക്ടർ പോർട്ടൽ',
    careCircleSetup: 'കെയർ സർക്കിൾ സെറ്റപ്പ്',
    goodDay: 'നമസ്കാരം',
    goodMorning: 'സുപ്രഭാതം',
    goodAfternoon: 'ശുഭ ഉച്ചതിരിഞ്ഞ്',
    goodEvening: 'ശുഭ സായാഹ്നം',
    caringWithLove: '{honorific} യെ സ്നേഹത്തോടെ പരിചരിക്കുന്നു',
    morning: 'രാവിലെ',
    afternoon: 'ഉച്ചയ്ക്ക്',
    evening: 'വൈകുന്നേരം',
    night: 'രാത്രി',
    morningTime: 'രാവിലെ 8:00 - 11:00',
    afternoonTime: 'ഉച്ചയ്ക്ക് 12:00 - 3:00',
    eveningTime: 'വൈകുന്നേരം 5:00 - 7:30',
    nightTime: 'രാത്രി 9:00 - 10:30',
    iHaveTakenThis: 'മരുന്ന് കഴിച്ചു',
    completed: 'പൂർത്തിയായി ✓',
    listenGuidance: 'ശബ്ദം കേൾക്കുക',
    stopAudio: 'നിർത്തുക',
    generatingVoice: 'ശബ്ദം തയ്യാറാകുന്നു...',
    doctorsAdvice: 'ഡോക്ടറുടെ ഉപദേശം',
    dose: 'ഡോസ്',
    takenToday: 'ഇന്ന് കഴിച്ചു',
    wonderfulJob: 'വളരെ നന്നായി, {honorific}! എല്ലാ {slot} മരുന്നുകളും കഴിച്ചു.',
    familyNotified: 'നിങ്ങളുടെ കുട്ടി {childName} നും ഡോക്ടർക്കും വിവരം അയച്ചു.',
    noMedsScheduled: '{slot} സമയത്ത് മരുന്നുകൾ ഒന്നുമില്ല',
    takeRest: 'നന്നായി വിശ്രമിക്കൂ അല്ലെങ്കിൽ ചൂടുവെള്ളം കുടിക്കൂ!',
    emergencyTitle: '{honorific} നുള്ള അടിയന്തര സഹായം',
    emergencySubtext:
      'തലകറക്കമോ അടിയന്തര സഹായമോ ആവശ്യമുണ്ടോ? ഇത് അമർത്തിയാൽ ഉടൻ തന്നെ {childName} ({childPhone}) ലേക്ക് കോൾ പോകുന്നതാണ്.',
    callChildNow: '{childName} വിളിക്കുക (SOS)',
    callChildSos: '{childName} നെ ഉടൻ വിളിക്കുക',
    callingChild: '{childName} ലേക്ക് കോൾ പോകുന്നു...',
    emergencyTriggeredBanner: 'മക്കളിലേക്ക് നേരിട്ടുള്ള കോൾ • അടിയന്തര സഹായം',
    dialingChildrenNumber: 'മക്കളുടെ ഫോൺ നമ്പർ',
    directCall: '{childName} ലേക്ക് നേരിട്ട് വിളിക്കുക',
    whatsappSos: 'വാട്സാപ്പ് അടിയന്തര സന്ദേശം',
    callDoctor: 'ഡോക്ടറെ വിളിക്കുക: {doctorName}',
    callAmbulance: 'ആംബുലൻസ് വിളിക്കുക (108 / 911)',
    closeSafe: 'അടയ്ക്കുക / ഞാൻ സുരക്ഷിതനാണ്',
    emailsDispatched: 'അടിയന്തര ഇമെയിൽ {childEmail} ലേക്ക് അയച്ചിട്ടുണ്ട്.',
    overview: 'അവലോകനം',
    medications: 'മരുന്നുകൾ',
    appointments: 'അപ്പോയിന്റ്മെന്റുകൾ',
    geminiSafety: 'ജെമിനി സുരക്ഷ',
    emailAlerts: 'ഇമെയിൽ അലേർട്ടുകൾ',
    dailyAdherence: 'പ്രതിദിന സ്ഥിരത',
    activeMedications: 'സജീവ മരുന്നുകൾ',
    upcomingVisits: 'അടുത്ത സന്ദർശനങ്ങൾ',
    geminiShield: 'ജെമിനി സുരക്ഷാ കവചം',
    addMedication: 'മരുന്ന് ചേർക്കുക',
    passcode: 'പാസ്‌കോഡ്',
    switchSeniorMode: 'സീനിയർ മോഡിലേക്ക് മാറുക',
  },
  es: {
    seniorMode: 'Modo para Mayores',
    caregiverPortal: 'Portal del Cuidador',
    childrenPortal: 'Portal de los Hijos',
    doctorPortal: 'Portal del Médico',
    careCircleSetup: 'Círculo de Cuidado',
    goodDay: 'Buen día',
    goodMorning: 'Buenos días',
    goodAfternoon: 'Buenas tardes',
    goodEvening: 'Buenas noches',
    caringWithLove: 'Cuidando a {honorific} con amor y atención',
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Atardecer',
    night: 'Noche',
    morningTime: '8:00 AM - 11:00 AM',
    afternoonTime: '12:00 PM - 3:00 PM',
    eveningTime: '5:00 PM - 7:30 PM',
    nightTime: '9:00 PM - 10:30 PM',
    iHaveTakenThis: 'He tomado esto',
    completed: 'Completado ✓',
    listenGuidance: 'Escuchar guía',
    stopAudio: 'Detener audio',
    generatingVoice: 'Generando guía de voz...',
    doctorsAdvice: 'Consejo del médico',
    dose: 'Dosis',
    takenToday: 'Tomado hoy',
    wonderfulJob:
      '¡Excelente trabajo, {honorific}! Todos los medicamentos de la {slot} completados.',
    familyNotified: 'Su hijo/a {childName} y su médico han sido informados.',
    noMedsScheduled: 'No hay medicamentos programados para la {slot}',
    takeRest: '¡Descanse o disfrute de una infusión caliente!',
    emergencyTitle: 'Asistencia de Emergencia para {honorific}',
    emergencySubtext:
      '¿Se siente mareado o necesita ayuda urgente? Al presionar esto llamará inmediatamente a {childName} ({childPhone}) y enviará alertas médicas.',
    callChildNow: 'Llamar a {childName} (SOS)',
    callChildSos: 'Llamar a {childName} ahora',
    callingChild: 'Llamando a {childName}...',
    emergencyTriggeredBanner: 'Llamada directa a los hijos • SOS instantáneo',
    dialingChildrenNumber: 'Marcando teléfono de los hijos',
    directCall: 'Llamar directamente a {childName}',
    whatsappSos: 'Enviar SOS por WhatsApp',
    callDoctor: 'Llamar al médico: {doctorName}',
    callAmbulance: 'Llamar a la ambulancia (108 / 911)',
    closeSafe: 'Cerrar / Estoy a salvo',
    emailsDispatched: 'Correos urgentes enviados a {childEmail}.',
    overview: 'Resumen',
    medications: 'Medicamentos',
    appointments: 'Citas médicas',
    geminiSafety: 'Seguridad Gemini',
    emailAlerts: 'Alertas de correo',
    dailyAdherence: 'Cumplimiento diario',
    activeMedications: 'Medicamentos activos',
    upcomingVisits: 'Próximas visitas',
    geminiShield: 'Escudo de seguridad Gemini',
    addMedication: 'Agregar medicamento',
    passcode: 'Código de acceso',
    switchSeniorMode: 'Cambiar a Modo para Mayores',
  },
}

export type TranslationKey = keyof typeof TRANSLATIONS.en

interface LanguageContextType {
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: TranslationKey, params?: Record<string, string>) => string
  currentOption: LanguageOption
  availableLanguages: LanguageOption[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(
    () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('carenest_language') as LanguageCode
        if (stored && TRANSLATIONS[stored]) return stored
      }
      return 'en'
    }
  )

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('carenest_language', lang)
    }
  }

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en
    let text = dict[key] || TRANSLATIONS.en[key] || String(key)

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), val)
      })
    }

    return text
  }

  const currentOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0]

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        currentOption,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Graceful fallback for components outside provider
    return {
      currentLanguage: 'en' as LanguageCode,
      setLanguage: () => {},
      t: (key: TranslationKey, params?: Record<string, string>) => {
        let text = TRANSLATIONS.en[key] || String(key)
        if (params) {
          Object.entries(params).forEach(([paramKey, val]) => {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), val)
          })
        }
        return text
      },
      currentOption: SUPPORTED_LANGUAGES[0],
      availableLanguages: SUPPORTED_LANGUAGES,
    }
  }
  return context
}
