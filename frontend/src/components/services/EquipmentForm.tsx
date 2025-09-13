import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface EquipmentItem {
  name: string;
  model: string;
  year: string;
  hourlyRate: string;
  dailyRate: string;
  availability: boolean;
}

interface EquipmentFormProps {
  equipment: EquipmentItem[];
  onChange: (equipment: EquipmentItem[]) => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, onChange }) => {
  const handleChange = (index: number, field: keyof EquipmentItem, value: string | boolean) => {
    const newEquipment = [...equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    onChange(newEquipment);
  };

  const addEquipment = () => {
    onChange([
      ...equipment,
      { name: '', model: '', year: '', hourlyRate: '', dailyRate: '', availability: true }
    ]);
  };

  const removeEquipment = (index: number) => {
    const newEquipment = [...equipment];
    newEquipment.splice(index, 1);
    onChange(newEquipment);
  };

  return (
    <div className="space-y-4">
      <Label>Equipment</Label>
      {equipment.map((item, index) => (
        <div key={index} className="border p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Equipment #{index + 1}</h4>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => removeEquipment(index)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`name-${index}`}>Name</Label>
              <Input
                id={`name-${index}`}
                value={item.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="Tractor Model"
              />
            </div>
            <div>
              <Label htmlFor={`model-${index}`}>Model</Label>
              <Input
                id={`model-${index}`}
                value={item.model}
                onChange={(e) => handleChange(index, 'model', e.target.value)}
                placeholder="Model Number"
              />
            </div>
            <div>
              <Label htmlFor={`year-${index}`}>Year</Label>
              <Input
                id={`year-${index}`}
                type="number"
                value={item.year}
                onChange={(e) => handleChange(index, 'year', e.target.value)}
                placeholder="Manufacturing Year"
              />
            </div>
            <div>
              <Label htmlFor={`hourlyRate-${index}`}>Hourly Rate (₹)</Label>
              <Input
                id={`hourlyRate-${index}`}
                type="number"
                value={item.hourlyRate}
                onChange={(e) => handleChange(index, 'hourlyRate', e.target.value)}
                placeholder="Hourly Rate"
              />
            </div>
            <div>
              <Label htmlFor={`dailyRate-${index}`}>Daily Rate (₹)</Label>
              <Input
                id={`dailyRate-${index}`}
                type="number"
                value={item.dailyRate}
                onChange={(e) => handleChange(index, 'dailyRate', e.target.value)}
                placeholder="Daily Rate"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <input
                  id={`availability-${index}`}
                  type="checkbox"
                  checked={item.availability}
                  onChange={(e) => handleChange(index, 'availability', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`availability-${index}`}>Available</Label>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addEquipment} variant="outline">
        Add Equipment
      </Button>
    </div>
  );
};

export default EquipmentForm;