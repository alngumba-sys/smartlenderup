// Utility functions for organization data

export function getOrganizationName(): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.organization_name || 'BV Funguo Ltd';
    }
  } catch (error) {
    console.error('Error retrieving organization name:', error);
  }
  return 'BV Funguo Ltd';
}

export function getOrganizationId(): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.id || '';
    }
  } catch (error) {
    console.error('Error retrieving organization ID:', error);
  }
  return '';
}

export function getOrganizationEmail(): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.email || 'victormuthama@gmail.com';
    }
  } catch (error) {
    console.error('Error retrieving organization email:', error);
  }
  return 'victormuthama@gmail.com';
}

export function getOrganizationCountry(): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.country || 'Kenya';
    }
  } catch (error) {
    console.error('Error retrieving organization country:', error);
  }
  return 'Kenya';
}

export function getCountryDemonym(country?: string): string {
  const countryName = country || getOrganizationCountry();
  
  const demonymMap: { [key: string]: string } = {
    'Kenya': 'Kenyan',
    'Uganda': 'Ugandan',
    'Tanzania': 'Tanzanian',
    'Rwanda': 'Rwandan',
    'Ethiopia': 'Ethiopian',
    'South Africa': 'South African',
    'Nigeria': 'Nigerian',
    'Ghana': 'Ghanaian',
    'Zimbabwe': 'Zimbabwean',
    'Zambia': 'Zambian',
    'Botswana': 'Batswana',
    'Malawi': 'Malawian',
    'Mozambique': 'Mozambican',
    'Other': 'Global'
  };
  
  return demonymMap[countryName] || 'African';
}

export function getOrganizationLogo(): string {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      // Return custom logo if set, otherwise return BV Funguo default logo
      if (org.organization_logo) {
        return org.organization_logo;
      }
    }
  } catch (error) {
    console.error('Error retrieving organization logo:', error);
  }
  // Default BV Funguo logo - base64 encoded SVG
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIyMCIgZmlsbD0iIzFGMkU0RCIvPgogIDx0ZXh0IHg9IjYwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzNCODJGNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QlY8L3RleHQ+CiAgPHRleHQgeD0iNjAiIHk9Ijg1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMzQjgyRjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmJ2ZnVuZ3VvPC90ZXh0Pgo8L3N2Zz4=';
}

export function getOrganizationData() {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      return JSON.parse(orgData);
    }
  } catch (error) {
    console.error('Error retrieving organization data:', error);
  }
  return null;
}