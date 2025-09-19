import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Download } from 'lucide-react';

export const Resources: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Resources</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">Access course materials and downloads</p>
    </div>

    <Card>
      <CardContent>
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Resource library coming soon...</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
