import React, { useState, useEffect } from 'react';
import { consultationService } from '../../services/consultationService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';

const ManageServicesPage = () => {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', duration_minutes: '', price: '' });
    const [editingId, setEditingId] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await consultationService.getConsultationTypes();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await consultationService.updateConsultationType(editingId, formData);
                toast({ title: 'Success', description: 'Service updated successfully!' });
            } else {
                await consultationService.createConsultationType(formData);
                toast({ title: 'Success', description: 'Service created successfully!' });
            }
            setFormData({ title: '', description: '', duration_minutes: '', price: '' });
            setEditingId(null);
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            toast({ title: 'Error', description: 'Failed to save service.', variant: 'destructive' });
        }
    };

    const handleEdit = (service) => {
        setFormData({ title: service.title, description: service.description, duration_minutes: service.duration_minutes, price: service.price });
        setEditingId(service._id);
    };

    const handleDelete = async (id) => {
        try {
            await consultationService.deleteConsultationType(id);
            toast({ title: 'Success', description: 'Service deleted successfully!' });
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            toast({ title: 'Error', description: 'Failed to delete service.', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Manage My Services</h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{editingId ? 'Edit Service' : 'Create a New Service'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Service Title" required />
                        <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
                        <Input name="duration_minutes" type="number" value={formData.duration_minutes} onChange={handleChange} placeholder="Duration (minutes)" required />
                        <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required />
                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                        {editingId && <Button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', duration_minutes: '', price: '' }); }} variant="outline">Cancel</Button>}
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                    <Card key={service._id}>
                        <CardHeader>
                            <CardTitle>{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{service.description}</p>
                            <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
                            <p><strong>Price:</strong> ${service.price}</p>
                            <div className="flex space-x-2 mt-4">
                                <Button onClick={() => handleEdit(service)}>Edit</Button>
                                <Button onClick={() => handleDelete(service._id)} variant="destructive">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ManageServicesPage;