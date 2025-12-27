import { useState } from 'react';
import { X, Building2, User, CalendarIcon, Camera, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface OrganizationSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (organizationData: any) => void;
  accountType?: 'organization' | 'individual' | 'group';
}

// Country to currency mapping
const countryCurrencyMap: { [key: string]: string } = {
  'Kenya': 'KES',
  'Uganda': 'UGX',
  'Tanzania': 'TZS',
  'Rwanda': 'RWF',
  'Ethiopia': 'ETB',
  'South Africa': 'ZAR',
  'Nigeria': 'NGN',
  'Ghana': 'GHS',
  'Zimbabwe': 'ZWL',
  'Zambia': 'ZMW',
  'Botswana': 'BWP',
  'Malawi': 'MWK',
  'Mozambique': 'MZN',
  'Other': 'USD'
};

// Country-specific location data (Counties/Regions and major Cities/Towns)
const countryLocationData: { 
  [key: string]: { 
    regions: string[]; 
    cities: { [region: string]: string[] };
    hasRegions: boolean; // Some countries don't use county/region system
    regionLabel: string; // Label to show (County, Region, Province, etc.)
  } 
} = {
  'Kenya': {
    hasRegions: true,
    regionLabel: 'County',
    regions: ['Nairobi', 'Kiambu', 'Nakuru', 'Mombasa', 'Kisumu', 'Machakos', 'Kajiado', 'Meru', 'Nyeri', 'Murang\'a', 'Uasin Gishu', 'Kakamega', 'Bungoma', 'Trans Nzoia'],
    cities: {
      'Nairobi': ['Nairobi', 'Westlands', 'Karen', 'Kilimani', 'Kasarani'],
      'Kiambu': ['Thika', 'Ruiru', 'Kikuyu', 'Limuru', 'Kiambu Town'],
      'Nakuru': ['Nakuru', 'Naivasha', 'Gilgil', 'Molo'],
      'Mombasa': ['Mombasa', 'Likoni', 'Changamwe', 'Nyali'],
      'Kisumu': ['Kisumu', 'Ahero', 'Maseno'],
      'Machakos': ['Machakos', 'Kangundo', 'Athi River'],
      'Kajiado': ['Kajiado', 'Ngong', 'Ongata Rongai', 'Kitengela'],
      'Meru': ['Meru', 'Maua', 'Mikinduri'],
      'Nyeri': ['Nyeri', 'Karatina', 'Othaya'],
      'Murang\'a': ['Murang\'a', 'Kenol', 'Kandara'],
      'Uasin Gishu': ['Eldoret', 'Burnt Forest', 'Turbo'],
      'Kakamega': ['Kakamega', 'Mumias', 'Butere'],
      'Bungoma': ['Bungoma', 'Webuye', 'Kimilili'],
      'Trans Nzoia': ['Kitale', 'Kiminini', 'Endebess']
    }
  },
  'Uganda': {
    hasRegions: true,
    regionLabel: 'District',
    regions: ['Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbarara', 'Gulu', 'Lira', 'Mbale', 'Hoima', 'Kasese'],
    cities: {
      'Kampala': ['Kampala', 'Makindye', 'Kawempe', 'Nakawa', 'Rubaga'],
      'Wakiso': ['Entebbe', 'Nansana', 'Kira', 'Makindye-Ssabagabo'],
      'Mukono': ['Mukono', 'Lugazi', 'Njeru'],
      'Jinja': ['Jinja', 'Buwenge'],
      'Mbarara': ['Mbarara', 'Rwampara'],
      'Gulu': ['Gulu', 'Bungatira'],
      'Lira': ['Lira', 'Adekokwok'],
      'Mbale': ['Mbale', 'Bududa'],
      'Hoima': ['Hoima', 'Kigorobya'],
      'Kasese': ['Kasese', 'Hima']
    }
  },
  'Tanzania': {
    hasRegions: true,
    regionLabel: 'Region',
    regions: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Zanzibar', 'Kilimanjaro', 'Tabora'],
    cities: {
      'Dar es Salaam': ['Dar es Salaam', 'Kinondoni', 'Ilala', 'Temeke'],
      'Arusha': ['Arusha', 'Moshi', 'Karatu'],
      'Mwanza': ['Mwanza', 'Nyamagana', 'Ilemela'],
      'Dodoma': ['Dodoma', 'Kondoa'],
      'Mbeya': ['Mbeya', 'Tukuyu', 'Kyela'],
      'Morogoro': ['Morogoro', 'Mvomero'],
      'Tanga': ['Tanga', 'Korogwe'],
      'Zanzibar': ['Zanzibar City', 'Stone Town'],
      'Kilimanjaro': ['Moshi', 'Hai', 'Rombo'],
      'Tabora': ['Tabora', 'Nzega']
    }
  },
  'Rwanda': {
    hasRegions: true,
    regionLabel: 'Province',
    regions: ['Kigali', 'Eastern', 'Northern', 'Southern', 'Western'],
    cities: {
      'Kigali': ['Kigali', 'Nyarugenge', 'Gasabo', 'Kicukiro'],
      'Eastern': ['Rwamagana', 'Kayonza', 'Kibungo', 'Nyagatare'],
      'Northern': ['Musanze', 'Gicumbi', 'Rulindo'],
      'Southern': ['Huye', 'Muhanga', 'Nyanza', 'Kamonyi'],
      'Western': ['Rubavu', 'Rusizi', 'Karongi', 'Nyamasheke']
    }
  },
  'Ethiopia': {
    hasRegions: true,
    regionLabel: 'Region',
    regions: ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'Somali', 'SNNPR', 'Afar', 'Gambela'],
    cities: {
      'Addis Ababa': ['Addis Ababa', 'Bole', 'Kirkos', 'Arada'],
      'Oromia': ['Adama', 'Jimma', 'Nekemte', 'Bishoftu'],
      'Amhara': ['Bahir Dar', 'Gondar', 'Dessie'],
      'Tigray': ['Mekelle', 'Adigrat', 'Aksum'],
      'Somali': ['Jijiga', 'Gode'],
      'SNNPR': ['Hawassa', 'Arba Minch', 'Sodo'],
      'Afar': ['Semera', 'Asayita'],
      'Gambela': ['Gambela', 'Itang']
    }
  },
  'South Africa': {
    hasRegions: true,
    regionLabel: 'Province',
    regions: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'],
    cities: {
      'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Midrand'],
      'Western Cape': ['Cape Town', 'Stellenbosch', 'George', 'Paarl'],
      'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay'],
      'Eastern Cape': ['Port Elizabeth', 'East London', 'Mthatha'],
      'Free State': ['Bloemfontein', 'Welkom', 'Sasolburg'],
      'Limpopo': ['Polokwane', 'Mokopane', 'Tzaneen'],
      'Mpumalanga': ['Nelspruit', 'Witbank', 'Middelburg'],
      'North West': ['Rustenburg', 'Mahikeng', 'Klerksdorp'],
      'Northern Cape': ['Kimberley', 'Upington', 'Springbok']
    }
  },
  'Nigeria': {
    hasRegions: true,
    regionLabel: 'State',
    regions: ['Lagos', 'Kano', 'Abuja FCT', 'Rivers', 'Oyo', 'Kaduna', 'Ogun', 'Anambra', 'Enugu', 'Delta'],
    cities: {
      'Lagos': ['Lagos', 'Ikeja', 'Lekki', 'Victoria Island', 'Surulere'],
      'Kano': ['Kano', 'Bichi', 'Wudil'],
      'Abuja FCT': ['Abuja', 'Gwagwalada', 'Kubwa', 'Nyanya'],
      'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Bonny'],
      'Oyo': ['Ibadan', 'Ogbomosho', 'Oyo'],
      'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan'],
      'Ogun': ['Abeokuta', 'Ijebu Ode', 'Sagamu'],
      'Anambra': ['Awka', 'Onitsha', 'Nnewi'],
      'Enugu': ['Enugu', 'Nsukka', 'Oji River'],
      'Delta': ['Asaba', 'Warri', 'Sapele']
    }
  },
  'Ghana': {
    hasRegions: true,
    regionLabel: 'Region',
    regions: ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono'],
    cities: {
      'Greater Accra': ['Accra', 'Tema', 'Madina', 'Teshie', 'Nungua'],
      'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong'],
      'Western': ['Sekondi-Takoradi', 'Tarkwa', 'Prestea'],
      'Eastern': ['Koforidua', 'Akropong', 'Begoro'],
      'Central': ['Cape Coast', 'Winneba', 'Kasoa', 'Swedru'],
      'Northern': ['Tamale', 'Yendi', 'Savelugu'],
      'Volta': ['Ho', 'Hohoe', 'Keta'],
      'Upper East': ['Bolgatanga', 'Bawku', 'Navrongo'],
      'Upper West': ['Wa', 'Lawra', 'Jirapa'],
      'Bono': ['Sunyani', 'Berekum', 'Dormaa Ahenkro']
    }
  },
  'Zimbabwe': {
    hasRegions: true,
    regionLabel: 'Province',
    regions: ['Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'],
    cities: {
      'Harare': ['Harare', 'Chitungwiza', 'Epworth'],
      'Bulawayo': ['Bulawayo'],
      'Manicaland': ['Mutare', 'Rusape', 'Chipinge'],
      'Mashonaland Central': ['Bindura', 'Mount Darwin', 'Guruve'],
      'Mashonaland East': ['Marondera', 'Ruwa', 'Mutoko'],
      'Mashonaland West': ['Chinhoyi', 'Karoi', 'Mhangura'],
      'Masvingo': ['Masvingo', 'Chiredzi', 'Bikita'],
      'Matabeleland North': ['Hwange', 'Victoria Falls', 'Lupane'],
      'Matabeleland South': ['Gwanda', 'Beitbridge', 'Plumtree'],
      'Midlands': ['Gweru', 'Kwekwe', 'Redcliff']
    }
  },
  'Zambia': {
    hasRegions: true,
    regionLabel: 'Province',
    regions: ['Lusaka', 'Copperbelt', 'Southern', 'Eastern', 'Northern', 'Luapula', 'North-Western', 'Western', 'Central', 'Muchinga'],
    cities: {
      'Lusaka': ['Lusaka', 'Kafue', 'Chilanga'],
      'Copperbelt': ['Kitwe', 'Ndola', 'Chingola', 'Mufulira'],
      'Southern': ['Livingstone', 'Choma', 'Kalomo'],
      'Eastern': ['Chipata', 'Katete', 'Petauke'],
      'Northern': ['Kasama', 'Mbala', 'Luwingu'],
      'Luapula': ['Mansa', 'Samfya', 'Kawambwa'],
      'North-Western': ['Solwezi', 'Zambezi', 'Mwinilunga'],
      'Western': ['Mongu', 'Senanga', 'Kalabo'],
      'Central': ['Kabwe', 'Kapiri Mposhi', 'Mkushi'],
      'Muchinga': ['Chinsali', 'Nakonde', 'Isoka']
    }
  },
  'Botswana': {
    hasRegions: true,
    regionLabel: 'District',
    regions: ['Gaborone', 'Francistown', 'Maun', 'Selebi-Phikwe', 'Serowe', 'Molepolole', 'Kanye', 'Mochudi'],
    cities: {
      'Gaborone': ['Gaborone', 'Tlokweng', 'Mogoditshane'],
      'Francistown': ['Francistown'],
      'Maun': ['Maun', 'Shorobe'],
      'Selebi-Phikwe': ['Selebi-Phikwe', 'Palapye'],
      'Serowe': ['Serowe', 'Palapye'],
      'Molepolole': ['Molepolole'],
      'Kanye': ['Kanye'],
      'Mochudi': ['Mochudi']
    }
  },
  'Malawi': {
    hasRegions: true,
    regionLabel: 'Region',
    regions: ['Southern', 'Central', 'Northern'],
    cities: {
      'Southern': ['Blantyre', 'Zomba', 'Mulanje', 'Thyolo'],
      'Central': ['Lilongwe', 'Kasungu', 'Salima', 'Dedza'],
      'Northern': ['Mzuzu', 'Karonga', 'Rumphi']
    }
  },
  'Mozambique': {
    hasRegions: true,
    regionLabel: 'Province',
    regions: ['Maputo City', 'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'],
    cities: {
      'Maputo City': ['Maputo'],
      'Maputo': ['Matola', 'Boane'],
      'Gaza': ['Xai-Xai', 'Chokwe'],
      'Inhambane': ['Inhambane', 'Maxixe'],
      'Sofala': ['Beira', 'Dondo'],
      'Manica': ['Chimoio', 'Manica'],
      'Tete': ['Tete', 'Moatize'],
      'Zambézia': ['Quelimane', 'Mocuba'],
      'Nampula': ['Nampula', 'Nacala'],
      'Cabo Delgado': ['Pemba', 'Montepuez'],
      'Niassa': ['Lichinga', 'Cuamba']
    }
  },
  'Other': {
    hasRegions: false,
    regionLabel: 'Region/State',
    regions: ['N/A'],
    cities: {
      'N/A': []
    }
  }
};

