import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CTACardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkTo?: string;
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
  iconColor?: string;
}

const CTACard: React.FC<CTACardProps> = ({
  icon,
  title,
  description,
  linkTo,
  onClick,
  bgColor = 'bg-white',
  textColor = 'text-emerald-500',
}) => {
  const cardContent = (
    <div className={`flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm ${bgColor} p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300`}>
      {icon}
      <h1 className={`${textColor} text-xl`}>{title}</h1>
      <p className={`${textColor === 'text-white' ? 'text-white' : 'text-gray-400'} text-sm`}>{description}</p>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{cardContent}</Link>;
  }

  return <div onClick={onClick}>{cardContent}</div>;
};

export default CTACard; 