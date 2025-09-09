const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

dotenv.config();

const sampleServiceProviders = [
    {
        businessName: "Rajesh Tractor Services",
        description: "Professional tractor services for all farming needs. 15+ years of experience in agricultural machinery.",
        serviceType: "tractor",
        location: {
            address: "Village Rampur, Tehsil Sadar, Meerut, Uttar Pradesh",
            coordinates: { latitude: 28.9845, longitude: 77.7064 }
        },
        contactInfo: {
            phone: "+91 98765 43210",
            email: "rajesh.tractors@gmail.com",
            whatsapp: "+91 98765 43210"
        },
        equipment: [
            {
                name: "Mahindra 575 DI",
                model: "2020",
                year: 2020,
                hourlyRate: 800,
                dailyRate: 6000,
                availability: true,
                images: ["https://example.com/tractor1.jpg"]
            },
            {
                name: "John Deere 5050D",
                model: "2019",
                year: 2019,
                hourlyRate: 900,
                dailyRate: 7000,
                availability: true,
                images: ["https://example.com/tractor2.jpg"]
            }
        ],
        serviceArea: {
            radius: 25,
            districts: ["Meerut", "Ghaziabad", "Bulandshahr"]
        },
        ratings: { average: 4.8, count: 45 },
        isVerified: true,
        isActive: true
    },
    {
        businessName: "Singh Harvesting Co.",
        description: "Complete harvesting solutions with modern combine harvesters. Quick and efficient service.",
        serviceType: "harvester",
        location: {
            address: "Khasra No. 123, Village Sultanpur, Karnal, Haryana",
            coordinates: { latitude: 29.6857, longitude: 76.9905 }
        },
        contactInfo: {
            phone: "+91 98765 43212",
            email: "singh.harvesting@gmail.com",
            whatsapp: "+91 98765 43212"
        },
        equipment: [
            {
                name: "New Holland TC5.90",
                model: "2021",
                year: 2021,
                hourlyRate: 1200,
                dailyRate: 9000,
                availability: true,
                images: ["https://example.com/harvester1.jpg"]
            }
        ],
        serviceArea: {
            radius: 50,
            districts: ["Karnal", "Panipat", "Kurukshetra"]
        },
        ratings: { average: 4.9, count: 32 },
        isVerified: true,
        isActive: true
    },
    {
        businessName: "Green Valley Suppliers",
        description: "Premium quality seeds, fertilizers, and pesticides. Authorized dealer for major brands.",
        serviceType: "supplier",
        location: {
            address: "Shop No. 15, Agricultural Market, Ludhiana, Punjab",
            coordinates: { latitude: 30.9010, longitude: 75.8573 }
        },
        contactInfo: {
            phone: "+91 98765 43213",
            email: "greenvalley.suppliers@gmail.com",
            whatsapp: "+91 98765 43213"
        },
        products: [
            {
                name: "Wheat Seeds (HD-2967)",
                category: "Seeds",
                price: 25,
                unit: "kg",
                description: "High yielding wheat variety suitable for Punjab region",
                images: ["https://example.com/wheat-seeds.jpg"],
                inStock: true
            },
            {
                name: "DAP Fertilizer",
                category: "Fertilizers",
                price: 1250,
                unit: "50kg bag",
                description: "Di-Ammonium Phosphate for better crop nutrition",
                images: ["https://example.com/dap.jpg"],
                inStock: true
            },
            {
                name: "Roundup Herbicide",
                category: "Pesticides",
                price: 450,
                unit: "500ml",
                description: "Effective weed control solution",
                images: ["https://example.com/roundup.jpg"],
                inStock: true
            }
        ],
        serviceArea: {
            radius: 30,
            districts: ["Ludhiana", "Patiala", "Sangrur"]
        },
        ratings: { average: 4.7, count: 78 },
        isVerified: true,
        isActive: true
    },
    {
        businessName: "Krishi Kendra",
        description: "One-stop shop for all agricultural inputs. Government authorized dealer with competitive prices.",
        serviceType: "supplier",
        location: {
            address: "Main Road, Near Bus Stand, Hisar, Haryana",
            coordinates: { latitude: 29.1492, longitude: 75.7217 }
        },
        contactInfo: {
            phone: "+91 98765 43214",
            email: "krishi.kendra@gmail.com"
        },
        products: [
            {
                name: "Urea Fertilizer",
                category: "Fertilizers",
                price: 280,
                unit: "45kg bag",
                description: "Nitrogen fertilizer for crop growth",
                images: ["https://example.com/urea.jpg"],
                inStock: true
            },
            {
                name: "Mustard Seeds",
                category: "Seeds",
                price: 80,
                unit: "kg",
                description: "Quality mustard seeds for oil production",
                images: ["https://example.com/mustard.jpg"],
                inStock: true
            }
        ],
        serviceArea: {
            radius: 40,
            districts: ["Hisar", "Fatehabad", "Sirsa"]
        },
        ratings: { average: 4.5, count: 56 },
        isVerified: true,
        isActive: true
    },
    {
        businessName: "Mahindra Tractors Dealer",
        description: "Authorized Mahindra dealer. New tractors, spare parts, and after-sales service.",
        serviceType: "manufacturer",
        location: {
            address: "GT Road, Industrial Area, Jalandhar, Punjab",
            coordinates: { latitude: 31.3260, longitude: 75.5762 }
        },
        contactInfo: {
            phone: "+91 98765 43215",
            email: "mahindra.jalandhar@gmail.com"
        },
        products: [
            {
                name: "Mahindra 245 DI Orchard",
                category: "Tractors",
                price: 450000,
                unit: "unit",
                description: "25 HP tractor suitable for small farms",
                images: ["https://example.com/mahindra245.jpg"],
                inStock: true
            },
            {
                name: "Mahindra 575 DI",
                category: "Tractors",
                price: 650000,
                unit: "unit",
                description: "47 HP tractor for medium farms",
                images: ["https://example.com/mahindra575.jpg"],
                inStock: true
            }
        ],
        serviceArea: {
            radius: 100,
            districts: ["Jalandhar", "Ludhiana", "Amritsar", "Kapurthala"]
        },
        ratings: { average: 4.8, count: 124 },
        isVerified: true,
        isActive: true
    },
    {
        businessName: "Modern Farm Equipment",
        description: "Rental services for modern farming equipment. Affordable rates with maintenance included.",
        serviceType: "tractor",
        location: {
            address: "Village Kheri, Block Sohna, Gurugram, Haryana",
            coordinates: { latitude: 28.2380, longitude: 77.0266 }
        },
        contactInfo: {
            phone: "+91 98765 43211",
            email: "modern.farm@gmail.com"
        },
        equipment: [
            {
                name: "Swaraj 744 FE",
                model: "2020",
                year: 2020,
                hourlyRate: 750,
                dailyRate: 5500,
                availability: true,
                images: ["https://example.com/swaraj744.jpg"]
            },
            {
                name: "Farmtrac 60 Classic",
                model: "2019",
                year: 2019,
                hourlyRate: 850,
                dailyRate: 6500,
                availability: false,
                images: ["https://example.com/farmtrac60.jpg"]
            }
        ],
        serviceArea: {
            radius: 35,
            districts: ["Gurugram", "Faridabad", "Palwal"]
        },
        ratings: { average: 4.6, count: 38 },
        isVerified: true,
        isActive: true
    }
];

async function createSampleServiceProviders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create sample users for service providers
        const users = [];
        for (let i = 0; i < sampleServiceProviders.length; i++) {
            const user = new User({
                name: `Owner ${i + 1}`,
                email: `owner${i + 1}@example.com`,
                password: 'password123',
                location: sampleServiceProviders[i].location.address,
                role: 'farmer', // Service providers are also farmers
                profileImage: `https://i.pravatar.cc/150?u=owner${i + 1}`
            });
            await user.save();
            users.push(user);
        }

        // Create service providers
        for (let i = 0; i < sampleServiceProviders.length; i++) {
            const providerData = {
                ...sampleServiceProviders[i],
                owner: users[i]._id
            };
            
            const provider = new ServiceProvider(providerData);
            await provider.save();
            console.log(`Created service provider: ${provider.businessName}`);
        }

        console.log('Sample service providers created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating sample data:', error);
        process.exit(1);
    }
}

createSampleServiceProviders();