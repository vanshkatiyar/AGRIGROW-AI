import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expertService } from '../services/expertService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const ExpertsPage = () => {
    const [experts, setExperts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const data = await expertService.getAllExperts();
                setExperts(data);
            } catch (error) {
                console.error('Error fetching experts:', error);
            }
        };
        fetchExperts();
    }, []);

    const filteredExperts = experts.filter(expert =>
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.expertDetails?.specializations.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Find an Expert</h1>
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExperts.map(expert => (
                    <Card key={expert._id} className="flex flex-col items-center text-center">
                        <CardHeader>
                            <img src={expert.profileImage} alt={expert.name} className="w-24 h-24 rounded-full mx-auto" />
                            <CardTitle className="mt-4">{expert.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Specialties:</strong> {expert.expertDetails?.specializations.join(', ')}</p>
                            <Link to={`/experts/${expert._id}`}>
                                <Button className="mt-4">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExpertsPage;