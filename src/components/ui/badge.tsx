import React from 'react';

export const Badge = ({ children, variant }: any) => {
  const color = variant === 'destructive' ? 'bg-red-100 text-red-700' :
                variant === 'secondary' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800';
  return <span className={`px-2 py-1 text-xs rounded ${color}`}>{children}</span>;
};

