import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockCalendarEvents } from '@/services/mockData';

// Helper function to get the week days
const getWeekDays = (date: Date) => {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
};

const BookingCalendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekDays = getWeekDays(currentWeek);

  const getBookingsForDate = (date: Date) => {
    return mockCalendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.toDateString() === date.toDateString();
    }).map(event => ({
      serviceType: event.title.split(' - '), // Extract service type from title
      time: `${event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'confirmed', // Assuming all mockCalendarEvents are confirmed for display
    }));
  };

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Booking Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="border rounded-lg p-2 min-h-[100px]">
              <div className="text-center font-medium text-sm mb-2">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                <div className="text-xs text-gray-500">
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {getBookingsForDate(day).map((event, idx) => (
                  <div key={idx} className="text-xs p-1 bg-blue-100 rounded">
                    <div className="font-medium">{event.serviceType}</div>
                    <div className="text-gray-600">{event.time}</div>
                    <Badge variant="outline" className="text-xs mt-1">{event.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;