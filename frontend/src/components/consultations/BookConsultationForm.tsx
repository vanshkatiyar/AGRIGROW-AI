import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../../services/consultationService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';

const BookConsultationForm = () => {
    const { expertId, typeId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        requested_datetime: '',
        farmer_notes: '',
        attachments: []
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, attachments: e.target.files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('expertId', expertId);
            data.append('consultationTypeId', typeId);
            data.append('requested_datetime', formData.requested_datetime);
            data.append('farmer_notes', formData.farmer_notes);
            for (let i = 0; i < formData.attachments.length; i++) {
                data.append('attachments', formData.attachments[i]);
            }

            await consultationService.requestConsultation(data);
            toast({ title: 'Success', description: 'Consultation requested successfully!' });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error booking consultation:', error);
            toast({ title: 'Error', description: 'Failed to book consultation.', variant: 'destructive' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="requested_datetime">Preferred Date and Time</label>
                <Input
                    type="datetime-local"
                    id="requested_datetime"
                    name="requested_datetime"
                    value={formData.requested_datetime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="farmer_notes">Notes for the Expert</label>
                <Textarea
                    id="farmer_notes"
                    name="farmer_notes"
                    value={formData.farmer_notes}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="attachments">Attach Files</label>
                <Input
                    type="file"
                    id="attachments"
                    name="attachments"
                    onChange={handleFileChange}
                    multiple
                />
            </div>
            <Button type="submit">Request Consultation</Button>
        </form>
    );
};

export default BookConsultationForm;