import React from 'react';
import PeaceWatermark from '@/components/ui/PeaceWatermark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestWatermark: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <PeaceWatermark size={500} opacity={20} rotation={-20} />
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Peace Watermark Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This page tests the peace watermark visibility. You should see a peace sign watermark in the bottom-left corner.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Watermark Settings</h3>
                <ul className="text-sm space-y-1">
                  <li>• Size: 500px</li>
                  <li>• Opacity: 20%</li>
                  <li>• Rotation: -20°</li>
                  <li>• Position: Bottom-left</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">SVG File</h3>
                <ul className="text-sm space-y-1">
                  <li>• Path: /icons/peace-watermark.svg</li>
                  <li>• Size: 800x800px</li>
                  <li>• Format: SVG</li>
                  <li>• Colors: Multi-colored</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/gallery'}>
                Go to Gallery
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestWatermark;