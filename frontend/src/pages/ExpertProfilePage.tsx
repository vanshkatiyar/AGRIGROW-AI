import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { expertService } from '../services/expertService';
import { consultationService } from '../services/consultationService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ExpertProfilePage = () => {
    const { id } = useParams();
    const [expert, setExpert] = useState(null);
    const [consultationTypes, setConsultationTypes] = useState([]);

    useEffect(() => {
        const fetchExpert = async () => {
            try {
                const expertData = await expertService.getExpertById(id);
                setExpert(expertData);
                const typesData = await consultationService.getConsultationTypesByExpert(id);
                setConsultationTypes(typesData);
            } catch (error) {
                console.error('Error fetching expert details:', error);
            }
        };
        fetchExpert();
    }, [id]);

    if (!expert) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{expert.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Bio:</strong> {expert.bio}</p>
                    <p><strong>Specialties:</strong> {expert.expertDetails?.specializations.join(', ')}</p>
                    <p><strong>Experience:</strong> {expert.expertDetails?.experienceYears} years</p>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mt-8 mb-4">Consultation Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {consultationTypes.map(type => (
                    <Card key={type._id}>
                        <CardHeader>
                            <CardTitle>{type.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{type.description}</p>
                            <p><strong>Duration:</strong> {type.duration_minutes} minutes</p>
                            <p><strong>Price:</strong> ${type.price}</p>
                            <Link to={`/book-consultation/${expert._id}/${type._id}`}>
                                <Button className="mt-4">Book Now</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExpertProfilePage;