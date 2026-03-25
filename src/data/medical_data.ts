export interface Disease {
  id: string;
  name: {
    en: string;
    hi: string;
    mr: string;
  };
  description: {
    en: string;
    hi: string;
    mr: string;
  };
  symptoms: string[];
  risk: 'Low' | 'Medium' | 'High';
  prevention: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const diseases: Disease[] = [
  {
    id: "dengue",
    name: {
      en: "Dengue",
      hi: "डेंगू",
      mr: "डेंग्यू"
    },
    description: {
      en: "Viral fever by Aedes mosquito. Peak in monsoon season.",
      hi: "एडीज मच्छर द्वारा वायरल बुखार। मानसून के मौसम में चरम पर।",
      mr: "एडिस डासामुळे होणारा विषाणूजन्य ताप. पावसाळ्यात प्रमाण जास्त."
    },
    symptoms: ["fever", "severe headache", "joint pain", "eye pain", "rash"],
    risk: "High",
    prevention: {
      en: "Mosquito repellent, eliminate stagnant water, full-sleeve clothes",
      hi: "मच्छर निरोधक का प्रयोग करें, रुका हुआ पानी हटा दें, पूरी बाजू के कपड़े पहनें",
      mr: "मच्छरदाणी वापरा, साचलेले पाणी काढून टाका, लांब बाह्यांचे कपडे घाला"
    }
  },
  {
    id: "malaria",
    name: {
      en: "Malaria",
      hi: "मलेरिया",
      mr: "मलेरिया"
    },
    description: {
      en: "Parasitic infection transmitted by Anopheles mosquitoes.",
      hi: "एनाफिलीज मच्छरों द्वारा प्रेषित परजीवी संक्रमण।",
      mr: "अॅनोफिलिस डासांमुळे पसरणारा परजीवी संसर्ग."
    },
    symptoms: ["shivering", "fever", "sweating", "nausea", "headache"],
    risk: "Medium",
    prevention: {
      en: "Use insect repellent, wear long sleeves, sleep under nets.",
      hi: "कीट निरोधक का प्रयोग करें, पूरी बाजू के कपड़े पहनें, जाली के नीचे सोएं।",
      mr: "कीटकनाशक वापरा, लांब बाह्यांचे कपडे घाला, जाळीखाली झोपा."
    }
  },
  {
    id: "flu",
    name: {
      en: "Flu (Influenza)",
      hi: "फ्लू (इन्फ्लुएंजा)",
      mr: "फ्लू (इन्फ्लुएन्झा)"
    },
    description: {
      en: "Common respiratory illness caused by influenza viruses.",
      hi: "इन्फ्लूएंजा वायरस के कारण होने वाली आम श्वसन बीमारी।",
      mr: "इन्फ्लूएंझा विषाणूंमुळे होणारा सामान्य श्वसन रोग."
    },
    symptoms: ["cough", "runny nose", "sneezing", "sore throat", "fever"],
    risk: "Low",
    prevention: {
      en: "Wash hands, avoid cold drinks, get vaccinated annually.",
      hi: "हाथ धोएं, ठंडे पेय से बचें, सालाना टीकाकरण करवाएं।",
      mr: "हात धुवा, थंड पेये टाळा, दरवर्षी लसीकरण करा."
    }
  },
  {
    id: "migraine",
    name: {
      en: "Migraine",
      hi: "माइग्रेन",
      mr: "अर्धशिशी"
    },
    description: {
      en: "A neurological condition causing intense, debilitating headaches.",
      hi: "एक स्नायविक स्थिति जो तीव्र सिरदर्द का कारण बनती है।",
      mr: "एक न्यूरोलॉजिकल स्थिती ज्यामुळे तीव्र डोकेदुखी होते."
    },
    symptoms: ["headache", "sensitivity to light", "dizziness", "nausea"],
    risk: "Low",
    prevention: {
      en: "Maintain sleep schedule, stay hydrated, avoid loud noises.",
      hi: "नींद का शेड्यूल बनाए रखें, हाइड्रेटेड रहें, तेज आवाज से बचें।",
      mr: "झोपेचे वेळापत्रक सांभाळा, हायड्रेटेड राहा, मोठ्या आवाजापासून दूर राहा."
    }
  }
];

export const symptomAlerts = [
  {
    location: "Nagpur",
    disease: "Dengue",
    risk: "High",
    message: {
      en: "High alert for Dengue in Nagpur Region. Protect yourself!",
      hi: "नागपुर क्षेत्र में डेंगू का हाई अलर्ट। अपनी सुरक्षा करें!",
      mr: "नागपूर विभागात डेंग्यूचा हाय अलर्ट. स्वतःचे रक्षण करा!"
    }
  }
];
