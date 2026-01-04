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

export function getOrganizationLogo(): string | null {
  try {
    const orgData = localStorage.getItem('current_organization');
    if (orgData) {
      const org = JSON.parse(orgData);
      return org.organization_logo || null;
    }
  } catch (error) {
    console.error('Error retrieving organization logo:', error);
  }
  return null;
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