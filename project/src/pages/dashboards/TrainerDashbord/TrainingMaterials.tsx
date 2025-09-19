import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Upload } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const TrainingMaterials: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
 Training Materials</h1>
      <Button><Upload className="w-4 h-4 mr-2" />Upload Material</Button>
    </div>
    <Card>
      <CardContent className="text-center py-12">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Material management coming soon...</p>
      </CardContent>
    </Card>
  </div>
);
