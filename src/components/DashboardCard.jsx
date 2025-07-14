import React from 'react';

const DashboardCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  badge, 
  gradient, 
  onClick, 
  actions = [],
  children 
}) => {
  const cardClasses = gradient 
    ? `col-span-1 divide-y divide-gray-200 rounded-lg ${gradient} text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`
    : `col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className={`truncate text-lg font-semibold ${gradient ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            {badge && (
              <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium ${
                gradient 
                  ? 'bg-white/20 text-white ring-1 ring-white/30' 
                  : 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
              } ring-inset`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`mt-1 truncate text-sm ${gradient ? 'text-white/90' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <Icon className={`size-10 shrink-0 ${gradient ? 'text-white' : 'text-gray-400'}`} />
        )}
      </div>
      
      {children && (
        <div className="p-6 pt-0">
          {children}
        </div>
      )}
      
      {actions.length > 0 && (
        <div>
          <div className="-mt-px flex divide-x divide-gray-200">
            {actions.map((action, index) => (
              <div key={index} className="flex w-0 flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className={`relative ${index === 0 ? '-mr-px' : '-ml-px'} inline-flex w-0 flex-1 items-center justify-center gap-x-3 ${
                    index === 0 ? 'rounded-bl-lg' : actions.length === 2 && index === 1 ? 'rounded-br-lg' : ''
                  } border border-transparent py-4 text-sm font-semibold ${
                    gradient ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {action.icon && <action.icon aria-hidden="true" className={`size-5 ${gradient ? 'text-white/80' : 'text-gray-400'}`} />}
                  {action.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;