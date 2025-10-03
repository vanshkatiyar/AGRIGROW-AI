import React, { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';

const ManageAvailabilityPage = () => {
    const [availability, setAvailability] = useState([]);
    const [formData, setFormData] = useState({ startTime: '', endTime: '' });
    const { toast } = useToast();

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const data = await consultationService.getAvailability();
            setAvailability(data);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await consultationService.createAvailability(formData);
            toast({ title: 'Success', description: 'Availability added successfully!' });
            setFormData({ startTime: '', endTime: '' });
            fetchAvailability();
        } catch (error) {
            console.error('Error adding availability:', error);
            toast({ title: 'Error', description: 'Failed to add availability.', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await consultationService.deleteAvailability(id);
            toast({ title: 'Success', description: 'Availability removed successfully!' });
            fetchAvailability();
        } catch (error) {
            console.error('Error deleting availability:', error);
            toast({ title: 'Error', description: 'Failed to remove availability.', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Manage My Availability</h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Availability</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
                        <Input name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />
                        <Button type="submit">Add</Button>
                    </form>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-bold mb-4">My Current Availability</h2>
                {availability.map(slot => (
                    <Card key={slot._id} className="mb-4">
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <p><strong>From:</strong> {new Date(slot.startTime).toLocaleString()}</p>
                                <p><strong>To:</strong> {new Date(slot.endTime).toLocaleString()}</p>
                            </div>
                            <Button onClick={() => handleDelete(slot._id)} variant="destructive">Remove</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ManageAvailabilityPage;