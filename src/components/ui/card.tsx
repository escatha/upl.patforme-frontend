import React from 'react';

export const Card = ({ children }: any) => <div className="bg-white p-4 shadow rounded">{children}</div>;
export const CardHeader = ({ children }: any) => <div className="mb-2">{children}</div>;
export const CardTitle = ({ children }: any) => <h2 className="text-xl font-semibold">{children}</h2>;
export const CardDescription = ({ children }: any) => <p className="text-sm text-gray-600">{children}</p>;
export const CardContent = ({ children }: any) => <div>{children}</div>;
