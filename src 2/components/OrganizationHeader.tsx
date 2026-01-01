import { getOrganizationName } from '../utils/organizationUtils';
const logo = '/logo.svg'; // Replaced figma:asset for deployment

interface OrganizationHeaderProps {
  showLogo?: boolean;
  className?: string;
  logoClassName?: string;
  titleClassName?: string;
}

export function OrganizationHeader({ 
  showLogo = true, 
  className = '',
  logoClassName = 'size-12',
  titleClassName = 'text-gray-900 dark:!text-gray-900 text-xl'
}: OrganizationHeaderProps) {
  const organizationName = getOrganizationName();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLogo && <img src={logo} alt={`${organizationName} Logo`} className={logoClassName} />}
      <h1 className={titleClassName}>{organizationName}</h1>
    </div>
  );
}