const KENYAN_COUNTIES = [
  'Nairobi', 'Kiambu', 'Nakuru', 'Mombasa', 'Kisumu', 'Machakos', 'Kajiado', 
  'Meru', 'Nyeri', 'Murang\'a', 'Uasin Gishu', 'Kakamega', 'Bungoma', 'Trans Nzoia'
];

export function OrganizationSignUpModal({ isOpen, onClose, onSignUp, accountType = 'organization' }: OrganizationSignUpModalProps) {
  const [dateOfIncorporation, setDateOfIncorporation] = useState<Date>();
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    industry: 'Microfinance',
    organizationType: 'Limited Company',
    country: 'Kenya',
    currency: 'KES',
    email: '',
    phone: '',
    alternativePhone: '',
    website: '',
    county: 'Nairobi',
    town: '',
    address: '',
    postalCode: '',
    contactPersonFirstName: '',
    contactPersonLastName: '',
    contactPersonTitle: 'CEO',
    contactPersonEmail: '',
    contactPersonPhone: '',
    numberOfEmployees: '',
    expectedClients: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrganizationLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCountryChange = (country: string) => {
    const currency = countryCurrencyMap[country] || 'USD';
    const locationData = countryLocationData[country];
    const firstRegion = locationData?.regions[0] || '';
    const firstCity = locationData?.cities[firstRegion]?.[0] || '';
    
    setFormData({ 
      ...formData, 
      country, 
      currency,
      county: firstRegion,
      town: firstCity
    });
  };

  // Validate required fields
  const areRequiredFieldsFilled = () => {
    return (
      formData.organizationName.trim() !== '' &&
      dateOfIncorporation !== undefined &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.county.trim() !== '' &&
      formData.town.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.contactPersonFirstName.trim() !== '' &&
      formData.contactPersonLastName.trim() !== '' &&
      formData.contactPersonEmail.trim() !== '' &&
      formData.contactPersonPhone.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword
    );
  };

  const isFormValid = areRequiredFieldsFilled();
  const missingFields = [];
  
  if (!areRequiredFieldsFilled()) {
    if (!formData.organizationName.trim()) missingFields.push('Organization Name');
    if (!dateOfIncorporation) missingFields.push('Date of Incorporation');
    if (!formData.email.trim()) missingFields.push('Organization Email');
    if (!formData.phone.trim()) missingFields.push('Phone Number');
    if (!formData.county.trim()) missingFields.push('County/Region');
    if (!formData.town.trim()) missingFields.push('Town/City');
    if (!formData.address.trim()) missingFields.push('Physical Address');
    if (!formData.contactPersonFirstName.trim()) missingFields.push('Contact First Name');
    if (!formData.contactPersonLastName.trim()) missingFields.push('Contact Last Name');
    if (!formData.contactPersonEmail.trim()) missingFields.push('Contact Email');
    if (!formData.contactPersonPhone.trim()) missingFields.push('Contact Phone');
    if (!formData.password.trim()) missingFields.push('Password');
    if (!formData.confirmPassword.trim()) missingFields.push('Confirm Password');
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      missingFields.push('Passwords must match');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('Please fill in the following required fields:\n\n' + missingFields.join('\n'));
      return;
    }
    onSignUp({
      ...formData,
      dateOfIncorporation: dateOfIncorporation ? format(dateOfIncorporation, 'yyyy-MM-dd') : '',
      organizationLogo
    });
    onClose();
  };

  if (!isOpen) return null;

  // Dynamic titles based on account type
  const accountTitles = {
    organization: {
      title: 'Create Organization Account',
      subtitle: 'Register your organization on SmartLenderUp platform',
      buttonText: 'Create Organization Account'
    },
    individual: {
      title: 'Create Individual Account',
      subtitle: 'Register as an individual lender on SmartLenderUp platform',
      buttonText: 'Create Individual Account'
    },
    group: {
      title: 'Create Group Account',
      subtitle: 'Register your lending group on SmartLenderUp platform',
      buttonText: 'Create Group Account'
    }
  };

  const currentAccountTitle = accountTitles[accountType];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] p-4" style={{ backgroundColor: 'rgba(2, 8, 56, 0.95)' }}>
      <style>{`
        .org-input,
        input.org-input,
        select.org-input,
        textarea.org-input,
        input.org-input[type="text"],
        input.org-input[type="email"],
        input.org-input[type="tel"],
        input.org-input[type="url"],
        input.org-input[type="number"],
        input.org-input[type="password"] {
          background-color: #0a1e3b !important;
          border: 1px solid rgba(232, 209, 201, 0.2) !important;
          color: #e8d1c9 !important;
          transition: all 0.2s ease !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        
        .org-input:focus,
        input.org-input:focus,
        select.org-input:focus,
        textarea.org-input:focus {
          background-color: #0a1e3b !important;
          border-color: #ec7347 !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(236, 115, 71, 0.1) !important;
        }
        
        .org-input::placeholder,
        input.org-input::placeholder,
        textarea.org-input::placeholder {
          color: rgba(232, 209, 201, 0.35) !important;
          opacity: 1 !important;
        }
        
        .org-input:-webkit-autofill,
        input.org-input:-webkit-autofill,
        input.org-input:-webkit-autofill:hover,
        input.org-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0a1e3b inset !important;
          -webkit-text-fill-color: #e8d1c9 !important;
          border: 1px solid rgba(232, 209, 201, 0.2) !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        .org-input option,
        select.org-input option {
          background-color: #020838 !important;
          color: #e8d1c9 !important;
        }
        
        .org-readonly {
          background-color: #0a1e3b !important;
          border: 1px solid rgba(232, 209, 201, 0.2) !important;
          color: rgba(232, 209, 201, 0.6) !important;
          cursor: not-allowed !important;
        }
      `}</style>
      
      <div 
        className="w-full max-w-5xl max-h-[92vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#020838' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ backgroundColor: '#154F73', borderBottom: '1px solid rgba(236, 115, 71, 0.2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 115, 71, 0.15)' }}>
              <Building2 className="size-4.5" style={{ color: '#ec7347' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>{currentAccountTitle.title}</h2>
              <p className="text-[0.688rem] mt-0.5" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>{currentAccountTitle.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: '#e8d1c9', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(232, 209, 201, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4" style={{ backgroundColor: '#032b43' }}>
          <div className="max-w-full mx-auto">
            
            {/* Logo Upload Section */}
            <div className="flex items-center gap-7 mb-7 pb-7" style={{ borderBottom: '1px solid rgba(232, 209, 201, 0.1)' }}>
              <div className="relative flex-shrink-0">
                {organizationLogo ? (
                  <img 
                    src={organizationLogo} 
                    alt="Organization Logo" 
                    className="size-28 rounded-xl object-contain"
                    style={{ border: '3px solid #ec7347' }}
                  />
                ) : (
                  <div 
                    className="size-28 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(236, 115, 71, 0.1)', border: '2px dashed rgba(236, 115, 71, 0.5)' }}
                  >
                    <Building2 className="size-12" style={{ color: 'rgba(236, 115, 71, 0.6)' }} />
                  </div>
                )}
                <label 
                  htmlFor="logo-upload" 
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-lg cursor-pointer shadow-lg transition-all"
                  style={{ backgroundColor: '#ec7347', color: '#ffffff' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Camera className="size-3.5" />
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold mb-1.5" style={{ color: '#e8d1c9', fontSize: '0.938rem' }}>Organization Logo</h3>
                <p className="text-[0.813rem] mb-1" style={{ color: 'rgba(232, 209, 201, 0.6)' }}>Upload your organization's logo for easy identification</p>
                <p className="text-[0.688rem]" style={{ color: 'rgba(236, 115, 71, 0.8)' }}>Recommended: Square image, minimum 500x500px</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-5">
                <Building2 className="size-4.5" style={{ color: '#ec7347' }} />
                <h3 className="font-semibold" style={{ color: '#e8d1c9', fontSize: '0.938rem' }}>Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Organization Name <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                    placeholder="ABC Microfinance Ltd"
                  />
                </div>
                
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                    placeholder="PVT-123456"
                  />
                </div>

                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Date of Incorporation <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem] text-left flex items-center justify-between"
                      >
                        <span style={{ color: dateOfIncorporation ? '#e8d1c9' : 'rgba(232, 209, 201, 0.35)' }}>
                          {dateOfIncorporation ? format(dateOfIncorporation, 'PPP') : 'Select date'}
                        </span>
                        <CalendarIcon className="size-3.5" style={{ color: 'rgba(232, 209, 201, 0.5)' }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfIncorporation}
                        onSelect={setDateOfIncorporation}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Industry <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                  >
                    <option value="Microfinance">Microfinance</option>
                    <option value="SACCO">SACCO</option>
                    <option value="Community Bank">Community Bank</option>
                    <option value="Credit Union">Credit Union</option>
                    <option value="Other Financial Services">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Organization Type <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.organizationType}
                    onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                  >
                    <option value="Limited Company">Limited Company</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietor</option>
                    <option value="NGO">NGO</option>
                    <option value="Cooperative">Cooperative</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Country <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Currency <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currency}
                    readOnly
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                    style={{ backgroundColor: '#051229', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfEmployees}
                    onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                    placeholder="10"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-[0.813rem] mb-1.5" style={{ color: '#e8d1c9' }}>
                    Expected Number of Clients
                  </label>
                  <input
                    type="number"
                    value={formData.expectedClients}
                    onChange={(e) => setFormData({ ...formData, expectedClients: e.target.value })}
                    className="org-input w-full px-3.5 py-2 rounded-lg text-[0.813rem]"
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-7 pb-7" style={{ borderBottom: '1px solid rgba(232, 209, 201, 0.1)' }}>
              <div className="flex items-center gap-2.5 mb-5">
                <Mail className="size-4.5" style={{ color: '#ec7347' }} />
                <h3 className="font-semibold" style={{ color: '#e8d1c9', fontSize: '0.938rem' }}>Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Organization Email <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="info@organization.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Phone Number <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.alternativePhone}
                    onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="+254 700 000 000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="https://www.organization.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8 pb-8" style={{ borderBottom: '1px solid rgba(232, 209, 201, 0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="size-5" style={{ color: '#ec7347' }} />
                <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Physical Location</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                {countryLocationData[formData.country]?.hasRegions ? (
                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                      {countryLocationData[formData.country]?.regionLabel} <span style={{ color: '#ec7347' }}>*</span>
                    </label>
                    <select
                      required
                      value={formData.county}
                      onChange={(e) => {
                        const newRegion = e.target.value;
                        const firstCity = countryLocationData[formData.country]?.cities[newRegion]?.[0] || '';
                        setFormData({ ...formData, county: newRegion, town: firstCity });
                      }}
                      className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    >
                      {countryLocationData[formData.country]?.regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                      Region/State
                    </label>
                    <input
                      type="text"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                      placeholder="Enter region/state"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Town/City <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  {countryLocationData[formData.country]?.hasRegions && 
                   countryLocationData[formData.country]?.cities[formData.county]?.length > 0 ? (
                    <select
                      required
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    >
                      {countryLocationData[formData.country]?.cities[formData.county]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                      placeholder="Enter town/city"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Physical Address <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="123 Main Street, Parklands"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="00100"
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact Person */}
            <div className="mb-8 pb-8" style={{ borderBottom: '1px solid rgba(232, 209, 201, 0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <User className="size-5" style={{ color: '#ec7347' }} />
                <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Primary Contact Person</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    First Name <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPersonFirstName}
                    onChange={(e) => setFormData({ ...formData, contactPersonFirstName: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Last Name <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPersonLastName}
                    onChange={(e) => setFormData({ ...formData, contactPersonLastName: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Title/Position <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.contactPersonTitle}
                    onChange={(e) => setFormData({ ...formData, contactPersonTitle: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                  >
                    <option value="CEO">CEO</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Contact Email (Login Email) <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactPersonEmail}
                    onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="john.doe@organization.com"
                  />
                  <p className="text-xs mt-2" style={{ color: 'rgba(236, 115, 71, 0.9)' }}>
                    You will use this email to log in to your account
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Contact Phone <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    className="org-input w-full px-4 py-2.5 rounded-lg text-sm"
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                  Organization Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="org-input w-full px-4 py-2.5 rounded-lg text-sm resize-none"
                  placeholder="Brief description of your organization and its mission..."
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="size-5" style={{ color: '#ec7347' }} />
                <h3 className="text-lg font-semibold" style={{ color: '#e8d1c9' }}>Account Security</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Password <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="org-input w-full px-4 py-2.5 pr-20 rounded-lg text-sm"
                      placeholder="Minimum 8 characters"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded transition-all"
                      style={{ color: '#ec7347', backgroundColor: 'rgba(236, 115, 71, 0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 115, 71, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 115, 71, 0.1)'}
                    >
                      {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'rgba(232, 209, 201, 0.5)' }}>
                    Use a strong password with letters, numbers, and symbols
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#e8d1c9' }}>
                    Confirm Password <span style={{ color: '#ec7347' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="org-input w-full px-4 py-2.5 pr-20 rounded-lg text-sm"
                      placeholder="Re-enter password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded transition-all"
                      style={{ color: '#ec7347', backgroundColor: 'rgba(236, 115, 71, 0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 115, 71, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(236, 115, 71, 0.1)'}
                    >
                      {showConfirmPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs mt-2" style={{ color: '#ec7347' }}>
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 flex flex-col gap-3" style={{ backgroundColor: '#0A4164', borderTop: '1px solid rgba(232, 209, 201, 0.1)' }}>
          {/* Validation message */}
          {!isFormValid && (
            <div className="text-sm text-center" style={{ color: '#ec7347' }}>
              {missingFields.join(' • ')}
            </div>
          )}
          
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium transition-all"
              style={{ 
                border: '1px solid rgba(232, 209, 201, 0.3)',
                color: '#e8d1c9',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(232, 209, 201, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-all shadow-lg"
              style={{ 
                backgroundColor: '#ec7347',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => isFormValid && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => isFormValid && (e.currentTarget.style.opacity = '1')}
            >
              <Building2 className="size-5" />
              {currentAccountTitle.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}